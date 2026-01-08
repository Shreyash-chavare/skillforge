import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import api from "../api/api";
import { motion, AnimatePresence } from "framer-motion";
import { User, Mail, Settings, Award, BookOpen, Target, Calendar, Zap, Edit2, Save, X, Star, Trophy, Flame, CheckCircle2 } from 'lucide-react';

function ProfilePage() {
  const [users, setuser] = useState(null);
  const [update, setupdate] = useState({ fields: "" });
  const [topicsWithDifficulty, setTopicsWithDifficulty] = useState({});
  const [existingTopicNames, setExistingTopicNames] = useState([]); // Track existing topics
  const [isEditing, setIsEditing] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const location = useLocation();
  const totalCompleted = Number(location.state?.totalCompleted) || 0;
  const [currentStreak, setCurrentStreak] = useState(0);

  useEffect(() => {
    const fetchuser = async () => {
      try {
        const token = localStorage.getItem("token");
        const user = await api.get("/auth/info", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setuser(user.data);
        const fieldsString = user.data.preferences.fields?.join(", ") || "";
        setupdate({
          fields: fieldsString,
        });
        
        
        const existingDifficulties = {};
        if (user.data.preferences.fields) {
          
          user.data.preferences.fields.forEach(field => {
            existingDifficulties[field] = "beginner";
          });
        }
        setTopicsWithDifficulty(existingDifficulties);

      
        try {
          const dailyProgressRes = await api.get('/progress/daily-progress', {
            headers: { Authorization: `Bearer ${token}` }
          });

          console.log(dailyProgressRes.data)

        
          if (dailyProgressRes.data && dailyProgressRes.data.length > 0) {
            const latestProgress = dailyProgressRes.data[dailyProgressRes.data.length - 1];
            setCurrentStreak(latestProgress.streakDays || 0);

          }
        } catch (err) {
          console.log('Daily progress endpoint not available yet:', err);
        }
      } catch (error) {
        console.error("Error in fetching user", error);
      }
    };

    fetchuser();

  }, []);

  if (!users) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading profile...</p>
        </div>
      </div>
    );
  }

  const handleFieldsChange = (e) => {
    const value = e.target.value;
    setupdate({ ...update, fields: value });
    
 
    const fieldsArray = value
      .split(",")
      .map((f) => f.trim())
      .filter((f) => f.length > 0);
    
   
    const newDifficulties = { ...topicsWithDifficulty };
    fieldsArray.forEach(field => {
     
      if (!existingTopicNames.includes(field.toLowerCase()) && !newDifficulties[field]) {
        newDifficulties[field] = "beginner";
      }
    });
    
    
    Object.keys(newDifficulties).forEach(field => {
      if (!fieldsArray.includes(field) || existingTopicNames.includes(field.toLowerCase())) {
        delete newDifficulties[field];
      }
    });
    
    setTopicsWithDifficulty(newDifficulties);
  };

  const handleDifficultyChange = (topic, difficulty) => {
    setTopicsWithDifficulty(prev => ({
      ...prev,
      [topic]: difficulty
    }));
  };

  const handleUpdate = async (action) => {
    if (action === "edit") {
      setIsEditing(true);
      
      try {
        const token = localStorage.getItem("token");
        const userTopics = await api.get('/topics/user-topics', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
       
        const existingTopics = [];
        if (userTopics.data?.topics) {
          userTopics.data.topics.forEach(topic => {
            existingTopics.push(topic.name.toLowerCase());
          });
        }
        setExistingTopicNames(existingTopics);
        
        
        const fieldsArray = update.fields.split(",").map((f) => f.trim()).filter((f) => f.length > 0);
        const newDifficulties = {};
        
        fieldsArray.forEach(field => {
        
          if (!existingTopics.includes(field.toLowerCase())) {
            newDifficulties[field] = "beginner";
          }
        });
        
        setTopicsWithDifficulty(newDifficulties);
      } catch (error) {
        console.error("Error fetching topic difficulties:", error);
      }
    }

    if (action === "save") {
      try {
        const token = localStorage.getItem("token");
        const fieldsArray = update.fields.split(",").map((f) => f.trim()).filter((f) => f.length > 0);
        
        
        const newTopicDifficulties = {};
        Object.keys(topicsWithDifficulty).forEach(topic => {
          if (!existingTopicNames.includes(topic.toLowerCase())) {
            newTopicDifficulties[topic] = topicsWithDifficulty[topic];
          }
        });
        
        const updated = await api.put(
          "/auth/preferences",
          {
            fields: fieldsArray,
            topicDifficulties: newTopicDifficulties, 
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setuser(updated.data);
        setupdate({
          fields: updated.data.preferences.fields.join(", "),
        });
        setIsEditing(false);
        setShowPopup(true);
        setTimeout(() => setShowPopup(false), 3000);
      } catch (error) {
        console.error("Error in updating preferences", error);
        alert("Failed to update preferences. Please try again.");
      }
    }

    if (action === "cancel") {
      setupdate({
        fields: users.preferences.fields.join(", "),
      });
      setTopicsWithDifficulty({}); 
      setExistingTopicNames([]); 
      setIsEditing(false);
    }
  };
  const created = new Date(users.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long'
  });

  const preferences = users.preferences.fields || [];
  const completion=(totalCompleted/(preferences.length*5))*100


  return (
    <div className="min-h-screen bg-gradient-to-br  from-indigo-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">👋</span>
            <h1 className="text-2xl font-bold text-gray-800">Welcome back, {users.name}!</h1>
          </div>
          <div className="flex gap-3">
            <Link
              to="/home"
              className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
            >
              Home
            </Link>
            <Link
              to="/logout"
              className="px-6 py-2.5 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors"
            >
              Logout
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
       
          <div className="lg:col-span-1">
          
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-gray-200 rounded-3xl shadow-xl overflow-hidden border border-gray-100"
            >
              
              <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12" />

                <div className="relative">
                  <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <User className="w-12 h-12 text-indigo-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-center mb-1">{users.name}</h2>
                  <p className="text-purple-200 text-center text-sm">{users.email}</p>
                </div>
              </div>

             
              <div className="p-6 space-y-6">
              
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Calendar className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-600">Member Since</div>
                      <div className="font-semibold text-gray-900">{created}</div>
                    </div>
                  </div>
                </div>

               
                <div className="bg-white/80 rounded-2xl p-5 shadow-sm border border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500" />
                    Quick Stats
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total Courses</span>
                      <span className="font-semibold text-gray-900">{preferences.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Completion Rate</span>
                      <span className="font-semibold text-green-600">{completion}%</span>
                    </div>
                   
                  </div>
                </div>
              </div>
            </motion.div>



          </div>

       
          <div className="lg:col-span-2 space-y-8">


        
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-gray-200 rounded-3xl shadow-xl border border-gray-100 overflow-hidden"
            >
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                    <Settings className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-bold">Learning Preferences</h3>
                </div>
              </div>

              <div className="p-8">
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Selected Courses</label>
                  {isEditing ? (
                    <>
                      <input
                        type="text"
                        value={update.fields}
                        onChange={handleFieldsChange}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors mb-4"
                        placeholder="e.g., MongoDB, Jenkins, C++"
                      />
                     
                      {update.fields && (() => {
                        const fieldsArray = update.fields.split(",").map((f) => f.trim()).filter((f) => f.length > 0);
                        const newTopics = fieldsArray.filter(topic => 
                          !existingTopicNames.includes(topic.toLowerCase())
                        );
                        
                        return newTopics.length > 0 && (
                          <div className="space-y-2 p-4 bg-gray-50 rounded-xl border border-gray-200">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Set Difficulty Level for New Topics
                            </label>
                            <p className="text-xs text-gray-500 mb-3">
                              Choose the difficulty level for new topics. Existing topics can be changed from the Home page.
                            </p>
                            <div className="space-y-2">
                              {newTopics.map((topic) => (
                                <div key={topic} className="flex items-center justify-between gap-3">
                                  <span className="text-sm font-medium text-gray-700 flex-1">{topic}</span>
                                  <select
                                    value={topicsWithDifficulty[topic] || "beginner"}
                                    onChange={(e) => handleDifficultyChange(topic, e.target.value)}
                                    className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                  >
                                    <option value="beginner">Beginner</option>
                                    <option value="intermediate">Intermediate</option>
                                    <option value="advanced">Advanced</option>
                                  </select>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })()}
                    </>
                  ) : (
                    <div className="flex flex-wrap gap-3">
                      {preferences.map((pref, index) => (
                        <div key={index} className="group relative">
                          <div className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium shadow-md hover:shadow-lg transition-all flex items-center gap-2">
                            <BookOpen className="w-4 h-4" />
                            {pref}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>


                {isEditing ? (
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleUpdate('save')}
                      className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                      <Save className="w-5 h-5" />
                      Save Changes
                    </button>
                    <button
                      onClick={() => handleUpdate('cancel')}
                      className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-all flex items-center justify-center gap-2"
                    >
                      <X className="w-5 h-5" />
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex justify-center">

                    <button
                      onClick={() => handleUpdate('edit')}
                      className="w-50 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                    >
                      Update Preferences
                    </button>
                  </div>
                )}
              </div>
            </motion.div>



          </div>

        </div>
      </div>

   
      <AnimatePresence>
        {showPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl p-8 max-w-md text-center"
            >
              <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Preferences Updated!</h3>
              <p className="text-gray-600">
                Awesome {users.name}, you're all set for a new learning journey 🚀
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ProfilePage;