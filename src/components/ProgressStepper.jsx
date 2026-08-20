// The graph runs: supervisor -> blueprint_agent -> financial_analyst ->
// (5 research agents, in parallel) -> asset_equipment -> [maybe a budget
// downgrade + re-research loop] -> product_strategist -> marketing_agent
// -> compiler. This mirrors that shape instead of a fixed per-step timer,
// so what's shown is what's actually happening on the backend.
const RESEARCH_KEYS = ['market_pricing', 'competitor_analyst', 'location_analyst', 'legal_agent', 'workforce_analyst'];

const STAGES = [
  { key: 'supervisor', name: 'Supervisor', description: 'Parsing your location & business type' },
  { key: 'blueprint_agent', name: 'Blueprint Agent', description: 'Building the operational blueprint & budget tiers' },
  { key: 'financial_analyst', name: 'Financial Analyst', description: 'Checking initial budget feasibility' },
  {
    key: 'research_group',
    isGroup: true,
    keys: RESEARCH_KEYS,
    name: 'Market Research',
    description: 'Researching material prices, competitors, rent, permits & payroll'
  },
  { key: 'asset_equipment', name: 'Asset & Equipment', description: 'Pricing equipment & inventory setup' },
  { key: 'product_strategist', name: 'Product Strategist', description: 'Designing your signature offerings' },
  { key: 'marketing_agent', name: 'Marketing Agent', description: 'Building the launch & growth strategy' },
  { key: 'compiler', name: 'Compiling Plan', description: 'Assembling your final feasibility study' }
];

export default function ProgressStepper({ completedNodes, budgetAdjusted }) {
  const isStageDone = (stage) =>
    stage.isGroup ? stage.keys.every((k) => completedNodes.has(k)) : completedNodes.has(stage.key);

  const firstActiveIndex = STAGES.findIndex((stage) => !isStageDone(stage));

  return (
    <div className="w-full max-w-2xl mx-auto py-4 sm:py-8 animate-fade-in">
      <div className="text-center mb-8 sm:mb-12 px-2">
        <div className="inline-block relative">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary rounded-full flex items-center justify-center mb-4 mx-auto shadow-glow">
            <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white animate-spin" style={{ animationDuration: '3s' }} fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        </div>
        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Generating Your Plan</h3>
        <p className="text-sm sm:text-base text-gray-500">Our AI agents are analyzing real-time data. This usually takes 1-2 minutes.</p>

        {budgetAdjusted && (
          <div className="mt-4 inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-800 text-xs sm:text-sm px-4 py-2 rounded-xl text-left">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M4.93 19h14.14a1 1 0 00.87-1.5L12.87 4.5a1 1 0 00-1.74 0L4.06 17.5a1 1 0 00.87 1.5z" /></svg>
            <span>Researched costs ran over budget — downgrading tier and re-researching for a better fit.</span>
          </div>
        )}
      </div>

      <div className="space-y-3 sm:space-y-4">
        {STAGES.map((stage, index) => {
          const done = isStageDone(stage);
          const status = done ? 'done' : index === firstActiveIndex ? 'active' : 'pending';
          const doneCount = stage.isGroup ? stage.keys.filter((k) => completedNodes.has(k)).length : null;

          return (
            <div
              key={stage.key}
              className={`flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-2xl transition-all duration-500 ${
                status === 'active' ? 'bg-white shadow-card scale-[1.01] sm:scale-[1.02] border border-primary/20' : 'bg-transparent border border-transparent'
              }`}
            >
              <div className="flex-shrink-0">
                {status === 'done' && (
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-green-500 rounded-full flex items-center justify-center animate-scale-in">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
                {status === 'active' && (
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-primary rounded-full flex items-center justify-center relative">
                    <span className="w-3 h-3 bg-white rounded-full animate-ping absolute"></span>
                    <span className="w-3 h-3 bg-white rounded-full relative"></span>
                  </div>
                )}
                {status === 'pending' && (
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-200 rounded-full flex items-center justify-center"></div>
                )}
              </div>
              <div className={`flex-1 min-w-0 ${status === 'pending' ? 'opacity-40' : 'opacity-100'}`}>
                <p className="font-semibold text-gray-900 text-sm sm:text-base flex items-center gap-2 flex-wrap">
                  <span>{stage.name}</span>
                  {stage.isGroup && status === 'active' && (
                    <span className="text-xs font-normal text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                      {doneCount}/{stage.keys.length} done
                    </span>
                  )}
                </p>
                {status === 'active' && <p className="text-xs sm:text-sm text-gray-500 mt-0.5">{stage.description}</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
