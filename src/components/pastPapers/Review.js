import React, { useState } from 'react';
import { usePastPapers } from '../../context/PastPapersContext';
import { useStartSession ,useGetSession} from '../../utils/api/userApi';
const Review = () => {
  const { 
    selectedLevel, 
    selectedSubject, 
    paperType, 
    selectedQuestions, 
    allSelectedQuestions, 
    questions,
    canGoToStep,
    goBack ,
    getSessionType,
    handleStartSession,
    isStartingSession
  } = usePastPapers();
  const [isExpanded, setIsExpanded] = useState(false);

  // Determine which questions to display based on paper type
  const getQuestionsToDisplay = () => {
    if (paperType?.id === 'yearly') {
      // For yearly papers, use questions from API (all questions at once)
      return questions || [];
    } else {
      // For topical papers, use selected questions
      return allSelectedQuestions || [];
    }
  };

  // const handleStartSession = async () => {
  //   try {
  //     setIsStartingSession(true);
      
  //     // Create payload for start session API
  //     const sessionPayload = {
  //       program: selectedLevel?.program,
  //       subject_id: selectedSubject?.id,
  //       paper_type: paperType?.id,
  //       selected_questions: allSelectedQuestions?.map(question => ({
  //         id: question.id
  //       })) || [],
  //       session_type: getSessionType(),
  //       created_at: new Date().toISOString()
  //     };
      
  //     console.log('Session Payload:', sessionPayload);
      
  //     // Here you would typically call the start session API
  //     // const response = await startSessionAPI(sessionPayload);
      
  //     // For now, we'll simulate the API call
  //     await new Promise(resolve => setTimeout(resolve, 2000));
      
  //     // Show success message
  //     alert(`🎉 Practice session started successfully!`);
      
  //   } catch (error) {
  //     console.error('Error starting session:', error);
  //     alert('Failed to start practice session. Please try again.');
  //   } finally {
  //     setIsStartingSession(false);
  //   }
  // };

  const handleGoBack = () => {
    goBack();
  };

  const handleEditSelection = () => {
    // Navigate back to questions step
    // You can add a goToStep function to context if needed
    window.location.reload(); // Temporary solution
  };

  const handleGoToStep = (step) => {
    if (canGoToStep(step)) {
      // You can add a goToStep function to context if needed
      window.location.reload(); // Temporary solution
    }
  };

  const getTotalTime = () => {
    // Estimate 2 minutes per question
    const questionsToDisplay = getQuestionsToDisplay();
    return questionsToDisplay.length * 2 || 0;
  };

  const getDifficultyLevel = () => {
    // Simple logic to determine difficulty based on year range
    const questionsToDisplay = getQuestionsToDisplay();
    const years = questionsToDisplay.map(q => q.year).filter(Boolean) || [];
    if (years.length === 0) return 'Mixed';
    
    const avgYear = years.reduce((a, b) => a + b, 0) / years.length;
    const currentYear = new Date().getFullYear();
    
    if (currentYear - avgYear <= 2) return 'Recent';
    if (currentYear - avgYear <= 5) return 'Moderate';
    return 'Classic';
  };



  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-gray-50 to-green-50 p-3 overflow-y-auto">
      <div className="mx-auto">
        {/* Header with Navigation */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-4">
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
            {/* Compact Progress Bar */}
        <div className="text-center">
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
            
            <div className="w-px h-4 bg-gray-300"></div>
            
            {paperType?.id === 'topical' ? (
              <>
                <div className="flex items-center space-x-1 px-2 py-1 rounded-full bg-green-100">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs font-medium text-green-800">Topic</span>
                </div>
                
                <div className="w-px h-4 bg-gray-300"></div>
                
                <div className="flex items-center space-x-1 px-2 py-1 rounded-full bg-green-100">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs font-medium text-green-800">Questions</span>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-1 px-2 py-1 rounded-full bg-green-100">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs font-medium text-green-800">Year & Filters</span>
              </div>
            )}
            
            <div className="w-px h-4 bg-gray-300"></div>
            
            <div className="flex items-center space-x-1 px-2 py-1 rounded-full bg-blue-100">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-blue-800">Review</span>
            </div>
          </div>
        </div>
          
          <button
            onClick={handleStartSession}
            disabled={isStartingSession}
            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
          >
            {isStartingSession ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span className="text-sm">Starting...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <span className="text-sm">🚀 Start Session</span>
              </div>
            )}
          </button>
        </div>

       

        {/* Title and Summary Section */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-4 mb-2">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center space-x-3">
             
              <h1 className="text-lg font-bold text-gray-800">
                {selectedLevel?.program_name} • {selectedSubject?.name} • {paperType?.name}
              </h1>
            </div>
            <div className="flex items-center justify-between gap-4">
            <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                {getQuestionsToDisplay()?.length || 0} Questions
              </div>
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium border border-gray-300 px-3 py-1 rounded hover:bg-gray-50 transition-colors"
            >
              {isExpanded ? 'View Less' : 'View More'}
            </button>
            </div>
          </div>

          {/* Expanded Summary - Only when expanded */}
          {isExpanded && (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 text-xs border-t pt-4">
              <div className="bg-blue-50 rounded-lg p-2">
                <div className="text-gray-600">Group Name:</div>
                <div className="font-semibold text-gray-800">Practice Session</div>
              </div>
              <div className="bg-green-50 rounded-lg p-2">
                <div className="text-gray-600">Total Questions:</div>
                <div className="font-semibold text-gray-800">
                  {getQuestionsToDisplay()?.length || 0}
                </div>
              </div>
              <div className="bg-purple-50 rounded-lg p-2">
                <div className="text-gray-600">Estimated Time:</div>
                <div className="font-semibold text-gray-800">{getTotalTime()} min</div>
              </div>
              <div className="bg-yellow-50 rounded-lg p-2">
                <div className="text-gray-600">Difficulty:</div>
                <div className="font-semibold text-gray-800">{getDifficultyLevel()}</div>
              </div>
              <div className="bg-orange-50 rounded-lg p-2">
                <div className="text-gray-600">Date:</div>
                <div className="font-semibold text-gray-800">{new Date().toLocaleDateString()}</div>
              </div>
              <div className="bg-indigo-50 rounded-lg p-2">
                <div className="text-gray-600">Session Type:</div>
                <div className="font-semibold text-gray-800">{getSessionType()}</div>
              </div>
            </div>
          )}
        </div>

        {/* Questions Section */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-4 flex flex-col" style={{height: 'calc(100vh - 154px)'}}>

          {/* Questions List */}
          <div className="flex-1 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-gray-100">
            {getQuestionsToDisplay()?.map((question, index) => (
              <div
                key={question.id}
                className="bg-white/90 backdrop-blur-sm rounded-lg shadow-md p-4 border-2 border-transparent hover:border-blue-200 transition-all duration-300"
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-1">
                    {/* Question Header */}
                    <div className="flex items-start gap-3 mb-3">
                      <div className="bg-blue-100 text-blue-700 rounded-full h-8 w-8 flex items-center justify-center text-sm font-bold flex-shrink-0">
                        Q{question.question_number || index + 1}
                      </div>
                      <div className="flex-1">
                        {/* Main Question Content */}
                        {question.mainContent && question.mainContent.length > 0 ? (
                          <div className="space-y-2">
                            {question.mainContent.map((contentItem, contentIndex) => (
                              <div key={contentIndex}>
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
                            {question.options.map((option, optionIndex) => (
                              <div key={optionIndex} className="flex items-center space-x-2 text-sm">
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
                            {['A) True', 'B) False'].map((option, optionIndex) => (
                              <div key={optionIndex} className="flex items-center space-x-2 text-sm">
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
                              {question.mainAnswerKey.map((answer, answerIndex) => (
                                <div key={answerIndex} className="text-gray-700">
                                  {answer.type === 'text' && answer.content}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Parts */}
                    {question.parts && question.parts.length > 0 && (
                      <div className="space-y-3 mt-4">
                        {question.parts.map((part, partIndex) => (
                          <div key={part.id} className="ml-4">
                            {/* Part Header */}
                            <div className="flex items-start gap-2 mb-2">
                              <div className="bg-green-100 text-green-700 rounded-full h-6 w-6 flex items-center justify-center text-xs font-medium flex-shrink-0">
                                {part.letter || String.fromCharCode(97 + partIndex)}
                              </div>
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
                                        {contentItem.type === 'text' && contentItem.content && (
                                          <p className="text-gray-700 text-sm">{contentItem.content}</p>
                                        )}
                                        {contentItem.type === 'image' && contentItem.content && (
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
                                
                              </div>
                            </div>
                            
                            {/* Subparts */}
                            {part.subParts && part.subParts.length > 0 && (
                              <div className="ml-6 space-y-2">
                                {part.subParts.map((subPart, subPartIndex) => (
                                  <div key={subPart.id} className="border-l-2 border-blue-200 pl-3 py-1">
                                    <div className="flex items-start gap-2">
                                      <span className="text-xs font-medium text-blue-600">
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
                                                {contentItem.type === 'text' && contentItem.content && (
                                                  <p className="text-gray-700 text-sm">{contentItem.content}</p>
                                                )}
                                                {contentItem.type === 'image' && contentItem.content && (
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
                        ))}
                      </div>
                    )}


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
            ))}

            {getQuestionsToDisplay()?.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <div className="text-4xl mb-4">📝</div>
                <p className="text-lg">
                  {paperType?.id === 'yearly' ? 'No questions available' : 'No questions selected'}
                </p>
                <p className="text-sm">
                  {paperType?.id === 'yearly' 
                    ? 'Try adjusting your filters or selecting different options' 
                    : 'Go back and select some questions to continue'
                  }
                </p>
              </div>
            )}
          </div>
        </div>


      
      </div>
    </div>
  );
};

export default Review;