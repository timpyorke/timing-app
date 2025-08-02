# Firebase Remote Config Setup

This guide explains how to set up Firebase Remote Config for the merchant close feature.

## 1. Firebase Project Setup

### Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or select existing project
3. Follow the setup wizard

### Add Web App
1. In your Firebase project, click "Add app" and select Web (</>) icon
2. Register your app with a nickname (e.g., "Timing Menu App")
3. Copy the Firebase configuration object

## 2. Environment Variables

Create a `.env` file in your project root with your Firebase configuration:

```env
VITE_FIREBASE_API_KEY=your-api-key-here
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=your-app-id-here
```

## 3. Enable Remote Config

1. In Firebase Console, go to "Remote Config" in the left sidebar
2. Click "Create configuration"

## 4. Set Up Remote Config Parameters

Add these parameters in Firebase Remote Config:

### Required Parameters

| Parameter | Type | Default Value | Description |
|-----------|------|---------------|-------------|
| `is_close` | Boolean | `false` | Controls whether the merchant is closed |
| `close_message` | String | `Sorry, we are temporarily closed. Please try again later.` | Message shown when closed |
| `close_title` | String | `Store Temporarily Closed` | Title of close modal |

### Parameter Setup Steps

1. **is_close parameter:**
   - Parameter key: `is_close`
   - Data type: Boolean
   - Default value: `false`
   - Description: "Controls whether the merchant is closed"

2. **close_message parameter:**
   - Parameter key: `close_message`
   - Data type: String
   - Default value: `Sorry, we are temporarily closed. Please try again later.`
   - Description: "Message displayed when store is closed"

3. **close_title parameter:**
   - Parameter key: `close_title`
   - Data type: String
   - Default value: `Store Temporarily Closed`
   - Description: "Title of the close modal"

## 5. Configure Fetch Settings

The app is configured with these settings:
- **Minimum fetch interval**: 30 minutes (1800 seconds)
- **Fetch timeout**: 1 minute (60 seconds)

## 6. How to Use

### To Close the Store:
1. Go to Firebase Console → Remote Config
2. Find the `is_close` parameter
3. Change its value to `true`
4. Click "Publish changes"
5. Users will see the closed modal within 30 minutes (or immediately if they refresh)

### To Reopen the Store:
1. Change `is_close` back to `false`
2. Click "Publish changes"
3. Users can click "Check Status Again" or wait for automatic refresh

### To Customize Messages:
1. Edit `close_title` and `close_message` parameters
2. Publish changes
3. Messages will update on next fetch

## 7. Testing

### Test Locally:
1. Set `is_close` to `true` in Firebase Remote Config
2. Publish changes
3. In your app, the modal should appear
4. Click "Check Status Again" to force refresh

### Test Different Messages:
1. Change `close_message` to test different messages
2. Publish and test the modal appearance

## 8. Security Rules

Remote Config is read-only from client apps by default. No additional security configuration needed.

## 9. Monitoring

- Monitor Remote Config usage in Firebase Console
- Check app logs for fetch errors
- Users can manually refresh status using the "Check Status Again" button

## 10. Features

✅ **Automatic Fetch**: Updates every 30 minutes  
✅ **Manual Refresh**: Users can force check status  
✅ **Offline Fallback**: Uses cached values when offline  
✅ **Visibility Detection**: Checks status when app becomes visible  
✅ **Loading States**: Shows loading indicators during fetch  
✅ **Error Handling**: Graceful fallback to default values  
✅ **Full Screen Block**: Prevents all interactions when closed  

## Troubleshooting

### Common Issues:

1. **Modal not showing when is_close = true**
   - Check Firebase configuration in `.env`
   - Verify Remote Config is enabled
   - Check browser console for errors

2. **Changes not reflecting**
   - Wait for 30-minute fetch interval
   - Use "Check Status Again" button
   - Clear browser cache

3. **Firebase connection errors**
   - Verify API key and project ID
   - Check internet connection
   - Review Firebase project permissions