import React from 'react';
import { Phone, MapPin } from 'lucide-react';
import { useTranslation } from '../i18n/stub';

const ContactPage: React.FC = () => {
  const { t } = useTranslation();

  const handleCallClick = () => {
    window.location.href = 'tel:062-608-1833';
  };

  return (
    <div className="min-h-screen bg-base-100 pt-20 pb-24">
      <div className="max-w-md mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-primary mb-2">
            {t('contact.title')}
          </h1>
          <p className="text-base-content/70">
            {t('contact.subtitle')}
          </p>
        </div>

        <div className="space-y-6">
          {/* Phone Contact */}
          <div className="card bg-base-200 shadow-sm">
            <div className="card-body p-6">
              <div className="flex items-center space-x-4">
                <div className="bg-primary/10 p-3 rounded-full">
                  <Phone className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-base-content">
                  </h3>
                  <p className="text-base-content/70 text-sm mb-3">
                    {t('contact.phoneDescription')}
                  </p>
                  <button
                    onClick={handleCallClick}
                    className="btn btn-primary btn-sm"
                  >
                    <Phone size={16} />
                    062-608-1833
                  </button>
                </div>
              </div>
            </div>
          </div>


          {/* Location */}
          <div className="card bg-base-200 shadow-sm">
            <div className="card-body p-6">
              <div className="flex items-start space-x-4">
                <div className="bg-accent/10 p-3 rounded-full">
                  <MapPin className="w-6 h-6 text-accent" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-base-content mb-2">
                    {t('contact.location')}
                  </h3>
                  <p className="text-sm text-base-content/70">
                    {t('contact.address')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;