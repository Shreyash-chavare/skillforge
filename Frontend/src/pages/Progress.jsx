import React, { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import api from "@/api/api";
import DailyProgress from "@/components/DailyProgress";
import { Flame, BookOpen, Trophy, Calendar, BarChart3, CheckCircle2, XCircle, Lock, ChevronRight, Clock, Star, Zap, Bot, Lightbulb, RefreshCw, X, Target, Play } from 'lucide-react';

export default function Progress() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(0);
  const location=useLocation();
  const totalStreak = Number(location.state?.currentStreak ?? 0) || 0;

  const fetchUserProgress = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found. Please login again.");
      }
      
      const topicsRes = await api.get("/topics/user-topics", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const progressRes = await api.get("/progress/userprogress", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const userTopics = topicsRes.data.topics || [];
      const allProgress = progressRes.data.userprogress || [];

      const progressMap = {};
      allProgress.forEach(progress => {
        if (progress.lessonId) {
          const lessonId = progress.lessonId.toString();
          if (!progressMap[lessonId] || new Date(progress.createdAt) > new Date(progressMap[lessonId].createdAt)) {
            progressMap[lessonId] = progress;
          }
        }
      });

      const formattedCourses = userTopics.map(topic => {
        const completedTitles = topic.titles.map(title => {
          const lessonId = title._id.toString();
          const progress = progressMap[lessonId];
          const isCompleted = title.completed || (progress && progress.score >= 80);
          return { ...title, isCompleted, progress };
        });
        
        const titles = completedTitles.map((title, index) => {
          const progress = title.progress;
          let status = "locked";
          let score = null;
          let timespent = null;
          let recommendations = [];
          let reason = "Complete above lesson first";
          
          if (index === 0) {
            if (title.isCompleted) {
              status = "completed";
              if (progress) {
                score = progress.score;
                timespent = progress.timespent;
                recommendations = progress.recommendations || [];
              }
            } else {
              status = "unlocked";
              if (progress) {
                score = progress.score;
                timespent = progress.timespent;
                recommendations = progress.recommendations || [];
                if (progress.recommendations?.length > 0) {
                  status = "failed";
                }
              }
            }
          } else {
            const previousTitleCompleted = completedTitles[index - 1].isCompleted;
            if (previousTitleCompleted) {
              if (title.isCompleted) {
                status = "completed";
                if (progress) {
                  score = progress.score;
                  timespent = progress.timespent;
                  recommendations = progress.recommendations || [];
                }
              } else {
                status = "unlocked";
                if (progress) {
                  score = progress.score;
                  timespent = progress.timespent;
                  recommendations = progress.recommendations || [];
                  if (progress.recommendations?.length > 0) {
                    status = "failed";
                  }
                }
              }
            } else {
              status = "locked";
              reason = "Complete the previous lesson first";
            }
          }
          
          return {
            label: title.title,
            status,
            recommendations,
            reason,
            score,
            timespent,
            createdAt: progress?.createdAt,
            order: title.order,
            difficulty: title.difficulty
          };
        });
        
        const completedCount = completedTitles.filter(t => t.isCompleted).length;
        const progress = Math.round((completedCount / topic.titles.length) * 100);
        
        return {
          title: topic.name,
          level: topic.difficulty,
          progress,
          titles,
          icon: getTopicIcon(topic.name),
          color: getTopicColor(topic.name)
        };
      });

      setCourses(formattedCourses);
    } catch (err) {
      console.error("Error fetching progress:", err);
      const errorMessage = err.response?.data?.message || err.message || "Failed to load progress data";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProgress();
  }, []);

  const getTopicIcon = (name) => {
    const iconMap = {
      'MongoDB': '🍃',
      'Jenkins': '⚙️',
      'C++': '💻',
      'JavaScript': '🟨',
      'Python': '🐍',
      'React': '⚛️'
    };
    return iconMap[name] || '📚';
  };

  const getTopicColor = (name) => {
    const colorMap = {
      'MongoDB': 'from-green-500 to-emerald-600',
      'Jenkins': 'from-red-500 to-orange-600',
      'C++': 'from-blue-500 to-cyan-600',
      'JavaScript': 'from-yellow-500 to-amber-600',
      'Python': 'from-indigo-500 to-blue-600',
      'React': 'from-cyan-500 to-blue-600'
    };
    return colorMap[name] || 'from-purple-500 to-pink-600';
  };

  const memoizedCourses = useMemo(() => courses, [courses]);
  
  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return <ErrorDisplay error={error} onRetry={fetchUserProgress} />;
  }

  if (memoizedCourses.length === 0) {
    return <EmptyState />;
  }

  const currentCourse = memoizedCourses[selectedCourse];
  const completedTitles = currentCourse.titles.filter(t => t.status === 'completed').length;
  const failedTitles = currentCourse.titles.filter(t => t.status === 'failed').length;
  const totalTitles = currentCourse.titles.length;
  const hasFailed = failedTitles > 0;

  const totalCompletedLessons = memoizedCourses.reduce((sum, c) => 
    sum + c.titles.filter(t => t.status === 'completed').length, 0
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-8">
      <div className="max-w-7xl mx-auto">
        
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <Calendar className="w-10 h-10 text-purple-600" />
            Your Learning Progress
          </h1>
          <p className="text-gray-600 text-lg">Track your journey and celebrate your achievements!</p>
        </div>

       

      
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-orange-500 via-red-500 to-pink-600 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm font-medium opacity-90">Learning Streak</div>
                <Flame className="w-8 h-8" />
              </div>
              <div className="text-5xl font-bold mb-2">{totalStreak} days</div>
              <div className="text-sm opacity-90">Keep going! 🔥</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 via-teal-500 to-cyan-600 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16" />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm font-medium opacity-90">Lessons Completed</div>
                <BookOpen className="w-8 h-8" />
              </div>
              <div className="text-5xl font-bold mb-2">{totalCompletedLessons}</div>
              <div className="text-sm opacity-90">Great progress!</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 via-indigo-500 to-blue-600 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-8 -mt-8" />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm font-medium opacity-90">Active Courses</div>
                <Trophy className="w-8 h-8" />
              </div>
              <div className="text-5xl font-bold mb-2">{memoizedCourses.length}</div>
              <div className="text-sm opacity-90">Keep learning!</div>
            </div>
          </div>
        </div>

       
        <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
          {memoizedCourses.map((course, index) => (
            <button
              key={index}
              onClick={() => setSelectedCourse(index)}
              className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-semibold transition-all flex-shrink-0 ${
                selectedCourse === index
                  ? `bg-gradient-to-r ${course.color} text-white shadow-lg scale-105`
                  : 'bg-white text-gray-700 hover:bg-gray-50 shadow'
              }`}
            >
              <span className="text-2xl">{course.icon}</span>
              <div className="text-left">
                <div className="font-bold">{course.title}</div>
                <div className={`text-xs ${selectedCourse === index ? 'text-white/80' : 'text-gray-500'}`}>
                  {course.level}
                </div>
              </div>
              {course.progress === 100 && (
                <Trophy className="w-5 h-5 ml-2" />
              )}
            </button>
          ))}
        </div>
       
        <div className="bg-white rounded-3xl w-75 mb-2 shadow-xl p-6 border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Best Score</span>
                  <span className="font-bold text-green-600">
                    {Math.max(...currentCourse.titles.filter(t => t.score).map(t => t.score), 0)}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Success Rate</span>
                  <span className="font-bold text-purple-600">
                    {totalTitles > 0 ? Math.round((completedTitles / totalTitles) * 100) : 0}%
                  </span>
                </div>
              </div>
            </div>

        <div className="grid lg:grid-cols-3 gap-8">
         
          <div className="lg:col-span-2 space-y-6">
         
            <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{currentCourse.title} Progress</h2>
                  <p className="text-gray-600">Track your completion and master each topic</p>
                </div>
                <div className="text-center">
                  <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                    {currentCourse.progress}%
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Complete</div>
                </div>
              </div>

            
              <div className="mb-8">
                <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full bg-gradient-to-r ${currentCourse.color} rounded-full transition-all duration-500 relative`}
                    style={{ width: `${currentCourse.progress}%` }}
                  >
                    <div className="absolute inset-0 bg-white/20 animate-pulse" />
                  </div>
                </div>
              </div>

             
              <div className="space-y-3">
                {currentCourse.titles.map((title, index) => (
                  <div
                    key={index}
                    className={`group p-5 rounded-2xl transition-all cursor-pointer ${
                      title.status === 'completed' 
                        ? 'bg-green-50 hover:bg-green-100 border-2 border-green-200' 
                        : title.status === 'failed'
                        ? 'bg-red-50 hover:bg-red-100 border-2 border-red-200'
                        : title.status === 'unlocked'
                        ? 'bg-blue-50 hover:bg-blue-100 border-2 border-blue-200'
                        : 'bg-gray-50 hover:bg-gray-100 border-2 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          title.status === 'completed' 
                            ? 'bg-green-500 text-white' 
                            : title.status === 'failed'
                            ? 'bg-red-500 text-white'
                            : title.status === 'unlocked'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-300 text-gray-600'
                        }`}>
                          {title.status === 'completed' ? (
                            <CheckCircle2 className="w-6 h-6" />
                          ) : title.status === 'failed' ? (
                            <XCircle className="w-6 h-6" />
                          ) : title.status === 'unlocked' ? (
                            <Play className="w-6 h-6" />
                          ) : (
                            <Lock className="w-6 h-6" />
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 mb-1 group-hover:text-purple-600 transition-colors">
                            {title.label}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            {title.timespent && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {Math.round(title.timespent)}s
                              </span>
                            )}
                            {title.score !== null && (
                              <span className={`px-3 py-1 rounded-full font-medium ${
                                title.status === 'completed'
                                  ? 'bg-green-200 text-green-800'
                                  : title.status === 'failed'
                                  ? 'bg-red-200 text-red-800'
                                  : 'bg-blue-200 text-blue-800'
                              }`}>
                                {title.score}%
                              </span>
                            )}
                          </div>
                          {title.recommendations?.length > 0 && (
                            <div className="mt-2 text-xs text-gray-600">
                              💡 {title.recommendations.length} recommendation{title.recommendations.length > 1 ? 's' : ''} available
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

      
          <div className="space-y-6">
           
            <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Completion Analytics</h3>
              
              
              <div className="relative w-48 h-48 mx-auto mb-8">
                <svg viewBox="0 0 100 100" className="transform -rotate-90">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="12"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="12"
                    strokeDasharray={`${(completedTitles / totalTitles) * 251.2} 251.2`}
                    strokeLinecap="round"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="12"
                    strokeDasharray={`${(failedTitles / totalTitles) * 251.2} 251.2`}
                    strokeDashoffset={`-${(completedTitles / totalTitles) * 251.2}`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-4xl font-bold text-gray-900">{currentCourse.progress}%</div>
                  <div className="text-sm text-gray-600">Complete</div>
                </div>
              </div>

            
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full" />
                    <span className="text-sm font-medium text-gray-700">Completed</span>
                  </div>
                  <span className="font-bold text-gray-900">{completedTitles}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-xl">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full" />
                    <span className="text-sm font-medium text-gray-700">Failed</span>
                  </div>
                  <span className="font-bold text-gray-900">{failedTitles}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gray-400 rounded-full" />
                    <span className="text-sm font-medium text-gray-700">Locked</span>
                  </div>
                  <span className="font-bold text-gray-900">{totalTitles - completedTitles - failedTitles}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full" />
                    <span className="text-sm font-medium text-gray-700">Total</span>
                  </div>
                  <span className="font-bold text-gray-900">{totalTitles}</span>
                </div>
              </div>
            </div>

     
          </div>
        </div>

   
        <div className="mt-8">
          <DailyProgress />
        </div>
      </div>
    </div>
  );
}


const LoadingSkeleton = () => (
  <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-8">
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="h-10 bg-gray-200 rounded w-1/3 animate-pulse"></div>
      <div className="grid md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-40 bg-gray-200 rounded-3xl animate-pulse"></div>
        ))}
      </div>
      <div className="h-96 bg-gray-200 rounded-3xl animate-pulse"></div>
    </div>
  </div>
);


const ErrorDisplay = ({ error, onRetry }) => (
  <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-8 flex items-center justify-center">
    <div className="bg-red-50 border-2 border-red-200 rounded-3xl p-12 text-center max-w-md">
      <div className="text-red-600 mb-6">
        <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="text-2xl font-bold mb-2">Failed to Load Progress</h3>
        <p className="text-sm">{error}</p>
      </div>
      <button 
        onClick={onRetry}
        className="bg-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-red-700 transition-colors"
      >
        Try Again
      </button>
    </div>
  </div>
);

const EmptyState = () => (
  <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-8 flex items-center justify-center">
    <div className="bg-white rounded-3xl shadow-xl p-12 text-center max-w-md border border-gray-100">
      <div className="text-gray-400 mb-6">
        <BookOpen className="w-20 h-20 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-gray-700 mb-2">No Progress Yet</h3>
        <p className="text-gray-600">Start learning to see your progress here!</p>
      </div>
      <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all">
        Start Learning
      </button>
    </div>
  </div>
)