import { useState, useRef, useEffect } from 'react';
import { diseaseReportAPI, mlServerAPI } from '../services/api';
import { useTranslation } from 'react-i18next';

const CROPS = [
  'apple', 'blueberry', 'cherry', 'corn', 'grape', 
  'orange', 'peach', 'pepper_bell', 'potato', 'raspberry', 'tomato'
];

const DiseaseDetection = ({ onDetectionComplete }) => {
  const { t } = useTranslation();
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isPredicting, setIsPredicting] = useState(false);
  const [mlServerStatus, setMlServerStatus] = useState(null); // 'starting', 'running', 'error'
  const [predictionResult, setPredictionResult] = useState(null);
  const [error, setError] = useState('');
  const [reports, setReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [showPreviousTests, setShowPreviousTests] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const pollingIntervalRef = useRef(null);

  const handleCropSelect = (crop) => {
    setSelectedCrop(crop);
    setSelectedImage(null);
    setImagePreview(null);
    setPredictionResult(null);
    setError('');
  };

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError(t('diseaseDetection.error.imageTooLarge'));
        return;
      }
      setSelectedImage(file);
      setError('');
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      setPredictionResult(null);
    }
  };

  const handleCameraCapture = (e) => {
    handleImageSelect(e);
  };

  // Poll ML server status until it's running
  const pollMLServerStatus = async () => {
    try {
      const response = await mlServerAPI.getStatus();
      const status = response.data.mlServerStatus;
      
      if (status === 'running') {
        setMlServerStatus('running');
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
        return true;
      } else if (status === 'starting') {
        setMlServerStatus('starting');
        return false;
      } else {
        setMlServerStatus('error');
        setError('Failed to start ML server. Please try again.');
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
        return false;
      }
    } catch (err) {
      console.error('Error checking ML server status:', err);
      setMlServerStatus('error');
      setError('Failed to check ML server status. Please try again.');
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      return false;
    }
  };

  // Check and start ML server if needed
  const ensureMLServerRunning = async () => {
    try {
      const response = await mlServerAPI.getStatus();
      const status = response.data.mlServerStatus;
      
      if (status === 'running') {
        setMlServerStatus('running');
        return true;
      } else if (status === 'starting') {
        setMlServerStatus('starting');
        // Start polling
        pollingIntervalRef.current = setInterval(async () => {
          const isRunning = await pollMLServerStatus();
          if (isRunning) {
            // Server is now running, proceed with detection
            await performDetection();
          }
        }, 2000); // Poll every 2 seconds
        return false;
      } else {
        setMlServerStatus('error');
        setError('Failed to start ML server. Please try again.');
        return false;
      }
    } catch (err) {
      console.error('Error checking ML server status:', err);
      setMlServerStatus('error');
      setError('Failed to check ML server status. Please try again.');
      return false;
    }
  };

  // Perform the actual disease detection
  const performDetection = async () => {
    try {
      const response = await diseaseReportAPI.detectDisease(selectedCrop, selectedImage);
      const newReport = response.data.report;
      setPredictionResult(newReport);
      setMlServerStatus(null);
      // Immediately add to reports list without refresh
      setReports(prevReports => [newReport, ...prevReports]);
      if (onDetectionComplete) {
        onDetectionComplete();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to detect disease. Please try again.');
      console.error('Detection error:', err);
      setMlServerStatus(null);
    } finally {
      setIsPredicting(false);
    }
  };

  const handleDetect = async () => {
    if (!selectedCrop || !selectedImage) {
      setError('Please select a crop and upload an image');
      return;
    }

    setIsPredicting(true);
    setError('');
    setPredictionResult(null);
    setMlServerStatus(null);

    // First, ensure ML server is running
    const isRunning = await ensureMLServerRunning();
    
    if (isRunning) {
      // Server is already running, proceed with detection
      await performDetection();
    }
    // If server is starting, polling will handle the detection once server is ready
  };

  const handleReset = () => {
    setSelectedCrop(null);
    setSelectedImage(null);
    setImagePreview(null);
    setPredictionResult(null);
    setError('');
    setMlServerStatus(null);
    setIsPredicting(false);
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  // Fetch reports on mount
  useEffect(() => {
    fetchReports();
  }, []);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  // Helper function to format date and time
  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  };

  // Helper function to check if prediction is "Healthy"
  const isHealthy = (prediction) => {
    return prediction?.toLowerCase() === 'healthy';
  };

  // Fetch reports from API
  const fetchReports = async () => {
    try {
      setLoadingReports(true);
      const response = await diseaseReportAPI.getReports();
      // Filter only ML prediction reports (those with prediction field)
      const mlReports = response.data.filter(report => report.prediction);
      // Sort by date, newest first
      mlReports.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setReports(mlReports);
    } catch (err) {
      console.error('Failed to fetch reports:', err);
    } finally {
      setLoadingReports(false);
    }
  };

  // Handle delete report
  const handleDeleteReport = async (reportId) => {
    if (!window.confirm(t('diseaseDetection.confirmDelete'))) {
      return;
    }

    try {
      setDeletingId(reportId);
      await diseaseReportAPI.deleteReport(reportId);
      // Remove from local state immediately
      setReports(reports.filter(report => report._id !== reportId));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete report');
      console.error('Delete error:', err);
    } finally {
      setDeletingId(null);
    }
  };

  // Render Previous Disease Testing Section
  const renderPreviousTestsSection = () => {
    return (
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <button
          onClick={() => setShowPreviousTests(!showPreviousTests)}
          className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <h2 className="text-2xl font-bold text-gray-900">{t('diseaseDetection.previousTests')}</h2>
          <svg
            className={`w-6 h-6 text-gray-600 transition-transform ${showPreviousTests ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showPreviousTests && (
          <div className="p-6 border-t border-gray-200">
            {loadingReports ? (
              <div className="text-center py-8 text-gray-500">{t('diseaseDetection.loadingReports')}</div>
            ) : reports.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>{t('diseaseDetection.noPreviousTests')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {reports.map((report) => {
                  const dateTime = formatDateTime(report.createdAt);
                  const healthy = isHealthy(report.prediction);
                  return (
                    <div
                      key={report._id}
                      className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 p-4 border-2 border-gray-100 hover:border-green-300 relative"
                    >
                      {/* Delete Button */}
                      <button
                        onClick={() => handleDeleteReport(report._id)}
                        disabled={deletingId === report._id}
                        className="absolute top-2 right-2 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors disabled:opacity-50"
                        title="Delete report"
                      >
                        {deletingId === report._id ? (
                          <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        )}
                      </button>

                      {/* Image Thumbnail */}
                      {report.imageURL && (
                        <div className="mb-3 rounded-lg overflow-hidden">
                          <img
                            src={report.imageURL}
                            alt="Disease detection"
                            className="w-full h-32 object-cover"
                          />
                        </div>
                      )}

                      {/* Crop Name */}
                      <p className="text-sm font-semibold text-gray-600 mb-1">
                        {t('crops.' + report.cropName) || report.cropName}
                      </p>

                      {/* Disease Name */}
                      <div className={`mb-2 p-2 rounded-lg ${
                        healthy ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        <p className={`text-lg font-bold capitalize ${
                          healthy ? 'text-green-800' : 'text-red-800'
                        }`}>
                          {t(`diseases.${report.cropName}_${report.prediction?.toLowerCase().replace(/\s+/g, '_')}`, { defaultValue: report.prediction || t('common.unknown') })}
                        </p>
                      </div>

                      {/* Confidence */}
                      <div className="mb-2">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div
                              className={`h-full transition-all ${
                                healthy ? 'bg-green-500' : 'bg-orange-500'
                              }`}
                              style={{ width: `${report.confidence || 0}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-semibold text-gray-700">
                            {report.confidence?.toFixed(1) || 0}%
                          </span>
                        </div>
                      </div>

                      {/* Date & Time */}
                      <div className="text-xs text-gray-500 space-y-1">
                        <p>Date: {dateTime.date}</p>
                        <p>Time: {dateTime.time}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Loading screen - ML server starting
  if (mlServerStatus === 'starting' && isPredicting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 py-12 px-4">
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-green-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-green-600 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{t('diseaseDetection.startingServer')}</h2>
          <p className="text-gray-600">{t('diseaseDetection.pleaseWait')}</p>
        </div>
      </div>
    );
  }

  // Loading screen - Predicting disease
  if (isPredicting && mlServerStatus === 'running') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 py-12 px-4">
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-green-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-green-600 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{t('diseaseDetection.predicting')}</h2>
          <p className="text-gray-600">{t('diseaseDetection.analyzingImage')}</p>
        </div>
      </div>
    );
  }

  // Results screen
  if (predictionResult) {
    const dateTime = formatDateTime(predictionResult.createdAt);
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12 px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6">
              <h2 className="text-3xl font-bold mb-2">{t('diseaseDetection.results.title')}</h2>
              <p className="text-green-100">{t('diseaseDetection.results.subtitle')}</p>
            </div>

            {/* Content */}
            <div className="p-6 md:p-8">
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                {/* Image Preview */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-3">{t('diseaseDetection.uploadedImage')}</h3>
                  <div className="rounded-lg overflow-hidden shadow-lg border-4 border-green-200">
                    <img
                      src={predictionResult.imageURL || imagePreview}
                      alt="Disease detection"
                      className="w-full h-auto object-cover"
                    />
                  </div>
                </div>

                {/* Results */}
                <div className="space-y-4">
                  <div className={`rounded-lg p-4 border-l-4 ${
                    isHealthy(predictionResult.prediction) 
                      ? 'bg-green-50 border-green-500' 
                      : 'bg-red-50 border-red-500'
                  }`}>
                    <p className="text-sm text-gray-600 mb-1">{t('diseaseDetection.diseaseName')}</p>
                    <p className="text-2xl font-bold text-gray-900 capitalize">
                      {predictionResult.prediction || 'Unknown'}
                    </p>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
                    <p className="text-sm text-gray-600 mb-1">{t('diseaseDetection.confidence')}</p>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-gray-200 rounded-full h-4 overflow-hidden">
                        <div
                          className="bg-blue-600 h-full transition-all duration-500"
                          style={{ width: `${predictionResult.confidence || 0}%` }}
                        ></div>
                      </div>
                      <span className="text-xl font-bold text-gray-900">
                        {predictionResult.confidence?.toFixed(1) || 0}%
                      </span>
                    </div>
                  </div>

                  <div className="bg-purple-50 rounded-lg p-4 border-l-4 border-purple-500">
                    <p className="text-sm text-gray-600 mb-1">{t('diseaseDetection.selectedCrop')}</p>
                    <p className="text-xl font-semibold text-gray-900 capitalize">
                      {selectedCrop}
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-gray-400">
                    <p className="text-sm text-gray-600 mb-1">{t('diseaseDetection.dateTime')}</p>
                    <p className="text-sm font-medium text-gray-900">
                      {dateTime.date} at {dateTime.time}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4 mt-6">
                <button
                  onClick={handleReset}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  {t('diseaseDetection.detectAnother')}
                </button>
              </div>
            </div>
          </div>

          {/* Previous Disease Testing Section */}
          {renderPreviousTestsSection()}
        </div>
      </div>
    );
  }

  // Main detection interface
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Heading */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            {t('diseaseDetection.title')}
          </h1>
          <p className="text-lg text-gray-600">
            {t('diseaseDetection.welcomeMessage')}
          </p>
        </div>

        {/* Crop Selection */}
        {!selectedCrop ? (
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {CROPS.map((crop) => (
                <button
                  key={crop}
                  onClick={() => handleCropSelect(crop)}
                  className="group relative bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 border-2 border-green-200 hover:border-green-400 rounded-xl p-4 transition-all duration-200 transform hover:scale-105 hover:shadow-lg"
                >
                  <div className="text-center">
                    <div className="text-3xl mb-2">🌾</div>
                    <p className="text-sm font-semibold text-gray-800 capitalize group-hover:text-green-700">
                      {t('crops.' + crop) || crop}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Selected Crop Display */}
            <div className="bg-white rounded-xl shadow-lg p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-2xl">🌾</div>
                <div>
                  <p className="text-sm text-gray-600">{t('diseaseDetection.selectedCrop')}</p>
                  <p className="text-lg font-bold text-gray-900 capitalize">{selectedCrop}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCrop(null)}
                className="text-gray-500 hover:text-gray-700 text-sm font-medium"
              >
                {t('diseaseDetection.changeCrop')}
              </button>
            </div>

            {/* Image Upload Section */}
            <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('diseaseDetection.uploadImage')}</h2>

              {!imagePreview ? (
                <div className="space-y-4">
                  {/* Upload Options */}
                  <div className="grid md:grid-cols-2 gap-4">
                    {/* File Upload */}
                    <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 hover:border-green-400 transition-colors group">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg
                          className="w-12 h-12 mb-4 text-gray-400 group-hover:text-green-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                          />
                        </svg>
                        <p className="mb-2 text-sm font-semibold text-gray-700 group-hover:text-green-700">
                          {t('diseaseDetection.uploadImage')}
                        </p>
                        <p className="text-xs text-gray-500">{t('diseaseDetection.imageRequirements')}</p>
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageSelect}
                      />
                    </label>

                    {/* Camera Capture */}
                    <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 hover:border-green-400 transition-colors group">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg
                          className="w-12 h-12 mb-4 text-gray-400 group-hover:text-green-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        <p className="mb-2 text-sm font-semibold text-gray-700 group-hover:text-green-700">
                          {t('diseaseDetection.takePhoto')}
                        </p>
                        <p className="text-xs text-gray-500">{t('diseaseDetection.useCamera')}</p>
                      </div>
                      <input
                        ref={cameraInputRef}
                        type="file"
                        className="hidden"
                        accept="image/*"
                        capture="environment"
                        onChange={handleCameraCapture}
                      />
                    </label>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Image Preview */}
                  <div className="relative rounded-xl overflow-hidden border-4 border-green-200 shadow-lg">
                    <img
                      src={imagePreview}
                      alt="Selected"
                      className="w-full h-auto max-h-96 object-contain bg-gray-50"
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex gap-4">
                    <button
                      onClick={() => {
                        setSelectedImage(null);
                        setImagePreview(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                        if (cameraInputRef.current) cameraInputRef.current.value = '';
                      }}
                      className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-lg transition-colors"
                    >
                      {t('diseaseDetection.changeImage')}
                    </button>
                    <button
                      onClick={handleDetect}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors shadow-lg"
                    >
                      {t('diseaseDetection.detectDisease')}
                    </button>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="mt-4 bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded">
                  <p className="font-medium">{error}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Previous Disease Testing Section */}
        {renderPreviousTestsSection()}
      </div>
    </div>
  );
};

export default DiseaseDetection;

