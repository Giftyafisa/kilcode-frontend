import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaChartLine, FaChartBar, FaChartPie, FaClock, FaCheckCircle, FaTimesCircle, FaInfoCircle, FaHistory, FaStar, FaDownload } from 'react-icons/fa';
import { Chart, registerables } from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';
import { useCountryConfig } from '../../../hooks/useCountryConfig';
import { marketplaceService } from '../../../services/marketplaceService';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

// Register Chart.js components
Chart.register(...registerables);

const CodeDetails = ({ code, onClose }) => {
  const { formatCurrency } = useCountryConfig();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState('7d');
  const [activeTab, setActiveTab] = useState('performance');
  const [feedback, setFeedback] = useState([]);
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    loadAnalytics();
    loadFeedback();
    loadMetrics();
  }, [code.id, selectedTimeframe]);

  const loadAnalytics = async () => {
    try {
      const data = await marketplaceService.getDetailedAnalytics(selectedTimeframe, { codeId: code.id });
      setAnalytics(data);
    } catch (error) {
      console.error('Error loading analytics:', error);
      toast.error('Failed to load analytics data');
    }
  };

  const loadFeedback = async () => {
    try {
      const data = await marketplaceService.getFeedbackSummary(code.id);
      setFeedback(data);
    } catch (error) {
      console.error('Error loading feedback:', error);
    }
  };

  const loadMetrics = async () => {
    try {
      const data = await marketplaceService.getPerformanceMetrics(code.id, selectedTimeframe);
      setMetrics(data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading metrics:', error);
      setLoading(false);
    }
  };

  const timeframeOptions = [
    { value: '24h', label: '24 Hours' },
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: '90d', label: '90 Days' }
  ];

  const renderPerformanceChart = () => {
    if (!analytics?.performance) return null;

    const data = {
      labels: analytics.performance.map(p => format(new Date(p.date), 'MMM dd')),
      datasets: [
        {
          label: 'Win Rate',
          data: analytics.performance.map(p => p.winRate),
          borderColor: '#10B981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          fill: true,
          tension: 0.4
        },
        {
          label: 'ROI',
          data: analytics.performance.map(p => p.roi),
          borderColor: '#3B82F6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: true,
          tension: 0.4
        }
      ]
    };

    const options = {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            color: '#9CA3AF'
          }
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          backgroundColor: '#1F2937',
          titleColor: '#F3F4F6',
          bodyColor: '#D1D5DB',
          borderColor: '#374151',
          borderWidth: 1
        }
      },
      scales: {
        x: {
          grid: {
            color: '#374151'
          },
          ticks: {
            color: '#9CA3AF'
          }
        },
        y: {
          grid: {
            color: '#374151'
          },
          ticks: {
            color: '#9CA3AF',
            callback: value => `${value}%`
          }
        }
      }
    };

    return <Line data={data} options={options} />;
  };

  const renderDistributionChart = () => {
    if (!analytics?.distribution) return null;

    const data = {
      labels: analytics.distribution.map(d => d.category),
      datasets: [
        {
          data: analytics.distribution.map(d => d.percentage),
          backgroundColor: [
            '#10B981',
            '#3B82F6',
            '#F59E0B',
            '#EF4444',
            '#8B5CF6'
          ]
        }
      ]
    };

    const options = {
      responsive: true,
      plugins: {
        legend: {
          position: 'right',
          labels: {
            color: '#9CA3AF'
          }
        },
        tooltip: {
          backgroundColor: '#1F2937',
          titleColor: '#F3F4F6',
          bodyColor: '#D1D5DB',
          borderColor: '#374151',
          borderWidth: 1
        }
      }
    };

    return <Pie data={data} options={options} />;
  };

  const renderMetricsChart = () => {
    if (!metrics) return null;

    const data = {
      labels: ['Accuracy', 'Consistency', 'Value', 'Risk Level', 'Market Coverage'],
      datasets: [
        {
          label: 'Current Performance',
          data: [
            metrics.accuracy,
            metrics.consistency,
            metrics.value,
            metrics.riskLevel,
            metrics.marketCoverage
          ],
          backgroundColor: 'rgba(59, 130, 246, 0.6)'
        }
      ]
    };

    const options = {
      responsive: true,
      scales: {
        r: {
          angleLines: {
            color: '#374151'
          },
          grid: {
            color: '#374151'
          },
          pointLabels: {
            color: '#9CA3AF'
          },
          ticks: {
            color: '#9CA3AF',
            backdropColor: 'transparent'
          }
        }
      },
      plugins: {
        legend: {
          display: false
        }
      }
    };

    return <Bar data={data} options={options} />;
  };

  const renderPerformanceMetrics = () => {
    if (!metrics) return null;

    return (
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-800 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">Win Rate</span>
            <span className={`text-lg font-bold ${metrics.winRate >= 60 ? 'text-green-400' : 'text-yellow-400'}`}>
              {metrics.winRate}%
            </span>
          </div>
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${metrics.winRate >= 60 ? 'bg-green-400' : 'bg-yellow-400'}`}
              style={{ width: `${metrics.winRate}%` }}
            />
          </div>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">ROI</span>
            <span className={`text-lg font-bold ${metrics.roi >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {metrics.roi}%
            </span>
          </div>
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${metrics.roi >= 0 ? 'bg-green-400' : 'bg-red-400'}`}
              style={{ width: `${Math.min(Math.abs(metrics.roi), 100)}%` }}
            />
          </div>
        </div>
      </div>
    );
  };

  const renderFeedbackSummary = () => {
    if (!feedback) return null;

    return (
      <div className="bg-gray-800 p-4 rounded-lg mb-6">
        <h3 className="text-lg font-medium text-white mb-4">User Feedback</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400 mb-1">{feedback.positiveRate}%</div>
            <div className="text-sm text-gray-400">Positive</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400 mb-1">{feedback.neutralRate}%</div>
            <div className="text-sm text-gray-400">Neutral</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-400 mb-1">{feedback.negativeRate}%</div>
            <div className="text-sm text-gray-400">Negative</div>
          </div>
        </div>
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">Average Rating</span>
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <FaStar
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.round(feedback.averageRating)
                      ? 'text-yellow-400'
                      : 'text-gray-600'
                  }`}
                />
              ))}
            </div>
          </div>
          <div className="text-sm text-gray-400">
            Based on {feedback.total} reviews
          </div>
        </div>
      </div>
    );
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-gray-900 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white">Code Analysis</h2>
              <p className="text-gray-400">ID: {code.id}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex items-center space-x-4 mb-6">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-gray-400">Status:</span>
                {code.isActive ? (
                  <span className="flex items-center text-green-400">
                    <FaCheckCircle className="mr-1" /> Active
                  </span>
                ) : (
                  <span className="flex items-center text-red-400">
                    <FaTimesCircle className="mr-1" /> Inactive
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-gray-400">Valid Until:</span>
                <span className="text-white">{format(new Date(code.validUntil), 'PPP')}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-gray-400 mb-1">Price</div>
              <div className="text-2xl font-bold text-white">{formatCurrency(code.price)}</div>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex space-x-2 mb-4">
              {timeframeOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => setSelectedTimeframe(option.value)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    selectedTimeframe === option.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <div className="flex space-x-4 mb-4">
              <button
                onClick={() => setActiveTab('performance')}
                className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'performance'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                <FaChartLine className="mr-2" />
                Performance
              </button>
              <button
                onClick={() => setActiveTab('distribution')}
                className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'distribution'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                <FaChartPie className="mr-2" />
                Distribution
              </button>
              <button
                onClick={() => setActiveTab('metrics')}
                className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'metrics'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                <FaChartBar className="mr-2" />
                Metrics
              </button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
              </div>
            ) : (
              <div className="bg-gray-800 p-4 rounded-lg">
                {activeTab === 'performance' && (
                  <>
                    {renderPerformanceMetrics()}
                    {renderPerformanceChart()}
                  </>
                )}
                {activeTab === 'distribution' && renderDistributionChart()}
                {activeTab === 'metrics' && renderMetricsChart()}
              </div>
            )}
          </div>

          {renderFeedbackSummary()}

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-white mb-3">Usage Statistics</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Total Downloads</span>
                  <span className="text-white font-medium">{metrics?.totalDownloads || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Active Users</span>
                  <span className="text-white font-medium">{metrics?.activeUsers || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Average Usage Time</span>
                  <span className="text-white font-medium">{metrics?.averageUsageTime || '0h'}</span>
                </div>
              </div>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-white mb-3">Market Impact</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Market Share</span>
                  <span className="text-white font-medium">{metrics?.marketShare || '0%'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Trend Direction</span>
                  <span className={`font-medium ${
                    metrics?.trendDirection === 'up' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {metrics?.trendDirection === 'up' ? '↑ Upward' : '↓ Downward'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Volatility</span>
                  <span className={`font-medium ${
                    (metrics?.volatility || 0) < 30 ? 'text-green-400' : 'text-yellow-400'
                  }`}>
                    {metrics?.volatility || 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm text-gray-400">
            <div className="flex items-center">
              <FaClock className="mr-1" />
              Last updated: {format(new Date(), 'PPp')}
            </div>
            <div className="flex items-center">
              <FaInfoCircle className="mr-1" />
              Data refreshes every {selectedTimeframe === '24h' ? 'hour' : 'day'}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CodeDetails; 