import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import api from "@/api/api";
import { useEffect, useState } from "react";

export default function DailyProgress() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDaily = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await api.get("/progress/daily-progress", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const records = Array.isArray(res.data) ? res.data : (res.data.records || []);

        const formatted = records.map((r) => ({
          date: new Date(r.date).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
          }),
          titles: Number(r.titlesCompletedToday) || 0,
          streak: Number(r.streakDays) || 0,
        }));

        setData(formatted);
      } catch (e) {
        setError("Failed to load daily progress");
      } finally {
        setLoading(false);
      }
    };
    fetchDaily();
  }, []);

  
  const currentStreak = data.length > 0 ? data[data.length - 1].streak : 0;
  const todayCompleted = data.length > 0 ? data[data.length - 1].titles : 0;

  return (
    <div className="bg-white rounded-xl shadow-md border p-6 mt-6">
      <h2 className="text-lg font-semibold mb-4">📅 Daily Learning Progress</h2>
      
      
      {!loading && !error && data.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-gradient-to-r from-orange-400 to-red-500 text-white p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Learning Streak</p>
                <p className="text-2xl font-bold">{currentStreak} days 🔥</p>
              </div>
              <div className="text-3xl">⚡</div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-400 to-blue-500 text-white p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Today's Progress</p>
                <p className="text-2xl font-bold">{todayCompleted} titles ✅</p>
              </div>
              <div className="text-3xl">📚</div>
            </div>
          </div>
        </div>
      )}

     
      {loading ? (
        <div className="text-gray-500">Loading...</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : data.length === 0 ? (
        <div className="text-gray-600">No daily progress yet. Complete a lesson to see your chart.</div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis domain={[0, 'dataMax + 1']} />
            <Tooltip 
              formatter={(value, name) => [
                name === 'titles' ? `${value} titles` : `${value} day streak`,
                name === 'titles' ? 'Completed' : 'Streak'
              ]} 
            />
            <Line type="monotone" dataKey="titles" stroke="#3b82f6" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
