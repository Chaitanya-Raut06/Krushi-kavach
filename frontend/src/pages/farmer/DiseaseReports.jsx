import { useState, useEffect } from 'react';
import { diseaseReportAPI, cropAPI } from '../../services/api';

const DiseaseReports = () => {
  const [reports, setReports] = useState([]);
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    cropId: '',
    reportLanguage: 'en',
  });
  const [images, setImages] = useState([]);

  useEffect(() => {
    fetchReports();
    fetchCrops();
  }, []);

  const fetchCrops = async () => {
    try {
      const response = await cropAPI.getCrops();
      setCrops(response.data);
    } catch (err) {
      console.error('Failed to fetch crops:', err);
    }
  };

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await diseaseReportAPI.getReports();
      setReports(response.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (images.length === 0) {
      setError('Please upload at least one image');
      return;
    }
    if (!formData.cropId) {
      setError('Please select a crop');
      return;
    }
    try {
      await diseaseReportAPI.createReport(formData, images);
      setShowForm(false);
      setFormData({ cropId: '', reportLanguage: 'en' });
      setImages([]);
      fetchReports();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create report');
    }
  };

  const handleMarkTreated = async (id) => {
    try {
      await diseaseReportAPI.markTreated(id);
      fetchReports();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update report');
    }
  };

  const handleImageChange = (e) => {
    setImages(Array.from(e.target.files));
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
        <h1 className="text-3xl font-bold text-gray-900">Disease Reports</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
        >
          {showForm ? 'Cancel' : 'Create Report'}
        </button>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {showForm && (
        <div className="mb-8 bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Create Disease Report</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Select Crop</label>
              <select
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                value={formData.cropId}
                onChange={(e) => setFormData({ ...formData, cropId: e.target.value })}
              >
                <option value="">Select a crop</option>
                {crops.map((crop) => (
                  <option key={crop._id} value={crop._id}>
                    {crop.cropName} - {crop.cropVariety}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Report Language</label>
              <select
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                value={formData.reportLanguage}
                onChange={(e) => setFormData({ ...formData, reportLanguage: e.target.value })}
              >
                <option value="en">English</option>
                <option value="mr">Marathi</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Disease Images</label>
              <input
                type="file"
                multiple
                accept="image/*"
                required
                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                onChange={handleImageChange}
              />
              <p className="mt-2 text-sm text-gray-500">Upload images of the affected crop area</p>
            </div>
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
            >
              Create Report
            </button>
          </form>
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {reports.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No reports found. Create your first report!</div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {reports.map((report) => (
              <li key={report._id} className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900">
                      {report.crop?.cropName || 'Unknown Crop'} - {report.crop?.cropVariety || ''}
                    </h3>
                    {report.detectedDisease && (
                      <p className="text-sm text-gray-600 mt-2">
                        <span className="font-medium">Detected Disease:</span> {report.detectedDisease}
                      </p>
                    )}
                    {report.diagnosis && (
                      <p className="text-sm text-gray-600 mt-2">
                        <span className="font-medium">Diagnosis:</span> {report.diagnosis}
                      </p>
                    )}
                    {report.recommendation && (
                      <p className="text-sm text-gray-600 mt-2">
                        <span className="font-medium">Recommendation:</span> {report.recommendation}
                      </p>
                    )}
                    <p className="text-sm text-gray-500 mt-2">
                      Status: <span className={`font-medium ${report.reportStatus === 'treated' ? 'text-green-600' : 'text-yellow-600'}`}>
                        {report.reportStatus || 'pending_action'}
                      </span>
                    </p>
                    {report.images && report.images.length > 0 && (
                      <div className="mt-4 flex gap-2">
                        {report.images.map((img, idx) => (
                          <img
                            key={idx}
                            src={img.url || img}
                            alt={`Report ${idx + 1}`}
                            className="h-20 w-20 object-cover rounded"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                  {report.reportStatus !== 'treated' && (
                    <button
                      onClick={() => handleMarkTreated(report._id)}
                      className="ml-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm"
                    >
                      Mark as Treated
                    </button>
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

export default DiseaseReports;

