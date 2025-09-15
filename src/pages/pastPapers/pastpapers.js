import React from 'react';
import { PastPapersProvider, usePastPapers } from '../../context/PastPapersContext';
import LevelSelection from '../../components/pastPapers/LevelSelection';
import SubjectSelection from '../../components/pastPapers/SubjectSelection';
import PaperTypeSelection from '../../components/pastPapers/PaperTypeSelection';
import TopicSelection from '../../components/pastPapers/TopicSelection';
import YearSelection from '../../components/pastPapers/YearSelection';
import QuestionsSelection from '../../components/pastPapers/QuestionsSelection';
import Review from '../../components/pastPapers/Review';

const PastPapersContent = () => {
  const { currentStep } = usePastPapers();

  const renderStep = () => {
    switch (currentStep) {
      case 'level':
        return <LevelSelection />;
      case 'subjects':
        return <SubjectSelection />;
      case 'paperType':
        return <PaperTypeSelection />;
      case 'topics':
        return <TopicSelection />;
      case 'yearSelection':
        return <YearSelection />;
      case 'questions':
        return <QuestionsSelection />;
      case 'review':
        return <Review />;
      default:
        return <LevelSelection />;
    }
  };

  return (
    <div className="">
      {renderStep()}
    </div>
  );
};

const PastPapers = () => {
  return (
    <PastPapersProvider>
      <PastPapersContent />
    </PastPapersProvider>
  );
};

export default PastPapers;