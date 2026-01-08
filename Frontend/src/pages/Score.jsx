import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from '../api/api'

const Score = () => {
  const location = useLocation();
  const navigate = useNavigate();
 


  const { score, results } = location.state || {};
  
  console.log("Score page received:", { score, results });
 
  
  

  if (!results) return <div className="text-center p-8">No results found. Please try taking the quiz again.</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Quiz Results</h2>
        <div className="text-right">
          <p className="text-xl font-bold text-indigo-600">Score: {score}%</p>
          <p className="text-sm text-gray-600">
            {results.filter(r => r.isCorrect).length} out of {results.length} correct
          </p>
        </div>
      </div>

      {/* Legend */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold mb-2">Legend:</h3>
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-200 border border-green-600 rounded mr-2"></div>
            <span>Correct Answer</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-200 border border-red-600 rounded mr-2"></div>
            <span>Your Wrong Answer</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-yellow-200 border border-yellow-600 rounded mr-2"></div>
            <span>Correct Answer (Not Selected)</span>
          </div>
        </div>
        
        {score === 0 && (
          <div className="mt-4 p-3 bg-blue-100 border border-blue-400 text-blue-700 rounded text-sm">
            <strong>Note:</strong> If you're seeing a score of 0, this might be due to a quiz format update. 
            The system has been improved to provide better feedback. Please try taking the quiz again.
          </div>
        )}
      </div>

      {results.map((q, idx) => (
        <div
          key={idx}
          className={`mb-6 p-4 border rounded-lg ${
            q.isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
          }`}
        >
          <div className="flex justify-between items-start mb-2">
            <p className="font-semibold">{idx + 1}. {q.question}</p>
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              q.isCorrect 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {q.isCorrect ? '✓ Correct' : '✗ Incorrect'}
            </span>
          </div>
          <ul className="mt-2 space-y-2">
            {q.options.map((opt, i) => {
              let bg = "";
              let textColor = "";
              
              const userIdx = q.userAnswerIndex;
              const correctIdx = typeof q.answerIndex === 'number' ? q.answerIndex : q.options.indexOf(q.answer);

              
              if (i === correctIdx) {
                bg = "bg-green-200 border-green-600";
                textColor = "text-green-800";
              } 
              
              else if (i === userIdx && !q.isCorrect) {
                bg = "bg-red-200 border-red-600"; 
                textColor = "text-red-800";
              }
            
              else if ((userIdx === null || userIdx === undefined) && i === correctIdx) {
                bg = "bg-yellow-200 border-yellow-600";
                textColor = "text-yellow-800";
              }

              return (
                <li
                  key={i}
                  className={`p-2 border rounded ${bg} ${textColor}`}
                >
                  {opt}
                </li>
              );
            })}
          </ul>
        </div>
      ))}
      

      <div className="flex justify-center mt-8">
        <button
          onClick={() => navigate("/home")}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Back to Lessons
        </button>
      </div>
    </div>
  );
};

export default Score;
