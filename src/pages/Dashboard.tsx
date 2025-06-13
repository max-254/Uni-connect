import React from 'react';
import { Bell, ChevronDown, Users, Zap } from 'lucide-react';

const Dashboard = () => {
  const subscribers = [
    { name: 'Abbey landing page', email: 'jdoe.mobbin@gmail.com', avatar: '🟧' },
    { name: 'Abbey landing page', email: 'alexsmith.mobbin@gmail.com', avatar: '🟦' },
    { name: 'Abbey landing page', email: 'user3@example.com', avatar: '🟦' }
  ];

  const stats = [
    { label: 'Today', value: '4' },
    { label: 'Past 7 days', value: '4' },
    { label: 'Past 30 days', value: '4' },
    { label: 'Total', value: '4' }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <span className="text-2xl font-bold">Kit</span>
            </div>

            {/* Navigation */}
            <nav className="flex items-center space-x-8">
              <button className="flex items-center text-gray-700 hover:text-gray-900">
                Grow
                <ChevronDown className="ml-1 h-4 w-4" />
              </button>
              <button className="flex items-center text-gray-700 hover:text-gray-900">
                Send
                <ChevronDown className="ml-1 h-4 w-4" />
              </button>
              <button className="flex items-center text-gray-700 hover:text-gray-900">
                Automate
                <ChevronDown className="ml-1 h-4 w-4" />
              </button>
              <button className="flex items-center text-gray-700 hover:text-gray-900">
                Earn
                <ChevronDown className="ml-1 h-4 w-4" />
              </button>
              <button className="flex items-center text-gray-700 hover:text-gray-900">
                Learn
                <ChevronDown className="ml-1 h-4 w-4" />
              </button>
            </nav>

            {/* Right section */}
            <div className="flex items-center space-x-4">
              <button className="text-gray-700 hover:text-gray-900">
                <Bell className="h-5 w-5" />
              </button>
              <span className="text-sm text-gray-600">Trial: 11 days remaining</span>
              <button className="rounded-md bg-black px-3 py-2 text-sm font-semibold text-white hover:bg-gray-800">
                Upgrade now
              </button>
              <button className="flex items-center text-gray-700 hover:text-gray-900">
                SLMobbin
                <ChevronDown className="ml-1 h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Welcome back, Sam Lee</h1>
          <button className="flex items-center rounded-md bg-gray-900 px-3 py-2 text-sm font-semibold text-white hover:bg-gray-700">
            Create a new
            <ChevronDown className="ml-1 h-4 w-4" />
          </button>
        </div>

        {/* Subscribers section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">New subscribers</h2>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              Go to subscribers →
            </button>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {stats.map((stat, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600">{stat.label}</div>
                <div className="text-3xl font-bold mt-1">{stat.value}</div>
              </div>
            ))}
          </div>

          {/* Recent subscribers list */}
          <div className="bg-white border border-gray-200 rounded-lg">
            <div className="p-4">
              <h3 className="text-sm font-medium text-gray-900">Most recent subscribers</h3>
            </div>
            <div className="border-t border-gray-200">
              {subscribers.map((subscriber, index) => (
                <div
                  key={index}
                  className="flex items-center p-4 hover:bg-gray-50"
                >
                  <span className="text-2xl mr-3">{subscriber.avatar}</span>
                  <div>
                    <div className="text-sm font-medium text-gray-900">{subscriber.email}</div>
                    <div className="text-sm text-gray-500">{subscriber.name}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* From Kit section */}
        <div>
          <h2 className="text-lg font-semibold mb-6">From Kit</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Grow your audience faster */}
            <div>
              <h3 className="text-lg font-medium mb-2">Grow your audience faster</h3>
              <div className="flex items-center mb-4">
                <Users className="h-5 w-5 mr-2" />
                <span className="font-medium">Creator Network</span>
              </div>
              <p className="text-gray-600">
                Thousands of creators in the Creator Network are growing their lists faster together with Recommendations.
              </p>
            </div>

            {/* Quick tip */}
            <div>
              <h3 className="text-lg font-medium mb-4">Quick tip</h3>
              <div className="aspect-video bg-gray-100 rounded-lg"></div>
            </div>

            {/* Daily dose of inspiration */}
            <div>
              <h3 className="text-lg font-medium mb-4">Daily dose of inspiration</h3>
              <div className="aspect-video bg-gray-100 rounded-lg"></div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;