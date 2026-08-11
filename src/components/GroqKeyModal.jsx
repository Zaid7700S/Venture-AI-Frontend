import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuthStore } from '../store/useAuthStore';

export default function GroqKeyModal({ userId, onClose }) {
  const [apiKey, setApiKey] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const { setGroqApiKey, isGuest } = useAuthStore();

  const handleSave = async () => {
    if (!apiKey) return;
    setSaving(true);
    setError('');
    
    try {
      if (isGuest) {
        localStorage.setItem('groq_api_key', apiKey);
      } else {
        const { error } = await supabase
          .from('profiles')
          .upsert({ id: userId, groq_api_key: apiKey });
        if (error) throw error;
      }
      setGroqApiKey(apiKey);
      onClose(); // Close the modal upon successful save
    } catch (e) {
      setError("Failed to save key. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-[2rem] max-w-xl w-full shadow-2xl animate-scale-in relative overflow-hidden">
        
        {/* Header Section with Gradient */}
        <div className="bg-gradient-to-br from-primary to-primary-dark p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-black/10 rounded-full blur-2xl -ml-10 -mb-10"></div>
          
          <div className="relative z-10">
            <div className="inline-block p-3 bg-white/20 backdrop-blur-sm rounded-2xl mb-4 border border-white/30">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white">Connect your Groq Account</h2>
            <p className="text-white/80 mt-2 text-sm max-w-sm mx-auto">
              We use your own Groq API key to power the ultra-fast AI agents. It is stored securely and never exposed.
            </p>
          </div>
        </div>

        {/* Body Section */}
        <div className="p-8 bg-cream/30">
          <a 
            href="https://console.groq.com/keys" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-gray-900 text-white py-3.5 rounded-xl font-semibold mb-6 hover:bg-gray-800 transition-colors duration-300 active:scale-[0.98] transform shadow-md"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            Get your Groq API Key here
            <svg className="w-4 h-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-10L10 14" /></svg>
          </a>

          <div className="space-y-3">
            <label className="block text-sm font-bold text-gray-700">
              {isGuest ? "Paste API Key (Stored locally in browser)" : "Paste API Key"}
            </label>
            <input 
              type="password" 
              placeholder="gsk_..." 
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full px-5 py-4 bg-white border border-gray-200 rounded-xl outline-none transition-all duration-300 focus:ring-4 focus:ring-primary/20 focus:border-primary text-gray-800 font-mono text-sm shadow-sm"
            />
            {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
          </div>
          
          <button 
            onClick={handleSave}
            disabled={saving || !apiKey}
            className="w-full mt-6 bg-primary text-white font-bold py-4 rounded-xl hover:bg-primary-dark transition-all duration-300 shadow-lg hover:shadow-glow active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 transform"
          >
            {saving ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              'Save & Continue'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}