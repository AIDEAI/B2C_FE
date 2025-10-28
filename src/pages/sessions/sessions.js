import React, { useState, useEffect } from 'react';
import { Search, ChevronDown, Edit, Trash2, Eye, Plus } from 'lucide-react';
import { useGetAllSessions } from '../../utils/api/userApi';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
const Sessions = () => {
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const { data: sessions, isLoading: isLoadingSessions, error: errorSessions } = useGetAllSessions(statusFilter, currentPage);
  console.log("🚀 ~ Sessions ~ sessions:", sessions);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');

  const statusOptions = ['All', 'In Progress', 'Submitted', 'Graded'];

  // Reset page to 1 when status filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter]);

  // Use actual data if available, otherwise use mock data
  const sessionData = sessions?.data 

  const paginationData = sessions?.pagination

  // Filter and search logic
  const filteredSessions = sessionData?.sessions?.filter(session => {
    const matchesSearch = session.sessionType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         session.program.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         session.paperType.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || 
                         (statusFilter === 'Submitted' && session.status?.toLowerCase().includes('submitted')) ||
                         (statusFilter === 'In Progress' && (session.status?.toLowerCase().includes('progress') || session.status?.toLowerCase().includes('in progress'))) ||
                         (statusFilter === 'Graded' && (session.status?.toLowerCase().includes('graded') || session.status?.toLowerCase().includes('evaluated'))) 
                        
    
    // Debug logging
    if (statusFilter !== 'All') {
      console.log(`🔍 Status Filter: "${statusFilter}" | Session Status: "${session.status}" | Matches: ${matchesStatus}`);
    }
    
    return matchesSearch && matchesStatus;
  }) || [];
  console.log("🚀 ~ filteredSessions ~ filteredSessions:", filteredSessions)

  // Sort logic
  const sortedSessions = [...filteredSessions].sort((a, b) => {
    if (!sortField) return 0;
    
    let aValue = a[sortField];
    let bValue = b[sortField];
    
    if (sortField === 'createdAt' || sortField === 'updatedAt') {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    }
    
    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'In Progress':
        return 'bg-blue-100 text-blue-800';
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Draft':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleAction = (action, sessionId) => {
    console.log(`${action} action for session:`, sessionId);
    // Implement your action logic here
  };

  const handleRowClick = (sessionId) => {
    // Find the session to check its status
    const session = sessionData?.sessions?.find(s => s.sessionId === sessionId);
    if(session?.status === 'In Progress'){
      navigate('/b2c/dashboard/paperAttempt', { state: { sessionId: sessionId } });
    } else  if (session?.status === 'Graded'){
      navigate('/b2c/dashboard/evaluatedSession', { state: { sessionId: sessionId } });
    }else{
        toast.error('Session is not evaluated yet', { position: 'bottom-right' });
    }
  };

  if (isLoadingSessions) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading sessions...</p>
        </div>
      </div>
    );
  }

  if (errorSessions) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading sessions</p>
          <p className="text-gray-600">{errorSessions.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 ">
      {/* Header Section */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Sessions</h1>
        <p className="text-gray-600">Manage your practice sessions</p>
      </div>

      {/* Top Controls */}
      <div className="  mb-2">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Search Bar */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search By Name"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Action Buttons and Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button onClick={() => navigate('/b2c/dashboard/pastPapers')} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add New Session
            </button>
            
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {statusOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('sessionType')}
                >
                  <div className="flex items-center gap-1">
                    SESSION TYPE
                    <div className="flex flex-col">
                      <div className={`w-0 h-0 border-l-2 border-r-2 border-b-2 border-transparent border-b-gray-400 ${sortField === 'sessionType' && sortDirection === 'asc' ? 'border-b-gray-600' : ''}`}></div>
                      <div className={`w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-gray-400 ${sortField === 'sessionType' && sortDirection === 'desc' ? 'border-t-gray-600' : ''}`}></div>
                    </div>
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('program')}
                >
                  <div className="flex items-center gap-1">
                    PROGRAM
                    <div className="flex flex-col">
                      <div className={`w-0 h-0 border-l-2 border-r-2 border-b-2 border-transparent border-b-gray-400 ${sortField === 'program' && sortDirection === 'asc' ? 'border-b-gray-600' : ''}`}></div>
                      <div className={`w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-gray-400 ${sortField === 'program' && sortDirection === 'desc' ? 'border-t-gray-600' : ''}`}></div>
                    </div>
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('paperType')}
                >
                  <div className="flex items-center gap-1">
                    PAPER TYPE
                    <div className="flex flex-col">
                      <div className={`w-0 h-0 border-l-2 border-r-2 border-b-2 border-transparent border-b-gray-400 ${sortField === 'paperType' && sortDirection === 'asc' ? 'border-b-gray-600' : ''}`}></div>
                      <div className={`w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-gray-400 ${sortField === 'paperType' && sortDirection === 'desc' ? 'border-t-gray-600' : ''}`}></div>
                    </div>
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('questionCount')}
                >
                  <div className="flex items-center gap-1">
                    QUESTIONS
                    <div className="flex flex-col">
                      <div className={`w-0 h-0 border-l-2 border-r-2 border-b-2 border-transparent border-b-gray-400 ${sortField === 'questionCount' && sortDirection === 'asc' ? 'border-b-gray-600' : ''}`}></div>
                      <div className={`w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-gray-400 ${sortField === 'questionCount' && sortDirection === 'desc' ? 'border-t-gray-600' : ''}`}></div>
                    </div>
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('createdAt')}
                >
                  <div className="flex items-center gap-1">
                    CREATED DATE
                    <div className="flex flex-col">
                      <div className={`w-0 h-0 border-l-2 border-r-2 border-b-2 border-transparent border-b-gray-400 ${sortField === 'createdAt' && sortDirection === 'asc' ? 'border-b-gray-600' : ''}`}></div>
                      <div className={`w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-gray-400 ${sortField === 'createdAt' && sortDirection === 'desc' ? 'border-t-gray-600' : ''}`}></div>
                    </div>
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center gap-1">
                    STATUS
                    <div className="flex flex-col">
                      <div className={`w-0 h-0 border-l-2 border-r-2 border-b-2 border-transparent border-b-gray-400 ${sortField === 'status' && sortDirection === 'asc' ? 'border-b-gray-600' : ''}`}></div>
                      <div className={`w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-gray-400 ${sortField === 'status' && sortDirection === 'desc' ? 'border-t-gray-600' : ''}`}></div>
                    </div>
                  </div>
                </th>
                {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ACTION
                </th> */}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedSessions?.map((session) => (
                <tr 
                  key={session.sessionId} 
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => handleRowClick(session.sessionId)}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {session.sessionType}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {session.program.toUpperCase()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {session.paperType.replace('_', ' ').toUpperCase()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {session.questionCount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(session.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(session.status)}`}>
                      {session.status}
                    </span>
                  </td>
                  {/* <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleAction('view', session.sessionId)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded"
                        title="View"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {session.status === 'In Progress' && (
                      <button
                        onClick={() => handleAction('edit', session.sessionId)}
                        className="text-gray-600 hover:text-gray-900 p-1 rounded"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      )}
                      <button
                        onClick={() => handleAction('delete', session.sessionId)}
                        className="text-red-600 hover:text-red-900 p-1 rounded"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td> */}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(Math.min(paginationData.totalPages, currentPage + 1))}
              disabled={currentPage === paginationData.totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">1</span> to <span className="font-medium">{paginationData.totalSessions}</span> of{' '}
                <span className="font-medium">{paginationData.totalSessions}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Previous</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                
                {/* Page Numbers */}
                {Array.from({ length: Math.min(5, paginationData.totalPages) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        currentPage === pageNum
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                {paginationData.totalPages > 5 && (
                  <>
                    <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                      ...
                    </span>
                    <button
                      onClick={() => setCurrentPage(paginationData.totalPages)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        currentPage === paginationData.totalPages
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {paginationData.totalPages}
                    </button>
                  </>
                )}
                
                <button
                  onClick={() => setCurrentPage(Math.min(paginationData.totalPages, currentPage + 1))}
                  disabled={currentPage === paginationData.totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Next</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sessions;
