import { useEffect, useState } from 'react';

const STAGES = [
  { name: 'Supervisor', description: 'Deconstructing location & business type' },
  { name: 'Blueprint Agent', description: 'Creating operational blueprints & tiers' },
  { name: 'Financial Analyst', description: 'Checking budget feasibility' },
  { name: 'Market & Competitors', description: 'Analyzing local OSM & web data' },
  { name: 'Location & Assets', description: 'Estimating rent, permits & equipment' },
  { name: 'Workforce & Products', description: 'Calculating payroll & service pricing' },
  { name: 'Marketing & Compile', description: 'Generating growth strategy & compiling plan' }
];

export default function ProgressStepper({ isGenerating }) {
  const [currentStage, setCurrentStage] = useState(0);

  useEffect(() => {
    if (!isGenerating) {
      setCurrentStage(0);
      return;
    }

    const interval = setInterval(() => {
      setCurrentStage((prev) => {
        if (prev < STAGES.length - 1) return prev + 1;
        return prev; // Stay at the last stage until API returns
      });
    }, 1700); // Move to next stage every 1.7s

    return () => clearInterval(interval);
  }, [isGenerating]);

  return (
    <div className="w-full max-w-2xl mx-auto py-8 animate-fade-in">
      <div className="text-center mb-12">
        <div className="inline-block relative">
          <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mb-4 mx-auto shadow-glow">
            <svg className="w-10 h-10 text-white animate-spin" style={{ animationDuration: '3s' }} fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Generating Your Plan</h3>
        <p className="text-gray-500">Our AI agents are analyzing real-time data. This usually takes 1-2 minutes.</p>
      </div>

      <div className="space-y-4">
        {STAGES.map((stage, index) => {
          let status = 'pending';
          if (index < currentStage) status = 'done';
          if (index === currentStage) status = 'active';

          return (
            <div 
              key={stage.name} 
              className={`flex items-center gap-4 p-4 rounded-2xl transition-all duration-500 ${
                status === 'active' ? 'bg-white shadow-card scale-[1.02] border border-primary/20' : 'bg-transparent border border-transparent'
              }`}
            >
              <div className="flex-shrink-0">
                {status === 'done' && (
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center animate-scale-in">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
                {status === 'active' && (
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <span className="w-3 h-3 bg-white rounded-full animate-ping absolute"></span>
                    <span className="w-3 h-3 bg-white rounded-full relative"></span>
                  </div>
                )}
                {status === 'pending' && (
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center"></div>
                )}
              </div>
              <div className={`flex-1 ${status === 'pending' ? 'opacity-40' : 'opacity-100'}`}>
                <p className="font-semibold text-gray-900">{stage.name}</p>
                {status === 'active' && <p className="text-sm text-gray-500 mt-0.5">{stage.description}</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}