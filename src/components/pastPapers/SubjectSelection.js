import React, { useState } from 'react';
import { usePastPapers } from '../../context/PastPapersContext';

const SubjectSelection = () => {
  const { subjects, selectedLevel, selectSubject, goBack, handleGoToStep, canGoToStep, pastPaperPending } = usePastPapers();
  const [hoveredSubject, setHoveredSubject] = useState(null);

  // Function to get subject icon based on subject name
  const getSubjectIcon = (subjectName) => {
    const name = subjectName?.toLowerCase() || '';
    
    if (name.includes('biology')) return '🧬';
    if (name.includes('chemistry')) return '⚗️';
    if (name.includes('computer') || name.includes('ict')) return '💻';
    if (name.includes('english')) return '📝';
    if (name.includes('islamiyat') || name.includes('islamic')) return '☪️';
    if (name.includes('mathematics') || name.includes('maths')) return '🔢';
    if (name.includes('pakistan')) return '🇵🇰';
    if (name.includes('physics')) return '⚛️';
    if (name.includes('urdu')) return '📖';
    if (name.includes('history')) return '📜';
    if (name.includes('geography')) return '🌍';
    if (name.includes('economics')) return '💰';
    if (name.includes('business')) return '💼';
    if (name.includes('accounting')) return '📊';
    if (name.includes('art') || name.includes('design')) return '🎨';
    if (name.includes('music')) return '🎵';
    if (name.includes('drama') || name.includes('theatre')) return '🎭';
    if (name.includes('psychology')) return '🧠';
    if (name.includes('sociology')) return '👥';
    if (name.includes('literature')) return '📚';
    if (name.includes('language')) return '🗣️';
    if (name.includes('science')) return '🔬';
    
    // Default icon for unknown subjects
    return '📚';
  };
  
  const handleSubjectSelect = (subject) => {
    selectSubject(subject);
  };

  const handleGoBack = () => {
    goBack();
  };

  if (pastPaperPending) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-blue-600 mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Loading Subjects</h2>
          <p className="text-lg text-gray-600">Fetching available subjects for {selectedLevel?.name}...</p>
          <div className="mt-4 text-sm text-gray-500">
            <div className="animate-pulse">Please wait while we prepare your learning options</div>
          </div>
        </div>
      </div>
    );
  }

  // if (state?.error) {
  //   return (
  //     <div className="min-h-screen bg-gradient-to-br from-gray-50 to-red-50 flex items-center justify-center">
  //       <div className="text-center max-w-md mx-auto p-8">
  //         <div className="text-red-500 text-7xl mb-6">⚠️</div>
  //         <h2 className="text-3xl font-bold text-gray-800 mb-4">Oops! Something went wrong</h2>
  //         <p className="text-gray-600 mb-6">{state?.error}</p>
  //         <div className="space-y-3">
  //           <button
  //             onClick={handleGoBack}
  //             className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-colors"
  //           >
  //             ← Go Back to Level Selection
  //           </button>
  //           <button
  //             onClick={() => window.location.reload()}
  //             className="w-full bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-xl font-medium transition-colors"
  //           >
  //             🔄 Try Again
  //           </button>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header with Navigation */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <button
              onClick={handleGoBack}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors bg-white/80 backdrop-blur-sm px-3 py-2 rounded-lg shadow-md hover:shadow-lg"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="text-sm">Back</span>
            </button>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-xs text-gray-500">Selected Level</div>
              <div className="text-lg font-bold text-gray-800 bg-white/80 backdrop-blur-sm px-3 py-2 rounded-lg shadow-md">
                {selectedLevel?.program_name}
              </div>
            </div>
            {/* Subject Count */}
            <div className="inline-block bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-md">
              <span className="text-base font-semibold text-blue-600">{Array.isArray(subjects) ? subjects.length : 0}</span>
              <span className="text-gray-600 ml-2 text-sm">subjects</span>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-3">
            Choose Your Subject
          </h1>
                      <p className="text-base text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Select the subject you want to practice for <strong>{selectedLevel?.program_name}</strong>.
              Each subject has different question types and difficulty levels to match your study needs.
            </p>
        </div>

        {/* Subject Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
          {Array.isArray(subjects) && subjects.length > 0 ? (
            subjects.map((subject) => (
              <div
                key={subject?.id}
                onClick={() => handleSubjectSelect(subject)}
                onMouseEnter={() => setHoveredSubject(subject.id)}
                onMouseLeave={() => setHoveredSubject(null)}
                className="bg-white hover:scale-105 transform transition-all duration-300 
                  cursor-pointer rounded-xl shadow-md hover:shadow-lg
                  p-3 text-center min-h-[100px] flex flex-col justify-between
                  group border border-gray-100 hover:border-blue-300 relative overflow-hidden"
              >
                
                <div className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity">
                  <div className="absolute top-0 right-0 w-12 h-12 bg-blue-200 rounded-full -translate-y-6 translate-x-6"></div>
                  <div className="absolute bottom-0 left-0 w-8 h-8 bg-green-200 rounded-full translate-y-4 -translate-x-4"></div>
                </div>
                
                <div className="relative z-10">
                  <div className="mb-2">
                    <div className="text-3xl mb-2 group-hover:scale-110 transition-transform duration-300">
                      {getSubjectIcon(subject?.name)}
                    </div>
                  </div>
                  
                  <h2 className="text-sm font-bold mb-1 text-gray-800 group-hover:text-blue-600 transition-colors">
                    {subject?.name}
                  </h2>
                  
                  <p className="text-xs text-gray-600 opacity-80 group-hover:opacity-100 transition-opacity leading-tight">
                    {subject?.description}
                  </p>
                </div>
                
                <div className="mt-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-1 group-hover:translate-y-0">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full px-3 py-1 inline-block shadow-md">
                    <span className="text-xs font-semibold flex items-center space-x-1">
                      <span>Select</span>
                      <span className="text-sm">→</span>
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">No subjects available</h3>
              <p className="text-gray-600">Please select a level first to see available subjects.</p>
            </div>
          )}
        </div>

        {/* Navigation Breadcrumb */}
        <div className="text-center">
          <div className="inline-flex items-center space-x-3 bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg">
            <button
              onClick={() => handleGoToStep('level')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-full transition-all ${
                canGoToStep('level') 
                  ? 'text-blue-600 hover:bg-blue-50' 
                  : 'text-gray-400 cursor-not-allowed'
              }`}
            >
              <div className={`w-3 h-3 rounded-full ${canGoToStep('level') ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              <span className="text-xs font-medium">Level</span>
            </button>
            
            <div className="w-px h-4 bg-gray-300"></div>
            
            <div className="flex items-center space-x-2 px-3 py-2 rounded-full bg-blue-100">
              <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-blue-800">Subject</span>
            </div>
            
            <div className="w-px h-4 bg-gray-300"></div>
            
            <div className="flex items-center space-x-2 px-3 py-2 rounded-full text-gray-400">
              <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
              <span className="text-xs font-medium">Paper Type</span>
            </div>
            
            <div className="w-px h-4 bg-gray-300"></div>
            
            <div className="flex items-center space-x-2 px-3 py-2 rounded-full text-gray-400">
              <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
              <span className="text-xs font-medium">Questions</span>
            </div>
            
            <div className="w-px h-4 bg-gray-300"></div>
            
            <div className="flex items-center space-x-2 px-3 py-2 rounded-full text-gray-400">
              <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
              <span className="text-xs font-medium">Review</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubjectSelection;
