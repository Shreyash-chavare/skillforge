import { useState } from "react";
import api from "../api/api.js";
import { useNavigate } from "react-router-dom";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Sphere, MeshDistortMaterial } from "@react-three/drei";

export default function Preferences() {
  const [fieldsInput, setFieldsInput] = useState("");
  const [topicsWithDifficulty, setTopicsWithDifficulty] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  
  const handleFieldsChange = (e) => {
    const value = e.target.value;
    setFieldsInput(value);
    
    
    const fieldsArray = value
      .split(",")
      .map((f) => f.trim())
      .filter((f) => f.length > 0);
    

    const newDifficulties = { ...topicsWithDifficulty };
    fieldsArray.forEach(field => {
      if (!newDifficulties[field]) {
        newDifficulties[field] = "beginner";
      }
    });
    

    Object.keys(newDifficulties).forEach(field => {
      if (!fieldsArray.includes(field)) {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fieldsArray = fieldsInput
      .split(",")
      .map((f) => f.trim())
      .filter((f) => f.length > 0);

    if (fieldsArray.length === 0) {
      alert("Please enter at least one topic.");
      return;
    }

    try {
      setLoading(true);
      await api.put("/auth/preferences", {
        fields: fieldsArray,
        topicDifficulties: topicsWithDifficulty,
      });
      
      navigate("/home", { replace: true });
    
      window.location.reload();
    } catch (err) {
      alert("Could not save preferences. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
     
      <div className="hidden md:flex w-1/2 items-center justify-center bg-black">
        <Canvas>
          <ambientLight intensity={0.6} />
          <directionalLight position={[3, 3, 3]} intensity={1} />
          <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={1.5} />

         
          <Sphere visible args={[1.5, 100, 200]} scale={2.5}>
            <MeshDistortMaterial
              color="#6366f1"
              attach="material"
              distort={0.4}
              speed={2}
              roughness={0.2}
            />
          </Sphere>
        </Canvas>
      </div>

   
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500">
        <form
          onSubmit={handleSubmit}
          className="bg-white/90 backdrop-blur rounded-2xl shadow-xl ring-1 ring-black/5 p-8 md:p-10 space-y-5 w-full max-w-md"
        >
          <div>
            <p className="text-sm font-medium text-emerald-700">Preferences</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight text-gray-900">
              Personalize your path
            </h2>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="fields"
              className="block text-sm font-medium text-gray-700"
            >
              Your fields
            </label>
            <input
              id="fields"
              type="text"
              placeholder="e.g. Java, Python, AI"
              value={fieldsInput}
              onChange={handleFieldsChange}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
            <p className="text-xs text-gray-500">
              Separate with commas. We'll tailor content based on these topics.
            </p>
          </div>

          {fieldsInput && fieldsInput.split(",").map(f => f.trim()).filter(f => f.length > 0).length > 0 && (
            <div className="space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <label className="block text-sm font-medium text-gray-700">
                Set Difficulty Level for Each Topic
              </label>
              <p className="text-xs text-gray-500 mb-3">
                Choose the difficulty level for each topic. This determines the complexity of the content generated.
              </p>
              <div className="space-y-2">
                {fieldsInput
                  .split(",")
                  .map((f) => f.trim())
                  .filter((f) => f.length > 0)
                  .map((topic) => (
                    <div key={topic} className="flex items-center justify-between gap-3">
                      <span className="text-sm font-medium text-gray-700 flex-1">{topic}</span>
                      <select
                        value={topicsWithDifficulty[topic] || "beginner"}
                        onChange={(e) => handleDifficultyChange(topic, e.target.value)}
                        className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      >
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                      </select>
                    </div>
                  ))}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 bg-emerald-600 text-white py-3 rounded-lg font-medium shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-600 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Saving..." : "Save preferences"}
          </button>
        </form>
      </div>
    </div>
  );
}
