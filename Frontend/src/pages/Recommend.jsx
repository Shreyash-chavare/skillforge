import { useLocation,useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import RecommendUI from "@/components/RecomendUI";
import LessonUI from "@/components/lessonUI";

const Recommendations = () => {
  const location = useLocation();
  const navigate=useNavigate();

  // ✅ safely extract recommendations passed in state
  const { recommendations = [], topic, order } = location.state || {};

  const [currentIndex, setCurrentIndex] = useState(0);

  // ✅ On load, find the first recommendation that is not passed
  useEffect(() => {
    if (recommendations.length > 0) {
      const firstUnpassedIndex = recommendations.findIndex((rec) => !rec.pass);
      if(firstUnpassedIndex==-1){
        alert("🎉 You have completed all recommended titles!");
        navigate(`/lesson/${topic}`, {
          replace: true,
        });
        setCurrentIndex(null);
      }
      else  setCurrentIndex(firstUnpassedIndex);
    }
  }, [recommendations]);

  const currentRec = recommendations[currentIndex];

  return (
    <div className="p-6">
      {currentRec ? (
        <div>
          <RecommendUI
            lesson={currentRec}
            topic={topic}
            order={order}
            onComplete={() => {
              // when user finishes, move to next unfinished recommendation
              const nextIndex = recommendations.findIndex(
                (rec, idx) => idx > currentIndex && !rec.pass
              );
              if (nextIndex !== -1) {
                setCurrentIndex(nextIndex);
              } else {
                setCurrentIndex(null)
                navigate(`/lesson/${topic}`, {
                  replace: true,
                });
                
              }
            }}
          />
        </div>
      ) : (
        <p>No recommendations to show.</p>
      )}
    </div>
  );
};

export default Recommendations;
