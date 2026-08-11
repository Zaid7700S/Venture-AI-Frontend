import { useState } from 'react';

export default function PlanForm({ onGenerate, loading }) {
  const [businessIdea, setBusinessIdea] = useState('');
  const [location, setLocation] = useState('');
  const [budget, setBudget] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!businessIdea || !location || !budget) return;
    onGenerate(businessIdea, location, budget);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto animate-fade-in">
      <div className="group">
        <label className="block text-sm font-medium text-gray-700 mb-2">Business Idea</label>
        <input 
          type="text" 
          placeholder="e.g., Artisanal Coffee Shop, Gaming Cafe, Organic Bakery" 
          value={businessIdea}
          onChange={(e) => setBusinessIdea(e.target.value)}
          className="w-full px-5 py-4 bg-white border border-gray-200 rounded-xl outline-none transition-all duration-300 focus:ring-4 focus:ring-primary/20 focus:border-primary hover:border-gray-300 shadow-sm"
          required
          disabled={loading}
        />
      </div>

      <div className="group">
        <label className="block text-sm font-medium text-gray-700 mb-2">Target Location</label>
        <input 
          type="text" 
          placeholder="e.g., DHA Phase 5, Lahore, Pakistan OR Remote/Online" 
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full px-5 py-4 bg-white border border-gray-200 rounded-xl outline-none transition-all duration-300 focus:ring-4 focus:ring-primary/20 focus:border-primary hover:border-gray-300 shadow-sm"
          required
          disabled={loading}
        />
        <p className="text-xs text-gray-400 mt-2 ml-1">The AI will automatically detect the local currency based on this location.</p>
      </div>

      <div className="group">
        <label className="block text-sm font-medium text-gray-700 mb-2">Available Budget</label>
        <input 
          type="number" 
          placeholder="e.g., 15000" 
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          className="w-full px-5 py-4 bg-white border border-gray-200 rounded-xl outline-none transition-all duration-300 focus:ring-4 focus:ring-primary/20 focus:border-primary hover:border-gray-300 shadow-sm"
          required
          min="100"
          disabled={loading}
        />
      </div>

      <button 
        type="submit" 
        disabled={loading || !businessIdea || !location || !budget}
        className="w-full bg-primary text-white font-bold py-4 rounded-xl hover:bg-primary-dark transition-all duration-300 shadow-glow active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2 transform"
      >
        {loading ? 'Generating Plan...' : 'Generate Feasibility Study'}
        {!loading && (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        )}
      </button>
    </form>
  );
}