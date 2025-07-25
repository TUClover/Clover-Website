import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Header, Paragraph, Title } from "@/components/ui/text";
import QuizPage from "@/pages/Quiz";
import { useState } from "react";
import ClassesDropdownMenu from "../../components/ClassesDropdownMenu";
import { useUserClasses } from "@/hooks/useUserClasses";
import { useUser } from "@/context/UserContext";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  XCircle,
} from "lucide-react";

type Quiz = {
  questions: QuizQuestion[] | null;
  score: number | null;
  submitted_at: string | null;
};

type QuizQuestion = {
  id: number;
  question: string;
  choices: string[];
  answerIndex: number;
  explanation: string;
};

const StudentQuizView = () => {
  const [quiz, setQuiz] = useState<Quiz>();
  const [answers, setAnswers] = useState<number[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);

  const generateQuiz = async () => {
    const quizQuestions: QuizQuestion[] = [];
    for (let i = 0; i < 10; i++) {
      quizQuestions.push({
        id: i,
        question: "What is the answer to life, the universe, and everything",
        choices: ["Choice 1", "Choice 2", "Choice 3", "Choice 4"],
        answerIndex: 1,
        explanation: "Here's an explanation for this question.",
      });
    }
    setQuiz({
      questions: quizQuestions,
      score: null,
      submitted_at: null,
    });
    setAnswers([-1, -1, -1, -1, -1, -1, -1, -1, -1, -1]);
    setSubmitted(false);
    setStartTime(new Date());
  };

  const submitQuiz = () => {
    if (!quiz?.questions) return;
    const correct = quiz.questions.filter(
      (q, i) => answers[i] === q.answerIndex
    ).length;
    setQuiz({
      ...quiz,
      score: correct,
      submitted_at: new Date().toISOString(),
    });
    setSubmitted(true);
  };

  const handleAnswer = (questionIndex: number, answerIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = answerIndex;
    setAnswers(newAnswers);
  };

  const nextQuestion = () => {
    if (quiz?.questions && currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const goToQuestion = (index: number) => {
    setCurrentQuestion(index);
  };

  return (
    <>
      {quiz ? (
        quiz.questions && !submitted ? (
          <QuizScroll
            quiz={quiz}
            answers={answers}
            currentQuestion={currentQuestion}
            onAnswer={handleAnswer}
            onNext={nextQuestion}
            onPrev={prevQuestion}
            onGoToQuestion={goToQuestion}
            onSubmit={submitQuiz}
            startTime={startTime}
          />
        ) : (
          <QuizResult quiz={quiz} answers={answers} />
        )
      ) : (
        <QuizControls generateQuiz={generateQuiz} />
      )}
    </>
  );
};

export default StudentQuizView;

const QuizControls = ({ generateQuiz }: { generateQuiz: () => void }) => {
  const { userData } = useUser();
  const { allClasses, handleClassSelect, selectedClassId } = useUserClasses(
    userData?.id,
    null
  );
  const navigate = useNavigate();

  const handleStart = () => {
    if (!selectedClassId) return;
    generateQuiz();
  };

  const handleHistory = () => {
    navigate("/dashboard/user-quiz/history");
  };

  return (
    <div className="flex flex-col gap-10 md:flex-row md:justify-center md:items-stretch mt-10">
      {/* Start Quiz Card */}
      <Card className="w-full max-w-md flex flex-col justify-between p-6">
        <div className="space-y-4">
          <Title>Start a Quiz</Title>
          <Paragraph>Select a class to begin:</Paragraph>
          <div className="space-y-2">
            <Label htmlFor="class">Class</Label>
            <ClassesDropdownMenu
              classes={allClasses}
              onClassSelect={handleClassSelect}
              selectedId={selectedClassId}
            />
          </div>
        </div>
        <Button
          className="mt-6 py-3"
          disabled={!selectedClassId}
          onClick={handleStart}
        >
          Start Quiz
        </Button>
      </Card>

      {/* History Card */}
      <Card className="w-full max-w-md flex flex-col justify-between p-6">
        <div className="space-y-4">
          <Title>Quiz History</Title>
          <Paragraph>Review your previous quizzes and scores.</Paragraph>
        </div>
        <Button className="mt-6 py-3" onClick={handleHistory}>
          View History
        </Button>
      </Card>
    </div>
  );
};

const QuizResult = ({ quiz, answers }: { quiz: Quiz; answers: number[] }) => {
  if (!quiz.questions) return null;

  const score = quiz.score || 0;
  const totalQuestions = quiz.questions.length;
  const percentage = Math.round((score / totalQuestions) * 100);

  const getGrade = (percent: number) => {
    if (percent >= 90) return { grade: "A", color: "text-green-600" };
    if (percent >= 80) return { grade: "B", color: "text-blue-600" };
    if (percent >= 70) return { grade: "C", color: "text-yellow-600" };
    if (percent >= 60) return { grade: "D", color: "text-orange-600" };
    return { grade: "F", color: "text-red-600" };
  };

  const { grade, color } = getGrade(percentage);

  return (
    <div className="flex flex-col items-center space-y-6 max-w-4xl mx-auto">
      {/* Score Summary */}
      <Card className="p-6 text-center w-full max-w-md">
        <div className="space-y-4">
          <div className={`text-6xl font-bold ${color}`}>{grade}</div>
          <div className="space-y-2">
            <div className="text-2xl font-semibold">
              {score} / {totalQuestions}
            </div>
            <div className="text-lg text-gray-600">{percentage}% Score</div>
          </div>
          <div className="text-sm text-gray-500">
            Completed on {new Date(quiz.submitted_at!).toLocaleDateString()}
          </div>
        </div>
      </Card>

      {/* Question Review */}
      <div className="space-y-4 w-full max-w-3xl">
        <Title>Question Review</Title>
        {quiz.questions.map((q, i) => {
          const isCorrect = answers[i] === q.answerIndex;
          const userAnswer = answers[i];

          return (
            <Card key={q.id} className="p-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-1 ${isCorrect ? "text-green-600" : "text-red-600"}`}
                  >
                    {isCorrect ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <XCircle className="w-5 h-5" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium mb-2">
                      {i + 1}. {q.question}
                    </div>

                    <div className="space-y-2">
                      <div
                        className={`text-sm ${isCorrect ? "text-green-600" : "text-red-600"}`}
                      >
                        <span className="font-medium">Your Answer: </span>
                        {userAnswer !== -1
                          ? q.choices[userAnswer]
                          : "No answer"}
                      </div>

                      {!isCorrect && (
                        <div className="text-sm">
                          <span className="font-medium">Correct Answer: </span>
                          {q.choices[q.answerIndex]}
                        </div>
                      )}

                      <Card className="text-sm bg-background p-6">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 mt-0.5" />
                          <span>{q.explanation}</span>
                        </div>
                      </Card>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-center">
        <Button onClick={() => window.location.reload()}>
          Take Another Quiz
        </Button>
        <Button variant="outline" onClick={() => console.log("View history")}>
          View All Results
        </Button>
      </div>
    </div>
  );
};

const QuizScroll = ({
  quiz,
  answers,
  currentQuestion,
  onAnswer,
  onNext,
  onPrev,
  onGoToQuestion,
  onSubmit,
  startTime,
}: {
  quiz: Quiz;
  answers: number[];
  currentQuestion: number;
  onAnswer: (questionIndex: number, answerIndex: number) => void;
  onNext: () => void;
  onPrev: () => void;
  onGoToQuestion: (index: number) => void;
  onSubmit: () => void;
  startTime: Date | null;
}) => {
  if (!quiz.questions) return null;

  const question = quiz.questions[currentQuestion];
  const totalQuestions = quiz.questions.length;
  const answeredCount = answers.filter((a) => a !== -1).length;
  const progressPercentage = (answeredCount / totalQuestions) * 100;

  const [timeElapsed, setTimeElapsed] = useState(0);

  useState(() => {
    if (startTime) {
      const interval = setInterval(() => {
        setTimeElapsed(
          Math.floor((new Date().getTime() - startTime.getTime()) / 1000)
        );
      }, 1000);
      return () => clearInterval(interval);
    }
  });
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-6">
      {/* Header with Progress */}
      <Card className="p-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-4">
            <Title className="text-lg">Quiz Progress</Title>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              {formatTime(timeElapsed)}
            </div>
          </div>
          <div className="text-sm font-medium">
            {answeredCount} / {totalQuestions} answered
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        {/* Question Navigation */}
        <div className="flex flex-wrap gap-2">
          {quiz.questions.map((_, index) => (
            <Button
              key={index}
              onClick={() => onGoToQuestion(index)}
              className={`w-8 h-8 text-white dark:text-black rounded-full text-xs font-medium transition-colors ${
                index === currentQuestion
                  ? ""
                  : answers[index] !== -1
                    ? "bg-green-300 border border-green-500"
                    : "bg-orange-300 border border-gray-500"
              }`}
            >
              {index + 1}
            </Button>
          ))}
        </div>
      </Card>

      {/* Question Card */}
      <Card className="p-6">
        <div className="space-y-6">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="text-sm font-medium mb-2">
                Question {currentQuestion + 1} of {totalQuestions}
              </div>
              <h3 className="text-lg font-semibold leading-relaxed">
                {question.question}
              </h3>
            </div>
          </div>

          {/* Answer Choices */}
          <div className="space-y-3">
            {question.choices.map((choice, index) => {
              const isSelected = answers[currentQuestion] === index;
              return (
                <Button
                  key={index}
                  onClick={() => onAnswer(currentQuestion, index)}
                  className={`w-full p-6 justify-start text-text bg-background text-left rounded-lg border-2 transition-all ${
                    isSelected ? "border-primary" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        isSelected
                          ? "border-gray-500 bg-primary"
                          : "border-gray-500"
                      }`}
                    >
                      {isSelected && (
                        <div className="w-2 h-2 bg-white rounded-full" />
                      )}
                    </div>
                    <span className="font-medium">
                      {String.fromCharCode(65 + index)}.
                    </span>
                    <span>{choice}</span>
                  </div>
                </Button>
              );
            })}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center pt-4">
            <Button
              variant="outline"
              onClick={onPrev}
              disabled={currentQuestion === 0}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>

            {currentQuestion === totalQuestions - 1 ? (
              <Button
                onClick={onSubmit}
                disabled={answeredCount < totalQuestions}
                className="flex items-center gap-2"
              >
                Submit Quiz
                <CheckCircle className="w-4 h-4" />
              </Button>
            ) : (
              <Button onClick={onNext} className="flex items-center gap-2">
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Review Section */}
      {answeredCount === totalQuestions && (
        <Card className="p-4 bg-green-50 border-green-200">
          <div className="flex items-center gap-2 text-green-800">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">
              All questions answered! Ready to submit.
            </span>
          </div>
        </Card>
      )}
    </div>
  );
};

const QuizHistory = () => {
  return (
    <Card>
      <Title>Quiz History</Title>
    </Card>
  );
};
