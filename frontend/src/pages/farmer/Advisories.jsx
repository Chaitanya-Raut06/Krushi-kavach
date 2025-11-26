import { useState, useEffect } from 'react';
import { advisoryAPI } from '../../services/api';

const Advisories = () => {
  const [advisories, setAdvisories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAdvisories();
  }, []);

  const fetchAdvisories = async () => {
    try {
      setLoading(true);
      const response = await advisoryAPI.getAdvisories();
      setAdvisories(response.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch advisories');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">Loading advisories...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Farming Advisories</h1>
        <button
          onClick={fetchAdvisories}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {advisories.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No advisories available at the moment.</div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {advisories.map((advisory, index) => (
              <li key={advisory._id || index} className="p-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {advisory.title || `Advisory ${index + 1}`}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">{advisory.message || advisory.description}</p>
                  {advisory.cropName && (
                    <p className="text-sm text-gray-500">Crop: {advisory.cropName}</p>
                  )}
                  {advisory.createdAt && (
                    <p className="text-sm text-gray-500 mt-2">
                      Date: {new Date(advisory.createdAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Advisories;






