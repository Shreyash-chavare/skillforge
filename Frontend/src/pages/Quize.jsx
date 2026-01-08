import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import api from "../api/api";
import { useNavigate } from "react-router-dom";
import Timer from '../components/Timer'
import Loading from "@/components/Loading";

const Quize = () => {
  const navigate = useNavigate();
  const { topic, order, suborder } = useParams();
  const [quize, setQuize] = useState(null);
  const [answers, setAnswers] = useState({}); 
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const timerRef = useRef();

  const getQuizkey = () => `quiz_${topic}_${order}${suborder ? `_${suborder}` : ''}`;

  useEffect(() => {
    const handlequize = async () => {
      try {
        const quizKey = getQuizkey();
        const cacheQuiz = localStorage.getItem(quizKey);
        if (cacheQuiz) {
          const { answers: SavedAnswers, startTime: saveStartTime } = JSON.parse(cacheQuiz);
          setAnswers(SavedAnswers);
          setStartTime(saveStartTime);
          
        }
        else{
          setStartTime(Date.now())
        }
        

        

        const token = localStorage.getItem("token");
        const res = await api.post(
          "/quize/generate",
          { topic, order, suborder },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        setQuize(res.data.quize || []);
        
      } catch (error) {
        console.error("Error in generating quize", error);
      }
    };

    if (topic && order) handlequize();
  }, [topic, order, suborder]);

  useEffect(() => {

    if (startTime) {
      const quizKey = getQuizkey();
      localStorage.setItem(quizKey, JSON.stringify({
        answers,
        startTime
      }))
    }
  }, [answers, startTime])

  const handleSelect = (qIndex, optidx) => {
    setAnswers((prev) => ({
      ...prev,
      [qIndex]: optidx,
    }));
  };

  const handleSubmit = async () => {
    try {
      
      const answeredQuestions = Object.keys(answers).length;
      const totalQuestions = quize.length;

      if (answeredQuestions < totalQuestions) {
        alert(`Please answer all ${totalQuestions} questions before submitting.`);
        return;
      }

      setIsSubmitting(true);
      setError(null);

      const timeSpent = Math.floor((Date.now() - startTime) / 1000);
      const token = localStorage.getItem("token");
      console.log("Submitting answers:", answers); 
      let res;
      if (!suborder) res = await api.post(
        "/quize/submit",
        { topicName: topic, order, answers, timespent: timeSpent },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      else {
        res = await api.post('/quize/Recsubmit',
          { topicName: topic, order, answers, timespent: timeSpent, suborder },
          { headers: { Authorization: `Bearer ${token}` } }
        )
      }

      localStorage.removeItem(getQuizkey());

      const { score, results } = res.data;
      console.log("Quiz response:", { score, results }); 
      navigate("/score", { state: { score, results, topic, order } });
    } catch (error) {
      console.error("Error submitting quiz:", error);
      setError("Failed to submit quiz. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };


  if (!quize) return <Loading message="quize" />

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Quiz</h2>
        <div className="text-sm text-gray-600">
          <Timer
            startTime={startTime}
            isActive={!isSubmitting}
          />

          {Object.keys(answers).length} / {quize.length} questions answered
        </div>
      </div>

      {quize.map((q, idx) => (
        <div
          key={idx}
          className="mb-6 p-4 border rounded-lg hover:shadow transition"
        >
          <p className="font-semibold">
            {idx + 1}. {q.question}
          </p>
          <ul className="mt-2 space-y-2">
            {q.options.map((opt, i) => (
              <li
                key={i}
                onClick={() => handleSelect(idx, i)}
                className={`p-2 border rounded cursor-pointer 
                  ${answers[idx] === i ? "bg-blue-100 border-blue-500" : "hover:bg-gray-100"}
                `}
              >
                {opt}
              </li>
            ))}
          </ul>
        </div>
      ))}

      {error && (
        <div className="text-center mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="flex justify-center">
        <button
          onClick={handleSubmit}
          disabled={Object.keys(answers).length < quize.length || isSubmitting}
          className={`px-6 py-2 rounded-lg ${Object.keys(answers).length < quize.length || isSubmitting
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700"
            } text-white`}
        >
          {isSubmitting ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Submitting...
            </span>
          ) : Object.keys(answers).length < quize.length ? (
            `Answer ${quize.length - Object.keys(answers).length} more questions`
          ) : (
            "Submit Quiz"
          )}
        </button>
      </div>
    </div>
  );
};

export default Quize;
