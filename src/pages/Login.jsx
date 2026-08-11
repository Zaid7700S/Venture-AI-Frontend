import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setUserData } = useAuthStore();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
    else navigate('/');
    setLoading(false);
  };

  const handleGuestLogin = () => {
    setUserData({ id: 'guest-user', email: 'Guest User' }, null, true);
    navigate('/');
  };

  return (
    <div className="min-h-screen w-full bg-cream flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-primary/5 rounded-full blur-3xl"></div>

      <div className="w-full max-w-md relative z-10 animate-scale-in">
        <div className="bg-white/80 backdrop-blur-xl p-8 sm:p-10 rounded-[2rem] shadow-[var(--shadow-glow)] border border-white">
          <div className="mb-8 text-center">
            <div className="inline-block p-4 bg-primary/10 rounded-2xl mb-4">
              <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">AI Venture Builder</h1>
            <p className="text-gray-500 mt-2">Log in to save your progress & chat history</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="group">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input 
                type="email" 
                placeholder="you@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl outline-none transition-all duration-300 focus:ring-4 focus:ring-primary/20 focus:border-primary hover:border-gray-300"
                required
              />
            </div>
            <div className="group">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl outline-none transition-all duration-300 focus:ring-4 focus:ring-primary/20 focus:border-primary hover:border-gray-300"
                required
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-primary text-white font-bold py-3.5 rounded-xl hover:bg-primary-dark transition-all duration-300 shadow-lg hover:shadow-glow active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed transform"
            >
              {loading ? 'Logging in...' : 'Log In'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-400 mb-3">Just want to look around?</p>
            <button onClick={handleGuestLogin} className="w-full text-gray-700 bg-gray-100 hover:bg-gray-200 font-medium py-3.5 rounded-xl transition-colors mb-4">
              Continue as Guest
            </button>
            <p className="text-sm text-gray-500">
              Don't have an account?{' '}
              <Link to="/signup" className="text-primary font-semibold hover:text-primary-dark transition-colors">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}