import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, BookOpen, Award, ArrowRight } from "lucide-react";


const RecommendUI = ({ lesson, topic, order }) => {
  
  const [displayedContent, setDisplayedContent] = useState("");
  const navigate=useNavigate();
  const [show,setShow]=useState(true)
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(()=>{
      if(lesson?.content){
          const words=lesson.content.split(" ");
          let i=0;
          setShow(false);
          setIsAnimating(true);
          const interval=setInterval(()=>{
            i++;
            setDisplayedContent(words.slice(0,i).join(" "));
              
            if(i>=words.length){
              setShow(true);
              setIsAnimating(false);
            clearInterval(interval)
          }
          },120);
          

      }
  },[lesson]);

  
  const handleNext = () => {
    navigate(`/quize/${encodeURIComponent(topic)}/${order}/${lesson.order}`)
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
     
        <button className="mb-4 px-4 py-2 bg-gray-200 rounded" onClick={() => navigate(-1)}>⬅ Back</button>

        
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
         
          <div className="relative bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 p-8 sm:p-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full -ml-24 -mb-24"></div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="w-6 h-6 text-blue-200" />
                <span className="text-blue-100 text-sm font-medium uppercase tracking-wider">
                  Lesson
                </span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight mb-4">
                {lesson.title}
              </h1>
              
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                  <Award className="w-4 h-4 text-blue-200" />
                  <span className="text-white text-sm font-medium capitalize">
                    {lesson.difficulty}
                  </span>
                </div>
              </div>
            </div>
          </div>

          
          <div className="p-8 sm:p-12">
            <div className="prose prose-lg max-w-none">
              <div className="text-slate-700 leading-relaxed space-y-4">
                {displayedContent.split('\n\n').map((paragraph, idx) => (
                  <p key={idx} className="text-lg leading-relaxed">
                    {paragraph}
                  </p>
                ))}
                {isAnimating && (
                  <span className="inline-block w-1 h-5 bg-blue-600 animate-pulse ml-1"></span>
                )}
              </div>
            </div>

           
            {isAnimating && (
              <div className="mt-8 flex items-center gap-3 text-sm text-slate-500">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span>Loading content...</span>
              </div>
            )}
          </div>

        
          {show && (
            <div className="px-8 sm:px-12 pb-8 sm:pb-10">
              <div className="flex justify-end">
                <button
                  onClick={handleNext}
                  className="group flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                >
                  <span>Next: Quiz</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          )}
        </div>

        
        {show && (
          <div className="mt-6 bg-blue-50 border border-blue-100 rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">Ready for the quiz?</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Test your understanding of the terminology you've just learned. The quiz will help reinforce these concepts.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecommendUI;
