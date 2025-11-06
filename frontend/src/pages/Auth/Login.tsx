import { useState } from "react";
import API from "../../utils/api";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await API.post("/auth/login", { email, password });
      login(res.data.token, res.data.user);
      toast.success("Login successful!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen justify-center items-center bg-neutral-950">
      <form
        onSubmit={handleLogin}
        className="bg-neutral-900 p-8 rounded-2xl shadow-lg w-96"
      >
        <h2 className="text-2xl font-semibold text-center text-white mb-6">
          Login
        </h2>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 rounded-md mb-4 bg-neutral-800 border border-neutral-700 text-white focus:outline-none focus:border-blue-500"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 rounded-md mb-6 bg-neutral-800 border border-neutral-700 text-white focus:outline-none focus:border-blue-500"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 p-3 rounded-md text-white font-semibold transition-all duration-150"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="text-sm text-gray-400 text-center mt-4">
          Don’t have an account?{" "}
          <a href="/signup" className="text-blue-400 hover:underline">
            Sign up
          </a>
        </p>
      </form>
    </div>
  );
}
