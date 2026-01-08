import { useState } from "react";
import api from "../api/api";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.post("/auth/register", form);
      window.location.href = "/login";
    } catch (err) {
      alert(err.response?.data?.message || "Error registering user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-700 via-purple-700 to-pink-600 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="w-full max-w-md bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl ring-1 ring-black/5 p-8 space-y-6"
      >
        <div className="text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-pink-500 bg-clip-text text-transparent">
            Create Account
          </h1>
          <p className="text-gray-600 mt-2">
            Join <span className="font-semibold text-indigo-600">SkillForge</span> and start your journey today.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
         
          <div className="relative">
            <input
              type="text"
              id="name"
              name="name"
              onChange={handleChange}
              required
              className="peer w-full rounded-xl border border-gray-300 bg-transparent px-3 pt-5 pb-2 text-gray-900 placeholder-transparent focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              placeholder="Name"
            />
            <label
              htmlFor="name"
              className="absolute left-3 top-2 text-gray-500 text-sm transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-sm peer-focus:text-indigo-600"
            >
              Full Name
            </label>
          </div>

          <div className="relative">
            <input
              type="email"
              id="email"
              name="email"
              onChange={handleChange}
              required
              className="peer w-full rounded-xl border border-gray-300 bg-transparent px-3 pt-5 pb-2 text-gray-900 placeholder-transparent focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              placeholder="Email"
            />
            <label
              htmlFor="email"
              className="absolute left-3 top-2 text-gray-500 text-sm transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-sm peer-focus:text-indigo-600"
            >
              Email address
            </label>
          </div>

          <div className="relative">
            <input
              type="password"
              id="password"
              name="password"
              onChange={handleChange}
              required
              className="peer w-full rounded-xl border border-gray-300 bg-transparent px-3 pt-5 pb-2 text-gray-900 placeholder-transparent focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              placeholder="Password"
            />
            <label
              htmlFor="password"
              className="absolute left-3 top-2 text-gray-500 text-sm transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-sm peer-focus:text-indigo-600"
            >
              Password
            </label>
          </div>

          <motion.button
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-pink-500 text-white py-3 rounded-xl font-medium shadow-md hover:shadow-lg hover:brightness-110 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin w-5 h-5" /> Creating...
              </>
            ) : (
              "Create Account"
            )}
          </motion.button>
        </form>

        <p className="text-center text-gray-600 text-sm">
          Already have an account?{" "}
          <a href="/login" className="text-indigo-600 font-semibold hover:underline">
            Sign in
          </a>
        </p>
      </motion.div>
    </div>
  );
}
