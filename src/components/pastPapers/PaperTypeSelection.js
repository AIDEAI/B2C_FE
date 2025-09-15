import React from 'react';
import { usePastPapers } from '../../context/PastPapersContext';

const PaperTypeSelection = () => {
  const { selectPaperType, goBack, selectedLevel, selectedSubject } = usePastPapers();

  const handlePaperTypeSelect = (paperType) => {
    selectPaperType(paperType);
  };

  const paperTypes = [
    {
      id: 'yearly',
      name: 'Yearly Papers',
      description: 'Complete past papers organized by year',
      icon: '📅',
      color: 'bg-blue-600',
      features: ['Complete exam papers', 'Year-wise organization', 'Full exam simulation']
    },
    {
      id: 'topical',
      name: 'Topical Papers',
      description: 'Questions organized by specific topics and concepts',
      icon: '🎯',
      color: 'bg-green-600',
      features: ['Topic-based questions', 'Concept-focused practice', 'Customizable filters']
    }
  ];

  const handleGoBack = () => {
    goBack();
  };

  return (
    <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-4">
      <div className="max-w-5xl mx-auto">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={handleGoBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors bg-white/80 backdrop-blur-sm px-3 py-2 rounded-lg shadow-md hover:shadow-lg"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm">Back</span>
          </button>
          
          <div className="text-right">
            <div className="text-xs text-gray-500">Selected</div>
            <div className="text-base font-semibold text-gray-800 bg-white/80 backdrop-blur-sm px-3 py-2 rounded-lg shadow-md">
              {selectedLevel?.program_name} • {selectedSubject?.name}
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-3">
            Choose Paper Type
          </h1>
          <p className="text-base text-gray-600">
            How would you like to practice {selectedSubject?.name}?
          </p>
        </div>

          {/* Paper Type Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {paperTypes.map((paperType) => (
              <div
                key={paperType.id}
                onClick={() => handlePaperTypeSelect(paperType)}
                className={`
                  ${paperType.color} hover:scale-105 transform transition-all duration-300 
                  cursor-pointer rounded-xl shadow-md hover:shadow-lg
                  p-6 text-white text-center min-h-[200px] flex flex-col justify-center
                  group
                `}
              >
                <div className="mb-4">
                  <div className="text-4xl mb-3">{paperType.icon}</div>
                </div>
                
                <h2 className="text-xl font-bold mb-2 group-hover:text-yellow-200 transition-colors">
                  {paperType.name}
                </h2>
                
                <p className="text-sm opacity-90 mb-4 group-hover:opacity-100 transition-opacity">
                  {paperType.description}
                </p>

                {/* Features List */}
                <div className="text-left space-y-1 mb-4">
                  {paperType.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                      <span className="text-xs opacity-90">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <div className="mt-auto opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-white/20 rounded-full px-4 py-2 inline-block">
                    <span className="text-xs font-semibold">Select →</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-md">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse"></div>
            <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
            <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
          </div>
        </div>
      </div>
    
  );
};

export default PaperTypeSelection;
