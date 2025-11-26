import { useState, useEffect } from 'react';
import { cropAPI } from '../../services/api';

const Crops = () => {
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    cropName: '',
    cropVariety: '',
    plantingDate: '',
    area: {
      value: '',
      unit: 'acres',
    },
  });

  useEffect(() => {
    fetchCrops();
  }, []);

  const fetchCrops = async () => {
    try {
      setLoading(true);
      const response = await cropAPI.getCrops();
      setCrops(response.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch crops');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const cropData = {
        ...formData,
        area: {
          value: parseFloat(formData.area.value),
          unit: formData.area.unit,
        },
      };
      await cropAPI.addCrop(cropData);
      setShowForm(false);
      setFormData({
        cropName: '',
        cropVariety: '',
        plantingDate: '',
        area: { value: '', unit: 'acres' },
      });
      fetchCrops();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add crop');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this crop?')) {
      try {
        await cropAPI.deleteCrop(id);
        fetchCrops();
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete crop');
      }
    }
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
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Crops</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
        >
          {showForm ? 'Cancel' : 'Add Crop'}
        </button>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {showForm && (
        <div className="mb-8 bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Add New Crop</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Crop Name</label>
              <input
                type="text"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                value={formData.cropName}
                onChange={(e) => setFormData({ ...formData, cropName: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Crop Variety</label>
              <input
                type="text"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                value={formData.cropVariety}
                onChange={(e) => setFormData({ ...formData, cropVariety: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Planting Date</label>
              <input
                type="date"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                value={formData.plantingDate}
                onChange={(e) => setFormData({ ...formData, plantingDate: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Area Value</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                  value={formData.area.value}
                  onChange={(e) => setFormData({
                    ...formData,
                    area: { ...formData.area, value: e.target.value },
                  })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Unit</label>
                <select
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                  value={formData.area.unit}
                  onChange={(e) => setFormData({
                    ...formData,
                    area: { ...formData.area, unit: e.target.value },
                  })}
                >
                  <option value="acres">Acres</option>
                  <option value="hectares">Hectares</option>
                  <option value="guntha">Guntha</option>
                </select>
              </div>
            </div>
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
            >
              Add Crop
            </button>
          </form>
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {crops.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No crops found. Add your first crop!</div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {crops.map((crop) => (
              <li key={crop._id} className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{crop.cropName}</h3>
                    <p className="text-sm text-gray-500">Variety: {crop.cropVariety}</p>
                    <p className="text-sm text-gray-500">Planting Date: {new Date(crop.plantingDate).toLocaleDateString()}</p>
                    <p className="text-sm text-gray-500">
                      Area: {crop.area?.value || crop.area} {crop.area?.unit || 'acres'}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(crop._id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Crops;

