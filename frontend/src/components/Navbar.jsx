import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getNavLinks = () => {
    if (!user) return [];
    
    if (user.role === 'farmer') {
      return [
        { path: '/farmer', label: 'Dashboard' },
        { path: '/farmer/crops', label: 'Crops' },
        { path: '/farmer/disease-reports', label: 'Disease Reports' },
        { path: '/farmer/weather', label: 'Weather' },
        { path: '/farmer/advisories', label: 'Advisories' },
        { path: '/farmer/profile', label: 'Profile' },
      ];
    } else if (user.role === 'admin') {
      return [
        { path: '/admin', label: 'Dashboard' },
        { path: '/admin/farmers', label: 'Farmers' },
        { path: '/admin/agronomists', label: 'Agronomists' },
        { path: '/admin/locations', label: 'Locations' },
        { path: '/admin/profile', label: 'Profile' },
      ];
    } else if (user.role === 'agronomist') {
      return [
        { path: '/agronomist', label: 'Dashboard' },
        { path: '/agronomist/profile', label: 'Profile' },
      ];
    }
    return [];
  };

  return (
    <nav className="bg-green-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-xl font-bold">
                Krishi Kavach
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {getNavLinks().map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="border-transparent text-white hover:border-green-300 hover:text-green-100 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center">
            {user && (
              <>
                <span className="mr-4 text-sm">Hello, {user.fullName}</span>
                <button
                  onClick={handleLogout}
                  className="bg-green-700 hover:bg-green-800 px-4 py-2 rounded-md text-sm font-medium"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;






