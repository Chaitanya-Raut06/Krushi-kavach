import { useState, useEffect } from 'react';
import { adminAPI, agronomistAPI } from '../../services/api';

const Agronomists = () => {
  const [agronomists, setAgronomists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedAgronomist, setSelectedAgronomist] = useState(null);
  const [locations, setLocations] = useState([{ district: '', taluka: '' }]);

  useEffect(() => {
    fetchAgronomists();
  }, []);

  const fetchAgronomists = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.listAgronomists();
      setAgronomists(response.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch agronomists');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (profileId) => {
    try {
      await agronomistAPI.verifyAgronomist(profileId, 'verified');
      fetchAgronomists();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to verify agronomist');
    }
  };

  const handleAssignLocations = async () => {
    if (!selectedAgronomist) return;
    const validLocations = locations.filter(loc => loc.district && loc.taluka);
    if (validLocations.length === 0) {
      setError('Please provide at least one location with district and taluka');
      return;
    }
    try {
      await adminAPI.assignLocations(selectedAgronomist.userId, validLocations);
      setSelectedAgronomist(null);
      setLocations([{ district: '', taluka: '' }]);
      fetchAgronomists();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign locations');
    }
  };

  const addLocationField = () => {
    setLocations([...locations, { district: '', taluka: '' }]);
  };

  const updateLocation = (index, field, value) => {
    const updated = [...locations];
    updated[index][field] = value;
    setLocations(updated);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Agronomists</h1>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {selectedAgronomist && (
        <div className="mb-4 bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Assign Locations</h2>
          <div className="space-y-4">
            {locations.map((loc, index) => (
              <div key={index} className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">District</label>
                  <input
                    type="text"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                    value={loc.district}
                    onChange={(e) => updateLocation(index, 'district', e.target.value)}
                    placeholder="District"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Taluka</label>
                  <input
                    type="text"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                    value={loc.taluka}
                    onChange={(e) => updateLocation(index, 'taluka', e.target.value)}
                    placeholder="Taluka"
                  />
                </div>
              </div>
            ))}
            <button
              onClick={addLocationField}
              className="text-green-600 hover:text-green-700 text-sm"
            >
              + Add Another Location
            </button>
            <div className="flex gap-2">
              <button
                onClick={handleAssignLocations}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
              >
                Assign
              </button>
              <button
                onClick={() => {
                  setSelectedAgronomist(null);
                  setLocations([{ district: '', taluka: '' }]);
                }}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {agronomists.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No agronomists found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mobile Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Qualification
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Experience
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {agronomists.map((agronomist) => (
                  <tr key={agronomist._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {agronomist.user?.fullName || agronomist.fullName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {agronomist.user?.mobileNumber || agronomist.mobileNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {agronomist.qualification || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {agronomist.experience || 0} years
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          agronomist.status === 'verified'
                            ? 'bg-green-100 text-green-800'
                            : agronomist.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {agronomist.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      {agronomist.status === 'pending' && (
                        <button
                          onClick={() => handleVerify(agronomist._id)}
                          className="text-green-600 hover:text-green-900"
                        >
                          Verify
                        </button>
                      )}
                      <button
                        onClick={() => setSelectedAgronomist({ userId: agronomist.user?._id, profileId: agronomist._id })}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Assign Locations
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Agronomists;

