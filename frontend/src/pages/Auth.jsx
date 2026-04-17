import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) throw error;
        navigate("/");
      } else {
        const { data, error } = await signUp(email, password, fullName);
        if (error) throw error;
        
        if (data?.user && !data?.session) {
          setSuccess("Account created! Check your email to confirm, then sign in.");
          setIsLogin(true);
        } else {
          navigate("/");
        }
      }
    } catch (err) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[75vh] w-full animate-fade-in pointer-events-auto">
      <div className="w-full max-w-md p-8 rounded-2xl shadow-xl bg-white/10 backdrop-blur-lg border border-white/20 transition-all duration-500">
        
        {/* Header */}
        <h2 className="text-3xl font-black uppercase tracking-tighter mb-2 text-center text-white">
          {isLogin ? "Welcome Back" : "Join Hermes"}
        </h2>
        <p className="text-white/50 text-center mb-8 text-sm uppercase tracking-widest">
          {isLogin ? "Sign in to your account" : "Create your account"}
        </p>

        {/* Error / Success Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-200 text-sm text-center animate-fade-in">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-xl text-green-200 text-sm text-center animate-fade-in">
            {success}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {!isLogin && (
            <div className="space-y-2 animate-fade-in">
              <label className="text-xs font-bold text-white/50 uppercase tracking-tighter ml-1">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                className="w-full bg-white/5 border border-white/20 text-white rounded-xl py-3 px-5 focus:outline-none focus:border-[#D4AF37]/50 placeholder-white/30 transition-all"
              />
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-bold text-white/50 uppercase tracking-tighter ml-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full bg-white/5 border border-white/20 text-white rounded-xl py-3 px-5 focus:outline-none focus:border-[#D4AF37]/50 placeholder-white/30 transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-white/50 uppercase tracking-tighter ml-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              className="w-full bg-white/5 border border-white/20 text-white rounded-xl py-3 px-5 focus:outline-none focus:border-[#D4AF37]/50 placeholder-white/30 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-white/5 border border-white/50 text-white font-black uppercase tracking-widest rounded-full hover:text-[#D4AF37] hover:bg-[#D4AF37]/10 hover:border-[#D4AF37] hover:scale-[1.02] active:scale-95 shadow-lg transition-all duration-300 disabled:opacity-50 disabled:hover:scale-100"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-3">
                <div className="w-5 h-5 border-3 border-white/20 border-t-white rounded-full animate-spin"></div>
                <span>{isLogin ? "Signing in..." : "Creating account..."}</span>
              </div>
            ) : (
              isLogin ? "Sign In" : "Create Account"
            )}
          </button>
        </form>

        {/* Toggle Login/Signup */}
        <div className="mt-8 text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError(null);
              setSuccess(null);
            }}
            className="text-white/50 text-sm hover:text-[#D4AF37] transition-colors"
          >
            {isLogin ? (
              <>Don't have an account? <span className="font-bold text-white/80 hover:text-[#D4AF37]">Sign up</span></>
            ) : (
              <>Already have an account? <span className="font-bold text-white/80 hover:text-[#D4AF37]">Sign in</span></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
