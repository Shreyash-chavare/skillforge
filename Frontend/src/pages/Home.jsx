import React, { useState, useEffect } from 'react';
import api from '../api/api';
import Tab from '../components/Tab';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Database, Zap, BookOpen, Award, Play, Calendar, BarChart3, Lock } from 'lucide-react';

const Home = () => {
  const [users, setUsers] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [userTopic, setUserTopic] = useState(null);
  const [dailyProgress, setDailyProgress] = useState([]);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [lessonIdToTopicId, setLessonIdToTopicId] = useState({});
  const [updatingDifficulty, setUpdatingDifficulty] = useState({});

  const handleLesson = (topic) => {
    navigate(`/lesson/${encodeURIComponent(topic)}`);
  };

  const handleDifficultyChange = async (topicName, newDifficulty, e) => {
    e.stopPropagation(); 
    
    
    const confirmed = window.confirm(
      `Changing difficulty to "${newDifficulty}" will delete all existing content for "${topicName}" and regenerate it with the new difficulty level. Continue?`
    );
    
    if (!confirmed) {
      return; 
    }
    
    setUpdatingDifficulty(prev => ({ ...prev, [topicName]: true }));
    
    try {
      const token = localStorage.getItem("token");
      const response = await api.put(
        `/topics/${encodeURIComponent(topicName)}/difficulty`,
        { difficulty: newDifficulty },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      
      const userTopics = await api.get('/topics/user-topics', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserTopic(userTopics.data);
      
    
      if (response.data.regenerated) {
        alert(`Difficulty updated! Content for "${topicName}" will be regenerated with "${newDifficulty}" difficulty when you start learning.`);
      }
    } catch (error) {
      console.error("Error updating difficulty:", error);
      alert("Failed to update difficulty. Please try again.");
    } finally {
      setUpdatingDifficulty(prev => ({ ...prev, [topicName]: false }));
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
       
      if (!token) {
       setIsAuthenticated(false)
       return;
      }
      setIsAuthenticated(true);
        
        
        const user = await api.get('/auth/info', {
          headers: { Authorization: `Bearer ${token}` },
        });
       
        const userTopics = await api.get('/topics/user-topics', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
    
        try {
          const dailyProgressRes = await api.get('/progress/daily-progress', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setDailyProgress(dailyProgressRes.data || []);
          console.log(dailyProgressRes.data)
          
          
          if (dailyProgressRes.data && dailyProgressRes.data.length > 0) {
            const latestProgress = dailyProgressRes.data[dailyProgressRes.data.length - 1];
            setCurrentStreak(latestProgress.streakDays || 0);
          }
        } catch (err) {
          console.log('Daily progress endpoint not available yet:', err);
          setDailyProgress([]);
        }
        
        setUsers(user.data);
        setUserTopic(userTopics.data);
        
        console.log('User Topics:', userTopics.data);
      } catch (error) {
        console.error("Error fetching user", error);
        localStorage.removeItem("token");
        setIsAuthenticated(false);
      }
    };
    fetchUser();
  }, [location.pathname]); 
  useEffect(() => {
   
    if (userTopic?.topics) {
      const map = {};
      userTopic.topics.forEach(t => {
        (t.titles || []).forEach(title => {
          if (title?._id) map[title._id.toString()] = t._id.toString();
        });
      });
      setLessonIdToTopicId(map);
    }
  }, [userTopic]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white px-6">
        <Lock className="w-16 h-16 mb-6 text-white/80" />
        <h1 className="text-3xl font-bold mb-2">Login Required</h1>
        <p className="text-white/80 mb-6 text-center max-w-sm">
          Please login to access your personalized dashboard and continue your learning journey.
        </p>
        <button
          onClick={() => navigate("/login")}
          className="px-6 py-3 bg-white text-indigo-600 font-semibold rounded-xl shadow-lg hover:bg-gray-100 transition"
        >
          Go to Login
        </button>
      </div>
    );
  }
  

  const generateWeeklyData = () => {
    if (!dailyProgress || dailyProgress.length === 0) {
      return [
        { day: 'Mon', lessons: 0 },
        { day: 'Tue', lessons: 0 },
        { day: 'Wed', lessons: 0 },
        { day: 'Thu', lessons: 0 },
        { day: 'Fri', lessons: 0 }
      ];
    }

    
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; 
    const monday = new Date(now);
    monday.setDate(now.getDate() + diff);
    monday.setHours(0, 0, 0, 0);

   
    const weekData = {
      'Mon': 0,
      'Tue': 0,
      'Wed': 0,
      'Thu': 0,
      'Fri': 0
    };

  
    dailyProgress.forEach(progress => {
      const progressDate = new Date(progress.date);
      progressDate.setHours(0, 0, 0, 0);
      
      
      const daysDiff = Math.floor((progressDate - monday) / (1000 * 60 * 60 * 24));
      
      if (daysDiff >= 0 && daysDiff < 5) {
        const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
        weekData[dayNames[daysDiff]] = progress.titlesCompletedToday || 0;
      }
    });

    return [
      { day: 'Mon', lessons: weekData['Mon'] },
      { day: 'Tue', lessons: weekData['Tue'] },
      { day: 'Wed', lessons: weekData['Wed'] },
      { day: 'Thu', lessons: weekData['Thu'] },
      { day: 'Fri', lessons: weekData['Fri'] }
    ];
  };

  
  const courseConfig = {
    'MongoDB': { icon: '🍃', color: 'from-green-500 to-emerald-600' },
    'Jenkins': { icon: '⚙️', color: 'from-red-500 to-orange-600' },
    'C++': { icon: '💻', color: 'from-blue-500 to-cyan-600' },
    'default': { icon: '📚', color: 'from-purple-500 to-pink-600' }
  };

  const getCourseConfig = (courseName) => {
    return courseConfig[courseName] || courseConfig.default;
  };



  
  const generateWeeklyDataForTopic = (topicId) => {
    if (!dailyProgress || dailyProgress.length === 0) {
      return [
        { day: 'Mon', lessons: 0 },
        { day: 'Tue', lessons: 0 },
        { day: 'Wed', lessons: 0 },
        { day: 'Thu', lessons: 0 },
        { day: 'Fri', lessons: 0 }
      ];
    }
    
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(now);
    monday.setDate(now.getDate() + diff);
    monday.setHours(0, 0, 0, 0);
    const weekData = { 'Mon': 0, 'Tue': 0, 'Wed': 0, 'Thu': 0, 'Fri': 0 };
    dailyProgress.forEach(progress => {
      const progressDate = new Date(progress.date);
      progressDate.setHours(0, 0, 0, 0);
      const daysDiff = Math.floor((progressDate - monday) / (1000 * 60 * 60 * 24));
      if (daysDiff >= 0 && daysDiff < 5) {
        const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
       
        const completedToday = Array.isArray(progress.completedTitles) ? progress.completedTitles : [];
        const countForTopic = completedToday.reduce((acc, lessonId) => {
          const idStr = (lessonId && lessonId.toString) ? lessonId.toString() : String(lessonId);
          return acc + (lessonIdToTopicId[idStr] === (topicId?.toString ? topicId.toString() : topicId) ? 1 : 0);
        }, 0);
        weekData[dayNames[daysDiff]] = countForTopic;
      }
    });
    return [
      { day: 'Mon', lessons: weekData['Mon'] },
      { day: 'Tue', lessons: weekData['Tue'] },
      { day: 'Wed', lessons: weekData['Wed'] },
      { day: 'Thu', lessons: weekData['Thu'] },
      { day: 'Fri', lessons: weekData['Fri'] }
    ];
  };

 
  let totalCompleted = 0;

  if (userTopic && Array.isArray(userTopic.topics)) {
    userTopic.topics.forEach(topic => {
      if (Array.isArray(topic.titles)) {
        topic.titles.forEach(title => {
          if (title.completed) totalCompleted++;
        });
      }
    });
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Tab totalCompleted={totalCompleted} currentStreak={currentStreak}/>

   
      <div className="flex justify-center bg-gradient-to-br from-purple-600 via-purple-700 to-pink-600 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-8 py-20">
          <motion.div
            className="relative z-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-purple-200 text-lg mb-3 font-medium">Welcome back!</p>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Forge your skills with<br />personalized learning
            </h1>
            <p className="text-purple-100 text-xl max-w-2xl mb-8">
              Lessons, quizzes, and progress tracking aligned to your goals. Keep building your expertise one lesson at a time.
            </p>
            
          
            <div className="flex flex-wrap gap-6 mb-8">
              <motion.div
                className="bg-white/10 backdrop-blur-md rounded-2xl px-6 py-4 border border-white/20"
                whileHover={{ scale: 1.05 }}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Zap className="w-5 h-5 text-yellow-300" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-white">{currentStreak}</div>
                    <div className="text-purple-200 text-sm">Day Streak</div>
                  </div>
                </div>
              </motion.div>
              
              <motion.div
                className="bg-white/10 backdrop-blur-md rounded-2xl px-6 py-4 border border-white/20"
                whileHover={{ scale: 1.05 }}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Award className="w-5 h-5 text-yellow-300" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-white">{totalCompleted}</div>
                    <div className="text-purple-200 text-sm">Lessons Done</div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="bg-white/10 backdrop-blur-md rounded-2xl px-6 py-4 border border-white/20"
                whileHover={{ scale: 1.05 }}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <BookOpen className="w-5 h-5 text-yellow-300" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-white">{users?.preferences?.fields?.length || 0}</div>
                    <div className="text-purple-200 text-sm">Active Courses</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          <div className="absolute right-10 top-1/2 -translate-y-1/2 opacity-20">
            <div className="w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          </div>
        </div>
      </div>

     
      <div className="max-w-7xl mx-auto px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Your Lessons</h2>
            <p className="text-gray-600">Continue your learning journey</p>
          </div>
        </div>

       
        <div className="space-y-6">
          {userTopic?.topics?.length > 0 ? (
            userTopic.topics.map((item, idx) => {
              const config = getCourseConfig(item.name);
              const weeklyData = generateWeeklyDataForTopic(item._id);
              
              let lessonsCompleted = 0;
              item.titles.forEach(title => {
                if (title.completed) lessonsCompleted++;
              });
              
              let totalLessons = item.titles.length;
              const progress = Math.round((lessonsCompleted / totalLessons) * 100);

              
              const thisWeekLessons = weeklyData.reduce((sum, d) => sum + d.lessons, 0);

              return (
                <motion.div
                  key={idx}
                  className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-purple-200 cursor-pointer"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ scale: 1.01 }}
                  onClick={() => handleLesson(item.name)}
                >
                  <div className="p-8">
                    <div className="flex items-start justify-between gap-8">
                     
                      <div className="flex-1">
                        <div className="flex items-start gap-4 mb-6">
                          <div className={`w-16 h-16 bg-gradient-to-br ${config.color} rounded-2xl flex items-center justify-center text-3xl shadow-lg`}>
                            {config.icon}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-3xl font-bold text-gray-900">{item.name}</h3>
                              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                <select
                                  value={item.difficulty || 'beginner'}
                                  onChange={(e) => handleDifficultyChange(item.name, e.target.value, e)}
                                  disabled={updatingDifficulty[item.name]}
                                  className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium capitalize border-0 cursor-pointer hover:bg-purple-200 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-wait"
                                  style={{ appearance: 'auto' }}
                                >
                                  <option value="beginner">Beginner</option>
                                  <option value="intermediate">Intermediate</option>
                                  <option value="advanced">Advanced</option>
                                </select>
                                {updatingDifficulty[item.name] && (
                                  <span className="text-xs text-gray-500">Updating...</span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-6 text-gray-600">
                              <span className="flex items-center gap-1.5">
                                <BookOpen className="w-4 h-4" />
                                {lessonsCompleted}/{totalLessons} lessons
                              </span>
                            </div>
                          </div>
                        </div>

                       
                        <div className="mb-6">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">Overall Progress</span>
                            <span className="text-sm font-bold text-purple-600">{progress}%</span>
                          </div>
                          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                            <motion.div 
                              className={`h-full bg-gradient-to-r ${config.color} rounded-full relative overflow-hidden`}
                              initial={{ width: 0 }}
                              animate={{ width: `${progress}%` }}
                              transition={{ duration: 1, delay: idx * 0.1 }}
                            >
                              <div className="absolute inset-0 bg-white/20 animate-pulse" />
                            </motion.div>
                          </div>
                        </div>

                      
                        <button className={`flex items-center gap-2 px-6 py-3 bg-gradient-to-r ${config.color} text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105`}>
                          <Play className="w-5 h-5" />
                          Continue Learning
                        </button>
                      </div>

                     
                      <div className="bg-gray-50 rounded-2xl p-6 w-80">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            This Week
                          </h4>
                          <BarChart3 className="w-4 h-4 text-gray-400" />
                        </div>
                        
                       
                        <div className="flex items-end justify-between gap-3 h-32">
                          {weeklyData.map((data, index) => {
                            
                            const maxValue = item.titles.length || 1;
                            const height = (data.lessons / maxValue) * 100;
                            
                            return (
                              <div key={index} className="flex-1 flex flex-col items-center gap-2">
                                <div className="w-full bg-gray-200 rounded-lg relative overflow-hidden" style={{ height: '100px' }}>
                                  <motion.div 
                                    className={`absolute bottom-0 w-full bg-gradient-to-t ${config.color} rounded-lg`}
                                    initial={{ height: 0 }}
                                    animate={{ height: `${height}%` }}
                                    transition={{ duration: 0.5, delay: idx * 0.1 + index * 0.1 }}
                                  />
                                  {data.lessons > 0 && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                      <span className="text-xs font-bold text-gray-700">{data.lessons}</span>
                                    </div>
                                  )}
                                </div>
                                <span className="text-xs font-medium text-gray-600">{data.day}</span>
                              </div>
                            );
                          })}
                        </div>

                        
                        <div className=" flex justify-center mt-4 pt-4 border-t border-gray-200">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-gray-900">
                              {thisWeekLessons}
                            </div>
                            <div className="text-xs text-gray-600">This Week</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No preferences set yet. Start by adding some courses!</p>
            </div>
          
        )}
        </div>
      </div>
    </div>
  );
};

export default Home;