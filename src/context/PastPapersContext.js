import React, { createContext, useContext, useState, useEffect } from 'react';
import { useGetFilterPastPapers } from '../utils/api/userApi';
import { useStartSession,useGetSessionMutation } from '../utils/api/userApi';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
const PastPapersContext = createContext();

export function PastPapersProvider({ children }) {
  // Simple state - just one object with all data

  const [sessions, setSessions] = useState([]);
  const navigate = useNavigate();
  const { mutate: getSession, isPending: isGettingSession, error: errorGettingSession } = useGetSessionMutation();
  const { mutate: startSession, isPending: isStartingSession, error: errorStartingSession } = useStartSession();
    const [data, setData] = useState({
    currentStep: 'level',
    levels: [],
  subjects: [],
  topics: [],
  subTopics: [],
    availableYears: [],
    availableSessions: [],
    availableVariants: [],
    questions: [],
    totalQuestions: 0,
    pagination: {
      current_page: 1,
      per_page: 10,
      total_questions: 0,
      total_pages: 0,
      has_next_page: false,
      has_prev_page: false
    },
    selectedLevel: null,
    selectedSubject: null,
    paperType: null,
    selectedTopic: null,
  selectedTopics: [],
  selectedSubTopics: [],
  selectedSessions: [],
  selectedVariants: [],
  selectedYearRange: {},
  selectedYear: null,
    selectedQuestions: [],
    allSelectedQuestions: [], // Store all selected questions across pages
    error: null
  });

  // Simple API call - only pass parameters when they're actually needed
  const { data: apiData, isPending:pastPaperPending, error: apiError } = useGetFilterPastPapers(
    data.selectedLevel?.program,
    data.selectedSubject?.id,
    data.paperType?.id,
    data.selectedTopic || data.selectedTopics?.join(','),
    data.selectedSubTopics?.join(','),
    // Only pass year range for questions step, yearSelection step, or review step for yearly
    (data.currentStep === 'questions' || data.currentStep === 'yearSelection' || (data.currentStep === 'review' && data.paperType?.id === 'yearly')) ? data.selectedYearRange?.start : undefined,
    (data.currentStep === 'questions' || data.currentStep === 'yearSelection' || (data.currentStep === 'review' && data.paperType?.id === 'yearly')) ? data.selectedYearRange?.end : undefined,
    (data.currentStep === 'questions' || data.currentStep === 'yearSelection' || (data.currentStep === 'review' && data.paperType?.id === 'yearly')) ? data.pagination?.current_page : undefined,
    // Pass sessions and variants for yearly papers on questions step, yearSelection step, or review step
    (data.currentStep === 'questions' || data.currentStep === 'yearSelection' || (data.currentStep === 'review' && data.paperType?.id === 'yearly')) && data.paperType?.id === 'yearly' ? data.selectedSessions?.join(',') : undefined,
    (data.currentStep === 'questions' || data.currentStep === 'yearSelection' || (data.currentStep === 'review' && data.paperType?.id === 'yearly')) && data.paperType?.id === 'yearly' ? data.selectedVariants?.join(',') : undefined
  );

  // Debug logging for API parameters
  useEffect(() => {
    if (data.paperType?.id === 'yearly' && (data.currentStep === 'yearSelection' || data.currentStep === 'review')) {
      console.log('API Call Parameters for Yearly:', {
        program: data.selectedLevel?.program,
        subject_id: data.selectedSubject?.id,
        paper_type: data.paperType?.id,
        year_start: (data.currentStep === 'questions' || data.currentStep === 'yearSelection' || (data.currentStep === 'review' && data.paperType?.id === 'yearly')) ? data.selectedYearRange?.start : undefined,
        year_end: (data.currentStep === 'questions' || data.currentStep === 'yearSelection' || (data.currentStep === 'review' && data.paperType?.id === 'yearly')) ? data.selectedYearRange?.end : undefined,
        sessions: (data.currentStep === 'questions' || data.currentStep === 'yearSelection' || (data.currentStep === 'review' && data.paperType?.id === 'yearly')) && data.paperType?.id === 'yearly' ? data.selectedSessions?.join(',') : undefined,
        variants: (data.currentStep === 'questions' || data.currentStep === 'yearSelection' || (data.currentStep === 'review' && data.paperType?.id === 'yearly')) && data.paperType?.id === 'yearly' ? data.selectedVariants?.join(',') : undefined,
        currentStep: data.currentStep
      });
    }
  }, [data.selectedLevel, data.selectedSubject, data.paperType, data.selectedYearRange, data.selectedSessions, data.selectedVariants, data.currentStep]);


  // Handle API response
  useEffect(() => {
    if (apiData?.data && !pastPaperPending) {
      console.log('API Response:', apiData);
      console.log('Current Step:', data.currentStep);
      console.log('Paper Type:', data.paperType?.id);
      // Determine what data we're getting based on current step and what's selected
      if (data.currentStep === 'level' && !data.selectedLevel && data.levels.length === 0) {
        // Initial call - no level selected yet, this must be levels data
        setData(prev => ({ ...prev, levels: apiData.data }));
      } else if (data.currentStep === 'subjects' && data.selectedLevel && data.subjects.length === 0) {
        // We have a selected level but no subjects yet - this must be subjects data
        setData(prev => ({ ...prev, subjects: apiData.data}));
      } else if (data.currentStep === 'topics' && data.selectedSubject && data.topics.length === 0) {
        // We have a selected subject but no topics yet - this must be topics data
        setData(prev => ({ ...prev, topics: apiData.data.topics || apiData.data }));
      } else if (data.currentStep === 'yearSelection' && data.paperType?.id === 'yearly') {
        // Yearly year selection - handle the yearly options response
        console.log('Processing yearly options response:', apiData);
        
        if (apiData.data && (apiData.data.years || apiData.data.sessions || apiData.data.variants)) {
          setData(prev => ({ 
            ...prev, 
            availableYears: apiData.data?.years || [],
            availableSessions: apiData.data?.sessions || [],
            availableVariants: apiData.data?.variants || [],
            questions: apiData.data?.questions || [],
            pagination: apiData.pagination || {
              current_page: 1,
              per_page: 10,
              total_questions: 0,
              total_pages: 0,
              has_next_page: false,
              has_prev_page: false
            },
            totalQuestions: apiData.data?.total_questions || 0,
            // Don't auto-select questions at this step - only when user makes selections and goes to review
            selectedQuestions: [],
            allSelectedQuestions: []
          }));
        }
      } else if ((data.currentStep === 'questions' || data.currentStep === 'review') && data.paperType?.id === 'yearly') {
        // Yearly questions - handle both initial load and filter data
        console.log('Processing yearly questions response:', apiData);
        
        // Only process if we have the expected data structure
        if (apiData.data && (apiData.data.years || apiData.data.sessions || apiData.data.variants || apiData.data.questions)) {
          setData(prev => ({ 
            ...prev, 
            availableYears: apiData.data?.years ,
            availableSessions: apiData.data?.sessions ,
            availableVariants: apiData.data?.variants ,
            questions: apiData.data?.questions ,
            // Set pagination and total questions from the response
            pagination: apiData.pagination ,
            totalQuestions: apiData.data?.total_questions ,
            // For yearly papers, automatically select all questions since we skip the question selection step
            selectedQuestions: apiData.data?.questions?.map(q => q.id) || [],
            allSelectedQuestions: apiData.data?.questions || [],
            // Don't set pagination and year range automatically - only set them if user applies filters
            // This prevents automatic API calls
          }));
        } else if (apiData.sessions || apiData.variants || apiData.data?.questions) {
          // Handle filtered response structure (sessions and variants in root, questions in data)
          setData(prev => ({ 
            ...prev, 
            availableYears: apiData.data?.years ,
            availableSessions: apiData.sessions ,
            availableVariants: apiData.variants,
            questions: apiData.data?.questions || [],
            pagination: apiData.pagination ,
            totalQuestions: apiData.data?.total_questions,
            // For yearly papers, automatically select all questions since we skip the question selection step
            selectedQuestions: apiData.data?.questions?.map(q => q.id) || [],
            allSelectedQuestions: apiData.data?.questions || []
          }));
        }
      } else if (data.currentStep === 'questions' && data.selectedTopic) {
        // We have a selected topic - this must be subtopics and questions data
        // The API response contains subtopics, available_years, and questions
        setData(prev => ({ 
          ...prev, 
          subTopics: apiData.data.subtopics || [],
          availableYears: apiData.data.available_years || [],
          availableSessions: apiData.data.sessions || [],
          availableVariants: apiData.data.variants || [],
          questions: apiData.questions || [],
          pagination: apiData.pagination || {
            current_page: 1,
            per_page: 10,
            total_questions: 0,
            total_pages: 0,
            has_next_page: false,
            has_prev_page: false
          },
          totalQuestions: apiData.pagination?.total_questions || 0,
          selectedYearRange: (prev.selectedYearRange && (prev.selectedYearRange.start || prev.selectedYearRange.end)) 
            ? prev.selectedYearRange 
            : (apiData.data.available_years ? {
                start: Math.min(...apiData.data.available_years),
                end: Math.max(...apiData.data.available_years)
              } : prev.selectedYearRange)
         
        }));
      }
    }
  }, [apiData, data.currentStep, data.selectedLevel, data.selectedSubject, data.selectedTopic, data.paperType, data.subjects.length, data.topics.length, data.levels.length]);

  useEffect(() => {
    if (apiError) {
      setData(prev => ({ ...prev, error: apiError.message || 'API Error'}));
    }
  }, [apiError]);

  // Fetch levels on mount
  // No need for separate levels API - useGetFilterPastPapers handles everything

  // Simple functions to update state
  const selectLevel = (level) => {
    setData(prev => ({
      ...prev,
      selectedLevel: level,
        currentStep: 'subjects',
        
      error: null
    }));
  };

  const selectSubject = (subject) => {
    setData(prev => ({
      ...prev,
      selectedSubject: subject,
      currentStep: 'paperType',
    
      error: null
    }));
  };

  const selectPaperType = (paperType) => {
    setData(prev => ({
      ...prev,
      paperType,
      currentStep: paperType.id === 'topical' ? 'topics' : 'yearSelection',
      
      error: null
    }));
  };

    const selectTopic = (topic) => {
    setData(prev => ({
      ...prev,
      selectedTopic: topic,
        currentStep: 'questions',
        
      error: null
    }));
  };

  const selectYear = (year) => {
    setData(prev => ({
      ...prev,
      selectedYear: year,
      currentStep: 'review',
      error: null
    }));
  };

  const updateSubTopics = (subTopics) => {
    setData(prev => ({
      ...prev,
      selectedSubTopics: subTopics,
      
      error: null
    }));
  };

  const updateSessions = (sessions) => {
    setData(prev => ({
      ...prev,
      selectedSessions: sessions,
      
      error: null
    }));
  };

  const updateVariants = (variants) => {
    setData(prev => ({
      ...prev,
      selectedVariants: variants,
      
      error: null
    }));
  };

  const updateYearRange = (yearRange) => {
    setData(prev => ({
      ...prev,
      selectedYearRange: yearRange,
      
      error: null
    }));
  };

  const updatePage = (page) => {
    setData(prev => ({
      ...prev,
      pagination: {
        ...prev.pagination,
        current_page: page
      },
      
      error: null
    }));
  };

  const selectQuestions = (questions) => {
    setData(prev => ({
      ...prev,
      selectedQuestions: questions,
      allSelectedQuestions: questions, // Store all selected questions
      currentStep: 'review'
    }));
  };

  const addSelectedQuestion = (question) => {
    setData(prev => ({
      ...prev,
      allSelectedQuestions: [...prev.allSelectedQuestions, question]
    }));
  };

  const removeSelectedQuestion = (questionId) => {
    setData(prev => ({
      ...prev,
      allSelectedQuestions: prev.allSelectedQuestions.filter(q => q.id !== questionId)
    }));
  };

  const clearAllSelectedQuestions = () => {
    setData(prev => ({
      ...prev,
      allSelectedQuestions: [],
      selectedQuestions: []
    }));
  };

  const goBack = () => {
    setData(prev => {
      // Define flows for different paper types
      const topicalFlow = ['level', 'subjects', 'paperType', 'topics', 'questions', 'review'];
      const yearlyFlow = ['level', 'subjects', 'paperType', 'yearSelection', 'review'];
      
      let currentFlow, currentIndex;
      
      if (prev.paperType?.id === 'yearly') {
        currentFlow = yearlyFlow;
        currentIndex = yearlyFlow.indexOf(prev.currentStep);
      } else {
        currentFlow = topicalFlow;
        currentIndex = topicalFlow.indexOf(prev.currentStep);
      }
      
      if (currentIndex > 0) {
        const newStep = currentFlow[currentIndex - 1];
        
        // If going back to questions step, don't clear selected questions
        // If going back to earlier steps, clear all selections based on the step
        if (newStep === 'questions') {
          return { ...prev, currentStep: newStep };
        } else {
          // Clear selections based on the step we're going back to
          const clearData = { 
            ...prev, 
            currentStep: newStep,
            allSelectedQuestions: [],
            selectedQuestions: []
          };

          // Clear subject-related data when going back to subjects or earlier
          if (newStep === 'subjects' || newStep === 'level') {
            clearData.selectedSubject = null;
            clearData.subjects = [];
            clearData.topics = [];
            clearData.subTopics = [];
            clearData.questions = [];
            clearData.availableYears = [];
            clearData.availableSessions = [];
            clearData.availableVariants = [];
            clearData.selectedTopic = null;
            clearData.selectedTopics = [];
            clearData.selectedSubTopics = [];
            clearData.selectedYear = null;
            clearData.selectedYearRange = null;
            clearData.selectedSessions = [];
            clearData.selectedVariants = [];
            clearData.pagination = {
              current_page: 1,
              per_page: 10,
              total_questions: 0,
              total_pages: 0,
              has_next_page: false,
              has_prev_page: false
            };
            clearData.totalQuestions = 0;
          }

          // Clear topic-related data when going back to topics or earlier
          if (newStep === 'topics' || newStep === 'subjects' || newStep === 'level') {
            clearData.selectedTopic = null;
            clearData.selectedTopics = [];
            clearData.selectedSubTopics = [];
            clearData.topics = [];
            clearData.subTopics = [];
            clearData.questions = [];
            clearData.availableYears = [];
            clearData.availableSessions = [];
            clearData.availableVariants = [];
            clearData.selectedYear = null;
            clearData.selectedYearRange = null;
            clearData.selectedSessions = [];
            clearData.selectedVariants = [];
            clearData.pagination = {
              current_page: 1,
              per_page: 10,
              total_questions: 0,
              total_pages: 0,
              has_next_page: false,
              has_prev_page: false
            };
            clearData.totalQuestions = 0;
          }

          // Clear paper type when going back to paperType or earlier
          if (newStep === 'paperType' || newStep === 'subjects' || newStep === 'level') {
            clearData.paperType = null;
            clearData.selectedTopic = null;
            clearData.selectedTopics = [];
            clearData.selectedSubTopics = [];
            clearData.topics = [];
            clearData.subTopics = [];
            clearData.questions = [];
            clearData.availableYears = [];
            clearData.availableSessions = [];
            clearData.availableVariants = [];
            clearData.selectedYear = null;
            clearData.selectedYearRange = null;
            clearData.selectedSessions = [];
            clearData.selectedVariants = [];
            clearData.pagination = {
              current_page: 1,
              per_page: 10,
              total_questions: 0,
              total_pages: 0,
              has_next_page: false,
              has_prev_page: false
            };
            clearData.totalQuestions = 0;
          }

          // Clear year selection data when going back to yearSelection or earlier
          if (newStep === 'yearSelection' || newStep === 'paperType' || newStep === 'subjects' || newStep === 'level') {
            clearData.selectedYear = null;
            clearData.selectedYearRange = null;
            clearData.selectedSessions = [];
            clearData.selectedVariants = [];
            clearData.availableYears = [];
            clearData.availableSessions = [];
            clearData.availableVariants = [];
            clearData.questions = [];
            clearData.pagination = {
              current_page: 1,
              per_page: 10,
              total_questions: 0,
              total_pages: 0,
              has_next_page: false,
              has_prev_page: false
            };
            clearData.totalQuestions = 0;
          }

          return clearData;
        }
      }
      return prev;
    });
  };

  const goToStep = (step) => {
    setData(prev => ({ ...prev, currentStep: step }));
  };

  const handleGoToStep = (step) => {
    goToStep(step);
  };

  const canGoToStep = (step) => {
    // Define flows for different paper types
    const topicalFlow = ['level', 'subjects', 'paperType', 'topics', 'questions', 'review'];
    const yearlyFlow = ['level', 'subjects', 'paperType', 'yearSelection', 'review'];
    
    let currentFlow;
    if (data.paperType?.id === 'yearly') {
      currentFlow = yearlyFlow;
    } else {
      currentFlow = topicalFlow;
    }
    
    const currentIndex = currentFlow.indexOf(data.currentStep);
    const targetIndex = currentFlow.indexOf(step);
    return targetIndex <= currentIndex + 1;
  };

  const handleStartSession = () => {
    const sessionPayload = {
        program: data.selectedLevel?.program,
        subject_id: data.selectedSubject?.id,
        paper_type: data.paperType?.id,
        selected_questions: data.allSelectedQuestions?.map(question => ({
          id: question.id
        })) || [],
        session_type: getSessionType(),
        created_at: new Date().toISOString()
    }
    startSession(sessionPayload,{
      onSuccess: (response) => {
        if (response?.success){
          console.log('startsessionResponse',response);
          // handleGetSession(response?.data?.sessionId)
          navigate('/b2c/dashboard/paperAttempt',{state:{sessionId:response?.data?.sessionId}})
          toast.success(response?.message,{position:"bottom-right"})
        }
      },
      onError: (error) => {
        console.log(error);
      }
    })
  };

  const handleGetSession = (sessionID) => {
    getSession(sessionID, {
      onSuccess: (response) => {
        if (response?.success){

          setSessions(response?.data)
        console.log('getsessionResponse', response);
          // You can add additional logic here if needed
          // For example, store the session data or navigate to the session
        }
      },
      onError: (error) => {
        console.log('Error getting session:', error);
      }
    });
  };


  const getSessionType = () => {
    if (data?.paperType?.id === 'yearly') {
      return 'Yearly Paper Practice';
    } else {
      return 'Topical Practice Session';
    }
  };
  


  const value = {
    // State
    ...data,
    
    // Functions
    selectLevel,
    selectSubject,
    selectPaperType,
    selectTopic,
    selectYear,
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
    goToStep,
    handleGoToStep,
    canGoToStep,
    sessions,
    setSessions,
    handleStartSession,
    handleGetSession,
    isStartingSession,
    getSessionType,
    pastPaperPending,
    isGettingSession
  };

  return (
    <PastPapersContext.Provider value={value}>
      {children}
    </PastPapersContext.Provider>
  );
}

export function usePastPapers() {
  const context = useContext(PastPapersContext);
  if (!context) {
    throw new Error('usePastPapers must be used within a PastPapersProvider');
  }
  return context;
}