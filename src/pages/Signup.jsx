import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate, Link } from 'react-router-dom';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password 
    });

    if (error) {
      setErrorMsg(error.message);
    } else if (data.user && data.session === null) {
      // Email confirmation is required by Supabase settings
      setSuccessMsg("Check your email for a confirmation link to complete your signup!");
    } else if (data.session) {
      // Auto-logged in if email confirmation is disabled in Supabase
      navigate('/');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen w-full bg-cream flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-primary/5 rounded-full blur-3xl"></div>

      <div className="w-full max-w-md relative z-10 animate-scale-in">
        <div className="bg-white/80 backdrop-blur-xl p-8 sm:p-10 rounded-[2rem] shadow-[var(--shadow-glow)] border border-white">
          <div className="mb-8 text-center">
            <div className="inline-block p-4 bg-primary/10 rounded-2xl mb-4">
              <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Create Account</h1>
            <p className="text-gray-500 mt-2">Sign up to save your plans & chat history</p>
          </div>

          {successMsg ? (
            <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl text-center mb-6">
              {successMsg}
            </div>
          ) : (
            <form onSubmit={handleSignup} className="space-y-5">
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
                  placeholder="Create a password (min 6 characters)" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl outline-none transition-all duration-300 focus:ring-4 focus:ring-primary/20 focus:border-primary hover:border-gray-300"
                  required
                  minLength="6"
                />
              </div>
              
              {errorMsg && <p className="text-red-500 text-sm font-medium">{errorMsg}</p>}

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-primary text-white font-bold py-3.5 rounded-xl hover:bg-primary-dark transition-all duration-300 shadow-lg hover:shadow-glow active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed transform"
              >
                {loading ? 'Creating account...' : 'Sign Up'}
              </button>
            </form>
          )}

          <div className="mt-6 pt-6 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-500">
              Already have an account?{' '}
              <Link to="/login" className="text-primary font-semibold hover:text-primary-dark transition-colors">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}