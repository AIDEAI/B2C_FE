import React, { useRef, useEffect, forwardRef, useState } from 'react';
import { Send, ChevronDown, ChevronLeft, ChevronRight, Upload, X, Image } from 'lucide-react';
import { toast } from 'react-toastify';
import axios from 'axios';
import Loader from '../../components/sharedUI/loader';
import SimpleMathEditor from '../../components/SimpleMathEditor/SimpleMathEditor';

const PaperEditor = forwardRef(({ 
  sessions,
  expandedSections,
  toggleSectionExpand,
  selectedSection,
  setSelectedSection,
  selectedItem,
  setSelectedItem,
  answers,
  handleAnswerChange,
  handleSubmit,
  isSavingDraft,
  submitSessionPending
}, ref) => {
  const fileInputRefs = useRef({});
  console.log("answers in editor top :", answers);
  
  // State for upload loading per question
  const [uploadingImages, setUploadingImages] = useState({});
  const [isUploading, setIsUploading] = useState(false);

  const [imageModal, setImageModal] = useState({
    isOpen: false,
    images: [],
    currentIndex: 0,
    title: ""
  });
  
  // Image modal functions
  const openImageModal = (images, index, title) => {
    console.log("Opening modal with:", { images, index, title });
    // Normalize images to always be an array
    const normalizedImages = Array.isArray(images) ? images : [images];
    console.log("Normalized images:", normalizedImages);
    
    setImageModal({
      isOpen: true,
      images: normalizedImages,
      currentIndex: index || 0,
      title: title || ""
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
      // Ensure images is an array
      const imagesArray = Array.isArray(prev.images) ? prev.images : [prev.images];
      
      const newIndex = direction === 'next' 
        ? (prev.currentIndex + 1) % imagesArray.length
        : (prev.currentIndex - 1 + imagesArray.length) % imagesArray.length;
      
      return {
        ...prev,
        images: imagesArray,
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

  // Helper function to find section by question id
  const findSectionByQuestionId = (questionId) => {
    return sessions?.questions?.find(section => 
      section.items.some(item => item.id === questionId)
    )?.sectionName;
  };

  // Enhanced section click handler
  const handleSectionClick = (sectionName) => {
    toggleSectionExpand(sectionName);
    setSelectedSection(sectionName);
  };

  // Auto-select first section if none selected
  useEffect(() => {
    if (!selectedSection && sessions?.questions) {
      const groupedQuestions = getGroupedQuestions();
      if (groupedQuestions.length > 0) {
        setSelectedSection(groupedQuestions[0].sectionName);
      }
    }
  }, [sessions, selectedSection]);

  // Scroll to selected item when it changes
  useEffect(() => {
    if (selectedItem) {
      setTimeout(() => {
        // For main questions, scroll directly to them
        const mainElement = document.getElementById(`item-${selectedItem}`);
        if (mainElement) {
          mainElement.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
          });
        }
      }, 100);
    }
  }, [selectedItem]);

  // Helper function to group questions by section for new format
  const getGroupedQuestions = () => {
    if (!sessions?.questions) {
      console.log("No session questions found");
      return [];
    }
    
    console.log("Session questions:", sessions.questions);
    
    // Group questions by section
    const grouped = sessions.questions.reduce((acc, question) => {
      const sectionName = question.section || 'Section 1';
      if (!acc[sectionName]) {
        acc[sectionName] = {
          sectionName,
          items: []
        };
      }
      acc[sectionName].items.push(question);
      return acc;
    }, {});
    
    const result = Object.values(grouped);
    console.log("Grouped questions result:", result);
    return result;
  };

  // Helper function to get answer for a question
  const getAnswerForQuestion = (questionId) => {
    const answer = answers.find(a => a.question_id === questionId);
    return answer ? answer.answer : '';
  };

  // Helper function to get uploaded images for a question
  const getUploadedImages = (questionId) => {
    const answer = answers.find(a => a.question_id === questionId);
    return answer?.images || [];
  };

  // File upload handler - updated to handle both file selection and paste
  const handleFileUpload = async (questionId, files) => {
    if (!files || files.length === 0) {
      return;
    }
    
    // Validate files
    const validFiles = Array.from(files).filter(file => {
      console.log("Validating file:", file.name, "type:", file.type, "size:", file.size);
      const isValidType = file.type.startsWith('image/');
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB
      
      if (!isValidType) {
        toast.error(`${file.name} is not a valid image file`, { position: "bottom-right" });
        return false;
      }
      if (!isValidSize) {
        toast.error(`${file.name} is too large. Maximum size is 5MB`, { position: "bottom-right" });
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) {
      return;
    }
    
    try {
      setIsUploading(true);
      setUploadingImages(prev => ({ ...prev, [questionId]: true }));

      // Create FormData for upload
      const formData = new FormData();
      validFiles.forEach(file => {
        formData.append('files', file);
      });

      // API call to upload images
      const response = await axios.post(
        `${process.env.REACT_APP_LOCAL_URL}/sessions/upload-image`, 
        formData, 
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('Token')}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data.success) {
        // Get current images and add new ones
        const currentImages = getUploadedImages(questionId);
        
        // Add new images directly to the array
        const updatedImages = [
          ...currentImages,
          ...response.data.images
        ];
        
        // Get current answer text
        const currentAnswer = getAnswerForQuestion(questionId);
        
        // Update answer with images
        handleAnswerChange(questionId, currentAnswer || '', 'text', updatedImages);
        
        toast.success(`${response.data.totalUploaded} image(s) uploaded successfully!`, { position: "bottom-right", toastId: "upload-success212312313123" });
      } else {
        throw new Error(response?.data?.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload images. Please try again.', { position: "bottom-right" });
    } finally {
      setIsUploading(false);
      setUploadingImages(prev => ({ ...prev, [questionId]: false }));
    }
  };

  // Remove uploaded image
  const removeUploadedImage = (questionId, imageIndex) => {
    const currentImages = getUploadedImages(questionId);
    const currentAnswer = getAnswerForQuestion(questionId);
    
    // Create updated images array with image removed
    const updatedImages = currentImages.filter((_, index) => index !== imageIndex);
    
    // Update answer with updated images
    handleAnswerChange(questionId, currentAnswer || '', 'text', updatedImages);
    
    toast.success('Image removed successfully!', { position: "bottom-right", toastId: "upload-success2123asdasda" });
  };

  // Trigger file input
  const triggerFileInput = (questionId) => {
    if (fileInputRefs.current[questionId]) {
      fileInputRefs.current[questionId].click();
    }
  };

  // For MCQ questions
  const renderMCQOptions = (question) => {
    const currentAnswer = getAnswerForQuestion(question.id);
    return question.options?.map((option, index) => (
      <label 
        key={index} 
        className={`block p-3 border rounded-lg cursor-pointer transition-colors ${
          (Array.isArray(currentAnswer) && currentAnswer.includes(index)) || currentAnswer === index
            ? 'bg-blue-50 border-blue-300'
            : 'hover:bg-gray-50 border-gray-200'
        }`}
      >
        <div className="flex items-center">
          <input
            type="radio"
            name={`mcq-${question.id}`}
            checked={(Array.isArray(currentAnswer) && currentAnswer.includes(index)) || currentAnswer === index}
            onChange={() => handleAnswerChange(question.id, index, 'mcq')}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500"
          />
          <span className="ml-3">{String.fromCharCode(65 + index)}) {option}</span>
        </div>
      </label>
    ));
  };

  // For text/long answer questions - updated to handle draw questions
  const renderTextAnswer = (question) => {
    console.log("question:", question);
    const currentAnswer = getAnswerForQuestion(question.id);
    const textValue = typeof currentAnswer === 'string' ? currentAnswer : (currentAnswer || '');
    
    return (
      <SimpleMathEditor
        value={textValue}
        onChange={(e) => {
          // For all text questions, just update the answer text
          // Images are handled separately
          handleAnswerChange(question.id, e.target.value, 'text');
        }}
        rows={4}
        placeholder="Type your answer here... Switch to Math mode for advanced equations."
        className="w-full"
      />
    );
  };

  // For true/false questions
  const renderTrueFalse = (question) => {
    const currentAnswer = getAnswerForQuestion(question.id);
    
    return (
      <div className="space-y-3">
        {[
          { value: 'true', label: 'True' },
          { value: 'false', label: 'False' }
        ].map((option) => (
          <label 
            key={option.value}
            className={`block p-3 border rounded-lg cursor-pointer transition-colors ${
              currentAnswer === option.value
                ? 'bg-blue-50 border-blue-300'
                : 'hover:bg-gray-50 border-gray-200'
            }`}
          >
            <div className="flex items-center">
              <input
                type="radio"
                name={`tf-${question.id}`}
                checked={currentAnswer === option.value}
                onChange={() => handleAnswerChange(question.id, option.value, 'tf')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-3">{option.label}</span>
            </div>
          </label>
        ))}
      </div>
    );
  };

  // Render main content (text and images)
  const renderMainContent = (mainContent) => {
    if (!mainContent || mainContent.length === 0) return null;
    
    return (
      <div className="space-y-3 mb-4">
        {mainContent.map((content, index) => (
          <div key={index}>
            {content.type === 'text' && (
              <div className="text-gray-800 whitespace-pre-line">
                {content.content}
              </div>
            )}
            {content.type === 'image' && (
              <div className="flex justify-center">
                <div className="relative group">
                  <img
                    src={content.url || content.content}
                    alt={content.alt || "Question content"}
                    className="max-w-full h-auto max-h-96 rounded-lg border border-gray-200 cursor-pointer"
                  />
                  <div 
                    className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded-lg transition-all duration-200 flex items-center justify-center cursor-pointer"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      openImageModal(content.url || content.content, 0, "Question Image");
                    }}
                  >
                    <span className="text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity bg-black bg-opacity-70 px-2 py-1 rounded">
                      Click to zoom
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  // Render parts and subparts for long_question and long_answer questions
  const renderParts = (parts, questionId) => {
    if (!parts || parts.length === 0) return null;
    
    return (
      <div className="mt-4 space-y-4">
        {parts.map((part, partIndex) => (
          <div 
            key={part.id || partIndex} 
            className="pl-4 border-l-2 border-blue-200"
          >
            <div className="flex items-start mb-2">
              <h5 className="font-medium text-gray-800">
                ({part.letter}) {part.marks && `[${part.marks} mark${part.marks !== 1 ? 's' : ''}]`}
              </h5>
            </div>
            
            {/* Part content */}
            {part.content && part.content.length > 0 && (
              <div className="mb-3">
                {part.content.map((content, contentIndex) => (
                  <div key={contentIndex} className="mb-2">
                    {content.type === 'text' && (
                      <p className="text-gray-700 whitespace-pre-line">{content.content}</p>
                    )}
                    {content.type === 'image' && (
                      <div className="flex justify-center mt-2">
                        <div className="relative group">
                          <img
                            src={content.url || content.content}
                            alt={`Part ${part.letter} content`}
                            className="max-w-full h-auto max-h-64 rounded-lg border border-gray-200 cursor-pointer"
                          />
                          <div 
                            className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded-lg transition-all duration-200 flex items-center justify-center cursor-pointer"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              openImageModal(content.url || content.content, 0, `Part ${part.letter} Image`);
                            }}
                          >
                            <span className="text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity bg-black bg-opacity-70 px-2 py-1 rounded">
                              Click to zoom
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {/* Answer area for this part - always show textarea */}
            <div className="mt-3 pl-4">
              <SimpleMathEditor
                value={getAnswerForQuestion(part.id) || ''}
                onChange={(e) => handleAnswerChange(part.id, e.target.value, 'text')}
                rows={3}
                placeholder={`Type your answer for part (${part.letter}) here... Switch to Math for advanced equations.`}
                className="w-full"
              />
            </div>
            
            {/* Image upload for this part if isDraw is true */}
            {part.isDraw && (
              <div className="mt-3 pl-4">
                {renderImageUpload({ id: part.id })}
              </div>
            )}
            
            {/* Subparts */}
            {part.subParts && part.subParts.length > 0 && (
              <div className="mt-3 space-y-3">
                {part.subParts.map((subPart, subPartIndex) => (
                  <div 
                    key={subPart.id || subPartIndex} 
                    className="pl-4 border-l-2 border-gray-200"
                  >
                    <div className="flex items-start mb-2">
                      <h6 className="font-medium text-gray-700">
                        ({subPart.label || subPart.letter}) {subPart.marks && `[${subPart.marks} mark${subPart.marks !== 1 ? 's' : ''}]`}
                      </h6>
                    </div>
                    
                    {/* Subpart content */}
                    {subPart.content && subPart.content.length > 0 && (
                      <div className="mb-2">
                        {subPart.content.map((content, contentIndex) => (
                          <div key={contentIndex} className="mb-2">
                            {content.type === 'text' && (
                              <p className="text-gray-700 text-sm whitespace-pre-line">{content.content}</p>
                            )}
                            {content.type === 'image' && (
                              <div className="flex justify-center mt-2">
                                <div className="relative group">
                                  <img
                                    src={content.url || content.content}
                                    alt={`Subpart ${subPart.label || subPart.letter} content`}
                                    className="max-w-full h-auto max-h-48 rounded-lg border border-gray-200 cursor-pointer"
                                  />
                                  <div 
                                    className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded-lg transition-all duration-200 flex items-center justify-center cursor-pointer"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      openImageModal(content.url || content.content, 0, `Subpart ${subPart.label || subPart.letter} Image`);
                                    }}
                                  >
                                    <span className="text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity bg-black bg-opacity-70 px-2 py-1 rounded">
                                      Click to zoom
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Answer area for this subpart - always show textarea */}
                    <div className="mt-3 pl-4">
                      <SimpleMathEditor
                        value={getAnswerForQuestion(subPart.id) || ''}
                        onChange={(e) => handleAnswerChange(subPart.id, e.target.value, 'text')}
                        rows={2}
                        placeholder={`Type your answer for part (${part.letter})(${subPart.label || subPart.letter}) here... Switch to Math for equations.`}
                        className="w-full"
                      />
                    </div>
                    
                    {/* Image upload for this subpart if isDraw is true */}
                    {subPart.isDraw && (
                      <div className="mt-3 pl-4">
                        {renderImageUpload({ id: subPart.id })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  // Render image upload section for draw questions
  const renderImageUpload = (question) => {
    const questionImages = getUploadedImages(question.id);
    console.log("questionImages", questionImages);
    const isUploading = uploadingImages[question.id];

    return (
      <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-gray-700 flex items-center">
            <Image className="h-4 w-4 mr-2" />
            Upload Your Drawing/Images
          </h4>
          
          <button
            onClick={() => triggerFileInput(question.id)}
            disabled={isUploading}
            className={`px-3 py-1 rounded-md text-sm flex items-center gap-2 transition-colors ${
              isUploading 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            <Upload className="h-4 w-4" />
            {isUploading ? 'Uploading...' : 'Choose Files'}
          </button>
        </div>

        {/* Hidden file input */}
        <input
          ref={el => fileInputRefs.current[question.id] = el}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onClick={(e) => {
            // Reset the input value before opening file dialog
            e.target.value = '';
          }}
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              handleFileUpload(question.id, e.target.files);
            }
          }}
        />

        {/* Upload area with paste functionality */}
        <div 
          className="min-h-[100px] focus:outline-none"
          tabIndex={0}
          onPaste={async (e) => {
            e.preventDefault();
            const items = e.clipboardData?.items;
            if (!items) return;

            const imageItems = Array.from(items).filter(item => item.type.startsWith('image/'));
            if (imageItems.length === 0) return;

            for (const item of imageItems) {
              const file = item.getAsFile();
              if (!file) continue;

              // Validate file size
              if (file.size > 5 * 1024 * 1024) { // 5MB
                toast.error(`Pasted image is too large. Max size is 5MB`);
                continue;
              }

              // Create a new file with a proper name
              const newFile = new File([file], `pasted-image-${Date.now()}.${file.type.split('/')[1]}`, {
                type: file.type
              });
              
              // Use the existing handleFileUpload function
              await handleFileUpload(question.id, [newFile]);
            }
          }}
        >
          {/* Display uploaded images */}
          {questionImages.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-3">
              {questionImages.map((imageUrl, index) => (
                <div key={index} className="relative group">
                  <img
                    src={imageUrl?.url || imageUrl}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg border border-gray-200 shadow-sm"
                  />
                  <div 
                    className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded-lg transition-all duration-200 flex items-center justify-center cursor-pointer"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      // Create array of all image URLs
                      const allImageUrls = questionImages.map(img => img?.url || img);
                      openImageModal(allImageUrls, index, "Question Images");
                    }}
                  >
                    <span className="text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity bg-black bg-opacity-70 px-2 py-1 rounded">
                      Click to zoom
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      removeUploadedImage(question.id, index);
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {questionImages.length === 0 && !isUploading && (
            <div className="text-center py-6 text-gray-500">
              <Image className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm">No images uploaded yet</p>
              <p className="text-xs text-gray-400 mt-1">Click "Choose Files" to upload your drawing or images</p>
            </div>
          )}

          {/* File info */}
          <div className="mt-2 text-xs text-gray-500">
            <p>• Supported formats: JPG, PNG, GIF, WebP</p>
            <p>• Maximum file size: 5MB per image</p>
            <p>• You can upload multiple images</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {isUploading && <Loader/>}
      <div className="mx-auto px-2 py-2">
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="flex h-[calc(100vh-210px)]">
            {/* Left sidebar with sections */}
            <div className="w-64 border-r border-gray-200 bg-gray-50">
              <div className="overflow-y-auto h-full">
                {getGroupedQuestions().map((section) => (
                  <div key={section.sectionName} className="border-b border-gray-200 last:border-b-0">
                    {/* Section header */}
                    <button
                      onClick={() => handleSectionClick(section.sectionName)}
                      className={`w-full text-left p-3 flex items-center justify-between ${
                        selectedSection === section.sectionName ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <span className="font-medium truncate">{section.sectionName}</span>
                      {expandedSections[section.sectionName] ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>
                    
                    {/* Questions list with hierarchical structure */}
                    <div 
                      className={`pl-6 pr-3 transition-all duration-300 ${
                        expandedSections[section.sectionName] 
                          ? 'max-h-[600px] opacity-100 pb-2' 
                          : 'max-h-0 opacity-0 overflow-hidden py-0'
                      }`}
                    >
                      {section.items.map((question) => {
                        const questNumber = question?.question_number || '?';
                        const hasSubparts = question?.parts && question?.parts?.length > 0;
                        const hasMainContent = question?.mainContent && question?.mainContent?.length > 0;
                        
                        return (
                          <div key={question.id}>
                            {/* Main question */}
                            <button
                              onClick={() => setSelectedItem(question.id)}
                              className={`w-full text-left py-2 px-3 text-sm rounded-md flex items-center transition-all duration-200 ${
                                selectedItem === question.id 
                                  ? 'bg-blue-500 text-white shadow-md transform scale-[1.02]' 
                                  : 'text-gray-800 hover:bg-gray-100'
                              }`}
                            >
                              <span className="mr-2">●</span>
                              <div className={`flex flex-shrink-0 w-fit h-fit items-center justify-center mr-2 text-xs font-medium ${
                                selectedItem === question.id ? 'text-white' : 'text-blue-700'
                              }`}>
                                {questNumber}
                              </div>
                              <span className="truncate">
                                {question.mainContent && question.mainContent.length > 0 ? 
                                  (() => {
                                    const firstTextContent = question.mainContent.find(content => content.type === 'text' && content.content);
                                    return firstTextContent ? 
                                      (firstTextContent.content.length > 25 ? firstTextContent.content.substring(0, 25) + '...' : firstTextContent.content) :
                                      'Question content';
                                  })() :
                                  'Question content'
                                }
                              </span>
                              {selectedItem === question.id && (
                                <div className="ml-auto">
                                  <div className="w-2 h-2 bg-white rounded-full"></div>
                                </div>
                              )}
                            </button>
                            
                            {/* Content (if they exist) */}
                            {hasMainContent && (
                              <div className="ml-4 space-y-1">
                                <div className="flex items-center py-1 px-2 text-xs text-gray-600">
                                  <span className="mr-2">└─</span>
                                  <span className="font-mono bg-blue-100 px-1 rounded mr-2">
                                    Content
                                  </span>
                                  <span className="truncate">
                                    {(() => {
                                      const textContents = question.mainContent.filter(content => content.type === 'text' && content.content);
                                      const imageContents = question.mainContent.filter(content => content.type === 'image');
                                      return `${textContents.length} text${textContents.length !== 1 ? 's' : ''}, ${imageContents.length} image${imageContents.length !== 1 ? 's' : ''}`;
                                    })()}
                                  </span>
                                </div>
                              </div>
                            )}
                            
                            {/* Parts */}
                            {hasSubparts && (
                              <div className="ml-4 space-y-1">
                                {question.parts.map((part, partIndex) => (
                                  <div key={part.id}>
                                    <div className="flex items-center py-1 px-2 text-xs text-gray-600">
                                      <span className="mr-2">└─</span>
                                      <span className="font-mono bg-green-100 px-1 rounded mr-2">
                                        {questNumber}({part.letter || String.fromCharCode(97 + partIndex)})
                                      </span>
                                      <span className="truncate">
                                        {(() => {
                                          const textContents = part.content?.filter(content => content.type === 'text' && content.content) || [];
                                          const imageContents = part.content?.filter(content => content.type === 'image') || [];
                                          return `${textContents.length} text${textContents.length !== 1 ? 's' : ''}, ${imageContents.length} image${imageContents.length !== 1 ? 's' : ''}`;
                                        })()}
                                      </span>
                                    </div>
                                    
                                    {/* Subparts */}
                                    {part.subParts && part.subParts.length > 0 && (
                                      <div className="ml-4 space-y-1">
                                        {part.subParts.map((subPart, subPartIndex) => (
                                          <div key={subPart.id} className="flex items-center py-1 px-2 text-xs text-gray-500">
                                            <span className="mr-2">└─</span>
                                            <span className="font-mono bg-gray-50 px-1 rounded mr-2">
                                              ({subPart.label || subPart.letter || String.fromCharCode(105 + subPartIndex)})
                                            </span>
                                            <span className="truncate">
                                              {(() => {
                                                const textContents = subPart.content?.filter(content => content.type === 'text' && content.content) || [];
                                                const imageContents = subPart.content?.filter(content => content.type === 'image') || [];
                                                return `${textContents.length} text${textContents.length !== 1 ? 's' : ''}, ${imageContents.length} image${imageContents.length !== 1 ? 's' : ''}`;
                                              })()}
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                      
                      {section.items.filter(item => item.itemType === 'question').length === 0 && (
                        <p className="text-xs text-gray-500 py-2 px-3">
                          No questions in this section
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Right content area */}
            <div className="flex-1 overflow-y-auto">
              {(() => {
                const groupedQuestions = getGroupedQuestions();
                const currentSelectedSection = selectedSection || (groupedQuestions.length > 0 ? groupedQuestions[0].sectionName : null);
                
                return currentSelectedSection && (
                  <div className="">
                    {/* Section header */}
                    <div className="sticky top-0 bg-white border-b border-gray-200 pb-2 mb-2 px-4">
                      <h2 className="text-lg font-semibold text-gray-800">{currentSelectedSection}</h2>
                    </div>
                    
                    {/* Render all section questions in sequence */}
                    <div className="space-y-4 px-2">
                      {groupedQuestions
                        .find(section => section.sectionName === currentSelectedSection)
                        ?.items
                        .map((question, index) => (
                          <div 
                            key={question.id} 
                            className={`p-6 border border-gray-200 rounded-lg shadow-sm ${
                              selectedItem === question.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                            }`}
                            id={`item-${question.id}`}
                          >
                            <div>
                              <div className="flex items-start mb-4">
                                <div className="bg-blue-100 text-blue-700 rounded-full h-fit p-2 w-fit flex items-center justify-center mr-3 flex-shrink-0">
                                  {question.question_number || '?'}
                                </div>
                                <div className="flex-1">
                                  {/* Main Question Content */}
                                  {renderMainContent(question.mainContent)}
                                </div>
                                <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-sm ml-3">
                                  {question.marks} {question.marks === 1 ? 'mark' : 'marks'}
                                </div>
                              </div>
                              
                              {/* Question response area based on type */}
                              <div className="mt-6 pl-12">
                                {/* MCQ */}
                                {question.type === 'mcq' && question.options && (
                                  <div className="space-y-3">
                                    {renderMCQOptions(question)}
                                  </div>
                                )}
                                
                                {/* True/False */}
                                {question.type === 'true_false' && (
                                  <div>
                                    {renderTrueFalse(question)}
                                  </div>
                                )}
                                
                                {/* Short Answer */}
                                {question.type === 'short_answer' && (
                                  <div>
                                    {renderTextAnswer(question)}
                                  </div>
                                )}
                                
                                {/* Long Question with Parts */}
                                {( question.type === 'long_answer') && (
                                  <>
                                    {/* If no parts, show regular text answer */}
                                    {(!question.parts || question.parts.length === 0) && renderTextAnswer(question)}
                                    
                                    {/* If has parts, render parts with individual answer areas */}
                                    {question.parts && question.parts.length > 0 && renderParts(question.parts, question.id)}
                                  </>
                                )}
                                
                                {/* Fill in the blank */}
                                {question.type === 'fill_text' && (
                                  <>
                                    {renderTextAnswer(question)}
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
          
          {/* Footer with submit button */}
          <div className="bg-gray-50 border-t border-gray-200 p-4 flex justify-between">
            <div className="text-sm text-gray-500">
              {isSavingDraft ? 'Saving...' : 'Auto-save enabled'}
            </div>
            
            <button
              onClick={handleSubmit}
              disabled={submitSessionPending}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg flex items-center hover:bg-blue-700 transition-colors disabled:opacity-70"
            >
              <span>{submitSessionPending ? 'Submitting...' : 'Submit Answers'}</span>
              <Send size={16} className="ml-2" />
            </button>
          </div>
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
              {imageModal.currentIndex + 1} / {Array.isArray(imageModal.images) ? imageModal.images.length : 1}
            </div>

            {/* Title */}
            <div className="absolute top-16 left-4 z-10 bg-black bg-opacity-50 text-white px-3 py-1 rounded-lg text-sm">
              {imageModal.title}
            </div>

            {/* Previous Button */}
            {(Array.isArray(imageModal.images) ? imageModal.images.length : 1) > 1 && (
              <button
                onClick={() => navigateImage('prev')}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-full p-2 transition-all"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
            )}

            {/* Main Image */}
            <img
              src={Array.isArray(imageModal.images) ? imageModal.images[imageModal.currentIndex] : imageModal.images}
              alt={`${imageModal.title} ${imageModal.currentIndex + 1}`}
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />

            {/* Next Button */}
            {(Array.isArray(imageModal.images) ? imageModal.images.length : 1) > 1 && (
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

          {/* Image Navigation Dots (for multiple images) */}
          {(Array.isArray(imageModal.images) ? imageModal.images.length : 1) > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {(Array.isArray(imageModal.images) ? imageModal.images : [imageModal.images]).map((_, index) => (
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
    </>
  );
});

export default PaperEditor;
