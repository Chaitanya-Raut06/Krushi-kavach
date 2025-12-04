import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Unauthorized = () => {
  const { t } = useTranslation();
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('unauthorized.title')}</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">{t('unauthorized.heading')}</h2>
        <p className="text-gray-600 mb-8">{t('unauthorized.message')}</p>
        <Link
          to="/"
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-md"
        >
          {t('unauthorized.goHome')}
        </Link>
      </div>
    </div>
  );
};

export default Unauthorized;









