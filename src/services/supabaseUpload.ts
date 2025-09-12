export interface UploadResult {
  path: string;
  publicUrl: string;
}

const getSupabaseEnv = () => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase configuration. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  }
  return { supabaseUrl: supabaseUrl.replace(/\/$/, ''), supabaseAnonKey };
};

const safeSegment = (s: string) => s.replace(/[^a-zA-Z0-9._\-]/g, '_');

export async function uploadPaymentSlip(
  file: File,
  opts?: { bucket?: string; directory?: string; upsert?: boolean }
): Promise<UploadResult> {
  const { supabaseUrl, supabaseAnonKey } = getSupabaseEnv();
  const bucket = opts?.bucket || 'payment-slip';
  const ext = file.name.includes('.') ? file.name.split('.').pop() : '';
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext ? '.' + safeSegment(ext) : ''}`;
  const directory = safeSegment(opts?.directory || 'slips');
  const objectPath = `${directory}/${filename}`;

  // First attempt: raw POST with file body to object path
  const rawUrl = `${supabaseUrl}/storage/v1/object/${bucket}/${objectPath}`;
  let res = await fetch(rawUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${supabaseAnonKey}`,
      apikey: supabaseAnonKey,
      'Content-Type': file.type || 'application/octet-stream',
      ...(opts?.upsert ? { 'x-upsert': 'true' } : {}),
    },
    body: file,
  });

  if (!res.ok) {
    // Fallback: multipart form with path
    const multiUrl = `${supabaseUrl}/storage/v1/object/${bucket}`;
    const form = new FormData();
    form.append('file', file, filename);
    form.append('path', objectPath);
    res = await fetch(multiUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${supabaseAnonKey}`,
        apikey: supabaseAnonKey,
        ...(opts?.upsert ? { 'x-upsert': 'true' } : {}),
      },
      body: form,
    });
  }

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Upload failed: ${res.status} ${res.statusText}${text ? ` - ${text}` : ''}`);
  }

  const publicUrl = `${supabaseUrl}/storage/v1/object/public/${bucket}/${objectPath}`;
  return { path: objectPath, publicUrl };
}
