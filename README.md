🚀 SkillForge – AI-Powered Learning Platform
SkillForge is a full-stack learning platform designed to help users learn topics efficiently through personalized lessons, quizzes, progress tracking, and AI-based recommendations.

It is built using MERN Stack, fully Dockerized, and deployed on Render with MongoDB Atlas.

🌐 Live Demo: https://skillforge-frontend-dyg3.onrender.com

🧩 Tech Stack:
Frontend
React (Vite)
Tailwind CSS

Backend
Node.js
Express.js
MongoDb

DevOps / Deployment
Dockerize both Frontend and Backend
Render (Frontend + Backend)
GitHub

✨ Features: 
🔐 User Authentication (JWT + Cookies)
🎯 Personalized learning preferences
📚 Topic-based lessons
🧠 AI-powered recommendations
📝 Quiz system with scoring
📊 Daily progress tracking
🧾 User profile & history


🚧 Issues Faced & Learnings
   Evolving System Architecture:
   While designing the overall system architecture, several components required restructuring during development.
  👉 Learning: Initial architecture serves as a guideline, but real-world development demands continuous refinement.

   Difficulty Level Design Change:
   Initially, the difficulty level was implemented as a global user setting. Later, it became clear that difficulty should vary per topic based on user preferences.
  👉 Learning: Feature logic should align with real user behavior, not just initial assumptions.

🔮 Future Improvements:
🎯 Goal-based learning system with deadlines
📢 Smart reminders & progress-based motivation
✅ Role-based access (Admin / User)
📈 Analytics dashboard
🤖 More advanced AI recommendations
⏱️ Real-time learning streaks
☁️ AWS EC2 + Nginx deployment
🔁 CI/CD using GitHub Actions


🐞Known Issues:
   ⏱️ Quiz timer starts during data loading instead of after UI render
    - The timer begins on component mount, even before quiz data is fully loaded.
    - This can reduce the effective time available for users on slower networks.
Planned Improvement:
    Initialize the quiz timer only after:
    - Quiz data is successfully fetched
    - UI is fully rendered and ready for interaction


