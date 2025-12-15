import React, { useState } from 'react';

const Quiz = ({ api, notebookId, topicTitle, user }) => {
  const [quizState, setQuizState] = useState('setup'); // setup, generating, ready, taking, completed
  const [customTopic, setCustomTopic] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [quizData, setQuizData] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [showResults, setShowResults] = useState(false);

  const handleGenerateQuiz = async (topic) => {
    setIsLoading(true);
    setError('');
    setQuizState('generating');

    try {
      // First, get content/questions from LLM via chat without enhancement
      const chatResult = await api.chatOnly(
        notebookId, 
        `Create 10 detailed quiz questions about "${topic}". Include comprehensive content that covers key concepts, definitions, and practical applications. Format as a study guide with detailed explanations.`
      );

      if (!chatResult.success) {
        throw new Error('Failed to generate quiz content');
      }

      // Then generate the actual quiz using the generate-quiz API
      const quizResult = await api.generateQuiz(chatResult.response);

      if (!quizResult.success) {
        throw new Error(quizResult.error || 'Failed to generate quiz');
      }

      setQuizData({
        ...quizResult.quiz,
        topic: topic,
        generatedAt: new Date().toISOString()
      });
      setQuizState('ready');
      setCurrentQuestion(0);
      setUserAnswers([]);
      setShowResults(false);

    } catch (error) {
      console.error('Quiz generation error:', error);
      setError(error.message);
      setQuizState('setup');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartQuiz = () => {
    setQuizState('taking');
    setCurrentQuestion(0);
    setUserAnswers([]);
    setShowResults(false);
  };

  const handleAnswerSelect = (selectedOption) => {
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestion] = selectedOption;
    setUserAnswers(newAnswers);
  };

  const handleNextQuestion = () => {
    if (currentQuestion < quizData.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setQuizState('completed');
      setShowResults(true);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const calculateScore = () => {
    if (!quizData || !userAnswers.length) return { score: 0, total: 0, percentage: 0 };
    
    const correct = userAnswers.filter((answer, index) => {
      const question = quizData.questions[index];
      const correctAnswer = getCorrectAnswerText(question);
      return answer === correctAnswer;
    }).length;
    
    return {
      score: correct,
      total: quizData.questions.length,
      percentage: Math.round((correct / quizData.questions.length) * 100)
    };
  };

  // Helper function to convert letter to option text
  const getCorrectAnswerText = (question) => {
    const letterToIndex = {
      'A': 0, 'B': 1, 'C': 2, 'D': 3,
      'a': 0, 'b': 1, 'c': 2, 'd': 3
    };
    const index = letterToIndex[question.correct];
    return index !== undefined ? question.options[index] : question.correct;
  };

  // Helper function to check if answer is correct
  const isAnswerCorrect = (question, userAnswer) => {
    const correctAnswer = getCorrectAnswerText(question);
    return userAnswer === correctAnswer;
  };

  const resetQuiz = () => {
    setQuizState('setup');
    setQuizData(null);
    setCurrentQuestion(0);
    setUserAnswers([]);
    setShowResults(false);
    setCustomTopic('');
    setError('');
  };

  // Setup State
  if (quizState === 'setup') {
    return (
      <div className="card p-8 space-y-6">
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">🧠 Quiz Generator</h3>
          <p className="text-gray-600">Generate a custom quiz on any topic</p>
        </div>

        <div className="space-y-4">
          {/* Default Topic Option */}
          <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-lg font-semibold text-gray-900">{topicTitle}</h4>
                <p className="text-sm text-gray-600">Generate quiz based on current topic</p>
              </div>
              <button 
                onClick={() => handleGenerateQuiz(topicTitle)}
                disabled={isLoading}
                className="btn-primary"
              >
                Generate Quiz
              </button>
            </div>
          </div>

          {/* Custom Topic Option */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-gray-900 mb-3">Custom Topic</h4>
            <div className="flex gap-3">
              <input
                type="text"
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
                placeholder="Enter any topic you want to quiz on..."
                disabled={isLoading}
                className="flex-1 input-field"
                onKeyPress={(e) => e.key === 'Enter' && customTopic.trim() && handleGenerateQuiz(customTopic)}
              />
              <button 
                onClick={() => handleGenerateQuiz(customTopic)}
                disabled={isLoading || !customTopic.trim()}
                className="btn-primary whitespace-nowrap"
              >
                Generate Quiz
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}
      </div>
    );
  }

  // Generating State
  if (quizState === 'generating') {
    return (
      <div className="card p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Generating Your Quiz</h3>
        <p className="text-gray-600">Creating questions and gathering content...</p>
      </div>
    );
  }

  // Ready State
  if (quizState === 'ready' && quizData) {
    return (
      <div className="card p-8 space-y-6">
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">✅ Quiz Ready!</h3>
          <h4 className="text-xl font-semibold text-indigo-600 mb-4">{quizData.topic}</h4>
          <p className="text-gray-600 mb-6">{quizData.questions.length} questions prepared for you</p>
        </div>

        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
          <h5 className="font-semibold text-indigo-900 mb-2">Quiz Instructions:</h5>
          <ul className="text-indigo-800 space-y-1 text-sm">
            <li>• Read each question carefully</li>
            <li>• Select the best answer from multiple choices</li>
            <li>• You can navigate back and forth between questions</li>
            <li>• Your final score will be shown at the end</li>
          </ul>
        </div>

        <div className="flex gap-4 justify-center">
          <button onClick={resetQuiz} className="btn-secondary">
            Choose Different Topic
          </button>
          <button onClick={handleStartQuiz} className="btn-primary text-lg px-8 py-3">
            Start Quiz 🚀
          </button>
        </div>
      </div>
    );
  }

  // Taking Quiz State
  if (quizState === 'taking' && quizData) {
    const question = quizData.questions[currentQuestion];
    const progress = ((currentQuestion + 1) / quizData.questions.length) * 100;

    return (
      <div className="card p-8 space-y-6">
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm font-medium text-gray-900 mb-2">
            <span>Question {currentQuestion + 1} of {quizData.questions.length}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Question */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">{question.question}</h3>
          
          <div className="space-y-3">
            {question.options.map((option, index) => (
              <label 
                key={index} 
                className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all duration-200 hover:bg-gray-50 ${
                  userAnswers[currentQuestion] === option 
                    ? 'border-indigo-500 bg-indigo-50' 
                    : 'border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name={`question-${currentQuestion}`}
                  value={option}
                  checked={userAnswers[currentQuestion] === option}
                  onChange={() => handleAnswerSelect(option)}
                  className="mr-4 text-indigo-600"
                />
                <span className="text-gray-900">{option}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button 
            onClick={handlePrevQuestion}
            disabled={currentQuestion === 0}
            className="btn-secondary"
          >
            ← Previous
          </button>
          
          <span className="text-sm text-gray-600">
            {userAnswers.filter(a => a).length} of {quizData.questions.length} answered
          </span>
          
          <button 
            onClick={handleNextQuestion}
            disabled={!userAnswers[currentQuestion]}
            className="btn-primary"
          >
            {currentQuestion === quizData.questions.length - 1 ? 'Finish Quiz' : 'Next →'}
          </button>
        </div>
      </div>
    );
  }

  // Completed State
  if (quizState === 'completed' && quizData && showResults) {
    const results = calculateScore();
    const getScoreColor = (percentage) => {
      if (percentage >= 80) return 'text-green-600';
      if (percentage >= 60) return 'text-yellow-600';
      return 'text-red-600';
    };

    const getScoreMessage = (percentage) => {
      if (percentage >= 90) return 'Excellent! Outstanding performance! 🌟';
      if (percentage >= 80) return 'Great job! You have a solid understanding! 👏';
      if (percentage >= 70) return 'Good work! Keep studying to improve! 📚';
      if (percentage >= 60) return 'Fair performance. Review the material and try again! 💪';
      return 'Keep studying! Practice makes perfect! 📖';
    };

    return (
      <div className="card p-8 space-y-8">
        {/* Results Header */}
        <div className="text-center">
          <div className="text-6xl mb-4">
            {results.percentage >= 80 ? '🎉' : results.percentage >= 60 ? '👍' : '📚'}
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-2">Quiz Complete!</h3>
          <h4 className="text-xl text-gray-600 mb-4">{quizData.topic}</h4>
        </div>

        {/* Score Display */}
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <div className={`text-6xl font-bold mb-4 ${getScoreColor(results.percentage)}`}>
            {results.percentage}%
          </div>
          <div className="text-xl text-gray-700 mb-2">
            {results.score} out of {results.total} correct
          </div>
          <p className="text-lg text-gray-600">{getScoreMessage(results.percentage)}</p>
        </div>

        {/* Detailed Results */}
        <div className="space-y-4">
          <h5 className="text-lg font-semibold text-gray-900">Review Your Answers:</h5>
          {quizData.questions.map((question, index) => {
            const userAnswer = userAnswers[index];
            const correctAnswer = getCorrectAnswerText(question);
            const isCorrect = isAnswerCorrect(question, userAnswer);
            
            return (
              <div key={index} className={`border rounded-lg p-4 ${isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                <div className="flex items-start gap-3">
                  <span className={`text-xl ${isCorrect ? '✅' : '❌'}`}>
                    {isCorrect ? '✅' : '❌'}
                  </span>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 mb-2">
                      Q{index + 1}: {question.question}
                    </p>
                    <p className="text-sm text-gray-700 mb-1">
                      <span className="font-medium">Your answer:</span> {userAnswer || 'No answer'}
                    </p>
                    {!isCorrect && (
                      <p className="text-sm text-green-700">
                        <span className="font-medium">Correct answer:</span> {correctAnswer}
                      </p>
                    )}
                    {question.explanation && (
                      <p className="text-sm text-blue-700 mt-2">
                        <span className="font-medium">Explanation:</span> {question.explanation}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex gap-4 justify-center">
          <button onClick={resetQuiz} className="btn-secondary">
            Try Different Topic
          </button>
          <button 
            onClick={() => handleGenerateQuiz(quizData.topic)} 
            className="btn-primary"
          >
            Retake Quiz
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default Quiz;