import { useState, useEffect } from 'react';
import { agronomistAPI, cropAPI } from '../../services/api';

const AgronomistDashboard = () => {
  const [localFarmers, setLocalFarmers] = useState([]);
  const [loadingFarmers, setLoadingFarmers] = useState(true);
  const [farmerError, setFarmerError] = useState('');
  const [viewingPhoto, setViewingPhoto] = useState(null);
  const [viewingCrops, setViewingCrops] = useState(null);
  const [crops, setCrops] = useState([]);
  const [loadingCrops, setLoadingCrops] = useState(false);

  useEffect(() => {
    fetchLocalFarmers();
  }, []);

  const fetchLocalFarmers = async () => {
    try {
      setLoadingFarmers(true);
      const response = await agronomistAPI.findLocalFarmers();
      setLocalFarmers(response.data);
      setFarmerError('');
    } catch (err) {
      setFarmerError(err.response?.data?.message || 'Failed to fetch farmers');
    } finally {
      setLoadingFarmers(false);
    }
  };

  const handleViewCrops = async (farmerId) => {
    try {
      setLoadingCrops(true);
      setViewingCrops(farmerId);
      const response = await cropAPI.getCropsByFarmer(farmerId);
      setCrops(response.data);
    } catch (err) {
      setFarmerError(err.response?.data?.message || 'Failed to fetch crops');
      setViewingCrops(null);
    } finally {
      setLoadingCrops(false);
    }
  };

  const closeCropsModal = () => {
    setViewingCrops(null);
    setCrops([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
            👨‍🔬 Agronomist Dashboard
          </h1>
          <p className="text-lg text-gray-600">
            Manage farmers and provide professional agricultural assistance
          </p>
        </div>
        
        {/* Welcome Card */}
        <div className="bg-gradient-to-r from-teal-600 to-cyan-600 rounded-2xl shadow-xl p-6 mb-8 text-white">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <h2 className="text-2xl font-bold">Welcome to your Professional Dashboard</h2>
              <p className="text-teal-100 mt-2">
                Help farmers with their agricultural needs and manage your profile efficiently.
              </p>
            </div>
          </div>
        </div>

        {/* Local Farmers Section */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-teal-600 to-cyan-600 px-6 py-5">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <span>👨‍🌾</span>
              <span>Farmers in Your District</span>
            </h2>
            <p className="mt-2 text-teal-100 text-sm">
              Connect with farmers in your district and help them with their agricultural needs
            </p>
          </div>
          
          <div className="p-6">
            {farmerError && (
              <div className="mb-6 bg-red-50 border-l-4 border-red-500 text-red-800 px-4 py-3 rounded-md shadow-sm">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span>{farmerError}</span>
                </div>
              </div>
            )}

            {loadingFarmers ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
                <span className="ml-4 text-gray-600">Loading farmers...</span>
              </div>
            ) : localFarmers.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">👨‍🌾</div>
                <p className="text-gray-600 text-lg">No farmers available in your district.</p>
                <p className="text-gray-500 text-sm mt-2">Check back later or contact support.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {localFarmers.map((farmer) => (
                  <div
                    key={farmer.id}
                    className="bg-gradient-to-br from-white to-teal-50 border border-teal-200 rounded-xl p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      {farmer.profilePhotoUrl ? (
                        <div className="relative group">
                          <img
                            src={farmer.profilePhotoUrl}
                            alt={farmer.fullName}
                            className="w-20 h-20 rounded-full object-cover cursor-pointer border-4 border-teal-500 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
                            onClick={() => setViewingPhoto(farmer.profilePhotoUrl)}
                            title="Click to view full size"
                          />
                          <div className="absolute inset-0 rounded-full bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                            <svg className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                            </svg>
                          </div>
                        </div>
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-teal-200 to-cyan-300 flex items-center justify-center text-teal-600 border-4 border-teal-300 font-bold text-lg">
                          {farmer.fullName?.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 text-lg truncate">{farmer.fullName}</h3>
                        <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          {farmer.mobileNumber}
                        </p>
                        {farmer.district && (
                          <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {farmer.district}
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleViewCrops(farmer.id)}
                      className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white px-4 py-3 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      View Crops
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Profile Photo Modal */}
      {viewingPhoto && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setViewingPhoto(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-auto relative shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center rounded-t-2xl">
              <h3 className="text-lg font-bold text-gray-900">Profile Photo</h3>
              <button
                onClick={() => setViewingPhoto(null)}
                className="text-gray-500 hover:text-gray-700 text-3xl font-bold hover:bg-gray-100 rounded-full w-10 h-10 flex items-center justify-center transition-colors"
              >
                ×
              </button>
            </div>
            <div className="p-6 flex justify-center">
              <img
                src={viewingPhoto}
                alt="Profile Photo"
                className="max-w-full max-h-[70vh] rounded-xl object-contain shadow-lg"
              />
            </div>
          </div>
        </div>
      )}

      {/* Crops Modal */}
      {viewingCrops && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={closeCropsModal}
        >
          <div
            className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-auto relative shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-gradient-to-r from-teal-600 to-cyan-600 text-white px-6 py-4 flex justify-between items-center rounded-t-xl">
              <h3 className="text-xl font-bold flex items-center">
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Farmer Crops
              </h3>
              <button
                onClick={closeCropsModal}
                className="text-white hover:text-teal-200 text-3xl font-bold transition-colors w-10 h-10 flex items-center justify-center rounded-full hover:bg-teal-800"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              {loadingCrops ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
                  <span className="ml-4 text-gray-600">Loading crops...</span>
                </div>
              ) : crops.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🌾</div>
                  <p className="text-gray-500 text-lg">No crops found for this farmer.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {crops.map((crop) => (
                    <div
                      key={crop._id}
                      className="bg-gradient-to-br from-teal-50 to-white border border-teal-200 rounded-xl p-5 hover:shadow-lg transition-all duration-200"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="font-bold text-gray-900 text-lg">{crop.cropName}</h4>
                        <span className="bg-teal-100 text-teal-800 text-xs font-semibold px-2 py-1 rounded-full">
                          Active
                        </span>
                      </div>
                      {crop.cropVariety && (
                        <div className="mb-2">
                          <span className="text-xs font-semibold text-gray-500 uppercase">Variety</span>
                          <p className="text-sm text-gray-700 font-medium">{crop.cropVariety}</p>
                        </div>
                      )}
                      <div className="mb-2">
                        <span className="text-xs font-semibold text-gray-500 uppercase">Planting Date</span>
                        <p className="text-sm text-gray-700 font-medium">
                          {new Date(crop.plantingDate).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-gray-500 uppercase">Area</span>
                        <p className="text-sm text-gray-700 font-medium">
                          {crop.area?.value} {crop.area?.unit}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgronomistDashboard;
