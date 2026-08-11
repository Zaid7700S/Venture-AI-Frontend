import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function PlanRenderer({ markdown, onReset }) {
  const handleDownload = () => {
    window.print(); // Triggers the browser's native print/save-as-pdf dialog
  };

  return (
    <div className="animate-fade-in w-full">
      {/* Top Action Bar - Hidden during print via 'no-print' class */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-6 border-b border-gray-100 no-print">
        <button 
          onClick={onReset} 
          className="text-primary font-semibold hover:text-primary-dark flex items-center gap-2 transition-colors group"
        >
          <svg className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Create New Plan
        </button>
        
        <button 
          onClick={handleDownload}
          title="Opens the print dialog. Choose 'Save as PDF' as the destination to download."
          className="flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-xl hover:bg-gray-800 transition-all shadow-sm active:scale-[0.98] font-medium text-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
          Save as PDF
        </button>
      </div>

      {/* The Styled Document - This is what gets printed */}
      <div id="plan-document" className="bg-white p-8 sm:p-12 rounded-2xl shadow-sm border border-gray-100">
        <ReactMarkdown 
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({node, ...props}) => <h1 className="text-3xl font-extrabold text-primary border-b-2 border-primary/20 pb-3 mb-6 mt-8 first:mt-0" {...props} />,
            h2: ({node, ...props}) => <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4 flex items-center gap-2" {...props} />,
            h3: ({node, ...props}) => <h3 className="text-lg font-bold text-gray-800 mt-6 mb-3 border-l-4 border-primary pl-3" {...props} />,
            h4: ({node, ...props}) => <h4 className="text-base font-semibold text-gray-700 mt-4 mb-2" {...props} />,
            p: ({node, ...props}) => <p className="text-gray-600 leading-relaxed mb-4 text-[15px]" {...props} />,
            ul: ({node, ...props}) => <ul className="space-y-2 mb-4 ml-5" {...props} />,
            ol: ({node, ...props}) => <ol className="space-y-2 mb-4 ml-5 list-decimal" {...props} />,
            li: ({node, ...props}) => <li className="text-gray-600 text-[15px] flex items-start gap-2" {...props}>
              <span className="text-primary mt-1.5 block w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0"></span>
              <span>{props.children}</span>
            </li>,
            strong: ({node, ...props}) => <strong className="font-bold text-gray-900" {...props} />,
            blockquote: ({node, ...props}) => <blockquote className="bg-cream/50 border-l-4 border-primary p-4 rounded-r-xl my-6 text-gray-700 italic" {...props} />,
            hr: ({node, ...props}) => <hr className="my-8 border-gray-100" {...props} />,
          }}
        >
          {markdown}
        </ReactMarkdown>
      </div>
    </div>
  );
}