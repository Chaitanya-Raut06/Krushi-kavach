import { useState, useEffect } from 'react';
import { adminAPI, agronomistAPI } from '../../services/api';

const Agronomists = () => {
  const [agronomists, setAgronomists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusUpdating, setStatusUpdating] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [viewingDocument, setViewingDocument] = useState(null);

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

  const handleStatusChange = async (profileId, status) => {
    try {
      setStatusUpdating(profileId + status);
      await agronomistAPI.verifyAgronomist(profileId, status);
      await fetchAgronomists();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update agronomist status');
    } finally {
      setStatusUpdating(null);
    }
  };

  const handleDelete = async (userId) => {
    if (!userId) {
      setError('Agronomist account missing user reference.');
      return;
    }
    if (!window.confirm('Are you sure you want to delete this agronomist account?')) return;
    try {
      setDeletingId(userId);
      await adminAPI.deleteAgronomist(userId);
      await fetchAgronomists();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete agronomist');
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      verified: 'bg-green-100 text-green-800 border-green-200',
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      rejected: 'bg-red-100 text-red-800 border-red-200',
    };
    return badges[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            <span className="ml-4 text-gray-600 text-lg">Loading agronomists...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
            🔬 Agronomists Management
          </h1>
          <p className="text-lg text-gray-600">
            Verify, approve, and manage all agronomist accounts
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 text-red-800 px-4 py-3 rounded-lg shadow-sm">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Table Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-6 py-5">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <span>📊</span>
                <span>All Agronomists</span>
              </h2>
              <button
                onClick={fetchAgronomists}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            {agronomists.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🔬</div>
                <p className="text-gray-500 text-lg">No agronomists found.</p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Mobile
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Qualification
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Experience
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      ID Proof
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {agronomists.map((agronomist) => (
                    <tr key={agronomist._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold mr-3">
                            {(agronomist.user?.fullName || agronomist.fullName)?.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-sm font-semibold text-gray-900">
                            {agronomist.user?.fullName || agronomist.fullName}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {agronomist.user?.mobileNumber || agronomist.mobileNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {agronomist.qualification || <span className="text-gray-400">N/A</span>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {agronomist.experience || 0} years
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusBadge(agronomist.status)}`}>
                          {agronomist.status || 'pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {agronomist.idProof?.url ? (
                          <button
                            onClick={() => setViewingDocument(agronomist.idProof)}
                            className="inline-flex items-center px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-medium transition-colors"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            {agronomist.idProof?.contentType === 'application/pdf' ? 'View PDF' : 'View Image'}
                          </button>
                        ) : (
                          <span className="text-gray-400">No document</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          {agronomist.status !== 'verified' && (
                            <button
                              onClick={() => handleStatusChange(agronomist._id, 'verified')}
                              disabled={statusUpdating === agronomist._id + 'verified'}
                              className="inline-flex items-center px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                            >
                              {statusUpdating === agronomist._id + 'verified' ? (
                                <>
                                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                  Approving...
                                </>
                              ) : (
                                <>
                                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                  Approve
                                </>
                              )}
                            </button>
                          )}
                          {agronomist.status !== 'rejected' && (
                            <button
                              onClick={() => handleStatusChange(agronomist._id, 'rejected')}
                              disabled={statusUpdating === agronomist._id + 'rejected'}
                              className="inline-flex items-center px-3 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                            >
                              {statusUpdating === agronomist._id + 'rejected' ? (
                                <>
                                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                  Rejecting...
                                </>
                              ) : (
                                <>
                                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                  Reject
                                </>
                              )}
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(agronomist.user?._id)}
                            disabled={deletingId === agronomist.user?._id}
                            className="inline-flex items-center px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                          >
                            {deletingId === agronomist.user?._id ? (
                              <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Deleting...
                              </>
                            ) : (
                              <>
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Delete
                              </>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Document Viewer Modal */}
      {viewingDocument && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setViewingDocument(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-auto relative shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-gradient-to-r from-gray-800 to-gray-900 text-white px-6 py-4 flex justify-between items-center rounded-t-2xl">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {viewingDocument.contentType === 'application/pdf' ? 'ID Proof - PDF Document' : 'ID Proof - Image'}
              </h3>
              <button
                onClick={() => setViewingDocument(null)}
                className="text-white hover:text-gray-200 text-3xl font-bold hover:bg-white/10 rounded-full w-10 h-10 flex items-center justify-center transition-colors"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              {viewingDocument.contentType === 'application/pdf' ? (
                <div className="bg-gray-100 rounded-lg p-4">
                  <object
                    data={`${viewingDocument.url}#toolbar=1`}
                    type="application/pdf"
                    className="w-full h-[75vh] border-0 rounded-lg"
                    title="PDF Viewer"
                  >
                    <iframe
                      src={`${viewingDocument.url}#toolbar=1`}
                      className="w-full h-[75vh] border-0 rounded-lg"
                      title="PDF Viewer"
                    >
                      <div className="text-center py-12">
                        <p className="text-gray-600 mb-4">
                          Your browser does not support PDFs.
                        </p>
                        <a
                          href={viewingDocument.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                        >
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Download PDF
                        </a>
                      </div>
                    </iframe>
                  </object>
                </div>
              ) : (
                <div className="flex justify-center bg-gray-100 rounded-lg p-4">
                  <img
                    src={viewingDocument.url}
                    alt="ID Proof"
                    className="max-w-full max-h-[75vh] rounded-lg object-contain shadow-lg"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Agronomists;
