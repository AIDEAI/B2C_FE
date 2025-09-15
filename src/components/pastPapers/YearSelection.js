import React, { useState } from 'react';
import { usePastPapers } from '../../context/PastPapersContext';

const YearSelection = () => {
  const { 
    availableYears, 
    availableSessions, 
    availableVariants,
    selectedLevel, 
    selectedSubject, 
    paperType, 
    selectYear,
    updateSessions,
    updateVariants,
    updateYearRange,
    goBack, 
    pastPaperPending 
  } = usePastPapers();
  
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedSession, setSelectedSession] = useState('');
  const [selectedVariant, setSelectedVariant] = useState('');
  const [hoveredYear, setHoveredYear] = useState(null);

  const handleYearSelect = (year) => {
    setSelectedYear(year);
    // Clear session and variant when year changes
    setSelectedSession('');
    setSelectedVariant('');
  };

  const handleSessionChange = (session) => {
    setSelectedSession(session);
  };

  const handleVariantChange = (variant) => {
    setSelectedVariant(variant);
  };

  const handleContinue = () => {
    if (selectedYear && selectedSession && selectedVariant) {
      console.log('YearSelection - Updating context with:', {
        selectedYear,
        selectedSession,
        selectedVariant
      });
      
      // Update context with selections
      updateSessions([selectedSession]);
      updateVariants([selectedVariant]);
      // Set year range for the selected year
      updateYearRange({ start: selectedYear, end: selectedYear });
      selectYear(selectedYear);
    }
  };

  const handleGoBack = () => {
    goBack();
  };

  if (pastPaperPending) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-blue-600 mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Loading Years</h2>
          <p className="text-lg text-gray-600">Fetching available years for {selectedSubject?.name}...</p>
          <div className="mt-4 text-sm text-gray-500">
            <div className="animate-pulse">Please wait while we prepare your learning options</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-2 h-full">
      <div className="mx-auto mt-2">
        {/* Header with Navigation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleGoBack}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors bg-white/80 backdrop-blur-sm px-4 py-2 rounded-xl shadow-lg hover:shadow-xl"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Back</span>
            </button>
          </div>
                  {selectedYear && selectedSession && selectedVariant && (
            <div className="text-center">
              <button
                onClick={handleContinue}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-sm text-white font-semibold py-2 px-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Continue with {selectedSession} & {selectedVariant} →
              </button>
            </div>
          )}
        </div>

        {/* Header */}
        <div className="text-center mb-2">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Choose Year & Filters
          </h1>
          <p className="text-base text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Select a year and filter by sessions and variants for <strong>{selectedSubject?.name}</strong>.
            You can select multiple sessions and variants to get questions from all of them.
          </p>
        </div>

        {/* Year Selection - Show initially */}
        {!selectedYear && (
          <div className=" mx-auto h-96 ">
            <div className=" p-2">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center flex items-center justify-center">
                <span className="mr-3">📅</span> Select Year
              </h3>
              <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 ${availableYears && availableYears.length > 10 ? 'max-h-96 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100' : ''}`}>
                {Array.isArray(availableYears) && availableYears.length > 0 ? (
                  availableYears.map((year) => (
                    <div
                      key={year}
                      onClick={() => handleYearSelect(year)}
                      onMouseEnter={() => setHoveredYear(year)}
                      onMouseLeave={() => setHoveredYear(null)}
                      className={`
                        bg-white/90 backdrop-blur-sm rounded-md shadow-sm hover:shadow-md
                        cursor-pointer p-4 text-center min-h-[80px] flex flex-col justify-center
                        group relative overflow-hidden border transition-all duration-300
                        ${selectedYear === year
                          ? 'border-blue-500 bg-blue-50/50 transform scale-105'
                          : hoveredYear === year 
                            ? 'border-blue-300 bg-blue-25/50 transform scale-105' 
                            : 'border-transparent hover:border-blue-200'
                        }
                      `}
                    >
                      {/* Background Pattern */}
                      <div className="absolute inset-0 opacity-5">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500 rounded-full -translate-y-10 translate-x-10"></div>
                        <div className="absolute bottom-0 left-0 w-16 h-16 bg-green-500 rounded-full translate-y-8 -translate-x-8"></div>
                      </div>
                      
                      {/* Selection Indicator */}
                      {selectedYear === year && (
                        <div className="absolute top-1 right-1 z-20">
                          <div className="w-2.5 h-2.5 bg-blue-500 rounded-full flex items-center justify-center">
                            <svg className="w-1.5 h-1.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        </div>
                      )}

                      {/* Content */}
                      <div className="relative z-10">
                        <div className="mb-2">
                          <div className={`w-8 h-8 rounded-full mx-auto flex items-center justify-center mb-2 backdrop-blur-sm transition-all duration-300 ${
                            selectedYear === year
                              ? 'bg-gradient-to-br from-green-500 to-blue-600'
                              : 'bg-gradient-to-br from-blue-500 to-purple-600'
                          }`}>
                            <span className="text-[14px] font-bold text-white">
                              {year.toString().slice(-2)}
                            </span>
                          </div>
                        </div>
                        
                        <h3 className="text-[16px] font-bold text-gray-800 mb-1 group-hover:text-blue-600 transition-colors duration-300 leading-tight">
                          {year}
                        </h3>
                        
                        <p className="text-[12px] text-gray-600 opacity-90 group-hover:opacity-100 transition-opacity">
                          Papers
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <div className="text-6xl mb-4">📅</div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">No years available</h3>
                    <p className="text-gray-600">Please try again later.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Sessions and Variants Selection - Show after year selection */}
        {selectedYear && (
          <div className=" mx-auto  h-96 px-8">
            {/* Change Year Button */}
            <div className="mb-4 text-center">
              <button
                onClick={() => setSelectedYear(null)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors duration-300 flex items-center space-x-2 mx-auto"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>Change Year</span>
              </button>
            </div>
            
            <div className="flex justify-center items-center w-full">
              {/* Sessions */}
              <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-md p-4 h-60 w-1/2">
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <span className="mr-2">📋</span> Select Session
                </h3>
                <div className="space-y-3">
                  {Array.isArray(availableSessions) && availableSessions.length > 0 ? (
                    <select
                      value={selectedSession}
                      onChange={(e) => handleSessionChange(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-700"
                    >
                      <option value="">Choose a session...</option>
                      {availableSessions.map((session) => (
                        <option key={session} value={session}>
                          {session}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-sm text-gray-500">No sessions available</p>
                  )}
                </div>
                </div>
                <div className="mt-4">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <span className="mr-2">🔢</span> Select Variant
                </h3>
                <div className="space-y-3">
                  {Array.isArray(availableVariants) && availableVariants.length > 0 ? (
                    <select
                      value={selectedVariant}
                      onChange={(e) => handleVariantChange(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-700"
                    >
                      <option value="">Choose a variant...</option>
                      {availableVariants.map((variant) => (
                        <option key={variant} value={variant}>
                          Paper {variant}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-sm text-gray-500">No variants available</p>
                  )}
                </div>
              </div>
              </div>

              {/* Variants */}
               
            </div>
          </div>
        )}

        {/* Progress Indicator */}
        <div className="text-center my-4">
          <div className="inline-flex items-center space-x-3 bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-700">Level</span>
            </div>
            <div className="w-px h-5 bg-gray-300"></div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-700">Subject</span>
            </div>
            <div className="w-px h-5 bg-gray-300"></div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-700">Paper Type</span>
            </div>
            <div className="w-px h-5 bg-gray-300"></div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-blue-800">Year & Filters</span>
            </div>
            <div className="w-px h-5 bg-gray-300"></div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
              <span className="text-sm text-gray-500">Review</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default YearSelection;
