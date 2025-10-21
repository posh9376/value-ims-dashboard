
const Overview = () => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Finance Overview</h1>
        <p className="text-gray-600">Financial metrics and analytics dashboard</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Sample cards */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Revenue</h3>
          <p className="text-2xl font-bold text-gray-900 mt-2">ksh.24,500,000</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Monthly Growth</h3>
          <p className="text-2xl font-bold text-green-600 mt-2">+12.5%</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Total sales</h3>
          <p className="text-2xl font-bold text-gray-900 mt-2">1,247</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Pending Items</h3>
          <p className="text-2xl font-bold text-yellow-600 mt-2">23</p>
        </div>
      </div>
    </div>
  );
};

export default Overview;
