import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

const Home = () => {
  const { user, isAuthenticated } = useAuth();
  const { t } = useTranslation();

  const roles = [
    {
      role: 'farmer',
      icon: '👨‍🌾',
      title: 'Farmer',
      description: 'Manage your crops, track diseases, and get expert agricultural advice',
      color: 'from-green-500 to-emerald-600',
      link: '/register',
    },
    {
      role: 'agronomist',
      icon: '🔬',
      title: 'Agronomist',
      description: 'Help farmers with your expertise and manage agricultural consultations',
      color: 'from-teal-500 to-cyan-600',
      link: '/register',
    },
    {
      role: 'admin',
      icon: '🛡️',
      title: 'Admin',
      description: 'Manage the platform, verify users, and oversee system operations',
      color: 'from-gray-700 to-gray-900',
      link: '/login',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-white">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="text-center">
          <div className="mb-8">
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-gray-900 mb-4">
              <span className="block">{t('home.title')}</span>
              <span className="block bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                {t('home.subtitle')}
              </span>
            </h1>
            <p className="mt-6 max-w-3xl mx-auto text-lg sm:text-xl text-gray-600 leading-relaxed">
              {t('home.description')}
            </p>
          </div>

          {!isAuthenticated ? (
            <>
              {/* Role Selection Cards */}
              <div className="mt-12 mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
                  Choose Your Role
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                  {roles.map((roleItem) => (
                    <Link
                      key={roleItem.role}
                      to={roleItem.link}
                      className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-2 border-2 border-transparent hover:border-green-300"
                    >
                      <div className={`absolute inset-0 bg-gradient-to-br ${roleItem.color} opacity-0 group-hover:opacity-5 transition-opacity`}></div>
                      <div className="relative p-8">
                        <div className="text-6xl mb-4 transform group-hover:scale-110 transition-transform">
                          {roleItem.icon}
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-3">{roleItem.title}</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">{roleItem.description}</p>
                        <div className="mt-6 flex items-center text-green-600 font-semibold group-hover:text-green-700">
                          <span className="text-sm">Get Started</span>
                          <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* CTA Button */}
              <div className="mt-10">
                <Link
                  to="/login"
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
                >
                  <span>{t('common.getStarted')}</span>
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </div>
            </>
          ) : (
            <div className="mt-10">
              <Link
                to={user.role === 'admin' ? '/admin' : user.role === 'farmer' ? '/farmer' : '/agronomist'}
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
              >
                <span>{t('common.goToDashboard')}</span>
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Features Section */}
      {!isAuthenticated && (
        <div className="bg-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-5xl mb-4">🌾</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Crop Management</h3>
                <p className="text-gray-600">Track and manage your crops efficiently</p>
              </div>
              <div className="text-center">
                <div className="text-5xl mb-4">☁️</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Weather Forecast</h3>
                <p className="text-gray-600">Get accurate weather predictions for your farm</p>
              </div>
              <div className="text-center">
                <div className="text-5xl mb-4">👨‍🔬</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Expert Advice</h3>
                <p className="text-gray-600">Connect with verified agronomists in your area</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
