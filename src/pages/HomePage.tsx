const HomePage = () => {
  const stats = [
    { label: 'Market Cap', value: '$2.4T', change: '+2.5%' },
    { label: 'BTC Price', value: '$64,231', change: '-0.4%' },
    { label: 'Active Alerts', value: '12', change: 'New' },
  ];

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-4xl font-extrabold">Market Overview</h1>
        <p className="text-gray-400 mt-2">Welcome back! Here's what's happening in the crypto world.</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-gray-800 p-6 rounded-2xl border border-gray-700">
            <p className="text-gray-400 text-sm">{stat.label}</p>
            <div className="flex items-end justify-between mt-2">
              <span className="text-2xl font-bold">{stat.value}</span>
              <span className={`text-sm ${stat.change.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Area Placeholder */}
      <div className="bg-gray-800 border border-gray-700 rounded-2xl h-64 flex items-center justify-center text-gray-500">
        <div className="text-center">
          <p className="text-lg">Price Chart Placeholder</p>
          <p className="text-sm">Connect your API to see real-time data</p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;