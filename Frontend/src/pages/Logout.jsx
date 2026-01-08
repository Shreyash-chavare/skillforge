import React,{useEffect} from 'react'
import { useNavigate } from "react-router-dom";

export const Logout = () => {
    const navigate = useNavigate();

    useEffect(() => {
      
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      sessionStorage.clear();
  
      navigate("/login");
    }, [navigate]);
  
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600">
        <div className="bg-white p-6 rounded-2xl shadow-xl">
          <p className="text-gray-700 text-lg font-medium">Logging out...</p>
        </div>
      </div>
    );
}
