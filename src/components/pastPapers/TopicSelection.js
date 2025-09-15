import React, { useState } from 'react';
import { usePastPapers } from '../../context/PastPapersContext';

const TopicSelection = () => {
  const { topics, selectedLevel, selectedSubject, paperType, selectTopic, goBack, pastPaperPending } = usePastPapers();
  const [hoveredTopic, setHoveredTopic] = useState(null);
  const [selectedTopics, setSelectedTopics] = useState([]);

  const handleTopicSelect = (topic) => {
    setSelectedTopics(prev => {
      if (prev.includes(topic)) {
        // Remove topic if already selected
        return prev.filter(t => t !== topic);
      } else {
        // Add topic if not selected
        return [...prev, topic];
      }
    });
  };

  const handleContinue = () => {
    if (selectedTopics.length > 0) {
      selectTopic(selectedTopics);
    }
  };

  const handleGoBack = () => {
    goBack();
  };

  if (pastPaperPending) {
    return (
      <div className=" bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-blue-600 mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Loading Topics</h2>
          <p className="text-lg text-gray-600">Fetching available topics for {selectedSubject?.name}...</p>
          <div className="mt-4 text-sm text-gray-500">
            <div className="animate-pulse">Please wait while we prepare your learning options</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className=" bg-gradient-to-br from-gray-50 to-blue-50 p-2">
      <div className=" mx-auto mt-2">
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
          {selectedTopics.length > 0 && (
          <div className="text-center ">
            <button
              onClick={handleContinue}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-sm text-white font-semibold py-2 px-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Continue with {selectedTopics.length} Topic{selectedTopics.length !== 1 ? 's' : ''} →
            </button>
          </div>
        )}

        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-3">
            Choose Your Topics
          </h1>
          <p className="text-base text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Select one or more topics you want to practice for <strong>{selectedSubject?.name}</strong>.
            You can select multiple topics to get questions from all of them.
          </p>
        </div>
    

        {/* Topic Grid */}
        <div className='w-full h-[51vh] overflow-y-auto scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-gray-100 px-4 mb-4'>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 ">
          {Array.isArray(topics) && topics.length > 0 ? (
            topics.map((topic, index) => (
              <div
                key={topic}
                onClick={() => handleTopicSelect(topic)}
                onMouseEnter={() => setHoveredTopic(topic)}
                onMouseLeave={() => setHoveredTopic(null)}
                className={`
                  bg-white/90 backdrop-blur-sm rounded-md shadow-sm hover:shadow-md
                  cursor-pointer p-4 text-center     min-h-[60px] flex flex-col justify-center
                  group relative overflow-hidden border transition-all duration-300
                  ${selectedTopics.includes(topic)
                    ? 'border-blue-500 bg-blue-50/50 transform scale-105'
                    : hoveredTopic === topic 
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
                {selectedTopics.includes(topic) && (
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
                  <div className="mb-1">
                    <div className={`w-7 h-7 rounded-full mx-auto flex items-center justify-center mb-0.5 backdrop-blur-sm transition-all duration-300 ${
                      selectedTopics.includes(topic)
                        ? 'bg-gradient-to-br from-green-500 to-blue-600'
                        : 'bg-gradient-to-br from-blue-500 to-purple-600'
                    }`}>
                      <span className="text-[14px] font-bold text-white">
                        {topic.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                  
                  <h3 className="text-[14px] font-bold text-gray-800 mb-1 group-hover:text-blue-600 transition-colors duration-300 leading-tight">
                    {topic}
                  </h3>
                  
                  <p className="text-[14px] text-gray-600 opacity-90 group-hover:opacity-100 transition-opacity">
                    Practice
                  </p>
                </div>
                
                {/* Hover Action */}
                <div className={`mt-0.5 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-1 group-hover:translate-y-0`}>
                  <div className={`backdrop-blur-sm rounded-full px-0.5 py-0.5 inline-block border transition-all duration-300 ${
                    selectedTopics.includes(topic)
                      ? 'bg-green-500/10 border-green-500/20'
                      : 'bg-blue-500/10 border-blue-500/20'
                  }`}>
                    <span className={`text-[8px] font-semibold flex items-center ${
                      selectedTopics.includes(topic) ? 'text-green-600' : 'text-blue-600'
                    }`}>
                      <span>{selectedTopics.includes(topic) ? '✓' : '→'}</span>
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">No topics available</h3>
              <p className="text-gray-600">Please select a subject first to see available topics.</p>
            </div>
          )}
        </div>
        </div>
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
              <span className="text-sm font-medium text-blue-800">Topic</span>
            </div>
            <div className="w-px h-5 bg-gray-300"></div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
              <span className="text-sm text-gray-500">Questions</span>
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

export default TopicSelection;
