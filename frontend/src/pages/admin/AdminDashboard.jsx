import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const adminCards = [
    {
      to: '/admin/farmers',
      icon: '👨‍🌾',
      title: 'Farmers',
      description: 'Manage all farmer accounts',
      color: 'from-green-500 to-emerald-600',
      count: 'All Farmers',
    },
    {
      to: '/admin/agronomists',
      icon: '🔬',
      title: 'Agronomists',
      description: 'Verify and manage agronomists',
      color: 'from-blue-500 to-indigo-600',
      count: 'All Agronomists',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
            🛡️ Admin Dashboard
          </h1>
          <p className="text-lg text-gray-300">
            Manage farmers, agronomists, and system administration
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {adminCards.map((card) => (
            <Link
              key={card.to}
              to={card.to}
              className="group relative bg-gradient-to-br from-gray-800 to-gray-700 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 overflow-hidden transform hover:-translate-y-2 border border-gray-600"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-0 group-hover:opacity-20 transition-opacity`}></div>
              <div className="relative p-8">
                <div className="flex items-start justify-between mb-4">
                  <div className="text-6xl transform group-hover:scale-110 transition-transform">
                    {card.icon}
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-1">
                    <span className="text-white text-sm font-semibold">{card.count}</span>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">{card.title}</h3>
                <p className="text-gray-300 text-sm mb-4">{card.description}</p>
                <div className="flex items-center text-white font-medium group-hover:text-gray-200">
                  <span className="text-sm">Manage</span>
                  <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-2xl shadow-2xl p-6 border border-gray-600">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
              <p className="text-gray-300 text-sm mb-1">System Status</p>
              <p className="text-white font-semibold">All Systems Operational</p>
            </div>
            <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
              <p className="text-gray-300 text-sm mb-1">Last Updated</p>
              <p className="text-white font-semibold">{new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
