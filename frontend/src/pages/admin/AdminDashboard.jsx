import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/admin/farmers"
          className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
        >
          <div className="text-green-600 text-4xl mb-4">👨‍🌾</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Farmers</h3>
          <p className="text-gray-600">Manage farmers</p>
        </Link>

        <Link
          to="/admin/agronomists"
          className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
        >
          <div className="text-green-600 text-4xl mb-4">🔬</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Agronomists</h3>
          <p className="text-gray-600">Manage agronomists</p>
        </Link>

        <Link
          to="/admin/locations"
          className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
        >
          <div className="text-green-600 text-4xl mb-4">📍</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Locations</h3>
          <p className="text-gray-600">Manage locations</p>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;






