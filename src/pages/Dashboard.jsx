import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuthStore } from '../store/useAuthStore';
import { generatePlanStream, wakeServer } from '../lib/api';
import { fetchUserPlans, savePlanToSupabase } from '../lib/supabaseApi';
import GroqKeyModal from '../components/GroqKeyModal';
import PlanForm from '../components/PlanForm';
import ProgressStepper from '../components/ProgressStepper';
import PlanRenderer from '../components/PlanRenderer';
import ChatPanel from '../components/ChatPanel';

const RESEARCH_KEYS = ['market_pricing', 'competitor_analyst', 'location_analyst', 'legal_agent', 'workforce_analyst'];

export default function Dashboard() {
  const [showModal, setShowModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedMarkdown, setGeneratedMarkdown] = useState(null);
  const [currentPlanId, setCurrentPlanId] = useState(null);
  const [pastPlans, setPastPlans] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [serverWaking, setServerWaking] = useState(false);
  const [completedNodes, setCompletedNodes] = useState(() => new Set());
  const [budgetAdjusted, setBudgetAdjusted] = useState(false);
  
  const { user, groqApiKey, setGroqApiKey, isGuest, logout } = useAuthStore();

  useEffect(() => {
    if (isGuest) {
      const localKey = localStorage.getItem('groq_api_key');
      if (localKey) setGroqApiKey(localKey);
      else setShowModal(true); // Show modal automatically on first load
    } else if (user) {
      // Fetches the decrypted key via a security-definer function — the
      // client never selects the plaintext/vault-ref column directly.
      supabase
        .rpc('get_groq_key')
        .then(({ data }) => {
          if (data) setGroqApiKey(data);
          else setShowModal(true); // Show modal automatically if no key in DB
        });

      // Fetch past plans for logged-in users
      fetchUserPlans(user.id).then(setPastPlans).catch(console.error);
    }
  }, [user, setGroqApiKey, isGuest]);

  const handleGenerate = async (idea, loc, budget) => {
    // Intercept if user doesn't have a key yet
    if (!groqApiKey) {
      setShowModal(true);
      return;
    }

    setIsGenerating(true);
    setGeneratedMarkdown(null);
    setCurrentPlanId(null);
    setCompletedNodes(new Set());
    setBudgetAdjusted(false);

    try {
      // Render's free tier spins down when idle - ping /health first so the
      // progress screen can explain a slow start instead of just sitting there.
      await wakeServer(setServerWaking);

      const result = await generatePlanStream(idea, loc, budget, groqApiKey, (evt) => {
        if (evt.type !== 'node_done') return;

        if (evt.node === 'downgrade_tier') {
          // Budget gate kicked in: the graph loops back and re-runs the
          // research + asset nodes against a cheaper tier, so un-mark them
          // as done rather than leaving stale checkmarks up.
          setBudgetAdjusted(true);
          setCompletedNodes((prev) => {
            const next = new Set(prev);
            [...RESEARCH_KEYS, 'asset_equipment'].forEach((k) => next.delete(k));
            return next;
          });
          return;
        }

        setCompletedNodes((prev) => new Set(prev).add(evt.node));
      });

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
      setServerWaking(false);
    }
  };

  const loadPastPlan = (plan) => {
    setGeneratedMarkdown(plan.markdown);
    setCurrentPlanId(plan.id);
    setShowHistory(false);
  };

  return (
    <div className="min-h-screen bg-cream p-4 sm:p-6 md:p-10 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-4xl mx-auto relative z-10 animate-slide-up">
        <header className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-12">
          <div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">Dashboard</h1>
            <p className="text-gray-500 mt-1 text-sm sm:text-base truncate">Welcome back, {user?.email}</p>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3">
            {!isGuest && (
              <div className="relative flex-1 sm:flex-initial">
                <button 
                  onClick={() => setShowHistory(!showHistory)}
                  className="w-full sm:w-auto px-3 sm:px-5 py-2 sm:py-2.5 text-sm sm:text-base text-gray-600 bg-white rounded-xl hover:bg-gray-50 transition-colors shadow-sm border border-gray-200 font-medium flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <span className="whitespace-nowrap">My Plans</span>
                </button>
                
                {showHistory && (
                  <div className="absolute right-0 mt-2 w-[calc(100vw-2rem)] max-w-72 sm:w-72 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 max-h-96 overflow-y-auto animate-scale-in">
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
              className="flex-1 sm:flex-initial px-3 sm:px-5 py-2 sm:py-2.5 text-sm sm:text-base text-gray-600 bg-white rounded-xl hover:bg-gray-50 transition-colors shadow-sm border border-gray-200 font-medium whitespace-nowrap"
            >
              {isGuest ? "Exit Guest" : "Log Out"}
            </button>
          </div>
        </header>

        {serverWaking && (
          <div className="mb-4 sm:mb-6 flex items-center gap-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs sm:text-sm px-4 py-3 rounded-2xl animate-fade-in">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Server is starting up (it sleeps when idle on the free tier) — this can take up to a minute, thanks for your patience.</span>
          </div>
        )}
        
        <div className="bg-white rounded-2xl sm:rounded-[2rem] p-5 sm:p-8 md:p-12 shadow-[var(--shadow-soft)] border border-gray-100 min-h-[400px]">
          {!isGenerating && !generatedMarkdown && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Create New Plan</h2>
                <p className="text-gray-500 mt-1 text-sm sm:text-base">Generate an AI-powered feasibility study.</p>
              </div>
              
              {/* Dynamic Groq Connection Badge/Button */}
              <button 
                onClick={() => !groqApiKey && setShowModal(true)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-colors ${
                  groqApiKey 
                    ? 'bg-cream-dark/40 border-cream-dark cursor-default' 
                    : 'bg-primary/10 border-primary/30 hover:bg-primary/20 cursor-pointer'
                }`}
              >
                <span className={`w-2.5 h-2.5 rounded-full animate-pulse ${groqApiKey ? 'bg-green-500' : 'bg-primary'}`}></span>
                <span className={`text-sm font-medium ${groqApiKey ? 'text-gray-700' : 'text-primary'}`}>
                  {groqApiKey ? 'Groq Connected' : 'Connect Groq'}
                </span>
              </button>

            </div>
          )}

          {isGenerating ? (
            <ProgressStepper completedNodes={completedNodes} budgetAdjusted={budgetAdjusted} />
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