import React from 'react';
import { FaChartLine, FaTrophy, FaTimesCircle, FaClock } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

function Statistics({ stats }) {
  const { user } = useAuth();
  const currencySymbol = user?.country === 'nigeria' ? '₦' : 'GH₵';

  const statCards = [
    {
      title: 'Win Rate',
      value: `${stats.winRate}%`,
      icon: <FaChartLine className="h-8 w-8 text-green-500" />,
      description: 'Overall success rate',
      color: 'bg-green-100'
    },
    {
      title: 'Total Won',
      value: `${currencySymbol}${stats.totalWon.toLocaleString()}`,
      icon: <FaTrophy className="h-8 w-8 text-yellow-500" />,
      description: 'Total earnings',
      color: 'bg-yellow-100'
    },
    {
      title: 'Total Lost',
      value: `${stats.totalLost}`,
      icon: <FaTimesCircle className="h-8 w-8 text-red-500" />,
      description: 'Number of lost bets',
      color: 'bg-red-100'
    },
    {
      title: 'Pending',
      value: `${stats.pending}`,
      icon: <FaClock className="h-8 w-8 text-blue-500" />,
      description: 'Awaiting results',
      color: 'bg-blue-100'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat, index) => (
        <div 
          key={index} 
          className={`${stat.color} rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{stat.title}</p>
              <p className="text-2xl font-bold mt-1">{stat.value}</p>
              <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
            </div>
            {stat.icon}
          </div>
        </div>
      ))}
    </div>
  );
}

export default Statistics; 