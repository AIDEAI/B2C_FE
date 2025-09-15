import React, { useState, useEffect, useMemo } from "react";
import { ArrowLeft, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import moment from "moment-timezone";
import Loader from "../../components/sharedUI/loader";
import { toast } from "react-toastify";
import { useGetSessionMutation, useGetEvaluation } from "../../utils/api/userApi";

const EvaluatedSession = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const sessionId = location.state?.sessionId;
  
  const { data: evaluationData, isPending: isLoadingEvaluation } = useGetEvaluation(sessionId);
  console.log("🚀 ~ evaluationData:", evaluationData)
  console.log("🚀 ~ evaluationData.evaluation:", evaluationData?.evaluation)
  console.log("🚀 ~ evaluationData.evaluation.questions:", evaluationData?.evaluation?.questions)
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  
  // Image modal state
  const [imageModal, setImageModal] = useState({
    isOpen: false,
    images: [],
    currentIndex: 0,
    title: ""
  });
  // Calculate total awarded marks across all questions
  const totalAwardedMarks = useMemo(() => {
    if (!evaluationData?.evaluation?.questions) return 0;

    return evaluationData?.evaluation?.questions?.reduce((total, question) => {
      const marksAwarded = parseFloat(question.marks_awarded) || 0;
      return total + marksAwarded;
    }, 0);
  }, [evaluationData]);


  const handleBackClick = () => {
    navigate('/b2c/dashboard/sessions');
  };

  // Image modal functions
  const openImageModal = (images, index, title) => {
    setImageModal({
      isOpen: true,
      images: images,
      currentIndex: index,
      title: title
    });
  };

  const closeImageModal = () => {
    setImageModal({
      isOpen: false,
      images: [],
      currentIndex: 0,
      title: ""
    });
  };

  const navigateImage = (direction) => {
    setImageModal(prev => {
      const newIndex = direction === 'next' 
        ? (prev.currentIndex + 1) % prev.images.length
        : (prev.currentIndex - 1 + prev.images.length) % prev.images.length;
      
      return {
        ...prev,
        currentIndex: newIndex
      };
    });
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (imageModal.isOpen) {
        if (e.key === 'Escape') {
          closeImageModal();
        } else if (e.key === 'ArrowLeft') {
          navigateImage('prev');
        } else if (e.key === 'ArrowRight') {
          navigateImage('next');
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [imageModal.isOpen]);

  // Find question by id
  const findQuestion = (id) => {
    for (const question of evaluationData?.evaluation?.questions || []) {
      if (question.id === id) return { question };
    }
    return { question: null };
  };

  // Handle click on question
  const handleQuestionClick = (questionId) => {
    const { question } = findQuestion(questionId);
    if (!question) return;
    setSelectedQuestion(question);
  };

  // Function to render answer key array
  const renderAnswerKeyArray = (answerKeyArray) => {
    if (!answerKeyArray || answerKeyArray.length === 0) return null;

    return (
      <div className="mb-3 p-3 bg-green-50 rounded-lg border border-green-200">
        <p className="font-medium mb-2 text-green-800">Answer Key:</p>
        <div className="space-y-2">
          {answerKeyArray.map((answerItem, index) => (
            <div key={index}>
              {answerItem.type === 'text' && (
                <p className="text-green-700 leading-relaxed text-sm">{answerItem.content}</p>
              )}
              {answerItem.type === 'image' && (
                <img 
                  src={answerItem.content} 
                  alt="Answer key" 
                  className="max-w-full h-auto rounded border cursor-pointer"
                  onClick={() => openImageModal([answerItem.content], 0, "Answer Key Image")}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Recursive function to render unlimited nested subparts
  const renderNestedSubparts = (subParts, level = 0, parentPath = "", parentPart = null, parentSubPart = null) => {
    if (!subParts || subParts.length === 0) return null;
    
    const borderColors = [
      'border-blue-200',    // Level 0 (parts)
      'border-blue-200',    // Level 1 (subparts) 
      'border-green-200',   // Level 2 (nested subparts)
      'border-purple-200',  // Level 3 (sub-sub-subparts)
      'border-orange-200',  // Level 4 (sub-sub-sub-subparts)
      'border-red-200',     // Level 5+ (deeper levels)
    ];
    
    const bgColors = [
      'bg-white',           // Level 0
      'bg-white',           // Level 1
      'bg-green-50',        // Level 2
      'bg-purple-50',       // Level 3
      'bg-orange-50',       // Level 4
      'bg-red-50',          // Level 5+
    ];
    
    const currentBorderColor = borderColors[Math.min(level, borderColors.length - 1)];
    const currentBgColor = bgColors[Math.min(level, bgColors.length - 1)];
    
    return (
      <div className="mt-3 ml-4 space-y-3">
        {subParts.map((nestedSubPart, nestedIndex) => (
          <div key={nestedSubPart.id || nestedIndex} className={`border ${currentBorderColor} rounded-lg p-3 ${currentBgColor}`}>
            {/* Nested SubPart Header */}
            <div className="flex items-center gap-2 ">
              <span className="bg-purple-100 text-purple-700 rounded-full h-5 w-5 flex items-center justify-center text-xs font-medium flex-shrink-0">
                {nestedSubPart.letter || nestedIndex + 1}
              </span>

              {/* Nested SubPart Content */}
              {nestedSubPart.content && nestedSubPart.content.length > 0 && (
                <div className="">
                  {nestedSubPart.content.map((contentItem, index) => (
                    <div key={index} className="">
                      {contentItem.type === 'text' && (
                        <p className="text-gray-700 leading-relaxed text-xs">{contentItem.content}</p>
                      )}
                      {contentItem.type === 'image' && (
                        <img 
                          src={contentItem.content} 
                          alt="Nested subpart content" 
                          className="max-w-full h-auto rounded border cursor-pointer" 
                          onClick={() => openImageModal([contentItem.content], 0, "Nested Subpart Image")}
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Nested SubPart Answer Key */}
            {renderAnswerKeyArray(nestedSubPart.answerKey)}

            {/* Nested SubPart Student Answer */}
            {nestedSubPart.studentAnswer ? (
              <div className="mt-2 p-2 bg-purple-50 rounded border border-purple-200">
                <p className="font-medium mb-1 text-purple-800 text-xs">Student Answer:</p>
                <p className="text-purple-700 text-xs">{nestedSubPart.studentAnswer}</p>
              </div>
            ) : (
              <div className="mt-2 p-2 bg-red-50 rounded border border-purple-200">
                <p className="font-medium mb-1 text-red-800 text-xs">Student Answer:</p>
                <p className="text-red-700 text-xs">No answer provided</p>
              </div>
            )}

            {/* Nested SubPart Student Images */}
            {nestedSubPart.studentImages && nestedSubPart.studentImages.length > 0 && (
              <div className="mt-2 p-2 bg-purple-50 rounded border border-purple-200">
                <p className="font-medium mb-1 text-purple-800 text-xs">Student Answer Images:</p>
                <div className="grid grid-cols-2 gap-2">
                  {nestedSubPart.studentImages.map((imageUrl, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={imageUrl}
                        alt={`Student answer image ${index + 1}`}
                        className="w-full h-16 object-cover rounded border border-purple-200 shadow-sm hover:shadow-md transition-shadow"
                      />
                      <div 
                        className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded transition-all duration-200 flex items-center justify-center cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          openImageModal(nestedSubPart.studentImages, index, "Student Answer Images");
                        }}
                      >
                        <span className="text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity bg-black bg-opacity-70 px-1 py-0.5 rounded">
                          Zoom
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Nested SubPart AI Explanation */}
            {nestedSubPart.aiExplanation && (
              <div className="mt-3 p-2 bg-purple-50 rounded border border-purple-200">
                <p className="font-medium mb-1 text-purple-800 text-xs">AI Explanation:</p>
                <p className="text-purple-700 text-xs leading-relaxed">{nestedSubPart.aiExplanation}</p>
              </div>
            )}

            {/* Nested SubPart Marks Awarded */}
            <div className="mt-2 p-2 bg-gray-50 rounded border border-gray-200">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-800">Marks Awarded:</span>
                <span className="text-xs text-gray-600">
                  {nestedSubPart.marks_awarded || 0} / {nestedSubPart.marks} marks
                </span>
              </div>
            </div>
            
            {/* Recursively render deeper levels */}
            {nestedSubPart.subParts && nestedSubPart.subParts.length > 0 && (
              renderNestedSubparts(nestedSubPart.subParts, level + 1, `${parentPath ? parentPath + '.' : ''}${nestedSubPart.letter || nestedIndex + 1}`, parentPart, parentSubPart)
            )}
          </div>
        ))}
      </div>
    );
  };

  // Main student answer rendering function
  const renderStudentAnswer = (item) => {
    console.log("🚀 ~ renderStudentAnswer item:", item)
    console.log("🚀 ~ renderStudentAnswer item.parts:", item?.parts)
    // Helper function to render content array (text and images)
    const renderContentArray = (contentArray, title = "", bgColor = "blue") => {
      if (!contentArray || contentArray.length === 0) return null;

      const textContent = contentArray.filter(content => content.type === 'text' && content.content && content.content.trim());
      const imageContent = contentArray.filter(content => content.type === 'image' && content.content);

      if (textContent.length === 0 && imageContent.length === 0) return null;

      return (
        <div className="space-y-3">
          {/* Text Content */}
          {textContent.length > 0 && (
            <div className={`p-3 bg-${bgColor}-50 rounded-lg border border-${bgColor}-100`}>
              {title && <p className="font-medium mb-2 text-${bgColor}-800">{title}</p>}
              <div className="space-y-2">
                {textContent.map((textItem, index) => (
                  <div key={index} className="bg-white p-3 rounded border border-gray-200">
                    <p className="text-gray-700 whitespace-pre-wrap">{textItem.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Image Content */}
          {imageContent.length > 0 && (
            <div className={`p-3 bg-${bgColor}-50 rounded-lg border border-${bgColor}-100`}>
              <p className="font-medium mb-2 text-${bgColor}-800">Images:</p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {imageContent.map((imageItem, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={imageItem.content}
                      alt={`Image ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                    />
                    <div 
                      className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded-lg transition-all duration-200 flex items-center justify-center cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        openImageModal(imageContent.map(img => img.content), index, "Images");
                      }}
                    >
                      <span className="text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity bg-black bg-opacity-70 px-2 py-1 rounded">
                        Click to zoom
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    };

    // Helper function to render main content
    const renderMainContent = (item) => {
      if (!item.mainContent || item.mainContent.length === 0) return null;

      const validContent = item.mainContent.filter(content => 
        content.content && 
        ((content.type === 'text' && content.content.trim()) || (content.type === 'image' && content.content))
      );

      if (validContent.length === 0) return null;

      return (
        <div className="mb-4 space-y-3">
          {validContent.map((contentItem, index) => (
            <div key={index}>
              {contentItem.type === 'text' && (
                <p className="text-gray-700 leading-relaxed text-base whitespace-pre-wrap">{contentItem.content}</p>
              )}
              <div className="flex justify-start items-center flex-wrap gap-2">
                {contentItem.type === 'image' && (
                  <div className="relative group">
                    <img 
                      src={contentItem.content} 
                      alt="Question content" 
                      className="w-full h-48 object-cover rounded border cursor-pointer shadow-sm hover:shadow-md transition-shadow" 
                    /> 
                    <div 
                      className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded transition-all duration-200 flex items-center justify-center cursor-pointer"
                      onClick={() => openImageModal([contentItem.content], 0, "Question Image")}
                    >
                      <span className="text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity bg-black bg-opacity-70 px-2 py-1 rounded">
                        Click to zoom
                      </span>
                    </div> 
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      );
    };

    // Helper function to render main answer key
    const renderMainAnswerKey = (item) => {
      const mainAnswersKey = item.mainAnswerKey?.map(item => (item?.content || '').trim()) || [];
      if (mainAnswersKey.length === 0 || mainAnswersKey.every(c => c === '')) return null;

      const validContent = item.mainAnswerKey.filter(content => 
        content.content && 
        ((content.type === 'text' && content.content.trim()) || (content.type === 'image' && content.content))
      );

      if (validContent.length === 0) return null;

      return (
        <div className="mb-4 space-y-2 bg-green-100 p-2 rounded-lg border border-green-200">
          <h4 className="font-medium text-gray-800 text-sm">Main Answer Key:</h4>
          {validContent.map((answerItem, index) => (
            <div key={index}>
              {answerItem.type === 'text' && (
                <p className="text-gray-600 leading-relaxed text-sm whitespace-pre-wrap">{answerItem.content}</p>
              )}
              <div className="flex justify-start items-center flex-wrap gap-2">
                {answerItem.type === 'image' && (
                  <div className="relative group">
                    <img 
                      src={answerItem.content} 
                      alt="Answer key" 
                      className="w-full h-48 object-cover rounded border cursor-pointer shadow-sm hover:shadow-md transition-shadow"
                    />
                    <div 
                      className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded transition-all duration-200 flex items-center justify-center cursor-pointer"
                      onClick={() => openImageModal([answerItem.content], 0, "Answer Key Image")}
                    >
                      <span className="text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity bg-black bg-opacity-70 px-2 py-1 rounded">
                        Click to zoom
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      );
    };

    // Helper function to render parts
    const renderParts = (parts) => {
      if (!parts || parts.length === 0) return null;

      return (
        <div className="space-y-4">
          {parts?.map((part, partIndex) => {
            const hasContent = part.content && part.content.length > 0 && 
              part.content.some(content => content.content && 
                ((content.type === 'text' && content.content.trim()) || (content.type === 'image' && content.content))
              );
            const hasSubparts = part.subParts && part.subParts.length > 0;
            const hasStudentAnswer = part.studentAnswer && part.studentAnswer.trim();
            const hasStudentImages = part.studentImages && part.studentImages.length > 0;
            const hasAnswerKey = part.answerKey && part.answerKey.length > 0 && 
              part.answerKey.some(key => key.content && 
                ((key.type === 'text' && key.content.trim()) || (key.type === 'image' && key.content))
              );

            if (!hasContent && !hasSubparts && !hasStudentAnswer && !hasStudentImages && !hasAnswerKey) {
              return null;
            }

            return (
              <div key={part.id || partIndex} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                {/* Part Header */}
                <div className="flex items-center gap-2">
                  <span className="bg-blue-100 text-blue-700 rounded-full h-6 w-6 flex items-center justify-center text-sm font-medium flex-shrink-0">
                    {part.letter || partIndex + 1}
                  </span>
                </div>

                {hasContent && (
                  <div className="mb-3">
                    {part.content.map((contentItem, index) => {
                      if (!contentItem.content || 
                          (contentItem.type === 'text' && !contentItem.content.trim()) ||
                          (contentItem.type === 'image' && !contentItem.content)) {
                        return null;
                      }

                      return (
                        <div key={index} className="mb-2">
                          {contentItem.type === 'text' && (
                            <div className="flex items-start gap-2">
                              <p className="text-gray-700 leading-relaxed">{contentItem.content}</p>
                            </div>
                          )}
                          {contentItem.type === 'image' && (
                            <div className="flex items-start gap-2">
                              <img 
                                src={contentItem.content} 
                                alt="Part content" 
                                className="max-w-full h-auto rounded border cursor-pointer" 
                                onClick={() => openImageModal([contentItem.content], 0, "Part Image")}
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Part Answer Key */}
                {hasAnswerKey && renderAnswerKeyArray(part.answerKey)}

                {/* Part Student Answer */}
                {hasStudentAnswer && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="font-medium mb-1 text-blue-800">Student Answer:</p>
                    <p className="text-blue-700">{part.studentAnswer}</p>
                  </div>
                )}

                {/* Part Student Images */}
                {hasStudentImages && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="font-medium mb-2 text-blue-800">Student Answer Images:</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {part.studentImages.map((imageUrl, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={imageUrl}
                            alt={`Student answer image ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg border border-blue-200 shadow-sm hover:shadow-md transition-shadow"
                          />
                          <div 
                            className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded-lg transition-all duration-200 flex items-center justify-center cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              openImageModal(part.studentImages, index, "Student Answer Images");
                            }}
                          >
                            <span className="text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity bg-black bg-opacity-70 px-2 py-1 rounded">
                              Click to zoom
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Part AI Explanation */}
                {part.aiExplanation && (
                  <div className="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <p className="font-medium mb-2 text-purple-800">AI Explanation:</p>
                    <p className="text-purple-700 text-sm leading-relaxed">{part.aiExplanation}</p>
                  </div>
                )}

                {/* Part Marks Awarded */}
                <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium mb-1 text-gray-800">Marks Awarded:</p>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600">{part.marks_awarded || 0} / {part.marks}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* SubParts */}
                {part.subParts && part.subParts.length > 0 && (
                  <div className="mt-4 ml-4 space-y-3">
                    {part.subParts.map((subPart, subIndex) => (
                      <div key={subPart.id || subIndex} className="border border-gray-200 rounded-lg p-3 bg-white">
                        {/* SubPart Content */}
                        {subPart.content && subPart.content.length > 0 && (
                          <div className="mb-2">
                            <div className="flex items-start gap-2">
                              <span className="bg-green-100 text-green-700 rounded-full h-5 w-5 flex items-center justify-center text-xs font-medium flex-shrink-0 mt-1">
                                {subPart.label || subIndex + 1}
                              </span>
                            </div>
                            {subPart.content.map((contentItem, index) => (
                              <div key={index} className="mb-1">
                                {contentItem.type === 'text' && (
                                  <p className="text-gray-700 leading-relaxed text-sm whitespace-pre-wrap">{contentItem.content}</p>
                                )}
                                <div className="flex justify-start items-center flex-wrap gap-2">
                                  {contentItem.type === 'image' && (
                                    <div className="relative group">
                                      <img 
                                        src={contentItem.content} 
                                        alt="Subpart content" 
                                        className="w-full h-48 object-cover rounded border cursor-pointer shadow-sm hover:shadow-md transition-shadow" 
                                      />
                                      <div 
                                        className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded transition-all duration-200 flex items-center justify-center cursor-pointer"
                                        onClick={() => openImageModal([contentItem.content], 0, "Subpart Image")}
                                      >
                                        <span className="text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity bg-black bg-opacity-70 px-2 py-1 rounded">
                                          Click to zoom
                                        </span>
                                      </div> 
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* SubPart Answer Key */}
                        {renderAnswerKeyArray(subPart.answerKey)}

                        {/* SubPart Student Answer */}
                        {subPart.studentAnswer && (
                          <div className="mt-2 p-2 bg-green-50 rounded border border-green-200">
                            <p className="font-medium mb-1 text-green-800 text-sm">Student Answer:</p>
                            <p className="text-green-700 text-sm">{subPart.studentAnswer}</p>
                          </div>
                        )}

                        {/* SubPart Student Images */}
                        {subPart.studentImages && subPart.studentImages.length > 0 && (
                          <div className="mt-2 p-2 bg-green-50 rounded border border-green-200 w-full">
                            <p className="font-medium mb-1 text-green-800 text-sm">Student Answer Images:</p>
                            <div className="flex justify-center items-center flex-wrap gap-2">
                              {subPart.studentImages.map((imageUrl, index) => (
                                <div key={index} className="relative group">
                                  <img
                                    src={imageUrl}
                                    alt={`Student answer image ${index + 1}`}
                                    className="w-full h-48 object-cover rounded border border-green-200 shadow-sm hover:shadow-md transition-shadow"
                                  />
                                  <div 
                                    className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded transition-all duration-200 flex items-center justify-center cursor-pointer"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openImageModal(subPart.studentImages, index, "Student Answer Images");
                                    }}
                                  >
                                    <span className="text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity bg-black bg-opacity-70 px-1 py-0.5 rounded">
                                      Zoom
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* SubPart AI Explanation */}
                        {subPart.aiExplanation && (
                          <div className="mt-3 p-2 bg-purple-50 rounded border border-purple-200">
                            <p className="font-medium mb-1 text-purple-800 text-xs">AI Explanation:</p>
                            <p className="text-purple-700 text-xs leading-relaxed">{subPart.aiExplanation}</p>
                          </div>
                        )}

                        {/* SubPart Marks Awarded */}
                        <div className="mt-2 p-2 bg-gray-50 rounded border border-gray-200">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-gray-800">Marks Awarded:</span>
                            <span className="text-xs text-gray-600">{subPart.marks_awarded || 0} / {subPart.marks}</span>
                          </div>
                        </div>

                        {/* Recursively render nested subparts */}
                        {subPart.subParts && subPart.subParts.length > 0 && (
                          renderNestedSubparts(subPart.subParts, 2, `${part.letter || partIndex + 1}.${subPart.label || subIndex + 1}`, part, subPart)
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      );
    };

    // Check if question has parts structure
    if (item.parts && item.parts.length > 0) {
      return (
        <div className="mt-2 space-y-4">
          {/* Parts */}
          {renderParts(item.parts)}
        </div>
      );
    }

    // For questions without parts but with isDraw: true, show student images at main level
    if (item.isDraw && item.studentImages && item.studentImages.length > 0) {
      return (
        <div className="mt-2 space-y-4">
          {/* Main Question Content */}
          {renderMainContent(item)}
          
          {/* Main Answer Key */}
          {item?.mainAnswerKey && (
            renderMainAnswerKey(item)
          )}
          
          {/* Student Answer */}
          {item.studentAnswer && item.studentAnswer.trim() && (
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="font-medium mb-1">Student's Answer:</p>
              <p className="text-gray-700 whitespace-pre-wrap">
                {item.studentAnswer}
              </p>
            </div>
          )}

          {/* Student Images for main question with isDraw: true */}
          <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="font-medium mb-2 text-blue-800">Student Answer Images:</p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {item.studentImages.filter(img => img && img.trim()).map((imageUrl, index) => (
                <div key={index} className="relative group">
                  <img
                    src={imageUrl}
                    alt={`Student answer image ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg border border-blue-200 shadow-sm hover:shadow-md transition-shadow"
                  />
                  <div 
                    className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded-lg transition-all duration-200 flex items-center justify-center cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      openImageModal(item.studentImages.filter(img => img && img.trim()), index, "Student Answer Images");
                    }}
                  >
                    <span className="text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity bg-black bg-opacity-70 px-2 py-1 rounded">
                      Click to zoom
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* AI Explanation */}
          {item.aiExplanation && (
            <div className="mt-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
              <p className="font-medium mb-2 text-purple-800">AI Explanation:</p>
              <p className="text-purple-700 text-sm leading-relaxed">{item.aiExplanation}</p>
            </div>
          )}
          
          {/* Marks Awarded */}
          <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium mb-1 text-gray-800">Marks Awarded:</p>
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">{item.marks_awarded || 0} / {item.marks}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // For questions without parts, use switch case
    switch (item.type) {
      case "mcq":
        return (
          <div className="mt-2 space-y-4">
            {/* MCQ Options with Student Answer Highlighted */}
            {item.options && item.options.length > 0 && (
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="font-medium mb-2 text-gray-800">Options:</p>
                <div className="grid grid-cols-2 gap-2">
                  {item.options.map((option, idx) => {
                    let isStudentSelected = false;
                    if (item.studentAnswer !== null && item.studentAnswer !== undefined) {
                      const studentAnswerStr = item.studentAnswer.toString();
                      isStudentSelected =
                        studentAnswerStr === option ||
                        studentAnswerStr === idx.toString()
                    }

                    return (
                      <div
                        key={idx}
                        className={`p-2 rounded-lg border ${
                          isStudentSelected
                            ? "bg-blue-100 border-blue-300"
                            : "bg-gray-50 border-gray-200"
                        }`}
                      >
                        {option}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            
            {/* Answer Key */}
            {renderAnswerKeyArray(item.answerKey)}
            
            {/* AI Explanation */}
            {item.aiExplanation && (
              <div className="mt-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                <p className="font-medium mb-2 text-purple-800">AI Explanation:</p>
                <p className="text-purple-700 text-sm leading-relaxed">{item.aiExplanation}</p>
              </div>
            )}
            
            {/* Marks Awarded */}
            <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium mb-1 text-gray-800">Marks Awarded:</p>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">{item.marks_awarded || 0} / {item.marks}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "true_false":
        return (
          <div className="mt-2 space-y-4">
            {/* True/False Options */}
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <p className="font-medium mb-2 text-gray-800">Options:</p>
              <div className="space-y-2">
                {["true", "false"].map((option, idx) => {
                  const fullOption = `${idx === 0 ? "A" : "B"}) ${option}`;
                  const isStudentSelected = item.studentAnswer === fullOption;

                  return (
                    <div
                      key={option}
                      className={`p-2 rounded-lg border ${
                        isStudentSelected
                          ? "bg-blue-100 border-blue-300"
                          : "bg-gray-50 border-gray-200"
                      }`}
                    >
                      {option}
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Answer Key */}
            {renderAnswerKeyArray(item.answerKey)}
          </div>
        );

      case "long_answer":
      case "short_answer":
      case "fill_text":
        return (
          <div className="mt-2 space-y-4">
            {/* Main Content for long answer questions */}
            {renderMainContent(item)}
            
            {/* Main Answer Key */}
            {renderMainAnswerKey(item)}
            
            {/* Student Answer */}
            {item.studentAnswer && item.studentAnswer.trim() && (
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="font-medium mb-1">Student's Answer:</p>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {item.studentAnswer}
                </p>
              </div>
            )}
            
            {/* AI Explanation */}
            {item.aiExplanation && (
              <div className="mt-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                <p className="font-medium mb-2 text-purple-800">AI Explanation:</p>
                <p className="text-purple-700 text-sm leading-relaxed">{item.aiExplanation}</p>
              </div>
            )}
            
            {/* Marks Awarded */}
            <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium mb-1 text-gray-800">Marks Awarded:</p>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">{item.marks_awarded || 0} / {item.marks}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="mt-2 space-y-4">
            {/* Main Content */}
            {renderMainContent(item)}
            
            {/* Main Answer Key */}
            {item?.mainAnswerKey && (
              renderMainAnswerKey(item)
            )}
            
            {/* Student Answer */}
            {item?.studentAnswer && item?.studentAnswer?.trim() && (
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="font-medium mb-1 text-blue-800">Student's Answer:</p>
                <p className="text-gray-700">
                  {item.studentAnswer}
                </p>
              </div>
            )}
          </div>
        );
    }
  };

  if (isLoadingEvaluation) {
    return <Loader />;
  }

  if (!evaluationData) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">No evaluation data found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-white z-[90] flex flex-col overflow-y-auto">
      {/* Header */}
      <div className="bg-gray-50 py-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <button
            onClick={handleBackClick}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Sessions</span>
          </button>
        </div>

        <div className="mx-auto">
          <div className="flex flex-col gap-1 mb-8">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold text-gray-900">
                Session Evaluation Review
              </h1>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <h2 className="text-xl text-gray-700 italic">
                    {evaluationData?.evaluation?.metadata?.title || 'Practice Session'}
                  </h2>
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    {isExpanded ? "View Less" : "View More"}
                  </button>
                </div>
              </div>

              {/* Expandable Section */}
              {isExpanded && (
                <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-3 gap-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-700">
                        Grade:
                      </span>
                      <span className="text-sm text-gray-600">
                        {evaluationData?.evaluation?.metadata?.grade || 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-700">
                    Session:
                      </span>
                      <span className="text-sm text-gray-600">
                        {evaluationData?.evaluation?.metadata?.classroom_name || 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-700">
                        Teacher:
                      </span>
                      <span className="text-sm text-gray-600">
                        {evaluationData?.evaluation?.metadata?.teacher_name || 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-700">
                        Student:
                      </span>
                      <span className="text-sm text-gray-600">
                        {evaluationData?.evaluation?.metadata?.student_name || 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-700">
                        Evaluation Date:
                      </span>
                      <span className="text-sm text-gray-600">
                        {moment
                          .utc(evaluationData?.evaluation?.metadata?.evaluation_date)
                          .format("MM/DD/YYYY, h:mm:ss A")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-700">
                        Total Questions:
                      </span>
                      <span className="text-sm text-gray-600">
                        {evaluationData?.evaluation?.metadata?.total_questions || evaluationData?.evaluation?.questions?.length || 0}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-700">
                        Total Marks:
                      </span>
                      <span className="text-sm text-gray-600">
                        {totalAwardedMarks} / {evaluationData?.evaluation?.metadata?.total_marks || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          {evaluationData?.evaluation?.questions && evaluationData?.evaluation?.questions?.length > 0 ? (
            <div className="space-y-4">
              {evaluationData?.evaluation?.questions.map((question, questionIndex) => (
                <div
                  key={question.id}
                  className={`bg-white rounded-lg border border-gray-200 p-4 cursor-pointer hover:shadow transition-all ${
                    selectedQuestion?.id === question.id
                      ? "ring-2 ring-blue-400"
                      : ""
                  }`}
                  onClick={() => handleQuestionClick(question.id)}
                >
                  {/* Question Header */}
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-blue-100 text-blue-700 rounded-full h-6 w-auto px-2 flex items-center justify-center flex-shrink-0 font-medium">
                          Q{question.question_number || questionIndex + 1}
                        </span>
                        <span className="text-sm text-gray-500">
                          {question.question_type || 'Question'}
                        </span>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                      {question.marks_awarded || 0} / {question.marks} marks
                    </span>
                  </div>

                  {/* Question Content */}
                  <div className="mb-3">
                    {/* Section */}
                    {question.section && (
                      <div className="mb-2 p-2 bg-gray-100 rounded border border-gray-200">
                        <p className="text-sm text-gray-600 font-medium">{question.section}</p>
                      </div>
                    )}
                  </div>

                  {/* Student Answer Display */}
                  {renderStudentAnswer(question)}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 text-lg">No questions available for review.</p>
            </div>
          )}
        </div>
      </div>

      {/* Image Modal */}
      {imageModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-[100] flex items-center justify-center">
          <div className="relative max-w-4xl max-h-[90vh] w-full h-full flex items-center justify-center p-4">
            {/* Close Button */}
            <button
              onClick={closeImageModal}
              className="absolute top-4 right-4 z-10 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-full p-2 transition-all"
            >
              <X className="h-6 w-6" />
            </button>

            {/* Image Counter */}
            <div className="absolute top-4 left-4 z-10 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
              {imageModal.currentIndex + 1} / {imageModal.images.length}
            </div>

            {/* Title */}
            <div className="absolute top-16 left-4 z-10 bg-black bg-opacity-50 text-white px-3 py-1 rounded-lg text-sm">
              {imageModal.title}
            </div>

            {/* Previous Button */}
            {imageModal.images.length > 1 && (
              <button
                onClick={() => navigateImage('prev')}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-full p-2 transition-all"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
            )}

            {/* Main Image */}
            <img
              src={imageModal.images[imageModal.currentIndex]}
              alt={`${imageModal.title} ${imageModal.currentIndex + 1}`}
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />

            {/* Next Button */}
            {imageModal.images.length > 1 && (
              <button
                onClick={() => navigateImage('next')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-full p-2 transition-all"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            )}

            {/* Click outside to close */}
            <div
              className="absolute inset-0 -z-10"
              onClick={closeImageModal}
            />
          </div>

          {/* Image Navigation Dots */}
          {imageModal.images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {imageModal.images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setImageModal(prev => ({ ...prev, currentIndex: index }))}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === imageModal.currentIndex
                      ? 'bg-white'
                      : 'bg-white bg-opacity-50 hover:bg-opacity-75'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EvaluatedSession;