import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getNavLinks = () => {
    if (!user) return [];
    
    if (user.role === 'farmer') {
      return [
        { path: '/farmer', label: t('common.dashboard'), icon: '📊' },
        { path: '/farmer/crops', label: t('navbar.crops'), icon: '🌾' },
        { path: '/farmer/disease-reports', label: t('navbar.diseaseReports'), icon: '🔍' },
        { path: '/farmer/weather', label: t('navbar.weather'), icon: '☁️' },
        { path: '/farmer/advisories', label: t('navbar.advisories'), icon: '📋' },
        { path: '/farmer/profile', label: t('common.profile'), icon: '👤' },
      ];
    } else if (user.role === 'admin') {
      return [
        { path: '/admin', label: t('common.dashboard'), icon: '📊' },
        { path: '/admin/farmers', label: t('navbar.farmers'), icon: '👨‍🌾' },
        { path: '/admin/agronomists', label: t('navbar.agronomists'), icon: '🔬' },
        { path: '/admin/profile', label: t('common.profile'), icon: '👤' },
      ];
    } else if (user.role === 'agronomist') {
      return [
        { path: '/agronomist', label: t('common.dashboard'), icon: '📊' },
        { path: '/agronomist/profile', label: t('common.profile'), icon: '👤' },
      ];
    }
    return [];
  };

  const navLinks = getNavLinks();
  const roleColors = {
    farmer: 'bg-gradient-to-r from-green-600 to-green-700',
    admin: 'bg-gradient-to-r from-gray-800 to-gray-900',
    agronomist: 'bg-gradient-to-r from-teal-600 to-cyan-600',
  };

  const roleColor = user ? roleColors[user.role] || 'bg-green-600' : 'bg-green-600';

  return (
    <nav className={`${roleColor} text-white shadow-xl sticky top-0 z-50`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="text-xl font-bold hover:opacity-90 transition-opacity">
              🌾 {t('navbar.brand')}
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-1 flex-1 md:ml-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="px-4 py-2 rounded-lg text-sm font-medium text-white hover:bg-white/20 transition-all duration-200 flex items-center gap-2"
              >
                <span>{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            ))}
          </div>

          {/* User Info & Actions */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {user && (
              <>
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <p className="text-sm font-medium">{user.fullName}</p>
                    <p className="text-xs opacity-80 capitalize">{user.role}</p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center font-semibold">
                    {user.fullName?.charAt(0).toUpperCase()}
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  {t('common.logout')}
                </button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            {user && (
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center font-semibold text-sm">
                  {user.fullName?.charAt(0).toUpperCase()}
                </div>
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="p-2 rounded-lg hover:bg-white/20 transition-colors"
                  aria-label="Toggle menu"
                >
                  {mobileMenuOpen ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/20 py-4">
            <div className="space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-3 rounded-lg text-white hover:bg-white/20 transition-all duration-200 flex items-center gap-3"
                >
                  <span className="text-xl">{link.icon}</span>
                  <span className="font-medium">{link.label}</span>
                </Link>
              ))}
              {user && (
                <div className="pt-4 border-t border-white/20">
                  <div className="px-4 py-2 mb-2">
                    <p className="text-sm font-medium">{user.fullName}</p>
                    <p className="text-xs opacity-80 capitalize">{user.role}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-3 rounded-lg bg-white/20 hover:bg-white/30 text-white font-medium transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    {t('common.logout')}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
