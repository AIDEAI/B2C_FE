import React, { useState } from 'react';
import { usePastPapers } from '../../context/PastPapersContext';

const LevelSelection = () => {
  const { levels, selectLevel, pastPaperPending } = usePastPapers();
  const [hoveredLevel, setHoveredLevel] = useState(null);

  // Helper function to get level colors and icons
  const getLevelStyle = (program) => {
    const styles = {
      'igcse': { color: 'bg-gradient-to-br from-purple-600 to-purple-800', icon: '🎓' },
      'alevel': { color: 'bg-gradient-to-br from-blue-600 to-blue-800', icon: '🎓' },
      'olevel': { color: 'bg-gradient-to-br from-green-600 to-green-800', icon: '📚' }
    };
    return styles[program] || { color: 'bg-gradient-to-br from-gray-600 to-gray-800', icon: '📖' };
  };

  const handleLevelSelect = (level) => {
    selectLevel(level);
  };

  return (
    <div className=" bg-gradient-to-br from-gray-50 to-blue-50 p-4">
      {/* Content container */}
      <div className="max-w-3xl mx-auto flex flex-col justify-center">
        {/* Welcome Header */}
        <div className="text-center mb-3">
          <div className="mb-4">
            <div className="text-5xl mb-3">🎯</div>
            <h1 className="text-lg font-bold text-gray-800 mb-2">
              Welcome to Past Papers Practice
            </h1>
            <p className="text-md text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Choose your academic level to start building your personalized practice sessions. 
              We'll guide you through selecting subjects and question types to match your study needs.
            </p>
          </div>
        </div>

        {/* Level Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 ">
          {Array.isArray(levels) && levels.length > 0 ? (
            levels.map((level) => {
              const style = getLevelStyle(level.program);
              return (
                <div
                  key={level.program_id}
                  onClick={() => handleLevelSelect(level)}
                  onMouseEnter={() => setHoveredLevel(level.program_id)}
                  onMouseLeave={() => setHoveredLevel(null)}
                  className={`
                    ${style.color} hover:scale-105 transform transition-all duration-300 
                    cursor-pointer rounded-2xl shadow-lg hover:shadow-xl
                    p-5 text-white text-center min-h-[150px] flex flex-col justify-center
                    group relative overflow-hidden
                  `}
                >
                  {/* Background Pattern */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-white/20 rounded-full -translate-y-10 translate-x-10"></div>
                    <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/20 rounded-full translate-y-8 -translate-x-8"></div>
                  </div>
                  
                  {/* Content */}
                  <div className="relative z-10">
                    <div className="mb-3">
                      <div className="text-3xl mb-2">{style.icon}</div>
                      <div className="w-20 h-20 bg-white/20 rounded-full mx-auto flex items-center justify-center mb-3 backdrop-blur-sm">
                        <span className="text-2xl font-bold text-white">
                          {level.program_name.charAt(0)}
                        </span>
                      </div>
                    </div>
                    
                    <h2 className="text-xl font-bold mb-2 group-hover:text-yellow-200 transition-colors duration-300">
                      {level.program_name}
                    </h2>
                    
                    <p className="text-base opacity-90 group-hover:opacity-100 transition-opacity mb-3">
                      {level?.program?.toUpperCase()} Level Program
                    </p>
                  </div>
                  
                  {/* Hover Action */}
                  <div className={`mt-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0`}>
                    <div className="bg-white/20 backdrop-blur-sm rounded-full px-5 py-2 inline-block border border-white/30">
                      <span className="text-sm font-semibold flex items-center space-x-2">
                        <span>Start Learning</span>
                        <span className="text-lg">→</span>
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full text-center py-12">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Loading Levels</h3>
              <p className="text-gray-600">Please wait while we fetch available programs...</p>
            </div>
          )}
        </div>

        {/* Progress Indicator */}
        <div className="text-center my-5">
          <div className="inline-flex items-center space-x-3 bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-gray-700">Level Selection</span>
            </div>
            <div className="w-px h-5 bg-gray-300"></div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
              <span className="text-sm text-gray-500">Subject Choice</span>
            </div>
            <div className="w-px h-5 bg-gray-300"></div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
              <span className="text-sm text-gray-500">Paper Type</span>
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

export default LevelSelection;
