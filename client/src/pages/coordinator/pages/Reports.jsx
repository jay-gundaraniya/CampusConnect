import { useState, useEffect } from 'react';
import { FaChartBar, FaDownload, FaStar, FaUsers, FaCalendarAlt, FaComments } from 'react-icons/fa';

function Reports() {
  const [reports, setReports] = useState({});
  const [selectedEvent, setSelectedEvent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API calls
      const mockReports = {
        overview: {
          totalEvents: 5,
          totalParticipants: 120,
          averageRating: 4.2,
          totalFeedback: 45
        },
        events: [
          { id: 1, title: 'Tech Workshop 2024', participants: 45, rating: 4.5, feedback: 12 },
          { id: 2, title: 'Cultural Festival', participants: 120, rating: 4.1, feedback: 28 },
          { id: 3, title: 'Career Fair', participants: 0, rating: 0, feedback: 0 }
        ],
        feedback: [
          {
            id: 1,
            eventTitle: 'Tech Workshop 2024',
            studentName: 'John Doe',
            rating: 5,
            comment: 'Excellent workshop! Learned a lot about modern web technologies.',
            date: '2024-02-15'
          },
          {
            id: 2,
            eventTitle: 'Cultural Festival',
            studentName: 'Jane Smith',
            rating: 4,
            comment: 'Great event! The performances were amazing.',
            date: '2024-02-20'
          }
        ]
      };
      setReports(mockReports);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = (type) => {
    // TODO: Implement export functionality
    console.log(`Exporting ${type} report...`);
  };

  const getRatingStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <FaStar
        key={i}
        className={`h-4 w-4 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Feedback & Reports</h1>
        <p className="text-gray-600 mt-2">View analytics and feedback from your events</p>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading reports...</p>
        </div>
      ) : (
        <>
          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-500 bg-opacity-10">
                  <FaCalendarAlt className="h-6 w-6 text-blue-500" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Events</p>
                  <p className="text-2xl font-semibold text-gray-900">{reports.overview?.totalEvents}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-500 bg-opacity-10">
                  <FaUsers className="h-6 w-6 text-green-500" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Participants</p>
                  <p className="text-2xl font-semibold text-gray-900">{reports.overview?.totalParticipants}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-yellow-500 bg-opacity-10">
                  <FaStar className="h-6 w-6 text-yellow-500" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Average Rating</p>
                  <p className="text-2xl font-semibold text-gray-900">{reports.overview?.averageRating}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-purple-500 bg-opacity-10">
                  <FaComments className="h-6 w-6 text-purple-500" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Feedback</p>
                  <p className="text-2xl font-semibold text-gray-900">{reports.overview?.totalFeedback}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Event Performance */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Event Performance</h2>
              <button
                onClick={() => exportReport('events')}
                className="flex items-center px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
              >
                <FaDownload className="mr-1 h-3 w-3" />
                Export
              </button>
            </div>
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Event
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Participants
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rating
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Feedback
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reports.events?.map((event) => (
                      <tr key={event.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{event.title}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{event.participants}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {event.rating > 0 ? (
                              <>
                                <div className="flex mr-2">{getRatingStars(event.rating)}</div>
                                <span className="text-sm text-gray-900">({event.rating})</span>
                              </>
                            ) : (
                              <span className="text-sm text-gray-500">No ratings</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{event.feedback}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Recent Feedback */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Recent Feedback</h2>
              <button
                onClick={() => exportReport('feedback')}
                className="flex items-center px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
              >
                <FaDownload className="mr-1 h-3 w-3" />
                Export
              </button>
            </div>
            <div className="p-6">
              {reports.feedback?.length === 0 ? (
                <div className="text-center py-8">
                  <FaComments className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No feedback received yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reports.feedback?.map((feedback) => (
                    <div key={feedback.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-medium text-gray-900">{feedback.eventTitle}</h3>
                          <p className="text-sm text-gray-500">by {feedback.studentName}</p>
                        </div>
                        <div className="flex items-center">
                          <div className="flex mr-2">{getRatingStars(feedback.rating)}</div>
                          <span className="text-sm text-gray-500">{feedback.date}</span>
                        </div>
                      </div>
                      <p className="text-gray-700">{feedback.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <FaChartBar className="h-5 w-5 text-blue-600 mr-3" />
                <span className="text-sm font-medium text-gray-700">Generate Report</span>
              </button>
              <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <FaDownload className="h-5 w-5 text-green-600 mr-3" />
                <span className="text-sm font-medium text-gray-700">Export All Data</span>
              </button>
              <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <FaComments className="h-5 w-5 text-purple-600 mr-3" />
                <span className="text-sm font-medium text-gray-700">View All Feedback</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Reports; 