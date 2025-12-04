import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { agronomistAPI } from '../../services/api';

const FarmerDashboard = () => {
  const [localAgronomists, setLocalAgronomists] = useState([]);
  const [loadingAgronomists, setLoadingAgronomists] = useState(true);
  const [agronomistError, setAgronomistError] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  useEffect(() => {
    const fetchLocalAgronomists = async () => {
      try {
        setLoadingAgronomists(true);
        const response = await agronomistAPI.findLocalExperts();
        setLocalAgronomists(response.data);
        setAgronomistError('');
      } catch (err) {
        setLocalAgronomists([]);
        setAgronomistError(
          err.response?.data?.message || 'Failed to load local agronomists.'
        );
      } finally {
        setLoadingAgronomists(false);
      }
    };

    fetchLocalAgronomists();
  }, []);

  const getInitials = (name = '') => {
    return name
      .split(' ')
      .map(part => part[0])
      .filter(Boolean)
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  const quickActionCards = [
    {
      to: '/farmer/crops',
      icon: '🌾',
      title: 'My Crops',
      description: 'Manage and track your crops',
      color: 'from-green-500 to-emerald-600',
    },
    {
      to: '/farmer/disease-reports',
      icon: '🔍',
      title: 'Disease Reports',
      description: 'Report and track crop diseases',
      color: 'from-orange-500 to-red-600',
    },
    {
      to: '/farmer/weather',
      icon: '☁️',
      title: 'Weather',
      description: 'Check weather forecast',
      color: 'from-blue-500 to-cyan-600',
    },
    {
      to: '/farmer/advisories',
      icon: '📋',
      title: 'Advisories',
      description: 'View farming advisories',
      color: 'from-purple-500 to-indigo-600',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
            👨‍🌾 Farmer Dashboard
          </h1>
          <p className="text-lg text-gray-600">
            Manage your farm, track crops, and get expert advice
          </p>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {quickActionCards.map((card) => (
            <Link
              key={card.to}
              to={card.to}
              className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-0 group-hover:opacity-10 transition-opacity`}></div>
              <div className="relative p-6">
                <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform">
                  {card.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{card.title}</h3>
                <p className="text-gray-600 text-sm">{card.description}</p>
                <div className="mt-4 flex items-center text-green-600 font-medium group-hover:text-green-700">
                  <span className="text-sm">Explore</span>
                  <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Agronomists Section */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-5">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <span>👨‍🔬</span>
              <span>Agronomists in Your District</span>
            </h2>
            <p className="mt-2 text-green-100 text-sm">
              Connect with verified agronomists available in your district for quick advice
            </p>
          </div>
          
          <div className="p-6">
            {loadingAgronomists ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                <span className="ml-4 text-gray-600">Loading agronomists...</span>
              </div>
            ) : agronomistError ? (
              <div className="text-center py-8">
                <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg inline-block">
                  {agronomistError}
                </div>
              </div>
            ) : localAgronomists.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">👨‍🔬</div>
                <p className="text-gray-600 text-lg">No agronomists available in your district.</p>
                <p className="text-gray-500 text-sm mt-2">Check back later or contact support.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {localAgronomists.map((agronomist) => (
                  <div
                    key={agronomist.id}
                    className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                  >
                    <div className="flex items-start gap-4">
                      <button
                        type="button"
                        onClick={() => agronomist.profilePhotoUrl && setSelectedPhoto(agronomist.profilePhotoUrl)}
                        className="relative h-16 w-16 rounded-full overflow-hidden bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white font-bold text-lg shadow-md hover:shadow-lg transition-shadow focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 flex-shrink-0"
                        aria-label={
                          agronomist.profilePhotoUrl
                            ? `View profile photo of ${agronomist.fullName}`
                            : undefined
                        }
                        disabled={!agronomist.profilePhotoUrl}
                      >
                        {agronomist.profilePhotoUrl ? (
                          <img
                            src={agronomist.profilePhotoUrl}
                            alt={agronomist.fullName}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          getInitials(agronomist.fullName)
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-gray-900 truncate">{agronomist.fullName}</h3>
                        <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          {agronomist.mobileNumber}
                        </p>
                        {agronomist.district && (
                          <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {agronomist.district}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Photo Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-auto relative shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center rounded-t-2xl">
              <h3 className="text-lg font-bold text-gray-900">Profile Photo</h3>
              <button
                onClick={() => setSelectedPhoto(null)}
                className="text-gray-500 hover:text-gray-700 text-3xl font-bold hover:bg-gray-100 rounded-full w-10 h-10 flex items-center justify-center transition-colors"
                aria-label="Close photo preview"
              >
                ×
              </button>
            </div>
            <div className="p-6 flex justify-center">
              <img
                src={selectedPhoto}
                alt="Agronomist"
                className="max-w-full max-h-[70vh] rounded-xl object-contain shadow-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmerDashboard;
