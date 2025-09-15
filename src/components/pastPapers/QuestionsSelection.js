import React, { useState, useEffect, useRef } from 'react';
import { usePastPapers } from '../../context/PastPapersContext';

const QuestionsSelection = () => {
  const { 
    questions, 
    subTopics, 
    availableYears,
    availableSessions,
    availableVariants,
    pagination,
    totalQuestions,
    paperType, 
    selectedLevel,
    selectedSubject,
    selectedTopic,
    selectedSubTopics, 
    selectedSessions,
    selectedVariants,
    selectedYearRange,
    allSelectedQuestions,
    updateSubTopics,
    updateSessions,
    updateVariants,
    updateYearRange,
    updatePage,
    selectQuestions,
    addSelectedQuestion,
    removeSelectedQuestion,
    clearAllSelectedQuestions,
    goBack,
    handleGoToStep,
    canGoToStep,
    pastPaperPending
  } = usePastPapers();

  // Debug: Log context data
  useEffect(() => {
    console.log('QuestionsSelection Context Data:', {
      paperType: paperType?.id,
      questions: questions?.length,
      availableYears: availableYears,
      availableSessions: availableSessions,
      availableVariants: availableVariants,
      pagination,
      totalQuestions,
      pastPaperPending,
      firstQuestion: questions?.[0]
    });
  }, [paperType, questions, availableYears, availableSessions, availableVariants, pagination, totalQuestions, pastPaperPending]);

  // Debug: Log filtered questions
 
  
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [localSelectedSubTopics, setLocalSelectedSubTopics] = useState([]);
  const [localSelectedSessions, setLocalSelectedSessions] = useState([]);
  const [localSelectedVariants, setLocalSelectedVariants] = useState([]);
  
  // Debug: Log when localSelectedSubTopics changes
  useEffect(() => {
    console.log('localSelectedSubTopics changed to:', localSelectedSubTopics);
  }, [localSelectedSubTopics]);
  
  const [localSelectedYearRange, setLocalSelectedYearRange] = useState(selectedYearRange || { start: null, end: null });
  
  // Update local year range when context value changes
  useEffect(() => {
    if (selectedYearRange) {
      setLocalSelectedYearRange(selectedYearRange);
    }
  }, [selectedYearRange]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubTopicDropdownOpen, setIsSubTopicDropdownOpen] = useState(false);
  const [isSessionDropdownOpen, setIsSessionDropdownOpen] = useState(false);
  const [isVariantDropdownOpen, setIsVariantDropdownOpen] = useState(false);
  const [isApplyingFilters, setIsApplyingFilters] = useState(false);
  const isInitialized = useRef(false);
   useEffect(() => {
    console.log('Filtered Questions:', {
      count: filteredQuestions?.length,
      firstQuestion: filteredQuestions?.[0],
      allQuestions: filteredQuestions
    });
  }, [filteredQuestions]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isSubTopicDropdownOpen && !event.target.closest('.subtopic-dropdown')) {
        setIsSubTopicDropdownOpen(false);
      }
      if (isSessionDropdownOpen && !event.target.closest('.session-dropdown')) {
        setIsSessionDropdownOpen(false);
      }
      if (isVariantDropdownOpen && !event.target.closest('.variant-dropdown')) {
        setIsVariantDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSubTopicDropdownOpen, isSessionDropdownOpen, isVariantDropdownOpen]);

  // Initialize filteredQuestions from context data
  useEffect(() => {
    console.log('QuestionsSelection - paperType:', paperType?.id);
    console.log('QuestionsSelection - questions:', questions);
    
    if (questions?.length > 0) {
      console.log('Setting filtered questions:', questions);
      setFilteredQuestions(questions);
    }
  }, [questions, paperType]);



  // Initialize state from context when component mounts
  useEffect(() => {
    if (allSelectedQuestions && Array.isArray(allSelectedQuestions) && allSelectedQuestions.length > 0) {
      // Get IDs of all selected questions from context
      const selectedIds = allSelectedQuestions.map(q => q.id);
      setSelectedQuestions(selectedIds);
    } else {
      // Reset to empty array if no questions are selected
      setSelectedQuestions([]);
    }
  }, [allSelectedQuestions]);

  // Initialize local state from context only on initial load
  useEffect(() => {
    console.log('Initialization effect running - isInitialized.current:', isInitialized.current);
    console.log('Initialization effect running - selectedYearRange:', selectedYearRange);
    
    // Only initialize from context on the first load
    if (!isInitialized.current) {
      // Don't initialize subtopics from context - start with empty selection
      // This ensures users start with no topics selected
      if (selectedYearRange) {
        setLocalSelectedYearRange(selectedYearRange);
      }
      if (selectedSessions) {
        setLocalSelectedSessions(selectedSessions);
      }
      if (selectedVariants) {
        setLocalSelectedVariants(selectedVariants);
      }
      isInitialized.current = true;
    }
  }, []); // Remove all dependencies to prevent re-runs

  // Apply search filter
  useEffect(() => {
    console.log('Filtering questions:', {
      searchTerm,
      paperType: paperType?.id,
      questions: questions?.length
    });
    
    if (searchTerm.trim() === '') {
      if (Array.isArray(questions)) {
        console.log('Setting questions:', questions);
        setFilteredQuestions(questions);
      }
    } else {
      if (Array.isArray(questions)) {
        const filtered = questions.filter(q => 
          q.question?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (q.subtopic && q.subtopic.toLowerCase().includes(searchTerm.toLowerCase()))
        );
        console.log('Filtered questions:', filtered);
        setFilteredQuestions(filtered);
      }
    }
  }, [searchTerm, questions, paperType]);



  const handleQuestionToggle = (questionId) => {
    const question = questions.find(q => q.id === questionId);
    
    if (!question) return;
    
    setSelectedQuestions(prev => {
      if (prev.includes(questionId)) {
        // Remove from local state
        const newLocalState = prev.filter(id => id !== questionId);
        // Remove from context
        removeSelectedQuestion(questionId);
        return newLocalState;
      } else {
        // Add to local state
        const newLocalState = [...prev, questionId];
        // Add to context
        addSelectedQuestion(question);
        return newLocalState;
      }
    });
  };

  const handleSelectAll = () => {
    if (Array.isArray(filteredQuestions) && filteredQuestions.length > 0) {
      const currentPageQuestions = filteredQuestions.filter(q => q && q.id);
      const currentPageQuestionIds = currentPageQuestions.map(q => q.id);
      
      setSelectedQuestions(prev => {
        // Add current page questions to existing selections
        const newSelections = [...new Set([...prev, ...currentPageQuestionIds])];
        return newSelections;
      });
      
      // Add questions to context
      currentPageQuestions.forEach(question => {
        if (!allSelectedQuestions.find(q => q.id === question.id)) {
          addSelectedQuestion(question);
        }
      });
    }
  };

  const handleDeselectAll = () => {
    if (Array.isArray(filteredQuestions) && filteredQuestions.length > 0) {
      const currentPageQuestionIds = filteredQuestions
        .filter(q => q && q.id) // Safety check to ensure question has id
        .map(q => q.id);
      
      setSelectedQuestions(prev => {
        // Remove current page questions from selections
        return prev.filter(id => !currentPageQuestionIds.includes(id));
      });
      
      // Remove questions from context
      currentPageQuestionIds.forEach(questionId => {
        removeSelectedQuestion(questionId);
      });
    }
  };

  const handleContinue = () => {
    // Use allSelectedQuestions from context which contains all selected questions across pages
    if (Array.isArray(allSelectedQuestions) && allSelectedQuestions.length > 0) {
      console.log('All selected questions:', allSelectedQuestions.length);
      console.log('Selected questions:', allSelectedQuestions);
      selectQuestions(allSelectedQuestions);
    } else {
      console.warn('No questions selected');
      alert('Please select at least one question to continue.');
    }
  };

  const handleGoBack = () => {
    goBack();
  };





  const handleSubTopicChange = (subTopic) => {
    console.log('handleSubTopicChange called with:', subTopic);
    console.log('Current localSelectedSubTopics before change:', localSelectedSubTopics);
    
    setLocalSelectedSubTopics(prev => {
      const newSubTopics = prev.includes(subTopic)
        ? prev.filter(st => st !== subTopic)
        : [...prev, subTopic];
      
      console.log('New localSelectedSubTopics after change:', newSubTopics);
      return newSubTopics;
    });
    // Don't call updateSubTopics here - wait for Apply button
  };

  const handleSessionChange = (session) => {
    setLocalSelectedSessions(prev => {
      const newSessions = prev.includes(session)
        ? prev.filter(s => s !== session)
        : [...prev, session];
      return newSessions;
    });
  };

  const handleVariantChange = (variant) => {
    setLocalSelectedVariants(prev => {
      const newVariants = prev.includes(variant)
        ? prev.filter(v => v !== variant)
        : [...prev, variant];
      return newVariants;
    });
  };

  const handleYearRangeChange = (key, value) => {
    const newRange = { ...localSelectedYearRange, [key]: parseInt(value) || 0 };
    setLocalSelectedYearRange(newRange);
    // Don't call updateYearRange here - wait for Apply button
  };

  const handleApplyFilters = async () => {
    setIsApplyingFilters(true);
    try {
      // Update context with current local values
      updateSubTopics(localSelectedSubTopics);
      updateSessions(localSelectedSessions);
      updateVariants(localSelectedVariants);
      updateYearRange(localSelectedYearRange);
      
      // Reset pagination to first page when applying new filters
      updatePage(1);
      
      // Wait for the API call to complete
      setTimeout(() => {
        setIsApplyingFilters(false);
        // Don't reset local state - keep user selections visible
        // The user should see their current filter selections
      }, 1500);
    } catch (error) {
      setIsApplyingFilters(false);
      console.error('Error applying filters:', error);
    }
  };

  // Pagination functions
  const handlePageChange = (page) => {
    updatePage(page);
  };

  const handlePrevPage = () => {
    if (pagination.has_prev_page) {
      handlePageChange(pagination.current_page - 1);
    }
  };

  const handleNextPage = () => {
    if (pagination.has_next_page) {
      handlePageChange(pagination.current_page + 1);
    }
  };

  // Generate page numbers for pagination
  const generatePageNumbers = () => {
    const current = pagination.current_page;
    const total = pagination.total_pages;
    const pages = [];
    
    if (total <= 7) {
      // Show all pages if total is 7 or less
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      // Show first page
      pages.push(1);
      
      if (current > 4) {
        pages.push('...');
      }
      
      // Show pages around current page
      const start = Math.max(2, current - 1);
      const end = Math.min(total - 1, current + 1);
      
      for (let i = start; i <= end; i++) {
        if (i !== 1 && i !== total) {
          pages.push(i);
        }
      }
      
      if (current < total - 3) {
        pages.push('...');
      }
      
      // Show last page
      if (total > 1) {
        pages.push(total);
      }
    }
    
    return pages;
  };

  if (pastPaperPending) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-blue-600 mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Loading Questions</h2>
          <p className="text-lg text-gray-600">Preparing your practice questions...</p>
          <div className="mt-4 text-sm text-gray-500">
            <div className="animate-pulse">This may take a few moments</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-gray-50 to-blue-50 p-3 overflow-y-auto">
      <div className=" mx-auto">
        {/* Header with Navigation */}
  

        {/* Header */}
        <div className="flex justify-center text-center mb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={handleGoBack}
              className="flex items-center space-x-1 text-gray-600 hover:text-gray-800 transition-colors bg-white/80 backdrop-blur-sm px-2 py-1 rounded-lg shadow-md hover:shadow-lg text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Back</span>
            </button>
          </div>

         
        </div>
        <div className="w-full text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-1 ">
            {paperType?.id === 'yearly' ? 'Select Yearly Questions' : 'Select Topical Questions'}
          </h1>
          <p className="text-sm text-gray-600 max-w-2xl mx-auto leading-relaxed">
            {paperType?.id === 'yearly' 
              ? 'Choose the yearly papers you want to practice. Each paper contains a complete set of questions from that year.'
              : 'Use filters to narrow down questions by topic and year. Select the concepts you want to focus on.'
            }
          </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Filters Sidebar - For both Topical and Yearly */}
          {(paperType?.id === 'topical' || paperType?.id === 'yearly') && (
            <div className="lg:col-span-0.5">
                    <div className="flex space-x-1 mb-3 sticky top-3 bg-white/90 backdrop-blur-sm rounded-lg shadow-md p-3">
                  <button
                    onClick={handleSelectAll}
                    className="px-2 py-1 text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors bg-blue-50 hover:bg-blue-100 rounded-md"
                  >
                    Select Page
                  </button>
                  <button
                    onClick={handleDeselectAll}
                    className="px-2 py-1 text-xs font-medium text-gray-600 hover:text-gray-800 transition-colors bg-gray-50 hover:bg-gray-100 rounded-md"
                  >
                    Deselect Page
                  </button>
                </div>
              <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-md p-3 sticky top-3">
                <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center">
                  <span className="mr-1">🔍</span> Filters
                </h3>
                
                {/* Search */}
                <div className="mb-3">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Search Questions</label>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Type to search..."
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                


                {/* Sub-topic Filter - Only for Topical */}
                {paperType?.id === 'topical' && Array.isArray(subTopics) && subTopics.length > 0 && (
                  <div className="mb-3">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Sub-topics</label>
                    <div className="relative subtopic-dropdown">
                      <button
                        type="button"
                        onClick={() => setIsSubTopicDropdownOpen(!isSubTopicDropdownOpen)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-transparent bg-white text-left flex items-center justify-between"
                      >
                        <span className="text-xs text-gray-700">
                          {localSelectedSubTopics.length > 0 
                            ? `${localSelectedSubTopics.length} topic${localSelectedSubTopics.length > 1 ? 's' : ''} selected`
                            : 'Select topics...'
                          }
                        </span>
                        <svg 
                          className={`w-4 h-4 transition-transform ${isSubTopicDropdownOpen ? 'rotate-180' : ''}`} 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      
                      {isSubTopicDropdownOpen && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-56 overflow-y-auto">
                          {subTopics.map(subTopic => (
                            <label key={subTopic} className="flex items-center px-2 py-1 hover:bg-gray-50 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={localSelectedSubTopics.includes(subTopic)}
                                onChange={() => handleSubTopicChange(subTopic)}
                                className="mr-2 text-blue-600 border-gray-300 rounded focus:ring-blue-500 w-3 h-3"
                              />
                              <span className="text-xs text-gray-700">{subTopic}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Sessions Filter - Only for Yearly */}
              
                  <div className="mb-3">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Sessions</label>
                    <div className="relative session-dropdown">
                      <button
                        type="button"
                        onClick={() => setIsSessionDropdownOpen(!isSessionDropdownOpen)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-transparent bg-white text-left flex items-center justify-between"
                      >
                        <span className="text-xs text-gray-700">
                          {localSelectedSessions.length > 0 
                            ? `${localSelectedSessions.length} session${localSelectedSessions.length > 1 ? 's' : ''} selected`
                            : 'Select sessions...'
                          }
                        </span>
                        <svg 
                          className={`w-4 h-4 transition-transform ${isSessionDropdownOpen ? 'rotate-180' : ''}`} 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      
                      {isSessionDropdownOpen && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-56 overflow-y-auto">
                          {availableSessions.map(session => (
                            <label key={session} className="flex items-center px-2 py-1 hover:bg-gray-50 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={localSelectedSessions.includes(session)}
                                onChange={() => handleSessionChange(session)}
                                className="mr-2 text-blue-600 border-gray-300 rounded focus:ring-blue-500 w-3 h-3"
                              />
                              <span className="text-xs text-gray-700">{session}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                

                {/* Variants Filter - Only for Yearly */}
                
                  <div className="mb-3">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Variants</label>
                    <div className="relative variant-dropdown">
                      <button
                        type="button"
                        onClick={() => setIsVariantDropdownOpen(!isVariantDropdownOpen)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-transparent bg-white text-left flex items-center justify-between"
                      >
                        <span className="text-xs text-gray-700">
                          {localSelectedVariants.length > 0 
                            ? `${localSelectedVariants.length} variant${localSelectedVariants.length > 1 ? 's' : ''} selected`
                            : 'Select variants...'
                          }
                        </span>
                        <svg 
                          className={`w-4 h-4 transition-transform ${isVariantDropdownOpen ? 'rotate-180' : ''}`} 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      
                      {isVariantDropdownOpen && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-56 overflow-y-auto">
                          {availableVariants.map(variant => (
                            <label key={variant} className="flex items-center px-2 py-1 hover:bg-gray-50 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={localSelectedVariants.includes(variant)}
                                onChange={() => handleVariantChange(variant)}
                                className="mr-2 text-blue-600 border-gray-300 rounded focus:ring-blue-500 w-3 h-3"
                              />
                              <span className="text-xs text-gray-700">{variant}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                

                {/* Year Range Filter */}
                <div className="mb-3">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Year Range</label>
                  <div className="grid grid-cols-2 gap-1">
                    <input
                      type="number"
                      value={localSelectedYearRange?.start || ''}
                      onChange={(e) => handleYearRangeChange('start', e.target.value)}
                      placeholder="Min Year"
                      min="1900"
                      max="2100"
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                    />
                    <input
                      type="number"
                      value={localSelectedYearRange?.end || ''}
                      onChange={(e) => handleYearRangeChange('end', e.target.value)}
                      placeholder="Max Year"
                      min="1900"
                      max="2100"
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Apply Button */}
                <div className="mb-3">
                  <button
                    onClick={handleApplyFilters}
                    disabled={isApplyingFilters || (
                      paperType?.id === 'topical' 
                        ? (localSelectedSubTopics.length === 0 && (!localSelectedYearRange.start || !localSelectedYearRange.end))
                        : (localSelectedSessions.length === 0 && localSelectedVariants.length === 0 && (!localSelectedYearRange.start || !localSelectedYearRange.end))
                    )}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-2 px-4 rounded-lg text-sm transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105 disabled:transform-none"
                  >
                    {isApplyingFilters ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Applying...
                      </div>
                    ) : (
                      'Apply Filters'
                    )}
                  </button>
                  {(
                    paperType?.id === 'topical' 
                      ? (localSelectedSubTopics.length === 0 && (!localSelectedYearRange.start || !localSelectedYearRange.end))
                      : (localSelectedSessions.length === 0 && localSelectedVariants.length === 0 && (!localSelectedYearRange.start || !localSelectedYearRange.end))
                  ) && (
                    <p className="text-xs text-gray-500 mt-1 text-center">
                      {paperType?.id === 'topical' 
                        ? 'Select topics or year range to apply filters'
                        : 'Select sessions, variants, or year range to apply filters'
                      }
                    </p>
                  )}
                </div>

                {/* Results Count */}
                <div className="text-center p-2 bg-gradient-to-r from-blue-50 to-blue-100 rounded-md border border-blue-200">
                  <div className="text-lg font-bold text-blue-600">{totalQuestions}</div>
                  <div className="text-xs text-blue-700">Total Questions</div>
                  {pagination && pagination.total_pages > 1 && (
                    <div className="text-xs text-blue-600 mt-1">
                      Page {pagination.current_page} of {pagination.total_pages}
                    </div>
                  )}
                </div>

                {/* Quick Actions */}
                <div className="mt-2 space-y-1">
                  <button
                    onClick={() => {
                      setLocalSelectedSubTopics(() => []);
                      setLocalSelectedSessions(() => []);
                      setLocalSelectedVariants(() => []);
                      setLocalSelectedYearRange({ 
                        start: Array.isArray(availableYears) && availableYears.length > 0 ? Math.min(...availableYears) : 2015, 
                        end: Array.isArray(availableYears) && availableYears.length > 0 ? Math.max(...availableYears) : 2024 
                      });
                      setSearchTerm('');
                    }}
                    className="w-full text-xs text-red-600 hover:text-red-800 font-medium"
                  >
                    Reset All Filters
                  </button>
                </div>


              </div>

              {allSelectedQuestions?.length > 0 && (
              <div className="mt-4 text-center">
                <button
                  onClick={handleContinue}
                  disabled={allSelectedQuestions?.length === 0}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-2 px-4 rounded-lg text-sm transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
                >
                  🚀 Continue with {allSelectedQuestions?.length} Questions →
                </button>
              </div>
            )}
            </div>
          )}

          {/* Questions List */}
          <div className={(paperType?.id === 'topical' || paperType?.id === 'yearly') ? 'lg:col-span-3' : 'lg:col-span-4'}>
                          {/* Questions with Fixed Height and Scroll */}
              <div className="h-[79vh] overflow-y-auto border border-gray-200 rounded-lg bg-white/90 backdrop-blur-sm">
                <div className="p-3 space-y-2">
                  {!Array.isArray(filteredQuestions) || filteredQuestions?.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-3xl mb-2">🔍</div>
                      <h3 className="text-lg font-bold text-gray-800 mb-1">No questions found</h3>
                      <p className="text-sm text-gray-600 mb-3">
                        {paperType?.id === 'topical' 
                          ? 'Try adjusting your filters or selecting different topics/subtopics.'
                          : 'No yearly questions available for this combination.'
                        }
                      </p>
                      {paperType?.id === 'topical' && (
                        <button
                          onClick={() => {
                            setLocalSelectedSubTopics(() => []);
                            setLocalSelectedSessions(() => []);
                            setLocalSelectedVariants(() => []);
                            updateSubTopics([]);
                            updateSessions([]);
                            updateVariants([]);
                            setLocalSelectedYearRange({
                              start: Array.isArray(availableYears) && availableYears.length > 0 ? Math.min(...availableYears) : 2015,
                              end: Array.isArray(availableYears) && availableYears.length > 0 ? Math.max(...availableYears) : 2024
                            });
                            updateYearRange({
                              start: Array.isArray(availableYears) && availableYears.length > 0 ? Math.min(...availableYears) : 2015,
                              end: Array.isArray(availableYears) && availableYears.length > 0 ? Math.max(...availableYears) : 2024
                            });
                            setSearchTerm('');
                          }}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm"
                        >
                          Reset Filters
                        </button>
                      )}
                    </div>
                  ) : (
                    Array.isArray(filteredQuestions) && filteredQuestions.map((question) => (
                      <div
                        key={question.id}
                        className={`bg-white/90 backdrop-blur-sm rounded-lg shadow-md p-4 border-2 transition-all duration-300 ${
                          selectedQuestions?.includes(question.id)
                            ? 'border-blue-500 bg-blue-50/50'
                            : 'border-transparent hover:border-blue-200'
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <input
                            type="checkbox"
                            checked={selectedQuestions?.includes(question.id)}
                            onChange={() => handleQuestionToggle(question.id)}
                            className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <div className="flex-1">
                            {/* Question Header */}
                            <div className="flex items-start gap-3 mb-3">
                              <div className="bg-blue-100 text-blue-700 rounded-full h-8 w-8 flex items-center justify-center text-sm font-bold flex-shrink-0">
                                Q{question.question_number || ''}
                              </div>
                              <div className="flex-1">
                                {/* Main Question Content */}
                                {question.mainContent && question.mainContent.length > 0 ? (
                                  <div className="space-y-2">
                                    {question.mainContent.map((contentItem, index) => (
                                      <div key={index}>
                                        {contentItem.type === 'text' && contentItem.content && (
                                          <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">
                                            {contentItem.content}
                                          </p>
                                        )}
                                        {contentItem.type === 'image' && contentItem.content && (
                                          <div className="flex justify-center my-2">
                                            <img 
                                              src={contentItem.content} 
                                              alt="Question content" 
                                              className="max-w-full h-auto max-h-48 rounded border shadow-sm" 
                                            />
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-gray-800 text-sm leading-relaxed">{question.question}</p>
                                )}

                                {/* Question Options based on type */}
                                {question.type === 'mcq' && question.options && question.options.length > 0 && (
                                  <div className="mt-3 space-y-1">
                                    <h4 className="font-medium text-gray-800 text-sm mb-2">Options:</h4>
                                    {question.options.map((option, index) => (
                                      <div key={index} className="flex items-center space-x-2 text-sm">
                                        <span className="font-medium text-gray-700 min-w-[20px]">{option.split(')')[0]})</span>
                                        <span className="text-gray-700">{option.split(')').slice(1).join(')').trim()}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {/* True/False Options */}
                                {question.type === 'true_false' && (
                                  <div className="mt-3 space-y-1">
                                    <h4 className="font-medium text-gray-800 text-sm mb-2">Options:</h4>
                                    {['A) True', 'B) False'].map((option, index) => (
                                      <div key={index} className="flex items-center space-x-2 text-sm">
                                        <span className="font-medium text-gray-700 min-w-[20px]">{option.split(')')[0]})</span>
                                        <span className="text-gray-700">{option.split(')').slice(1).join(')').trim()}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {/* Fill in the blank - show answer if available */}
                                {question.type === 'fill_text' && question.mainAnswerKey && question.mainAnswerKey.length > 0 && (
                                  <div className="mt-3 space-y-1">
                                    <h4 className="font-medium text-gray-800 text-sm mb-2">Answer:</h4>
                                    <div className="bg-gray-50 p-2 rounded text-sm">
                                      {question.mainAnswerKey.map((answer, index) => (
                                        <div key={index} className="text-gray-700">
                                          {answer.type === 'text' && answer.content}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Long Answer/Long Question - show parts if available */}
                                {(question.type === 'long_answer' || question.type === 'long_question') && question.parts && question.parts.length > 0 && (
                                  <div className="mt-3 space-y-3">
                                    {question.parts.map((part, partIndex) => (
                                      <div key={part.id || partIndex} className="border-l-2 border-blue-200 pl-4">
                                        <div className="flex items-start gap-2 mb-2">
                                          <span className="bg-blue-100 text-blue-700 rounded-full h-6 w-6 flex items-center justify-center text-xs font-medium flex-shrink-0">
                                            {part.letter || String.fromCharCode(97 + partIndex)}
                                          </span>
                                          <div className="flex-1">
                                            {part.marks > 0 && (
                                              <div className="text-xs text-gray-500 mb-1">
                                                {part.marks} {part.marks === 1 ? 'mark' : 'marks'}
                                              </div>
                                            )}
                                            
                                            {/* Part Content */}
                                            {part.content && part.content.length > 0 && (
                                              <div className="space-y-1">
                                                {part.content.map((contentItem, contentIndex) => (
                                                  <div key={contentIndex}>
                                                    {contentItem.type === 'text' && (
                                                      <p className="text-gray-700 text-sm whitespace-pre-wrap">{contentItem.content}</p>
                                                    )}
                                                    {contentItem.type === 'image' && (
                                                      <div className="flex justify-center my-1">
                                                        <img 
                                                          src={contentItem.content} 
                                                          alt="Part content" 
                                                          className="max-w-full h-auto max-h-40 rounded border shadow-sm" 
                                                        />
                                                      </div>
                                                    )}
                                                  </div>
                                                ))}
                                              </div>
                                            )}
                                            
                                            {/* Subparts */}
                                            {part.subParts && part.subParts.length > 0 && (
                                              <div className="ml-4 space-y-2 mt-2">
                                                {part.subParts.map((subPart, subPartIndex) => (
                                                  <div key={subPart.id || subPartIndex} className="border-l-2 border-green-200 pl-3 py-1">
                                                    <div className="flex items-start gap-2">
                                                      <span className="text-xs font-medium text-green-600">
                                                        ({subPart.letter || String.fromCharCode(105 + subPartIndex)})
                                                      </span>
                                                      <div className="flex-1">
                                                        {subPart.marks > 0 && (
                                                          <div className="text-xs text-gray-500 mb-1">
                                                            {subPart.marks} {subPart.marks === 1 ? 'mark' : 'marks'}
                                                          </div>
                                                        )}
                                                        
                                                        {/* Subpart Content */}
                                                        {subPart.content && subPart.content.length > 0 && (
                                                          <div className="space-y-1">
                                                            {subPart.content.map((contentItem, contentIndex) => (
                                                              <div key={contentIndex}>
                                                                {contentItem.type === 'text' && (
                                                                  <p className="text-gray-700 text-sm whitespace-pre-wrap">{contentItem.content}</p>
                                                                )}
                                                                {contentItem.type === 'image' && (
                                                                  <div className="flex justify-center my-1">
                                                                    <img 
                                                                      src={contentItem.content} 
                                                                      alt="Subpart content" 
                                                                      className="max-w-full h-auto max-h-32 rounded border shadow-sm" 
                                                                    />
                                                                  </div>
                                                                )}
                                                              </div>
                                                            ))}
                                                          </div>
                                                        )}
                                                      </div>
                                                    </div>
                                                  </div>
                                                ))}
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>



                            {/* Question Tags */}
                            <div className="flex items-center space-x-2 text-xs text-gray-500 flex-wrap mt-3">
                              {question.topic && (
                                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                  {question.topic}
                                </span>
                              )}
                              {question.subtopic && (
                                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                  {question.subtopic}
                                </span>
                              )}
                              {question.year && (
                                <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                                  {question.year}
                                </span>
                              )}
                              {question.paper_code && (
                                <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                                  Paper {question.paper_code}
                                </span>
                              )}
                              {question.marks && (
                                <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                                  {question.marks} marks
                                </span>
                              )}
                              {question.difficulty_level && (
                                <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full">
                                  {question.difficulty_level}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

<div className='flex justify-between items-center'>
              {/* Pagination */}
            
             
            <div className="text-center mt-4">
          <div className="inline-flex items-center space-x-1 bg-white/80 backdrop-blur-sm rounded-full px-2 py-1 shadow-md">
            <button
              onClick={() => handleGoToStep('level')}
              className={`flex items-center space-x-1 px-2 py-1 rounded-full transition-all ${
                canGoToStep('level') 
                  ? 'text-blue-600 hover:bg-blue-50' 
                  : 'text-gray-400 cursor-not-allowed'
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${canGoToStep('level') ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              <span className="text-xs font-medium">Level</span>
            </button>
            
            <div className="w-px h-4 bg-gray-300"></div>
            
            <button
              onClick={() => handleGoToStep('subjects')}
              className={`flex items-center space-x-1 px-2 py-1 rounded-full transition-all ${
                canGoToStep('subjects') 
                  ? 'text-blue-600 hover:bg-blue-50' 
                  : 'text-gray-400 cursor-not-allowed'
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${canGoToStep('subjects') ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              <span className="text-xs font-medium">Subject</span>
            </button>
            
            <div className="w-px h-4 bg-gray-300"></div>
            
            <button
              onClick={() => handleGoToStep('paperType')}
              className={`flex items-center space-x-1 px-2 py-1 rounded-full transition-all ${
                canGoToStep('paperType') 
                  ? 'text-blue-600 hover:bg-blue-50' 
                  : 'text-gray-400 cursor-not-allowed'
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${canGoToStep('paperType') ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              <span className="text-xs font-medium">Paper Type</span>
            </button>
            
            {paperType?.id === 'topical' && (
              <>
                <div className="w-px h-4 bg-gray-300"></div>
                <div className="flex items-center space-x-1 px-2 py-1 rounded-full bg-green-100">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs font-medium text-green-800">Topic</span>
                </div>
              </>
            )}
            
            <div className="w-px h-4 bg-gray-300"></div>
            
            <div className="flex items-center space-x-1 px-2 py-1 rounded-full bg-blue-100">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-blue-800">Questions</span>
            </div>
            
            <div className="w-px h-4 bg-gray-300"></div>
            
            <div className="flex items-center space-x-1 px-2 py-1 rounded-full text-gray-400">
              <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
              <span className="text-xs font-medium">Review</span>
            </div>
          </div>
        </div>
        {pagination && pagination.total_pages > 1 && (
                <div className="mt-3 flex items-center justify-center">
                  <div className="flex items-center space-x-1 bg-white/90 backdrop-blur-sm rounded-lg shadow-md px-3 py-2">
                    {/* Previous Button */}
                    <button
                      onClick={handlePrevPage}
                      disabled={!pagination.has_prev_page}
                      className={`px-2 py-1 text-sm rounded-md transition-colors ${
                        pagination.has_prev_page
                          ? 'text-gray-700 hover:bg-gray-100'
                          : 'text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      &lt;
                    </button>

                    {/* Page Numbers */}
                    {generatePageNumbers().map((page, index) => (
                      <div key={index}>
                        {page === '...' ? (
                          <span className="px-2 py-1 text-sm text-gray-500">...</span>
                        ) : (
                          <button
                            onClick={() => handlePageChange(page)}
                            className={`px-2 py-1 text-sm rounded-md transition-colors ${
                              page === pagination.current_page
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            {page}
                          </button>
                        )}
                      </div>
                    ))}

                    {/* Next Button */}
                    <button
                      onClick={handleNextPage}
                      disabled={!pagination.has_next_page}
                      className={`px-2 py-1 text-sm rounded-md transition-colors ${
                        pagination.has_next_page
                          ? 'text-gray-700 hover:bg-gray-100'
                          : 'text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      &gt;
                    </button>
                  </div>
                </div>
              )}
</div>
            {/* Continue Button */}
       
          </div>
        </div>

        
      </div>
    </div>
  );
};

export default QuestionsSelection;
