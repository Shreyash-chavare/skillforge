import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Unlock } from 'lucide-react';
import Lottie from 'lottie-react';
import api from '../api/api';
import studyAnim from '../assets/lotties/study.json';

const Lesson = () => {
  const [titles, setTitles] = useState([]);
  const [currentTitle, setCurrentTitle] = useState(null);
  const [loading, setLoading] = useState(true);
  const { topic } = useParams();
  const navigate = useNavigate();

  const [score, setScore] = useState(null);
  const [recommend, setRecommend] = useState([]);

  
  useEffect(() => {
    const fetchProgress = async () => {
      if (!topic || !currentTitle?.order) return;
      try {
        const token = localStorage.getItem("token");
        const res = await api.get(`/progress/userprogress/${topic}/${currentTitle.order}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
  
        const recs = res.data.recommendations || [];
        const currentScore = res.data.score;
        setScore(currentScore);
        setRecommend(recs);
  
        
        if (currentScore < 80 && recs.length > 0) {
          setTitles(prev =>
            prev.map(t => {
              if (t.order === currentTitle.order) return { ...t, locked: true };
              return t;
            })
          );
          setCurrentTitle(prev => prev ? { ...prev, locked: true } : prev);
        }
  
        
        const allCompleted = recs.length > 0 && recs.every(r => r.pass);
        if (allCompleted && !currentTitle.completed) {
          setTitles(prev =>
            prev.map(t => {
              if (t.order === currentTitle.order) return { ...t, completed: true, locked: false };
              if (t.order === currentTitle.order + 1) return { ...t, unlocked: true };
              return t;
            })
          );
          setCurrentTitle(prev => prev ? { ...prev, completed: true, locked: false } : prev);
  
        
          await api.post(
            `/progress/mark`,
            { topic, order: currentTitle.order },
            { headers: { Authorization: `Bearer ${token}` } }
          ).catch(err => console.error("Error marking completed:", err));
        }
  
      } catch (err) {
        console.error("Error fetching progress:", err);
      }
    };
    fetchProgress();
  }, [topic, currentTitle]);
  

 
  const fetchTitles = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await api.get(
        `/topics/${encodeURIComponent(topic)}/generate`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const fetchedTitles = response.data.titles || [];
      const nextTitle = response.data.nextTitle || null;

      
      const syncedTitles = fetchedTitles.map((t, idx) => {
        if (idx > 0 && fetchedTitles[idx - 1].completed) {
          return { ...t, unlocked: true };
        }
        return t;
      });

      setTitles(syncedTitles);
      setCurrentTitle(nextTitle);
    } catch (err) {
      console.error('Error fetching titles', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (topic) fetchTitles();
  }, [topic]);

useEffect(() => {
  const handleCompletion = async () => {
    if (recommend?.length > 0 && currentTitle) {
      const allCompleted = recommend.every(r => r.pass);

      if (allCompleted && !currentTitle.completed) {
       
        setTitles(prev =>
          prev.map(t => {
            if (t.order === currentTitle.order) return { ...t, completed: true, locked: false };
            if (t.order === currentTitle.order + 1) return { ...t, unlocked: true };
            return t;
          })
        );

        setCurrentTitle(prev => prev ? { ...prev, completed: true, locked: false } : prev);

        try {
          const token = localStorage.getItem("token");
       
          await api.post(
            `/progress/mark`,
            { topic, order: currentTitle.order },
            { headers: { Authorization: `Bearer ${token}` } }
          );

         
          await fetchTitles();
        } catch (err) {
          console.error("Error marking completed:", err);
        }
      }
    }
  };

  handleCompletion();
}, [recommend, currentTitle]);

  


  const LoadingAnimation = () => (
    <div className="flex justify-center items-center h-64">
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className="w-4 h-4 mx-2 bg-indigo-500 rounded-full"
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }}
        />
      ))}
    </div>
  );

  return (
    <div className="p-6 bg-green-300">
      <h1 className="text-3xl font-bold mb-6 text-center">📚 Lesson Curriculum</h1>

      {loading ? (
        <LoadingAnimation />
      ) : (
        <div className="grid grid-cols-3 gap-6">
          
          <div className="col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {titles.length > 0 ? (
              titles.map((t, idx) => {
                const isUnlocked = (currentTitle?.order >= t.order || t.completed || t.unlocked) && !t.locked;

                return (
                  <motion.div
                    key={idx}
                    whileHover={{ scale: isUnlocked ? 1.05 : 1 }}
                    whileTap={{ scale: isUnlocked ? 0.97 : 1 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() =>
                      isUnlocked &&
                      navigate(`/title/${encodeURIComponent(topic)}/${t.order}`)
                    }
                    className={`p-4 rounded-xl shadow-md relative max-w-sm
                      transition duration-300 ${isUnlocked
                        ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white hover:shadow-lg cursor-pointer'
                        : t.locked
                        ? 'bg-red-200 text-red-600 cursor-not-allowed opacity-70'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-70'
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <h2 className="font-semibold text-base truncate">{t.title}</h2>
                      {isUnlocked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                    </div>
                    <p className="text-xs mt-1 capitalize">Difficulty: {t.difficulty}</p>
                    <p className={`text-xs mt-2 font-medium ${
                      t.completed ? 'text-green-300' : 
                      t.locked ? 'text-red-300' : 
                      isUnlocked ? 'text-yellow-200' : 'text-gray-300'
                    }`}>
                      {t.completed ? '✅ Completed' : 
                       t.locked ? '🔒 Locked (Score < 80%)' : 
                       isUnlocked ? 'In Progress' : '🔒 Locked'}
                    </p>
                  </motion.div>
                );
              })
            ) : (
              <p className="text-gray-500">No titles found...</p>
            )}
          </div>

         
          <div className="col-span-1 flex flex-col gap-6">
            {!currentTitle.completed && score !== null && score < 80 && (
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="p-5 rounded-2xl shadow-md bg-red-500 border border-gray-200"
              >
                <h2 className="text-lg font-semibold mb-3">✨ AI Recommendation</h2>
                <p className="text-sm text-black">
                  Based on your performance (Score: <span className="font-bold">{score}%</span>), here are recommended lessons:
                </p>
                {recommend?.length > 0 && (
                  <div className="flex justify-center mt-4">
                    <button
                      className="p-[3px] relative cursor-pointer"
                      onClick={() =>
                        navigate('/recommendations', { state: { recommendations: recommend, topic, order: currentTitle.order } })
                      }
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg" />
                      <div className="px-8 py-2 bg-black rounded-[6px] relative group transition duration-200 text-white hover:bg-transparent flex items-center gap-3">
                        <h3>Finish this to Unlock next title</h3>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M5 12h14"></path>
                          <path d="m12 5 7 7-7 7"></path>
                        </svg>
                      </div>
                    </button>
                  </div>
                )}
                <div className="mt-3 space-y-3">
                  {recommend?.length > 0 ? recommend.map((rec, idx) => (
                    <div key={rec._id || idx} className="p-4 rounded-xl bg-gradient-to-r from-indigo-50 to-indigo-100 shadow-md border border-indigo-200 text-center">
                      <p className="font-semibold text-lg text-indigo-900 mb-2">📌 {rec.title}</p>
                      <p className="text-sm text-gray-700 mb-4">💡 {rec.reason}</p>
                      <div className="flex justify-between items-center">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold tracking-wide ${rec.pass ? "bg-green-100 text-green-700 border border-green-300" : "bg-red-100 text-red-700 border border-red-300"}`}>
                          {rec.pass ? "✅ Completed" : "❌ Incomplete"}
                        </span>
                        <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 border border-yellow-300 text-sm font-semibold tracking-wide">
                          🔄 Attempted: {rec.tried}
                        </span>
                      </div>
                    </div>
                  )) : (
                    <div className="p-3 rounded-lg bg-gray-100 text-gray-600">No recommendations yet</div>
                  )}
                </div>
              </motion.div>
            )}
            <div className="p-5 rounded-2xl shadow-md bg-white border border-gray-200">
              <Lottie animationData={studyAnim} loop={true} className="w-full h-64" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Lesson;
