import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Register from './pages/register';
import Login from './pages/login';
import Preferences from './pages/preferences';
import Home from './pages/Home';
import Profile from './pages/profile'
import Lesson from './pages/lesson';
import Quize from './pages/Quize';
import Score from './pages/Score';
import Title from './pages/Title';
import  Progress from './pages/Progress';
import Recommend from './pages/Recommend';
import { Logout } from './pages/Logout';


function App() {

  return (
    <Router>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/preferences" element={<Preferences />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/profile" element={<Profile/>}/>
        <Route path='/logout' element={<Logout/>}/>
        <Route path="/lesson/:topic" element={<Lesson />} />
        <Route path="/title/:topic/:order" element={<Title />} />
        <Route path='/quize/:topic/:order' element={<Quize/>}/>
        <Route path='/score' element={<Score/>}/>
        <Route path='/recommendations' element={<Recommend/>}/>
        <Route path='/quize/:topic/:order/:suborder' element={<Quize/>}/>
        <Route path='/progress' element={<Progress/>}/>
        
      </Routes>
    </Router>
  );
}

export default App;
