import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuthStore } from '../store/useAuthStore';
import { generatePlan } from '../lib/api';
import { fetchUserPlans, savePlanToSupabase } from '../lib/supabaseApi';
import GroqKeyModal from '../components/GroqKeyModal';
import PlanForm from '../components/PlanForm';
import ProgressStepper from '../components/ProgressStepper';
import PlanRenderer from '../components/PlanRenderer';
import ChatPanel from '../components/ChatPanel';

export default function Dashboard() {
  const [showModal, setShowModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedMarkdown, setGeneratedMarkdown] = useState(null);
  const [currentPlanId, setCurrentPlanId] = useState(null);
  const [pastPlans, setPastPlans] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  
  const { user, groqApiKey, setGroqApiKey, isGuest, logout } = useAuthStore();

  useEffect(() => {
    if (isGuest) {
      const localKey = localStorage.getItem('groq_api_key');
      if (localKey) setGroqApiKey(localKey);
      else setShowModal(true);
    } else if (user) {
      supabase
        .from('profiles')
        .select('groq_api_key')
        .eq('id', user.id)
        .single()
        .then(({ data }) => {
          if (data?.groq_api_key) setGroqApiKey(data.groq_api_key);
          else setShowModal(true);
        });

      // Fetch past plans for logged-in users
      fetchUserPlans(user.id).then(setPastPlans).catch(console.error);
    }
  }, [user, setGroqApiKey, isGuest]);

  const handleGenerate = async (idea, loc, budget) => {
    setIsGenerating(true);
    setGeneratedMarkdown(null);
    setCurrentPlanId(null);
    try {
      const result = await generatePlan(idea, loc, budget, groqApiKey);
      setGeneratedMarkdown(result.markdown);
      
      // Save to Supabase if logged in
      if (!isGuest && user) {
        const savedPlan = await savePlanToSupabase(user.id, idea, result.markdown);
        setCurrentPlanId(savedPlan.id);
        setPastPlans(prev => [savedPlan, ...prev]);
      }
    } catch (error) {
      alert("Error generating plan. Check console.");
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const loadPastPlan = (plan) => {
    setGeneratedMarkdown(plan.markdown);
    setCurrentPlanId(plan.id);
    setShowHistory(false);
  };

  return (
    <div className="min-h-screen bg-cream p-6 sm:p-10 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-4xl mx-auto relative z-10 animate-slide-up">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Dashboard</h1>
            <p className="text-gray-500 mt-1">Welcome back, {user?.email}</p>
          </div>
          
          <div className="flex items-center gap-3">
            {!isGuest && (
              <div className="relative">
                <button 
                  onClick={() => setShowHistory(!showHistory)}
                  className="px-5 py-2.5 text-gray-600 bg-white rounded-xl hover:bg-gray-50 transition-colors shadow-sm border border-gray-200 font-medium flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  My Plans
                </button>
                
                {showHistory && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 max-h-96 overflow-y-auto animate-scale-in">
                    {pastPlans.length === 0 ? (
                      <p className="p-4 text-sm text-gray-500 text-center">No saved plans yet.</p>
                    ) : (
                      pastPlans.map(plan => (
                        <button 
                          key={plan.id} 
                          onClick={() => loadPastPlan(plan)}
                          className="w-full text-left p-4 hover:bg-cream/30 border-b border-gray-50 last:border-0 transition-colors"
                        >
                          <p className="font-semibold text-gray-900 truncate">{plan.title}</p>
                          <p className="text-xs text-gray-400">{new Date(plan.created_at).toLocaleDateString()}</p>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}

            <button 
              onClick={() => logout(supabase)}
              className="px-5 py-2.5 text-gray-600 bg-white rounded-xl hover:bg-gray-50 transition-colors shadow-sm border border-gray-200 font-medium"
            >
              {isGuest ? "Exit Guest" : "Log Out"}
            </button>
          </div>
        </header>
        
        <div className="bg-white rounded-[2rem] p-8 sm:p-12 shadow-[var(--shadow-soft)] border border-gray-100 min-h-[400px]">
          {!isGenerating && !generatedMarkdown && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Create New Plan</h2>
                <p className="text-gray-500 mt-1">Generate an AI-powered feasibility study.</p>
              </div>
              <div className="flex items-center gap-2 bg-cream-dark/40 px-4 py-2 rounded-full border border-cream-dark">
                <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-sm font-medium text-gray-700">Groq Connected</span>
              </div>
            </div>
          )}

          {isGenerating ? (
            <ProgressStepper isGenerating={isGenerating} />
          ) : generatedMarkdown ? (
            <PlanRenderer 
              markdown={generatedMarkdown} 
              onReset={() => { 
                setGeneratedMarkdown(null); 
                setCurrentPlanId(null); 
              }} 
            />
          ) : (
            <PlanForm onGenerate={handleGenerate} loading={isGenerating} />
          )}
        </div>
      </div>

      {generatedMarkdown && (
        <ChatPanel 
          planMarkdown={generatedMarkdown} 
          planId={currentPlanId} 
          userId={user?.id} 
          isGuest={isGuest}
          groqApiKey={groqApiKey}
        />
      )}

      {showModal && <GroqKeyModal userId={user?.id} onClose={() => setShowModal(false)} />}
    </div>
  );
}
