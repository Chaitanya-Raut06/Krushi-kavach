import { Link } from 'react-router-dom';

const FarmerDashboard = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Farmer Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link
          to="/farmer/crops"
          className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
        >
          <div className="text-green-600 text-4xl mb-4">🌾</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Crops</h3>
          <p className="text-gray-600">Manage your crops</p>
        </Link>

        <Link
          to="/farmer/disease-reports"
          className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
        >
          <div className="text-green-600 text-4xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Disease Reports</h3>
          <p className="text-gray-600">Report and track diseases</p>
        </Link>

        <Link
          to="/farmer/weather"
          className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
        >
          <div className="text-green-600 text-4xl mb-4">☁️</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Weather</h3>
          <p className="text-gray-600">Check weather forecast</p>
        </Link>

        <Link
          to="/farmer/advisories"
          className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
        >
          <div className="text-green-600 text-4xl mb-4">📋</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Advisories</h3>
          <p className="text-gray-600">View farming advisories</p>
        </Link>
      </div>
    </div>
  );
};

export default FarmerDashboard;






