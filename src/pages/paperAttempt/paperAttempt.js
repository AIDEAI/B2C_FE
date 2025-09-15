import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'react-toastify';
import { useNavigate, useLocation } from 'react-router-dom';
import { usePastPapers } from '../../context/PastPapersContext';
import Loader from '../../components/sharedUI/loader';
import PaperEditor from './PaperEditor';
import DocumentGalleryModal from './imageUploadGallery';
import axios from 'axios';
import { useSubmitSession, useAutoSaveSession, useGetDraftSession } from '../../utils/api/userApi';

const PaperAttempt = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const sessionId = state?.sessionId;
  const { sessions, handleGetSession, isGettingSession } = usePastPapers();
  const { mutate: submitSession, isPending: isSubmittingSession, error: errorSubmittingSession } = useSubmitSession();
  const { mutate: saveDraft, isPending: isSavingDraft } = useAutoSaveSession();
  const { data: draftData, isPending: isLoadingDraft } = useGetDraftSession(sessionId, {
    enabled: !!sessionId,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    cacheTime: 0,
    onSuccess: (data) => {
      console.log("📥 Draft API called successfully:", {
        sessionId: sessionId,
        hasData: !!data,
        hasDataProperty: !!data?.data,
        hasAnswers: !!data?.data?.answers,
        answersCount: data?.data?.answers ? (typeof data.data.answers === 'string' ? JSON.parse(data.data.answers).length : data.data.answers.length) : 0,
        rawResponse: data
      });
    },
    onError: (error) => {
      console.error("❌ Draft API error:", error);
    }
  });
  console.log("🚀 ~ PaperAttempt ~ state:", state);
  console.log("🚀 ~ PaperAttempt ~ sessionId:", sessionId);
  console.log("🚀 ~ PaperAttempt ~ sessions:", sessions);
  console.log("🚀 ~ PaperAttempt ~ session status:", sessions?.status);
  console.log("🚀 ~ PaperAttempt ~ session keys:", sessions ? Object.keys(sessions) : 'No session data');
  
  const lastFetchTimeRef = useRef(Date.now());

  const [documents, setDocuments] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [imageGallery, setImageGallery] = useState(false);

  // State for the paper attempt
  const [expandedSections, setExpandedSections] = useState({});
  const [selectedSection, setSelectedSection] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [draftLoaded, setDraftLoaded] = useState(false);
  const answersRef = useRef(answers);


  // Update answersRef whenever answers changes
  useEffect(() => {
    answersRef.current = answers;
    console.log("📝 Answers state updated:", {
      answersCount: answers.length,
      answers: answers
    });
  }, [answers]);

  // Fetch session data when component mounts
  useEffect(() => {
    if (sessionId) {
      handleGetSession(sessionId);
    }
  }, [sessionId]);

  // Auto-save function
  const saveDraftAnswers = useCallback(() => {
    if (!sessionId) return;
    
    // Always save the current state, even if answers array is empty
    // This ensures the database is updated with the latest changes
    const currentAnswers = answersRef.current;
    const data = {
      sessionId: sessionId,
      answers: currentAnswers,
      
    };
    
    saveDraft(data, {
      onSuccess: () => {
        // Optionally show a toast or log
        console.log("Auto-save successful:", currentAnswers.length === 0 ? "Empty answers saved" : `${currentAnswers.length} answers saved`);
      },
      onError: (error) => {
        console.error("Error saving draft answers:", error);
      }
    });
  }, [sessionId, saveDraft]);

  // Function to clear draft data and reset answers
  const clearDraftAndReset = useCallback(() => {
    setAnswers([]);
    setDraftLoaded(false);
    
    // Clear draft from database by saving empty answers
    if (sessionId) {
      const data = {
        sessionId: sessionId,
        answers: [],
        remainingTime: null
      };
      
      saveDraft(data, {
        onSuccess: () => {
          toast.success("Draft cleared successfully", { position: "bottom-right" });
          console.log("✅ Draft cleared and saved to database");
        },
        onError: (error) => {
          console.error("Error clearing draft:", error);
        }
      });
    }
  }, [sessionId, saveDraft]);

  // Function to manually save current state (useful for debugging)
  const manualSave = useCallback(() => {
    if (sessionId) {
      const currentAnswers = answersRef.current;
      console.log("🔄 Manual save triggered", {
        answersCount: currentAnswers.length,
        answers: currentAnswers
      });
      saveDraftAnswers();
    }
  }, [sessionId, saveDraftAnswers]);

  const handleSubmitSession = () => {
    // Save draft before submitting
    saveDraftAnswers();
    
    const data={
        "sessionId": sessionId,
        "questions": answers.map(answer => ({
          
            "question_id": answer.question_id,
            "answer": answer.answer,
            "images": answer.images
          }))   
     
      }
    submitSession(data, {
      onSuccess: (response) => {
          console.log("🚀 ~ handleSubmitSession ~ response:", response)
        if(response?.success){
          toast.success(response?.message,{position:"bottom-right"})
          navigate("/b2c/dashboard/sessions")
        }
      }
    });
  };

  // Initialize sections and items when session data is available
  useEffect(() => {
    if (sessions?.questions?.length > 0) {
      const groupedQuestions = getGroupedQuestions();
      if (groupedQuestions.length > 0) {
        const firstSection = groupedQuestions[0].sectionName;
        const initialExpanded = groupedQuestions.reduce((acc, section) => {
          acc[section.sectionName] = true;
          return acc;
        }, {});
        setExpandedSections(initialExpanded);
        setSelectedSection(firstSection);
        
        // Select the first question by default
        if (groupedQuestions[0].items.length > 0) {
          setSelectedItem(groupedQuestions[0].items[0].id);
        }
      }
    }
  }, [sessions]);

  // Reset draftLoaded when component mounts or sessionId changes
  useEffect(() => {
    setDraftLoaded(false);
  }, [sessionId]);

  // Load draft answers when available
  useEffect(() => {
    if (draftData && draftData.data && draftData.data.answers && !draftLoaded) {
      try {
        const parsedAnswers = typeof draftData.data.answers === 'string' 
          ? JSON.parse(draftData.data.answers) 
          : draftData.data.answers;
        
        if (Array.isArray(parsedAnswers) && parsedAnswers.length > 0) {
          console.log("📥 Loading draft answers from database:", {
            draftAnswersCount: parsedAnswers.length,
            currentAnswersCount: answers.length,
            sessionId: sessionId,
            rawDraftData: draftData
          });
          console.log("🔄 Setting answers state:", parsedAnswers);
          setAnswers(parsedAnswers);
          setDraftLoaded(true);
          toast.success("Draft answers loaded", { position: "bottom-right" });
        } else {
          console.log("📭 Draft data is empty, not loading");
          setDraftLoaded(true); // Mark as loaded even if empty
        }
      } catch (error) {
        console.error("Error parsing draft answers:", error);
        setDraftLoaded(true); // Mark as loaded to prevent retries
      }
    }
  }, [draftData, draftLoaded, sessionId]);

  useEffect(() => {
    console.log("🔍 Auto-save check:", {
      hasSession: !!sessions,
      sessionStatus: sessions?.status,
      sessionId: !!sessionId
    });
    
    if (sessions && sessionId) {
      console.log("🔄 Auto-save started - saving every 5 seconds");
      
      const autoSaveInterval = setInterval(() => {
        const currentAnswers = answersRef.current;
        console.log("💾 Auto-saving current state...", {
          answersCount: currentAnswers.length,
          hasAnswers: currentAnswers.length > 0,
          answers: currentAnswers,
          timestamp: new Date().toISOString()
        });
        saveDraftAnswers();
      }, 5000); // Every 5 seconds
    
      return () => {
        console.log("🛑 Auto-save stopped");
        clearInterval(autoSaveInterval);
      };
    }
  }, [sessions, sessionId, saveDraftAnswers]);



  // Helper function to group questions by section
  const getGroupedQuestions = () => {
    if (!sessions?.questions) return [];
    
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
    
    return Object.values(grouped);
  };

  const handleImageGallery = () => {
    console.log('Upload button clicked, current imageGallery state:', imageGallery);
    setImageGallery(!imageGallery);
    console.log('Setting imageGallery to:', !imageGallery);
  };

  const handleImageGalleryClose = () => {
    setImageGallery(false);
  };

  const handleUpload = async () => {
    if (documents.length === 0) {
      toast.error("Please add at least one document", { position: "bottom-right" });
      return;
    }
    
    setIsUploading(true);

    try {
      const formData = new FormData();

      // Append all documents to formData
      documents.forEach((doc, index) => {
        formData.append(`files`, doc.file);
      });

      // Add order information
      formData.append(
        "order",
        JSON.stringify(documents.map((_, index) => index))
      );
      formData.append("sessionId", sessionId);

      // Send to backend
      const response = await axios.post(
        `${process.env.REACT_APP_LOCAL_URL}/sessions/preview-ocr-session`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem('Token')}`,
          },
        }
      );
      console.log("🚀 ~ handleUpload ~ response:", response)
      
      if (response?.data?.success) {
        // Handle OCR response data
        handleOcrResponse(response.data);
        toast.success("Documents uploaded successfully!");
        handleImageGalleryClose();
        setDocuments([]);
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(error.response?.data?.message || "Error uploading documents");
    } finally {
      setIsUploading(false);
    }
  };

  const handleAnswerChange = (questionId, value, type = 'text', images = null) => {
    console.log("✏️ Answer changed:", {
      questionId,
      value: value?.substring?.(0, 50) + (value?.length > 50 ? '...' : ''),
      type,
      hasImages: images !== null,
      currentAnswersCount: answers.length
    });
    
    setAnswers(prev => {
      const existingAnswerIndex = prev.findIndex(a => a.question_id === questionId);
      
      let answerValue;
      if (type === 'mcq') {
        answerValue = formatMCQAnswer(value, prev[existingAnswerIndex]?.answer);
      } else {
        // For regular text, true/false questions - keep answer as is
        answerValue = value;
      }
      
      const newAnswer = {
        question_id: questionId,
        answer: answerValue
      };

      // Add images field if provided (for draw questions)
      if (images !== null) {
        newAnswer.images = images;
      } else if (prev[existingAnswerIndex]?.images) {
        // Preserve existing images if not updating images
        newAnswer.images = prev[existingAnswerIndex].images;
      }

      if (existingAnswerIndex !== -1) {
        const updated = [...prev];
        updated[existingAnswerIndex] = newAnswer;
        console.log("🔄 Updated existing answer for question:", questionId);
        return updated;
      }
      
      console.log("➕ Added new answer for question:", questionId);
      return [...prev, newAnswer];
    });
  };

  const formatMCQAnswer = (newValue, existingAnswers = []) => {
    // For MCQ, we only want one selected option, so just return the new value
    return [newValue];
  };

  // Enhanced toggle function
  const toggleSectionExpand = (sectionName) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionName]: !prev[sectionName]
    }));
  };

  // Add this new function to handle OCR response
  const handleOcrResponse = (ocrData) => {
    console.log("ocrData:", ocrData);
    let questionAnswers = {};
    
    // Handle different OCR response formats
    if (ocrData?.questions) {
      if (Array.isArray(ocrData.questions)) {
        // Check if this is the old format (sections with items) or new format (items with parts/subparts)
        const firstSection = ocrData.questions[0];
        const firstItem = firstSection?.items?.[0];
        
        if (firstItem && !firstItem.parts) {
          // Old format: sections with items (no parts/subparts)
          questionAnswers = ocrData.questions.reduce((acc, section) => {
            section.items.forEach(item => {
              if (item.itemType === 'question' && item.answer) {
                acc[item.id] = item.answer;
              }
            });
            return acc;
          }, {});
        } else {
          // New format: sections with items containing parts and subParts
          questionAnswers = ocrData.questions.reduce((acc, section) => {
            if (section.items && Array.isArray(section.items)) {
              section.items.forEach(item => {
                if (item.itemType === 'question') {
                  // Handle main question answer (if exists)
                  if (item.answer) {
                    acc[item.id] = item.answer;
                  }
                  
                  // Handle parts answers
                  if (item.parts && Array.isArray(item.parts)) {
                    item.parts.forEach(part => {
                      if (part.answer) {
                        acc[part.id] = part.answer;
                      }
                      
                      // Handle subParts answers
                      if (part.subParts && Array.isArray(part.subParts)) {
                        part.subParts.forEach(subPart => {
                          if (subPart.answer) {
                            acc[subPart.id] = subPart.answer;
                          }
                          
                          // Recursively handle nested subparts
                          if (subPart.subParts && Array.isArray(subPart.subParts)) {
                            extractNestedSubpartsAnswers(subPart.subParts, acc);
                          }
                        });
                      }
                    });
                  }
                }
              });
            }
            return acc;
          }, {});
        }
      }
    } else if (Array.isArray(ocrData)) {
      // Direct array of questions (your format)
      questionAnswers = ocrData.reduce((acc, item) => {
        if (item.itemType === 'question' && item.answer) {
          acc[item.id] = item.answer;
        }
        return acc;
      }, {});
    } else if (ocrData && typeof ocrData === 'object') {
      // Single question object or other format
      if (ocrData.itemType === 'question' && ocrData.answer) {
        questionAnswers[ocrData.id] = ocrData.answer;
      }
    }

    console.log("Extracted OCR answers:", questionAnswers);

    // Update answers state with ALL questions from session, including OCR answers
    setAnswers(prevAnswers => {
      const newAnswers = [];
      
      // First, collect all questions, parts, and subparts from the session
      const allSessionQuestions = [];
      
      sessions?.questions?.forEach((question, qIndex) => {
        // Add main question
        allSessionQuestions.push({
          id: question.id,
          type: 'main',
          question: question
        });
        
        // Add parts
        if (question.parts && Array.isArray(question.parts)) {
          question.parts.forEach((part, pIndex) => {
            allSessionQuestions.push({
              id: part.id,
              type: 'part',
              question: part
            });
            
            // Add subparts
            if (part.subParts && Array.isArray(part.subParts)) {
              part.subParts.forEach((subPart, spIndex) => {
                allSessionQuestions.push({
                  id: subPart.id,
                  type: 'subpart',
                  question: subPart
                });
                
                // Recursively add nested subparts
                if (subPart.subParts && Array.isArray(subPart.subParts)) {
                  collectNestedSubparts(subPart.subParts, allSessionQuestions);
                }
              });
            }
          });
        }
      });
      
      // Now process each session question
      allSessionQuestions.forEach(({ id, type, question }) => {
        // Check if we have an OCR answer for this question
        let ocrAnswer = null;
        
        // Try exact match first
        if (questionAnswers[id]) {
          ocrAnswer = questionAnswers[id];
        } else {
          // Try flexible matching for parts and subparts
          if (type === 'part' || type === 'subpart') {
            // Extract the identifier part (e.g., "1_a" or "1_a_i")
            const idMatch = id.match(/_(\d+_[a-z]+(_[a-z]+)?)$/);
            if (idMatch) {
              const identifier = idMatch[1];
              
              // Find matching OCR answer
              Object.entries(questionAnswers).forEach(([ocrId, answer]) => {
                const ocrMatch = ocrId.match(/_(\d+_[a-z]+(_[a-z]+)?)$/);
                if (ocrMatch && ocrMatch[1] === identifier) {
                  ocrAnswer = answer;
                }
              });
            }
          }
        }
        
        // Check if this question already exists in previous answers
        const existingAnswer = prevAnswers.find(a => a.question_id === id);
        
        if (existingAnswer) {
          // Update with OCR answer if available, otherwise keep existing
          newAnswers.push({
            question_id: id,
            answer: ocrAnswer || existingAnswer.answer || ''
          });
        } else {
          // Add new answer entry
          newAnswers.push({
            question_id: id,
            answer: ocrAnswer || ''
          });
        }
      });
      
      return newAnswers;
    });
  };

  // Helper function to recursively collect nested subparts
  const collectNestedSubparts = (subParts, allSessionQuestions) => {
    subParts.forEach((nestedSubPart, nestedIndex) => {
      allSessionQuestions.push({
        id: nestedSubPart.id,
        type: 'nested_subpart',
        question: nestedSubPart
      });
      
      // Recursively collect deeper levels
      if (nestedSubPart.subParts && Array.isArray(nestedSubPart.subParts)) {
        collectNestedSubparts(nestedSubPart.subParts, allSessionQuestions);
      }
    });
  };

  // Helper function to recursively extract nested subparts answers from OCR data
  const extractNestedSubpartsAnswers = (subParts, questionAnswers) => {
    subParts.forEach((nestedSubPart) => {
      if (nestedSubPart.answer) {
        questionAnswers[nestedSubPart.id] = nestedSubPart.answer;
      }
      
      // Recursively extract deeper levels
      if (nestedSubPart.subParts && Array.isArray(nestedSubPart.subParts)) {
        extractNestedSubpartsAnswers(nestedSubPart.subParts, questionAnswers);
      }
    });
  };

  return (
    <>
      {(isGettingSession || isUploading || isLoadingDraft) && <Loader />}
      {!isGettingSession && !isLoadingDraft && (
        <div className="fixed top-0 left-0 w-full h-full z-50 bg-white overflow-y-auto">
          {/* Header with session info */}
          <div className="bg-white shadow-sm p-4">
            <div className="px-4 mx-auto">
              <div className="flex justify-between items-center">
                <div>
                  <button 
                    onClick={() => {
                      saveDraftAnswers();
                      navigate("/b2c/dashboard/sessions");
                    }}
                    className="flex items-center text-gray-600 hover:text-gray-800"
                  >
                    <ArrowLeft size={16} className="mr-1" />
                    Back
                  </button>
                  <h1 className="text-xl font-bold mt-2">
                    <span className='text-gray-600 text-lg font-semibold'>Session:</span> {sessions?.session_type || 'Practice Session'}
                  </h1>
                  <div className="flex items-center gap-2">
                    <p className="text-xl font-semibold text-gray-600">
                      <span className='text-gray-600 text-lg font-semibold'>Program:</span> {sessions?.program}
                    </p>
                    <button
                      onClick={() => setIsExpanded(!isExpanded)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium ml-2"
                    >
                      {isExpanded ? "View Less" : "View More"}
                    </button>
                  </div>
                </div>
                <div className='flex items-center gap-2'>
                  <button
                    onClick={() => handleImageGallery()}
                    className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600"
                  >
                    Upload Files
                  </button>
                  
                  {/* Debug button for manual save */}
                  <button
                    onClick={manualSave}
                    className="bg-green-500 text-white px-4 py-1 rounded hover:bg-green-600 text-xs"
                    title="Manual save for debugging"
                  >
                    Save Now
                  </button>
                </div>
              </div>
              
              {/* Expandable Section */}
              {isExpanded && (
                <div className="mt-2 space-y-2 bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-3 gap-4">
                    {sessions?.program && (
                      <div>
                        <h3 className="text-[12px] text-gray-700 font-[700] mb-1">
                          Program:
                        </h3>
                        <p className="text-[14px] text-gray-800">
                          {sessions?.program}
                        </p>
                      </div>
                    )}
                    {sessions?.subject_id && (
                      <div>
                        <h3 className="text-[12px] text-gray-700 font-[700] mb-1">
                          Subject ID:
                        </h3>
                        <p className="text-[14px] text-gray-800">
                          {sessions?.subject_id}
                        </p>
                      </div>
                    )}
                    {sessions?.paper_type && (
                      <div>
                        <h3 className="text-[12px] text-gray-700 font-[700] mb-1">
                          Paper Type:
                        </h3>
                        <p className="text-[14px] text-gray-800">
                          {sessions?.paper_type}
                        </p>
                      </div>
                    )}
                    {sessions?.created_at && (
                      <div>
                        <h3 className="text-[12px] text-gray-700 font-[700] mb-1">
                          Created At:
                        </h3>
                        <p className="text-[14px] text-gray-800">
                          {new Date(sessions?.created_at).toLocaleString()}
                        </p>
                      </div>
                    )}
                    {sessions?.selected_questions?.length && (
                      <div>
                        <h3 className="text-[12px] text-gray-700 font-[700] mb-1">
                          Total Questions:
                        </h3>
                        <p className="text-[14px] text-gray-800">
                          {sessions?.selected_questions?.length} questions
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Main paper editor */}
          <PaperEditor
            sessions={sessions}
            expandedSections={expandedSections}
            toggleSectionExpand={toggleSectionExpand}
            selectedSection={selectedSection}
            setSelectedSection={setSelectedSection}
            selectedItem={selectedItem}
            setSelectedItem={setSelectedItem}
            answers={answers}
            handleAnswerChange={handleAnswerChange}
            handleSubmit={handleSubmitSession}
            isSavingDraft={isSavingDraft}
            submitSessionPending={isSubmittingSession}
          />
        </div>
      )}
      
      {imageGallery && (
        <DocumentGalleryModal
          setDocuments={setDocuments}
          documents={documents}
          isUploading={isUploading}
          isOpen={imageGallery}
          onClose={handleImageGalleryClose}
          onUpload={handleUpload}
        />
      )}
    </>
  );
};
    
export default PaperAttempt;