import { useState, useRef, useEffect } from 'react';
import { chatWithPlan } from '../lib/api';
import { fetchPlanChats, saveChatMessage } from '../lib/supabaseApi';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function ChatPanel({ planMarkdown, planId, userId, isGuest }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  // Load chat history when planId changes
  useEffect(() => {
    if (planId && !isGuest) {
      fetchPlanChats(planId).then(history => {
        setMessages(history || []);
      }).catch(console.error);
    } else {
      setMessages([]); // Clear chat for new plans or guests
    }
  }, [planId, isGuest]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    const newMessages = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      // Save user message to Supabase
      if (!isGuest && planId && userId) {
        await saveChatMessage(userId, planId, 'user', userMessage);
      }

      const historyForApi = newMessages.slice(0, -1).map(m => ({
        role: m.role,
        content: m.content
      }));

      const aiResponse = await chatWithPlan(planMarkdown, userMessage, historyForApi);
      setMessages([...newMessages, { role: 'assistant', content: aiResponse }]);

      // Save AI response to Supabase
      if (!isGuest && planId && userId) {
        await saveChatMessage(userId, planId, 'assistant', aiResponse);
      }
    } catch (error) {
      setMessages([...newMessages, { role: 'assistant', content: "Sorry, I couldn't connect to the analysis engine." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="fixed bottom-8 right-8 z-50 w-16 h-16 bg-primary text-white rounded-full shadow-glow flex items-center justify-center hover:scale-110 transition-transform active:scale-95 animate-scale-in"
          aria-label="Open Chat"
        >
          <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 3v-3z" />
          </svg>
          {messages.length === 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></span>
          )}
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-8 right-8 z-50 w-[calc(100vw-4rem)] sm:w-96 h-[60vh] sm:h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden animate-scale-in">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-cream/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-glow">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 3v-3z" /></svg>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm">Chat with your Plan</h3>
                <p className="text-xs text-gray-500">
                  {isGuest ? "History not saved for guests" : "History saved to your account"}
                </p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-cream/10">
            {messages.length === 0 ? (
              <div className="text-center text-gray-400 mt-20">
                <svg className="w-16 h-16 mx-auto mb-4 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 3v-3z" /></svg>
                <p className="text-sm">Try asking: "How can I reduce my setup costs?"</p>
              </div>
            ) : (
              messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                  <div className={`max-w-[85%] p-3 rounded-2xl ${msg.role === 'user' ? 'bg-primary text-white rounded-br-sm' : 'bg-white text-gray-700 border border-gray-100 rounded-bl-sm shadow-sm'}`}>
                    {msg.role === 'user' ? (
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    ) : (
                      <div className="text-sm">
                        <ReactMarkdown 
                          remarkPlugins={[remarkGfm]}
                          components={{
                            p: ({node, ...props}) => <p className="mb-2 last:mb-0 leading-relaxed text-gray-600" {...props} />,
                            ul: ({node, ...props}) => <ul className="list-disc pl-4 mb-2 space-y-1 text-gray-600" {...props} />,
                            ol: ({node, ...props}) => <ol className="list-decimal pl-4 mb-2 space-y-1 text-gray-600" {...props} />,
                            li: ({node, ...props}) => <li className="text-sm" {...props} />,
                            strong: ({node, ...props}) => <strong className="font-bold text-gray-900" {...props} />,
                            a: ({node, ...props}) => <a className="text-primary underline hover:text-primary-dark" {...props} />,
                            code: ({node, ...props}) => <code className="bg-gray-100 text-primary p-1 rounded text-xs font-mono" {...props} />,
                            h3: ({node, ...props}) => <h3 className="font-bold text-gray-900 mt-2 mb-1 text-sm" {...props} />,
                            blockquote: ({node, ...props}) => <blockquote className="border-l-2 border-primary pl-2 italic text-gray-500 my-1 text-xs" {...props} />
                          }}
                        >
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
            
            {loading && (
              <div className="flex justify-start animate-fade-in">
                <div className="bg-white p-4 rounded-2xl rounded-bl-sm border border-gray-100 shadow-sm">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></span>
                    <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-3 border-t border-gray-100 bg-white">
            <div className="flex gap-2 items-end">
              <textarea 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Ask about this plan..."
                rows="1"
                className="flex-1 p-3 bg-cream/30 border border-gray-200 rounded-xl outline-none transition-all duration-300 focus:ring-4 focus:ring-primary/20 focus:border-primary focus:bg-white resize-none text-sm"
              />
              <button 
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="w-12 h-12 bg-primary text-white rounded-xl flex items-center justify-center hover:bg-primary-dark transition-all shadow-glow active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}