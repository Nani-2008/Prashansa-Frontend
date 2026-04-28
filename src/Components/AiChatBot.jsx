import React, { useState, useRef, useEffect } from 'react';
import { Scale, Send, Loader2, RotateCcw, AlertCircle, ChevronDown } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { motion, AnimatePresence } from 'framer-motion';

const API_KEY = "AIzaSyBvbNik60j_mbfgaTPJY3-v18LvwX2AqLE";
const genAI = new GoogleGenerativeAI(API_KEY);

const SYSTEM_INSTRUCTION = `You are a specialized legal assistant for the PRASHANSA platform. Your sole purpose is to answer questions related to law, legal procedures, and legal rights. If the user asks about anything else that is not related to law, you must respond with exactly 'Invalid query. I can only assist with legal matters.' and nothing else.

IMPORTANT: Always structure your response using markdown headers (##) to divide your answer into clear sections. For example use sections like:
## Applicable Laws
## Your Rights
## Recommended Actions
## Key Points
## Penalties
## Legal Procedures

Each section should have a brief, clear explanation. Use **bold** for key terms and bullet points where helpful. Keep each section concise.`;

const SECTION_COLORS = [
  { bg: 'bg-blue-50 dark:bg-blue-500/10', border: 'border-blue-100 dark:border-blue-500/20', label: 'text-blue-600 dark:text-blue-400', chevron: 'text-blue-400' },
  { bg: 'bg-emerald-50 dark:bg-emerald-500/10', border: 'border-emerald-100 dark:border-emerald-500/20', label: 'text-emerald-600 dark:text-emerald-400', chevron: 'text-emerald-400' },
  { bg: 'bg-violet-50 dark:bg-violet-500/10', border: 'border-violet-100 dark:border-violet-500/20', label: 'text-violet-600 dark:text-violet-400', chevron: 'text-violet-400' },
  { bg: 'bg-amber-50 dark:bg-amber-500/10', border: 'border-amber-100 dark:border-amber-500/20', label: 'text-amber-600 dark:text-amber-400', chevron: 'text-amber-400' },
  { bg: 'bg-rose-50 dark:bg-rose-500/10', border: 'border-rose-100 dark:border-rose-500/20', label: 'text-rose-600 dark:text-rose-400', chevron: 'text-rose-400' },
  { bg: 'bg-cyan-50 dark:bg-cyan-500/10', border: 'border-cyan-100 dark:border-cyan-500/20', label: 'text-cyan-600 dark:text-cyan-400', chevron: 'text-cyan-400' },
];

/* Collapsible section card — controlled via props */
const SectionCard = ({ title, body, color, formatLine, expanded, onToggle }) => {
  const lines = body.split('\n').filter(l => l.trim());
  const summary = lines[0] || '';

  return (
    <div
      className={`${color.bg} ${color.border} border rounded-[16px] cursor-pointer transition-all duration-300 hover:shadow-sm ${expanded ? 'col-span-2' : ''}`}
      onClick={onToggle}
    >
      <div className="flex items-center justify-between p-4">
        <div className="flex-1 min-w-0">
          <h5 className={`text-[11px] font-bold tracking-widest uppercase mb-1 ${color.label}`}>{title}</h5>
          {!expanded && (
            <p className="text-[13px] text-[#86868b] dark:text-[#a1a1a6] truncate" dangerouslySetInnerHTML={{ __html: formatLine(summary) }} />
          )}
        </div>
        <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }} className="flex-shrink-0 ml-3">
          <ChevronDown size={18} className={color.chevron} />
        </motion.div>
      </div>
      {expanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden"
        >
          <div className="px-4 pb-4 text-[14px] leading-relaxed text-[#1d1d1f] dark:text-white/90">
            {lines.map((line, i) => (
              <p key={i} className={i > 0 ? "mt-1.5" : ""} dangerouslySetInnerHTML={{ __html: formatLine(line) }} />
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

const AiChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasQueried, setHasQueried] = useState(false);
  const [analysisResult, setAnalysisResult] = useState('');
  const [expandedIdx, setExpandedIdx] = useState(null);

  const chatSessionRef = useRef(null);
  const resultEndRef = useRef(null);
  const panelRef = useRef(null);

  useEffect(() => {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash", systemInstruction: SYSTEM_INSTRUCTION });
      chatSessionRef.current = model.startChat({ history: [] });
    } catch (error) {
      console.error("Failed to initialize Gemini AI:", error);
    }
  }, []);

  const handleAnalyze = async (e) => {
    e?.preventDefault();
    if (!input.trim() || isAnalyzing) return;
    const userText = input.trim();
    setIsAnalyzing(true);
    setHasQueried(true);
    setAnalysisResult('');
    try {
      if (!chatSessionRef.current) throw new Error("Chat session not initialized");
      const result = await chatSessionRef.current.sendMessage(userText);
      setAnalysisResult(result.response.text());
    } catch (error) {
      console.error("Error analyzing:", error);
      setAnalysisResult('Sorry, I encountered an error. Please try again later.');
    } finally {
      setIsAnalyzing(false);
      setTimeout(() => { resultEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, 100);
    }
  };

  const handleReset = () => { setInput(''); setHasQueried(false); setAnalysisResult(''); setExpandedIdx(null); };

  const formatLine = (line) => {
    let html = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    return html;
  };

  const renderStructured = (text) => {
    const parts = text.split(/^##\s+/m);
    const intro = parts[0]?.trim();
    const sections = parts.slice(1).map(part => {
      const nl = part.indexOf('\n');
      if (nl === -1) return { title: part.trim(), body: '' };
      return { title: part.substring(0, nl).trim(), body: part.substring(nl + 1).trim() };
    });

    if (sections.length === 0) {
      return (
        <div className="bg-white dark:bg-[#1e1e1e] p-5 rounded-[20px] shadow-sm border border-gray-100 dark:border-white/10 text-[14px] leading-relaxed text-[#1d1d1f] dark:text-white/90">
          {text.split('\n').map((line, i) => (
            <p key={i} className={i > 0 ? "mt-2" : ""} dangerouslySetInnerHTML={{ __html: formatLine(line) }} />
          ))}
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-3">
        {intro && (
          <div className="bg-white dark:bg-[#1e1e1e] p-4 rounded-[16px] shadow-sm border border-gray-100 dark:border-white/10 text-[14px] leading-relaxed text-[#1d1d1f] dark:text-white/90">
            {intro.split('\n').filter(l => l.trim()).map((line, i) => (
              <p key={i} className={i > 0 ? "mt-2" : ""} dangerouslySetInnerHTML={{ __html: formatLine(line) }} />
            ))}
          </div>
        )}
        {/* All sections in a 2-col grid; expanded cards span full width */}
        <div className="grid grid-cols-2 gap-3">
          {sections.map((sec, idx) => (
            <SectionCard
              key={idx}
              title={sec.title}
              body={sec.body}
              color={SECTION_COLORS[idx % SECTION_COLORS.length]}
              formatLine={formatLine}
              expanded={expandedIdx === idx}
              onToggle={() => setExpandedIdx(expandedIdx === idx ? null : idx)}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-[100] w-14 h-14 bg-[#5c4dff] text-white rounded-full flex items-center justify-center shadow-[0_8px_20px_rgba(92,77,255,0.3)] hover:bg-[#4b3cfa] hover:scale-105 active:scale-95 transition-all duration-300"
          title="Legal AI Assistant"
        >
          <Scale size={24} />
        </button>
      )}

      {/* Backdrop + Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Blurred backdrop — click to close */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[99] bg-black/30 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />

            {/* Chat panel */}
            <motion.div
              ref={panelRef}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.95 }}
              transition={{ duration: 0.25 }}
              className="fixed bottom-6 right-6 z-[100] w-[380px] sm:w-[420px] h-[600px] max-h-[85vh] bg-white dark:bg-[#121212] rounded-[24px] shadow-[0_20px_60px_rgba(0,0,0,0.2)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.6)] border border-gray-100 dark:border-white/10 flex flex-col overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header — no X button */}
              <div className="flex items-center gap-3 px-6 py-4 flex-none border-b border-gray-100 dark:border-white/10">
                <div className="p-2 bg-[#5c4dff] rounded-full shadow-sm">
                  <Scale size={20} className="text-white" />
                </div>
                <h3 className="font-bold text-[17px] text-[#1d1d1f] dark:text-white">Legal AI Agent</h3>
              </div>

              {/* Scrollable Body */}
              <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#fbfbfd] dark:bg-[#151515] p-6 flex flex-col">

                {/* Input Area */}
                <motion.div
                  layout
                  initial={false}
                  animate={{
                    flex: hasQueried ? "0 0 auto" : "1 1 auto",
                    justifyContent: hasQueried ? "flex-start" : "center",
                    paddingTop: hasQueried ? "0px" : "40px"
                  }}
                  className="flex flex-col w-full z-10"
                >
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Describe your legal issue or ask a question about the law..."
                    disabled={isAnalyzing}
                    rows={4}
                    className="w-full bg-white dark:bg-[#1e1e1e] text-[#1d1d1f] dark:text-white text-[15px] p-4 rounded-[20px] outline-none focus:ring-2 focus:ring-[#5c4dff]/40 border border-gray-200 dark:border-white/10 disabled:opacity-70 transition-all resize-none shadow-sm"
                  />
                  <button
                    onClick={handleAnalyze}
                    disabled={!input.trim() || isAnalyzing}
                    className="mt-4 w-full py-3.5 bg-gradient-to-r from-[#5c4dff] to-[#7c6bff] text-white rounded-[16px] flex items-center justify-center gap-2 font-semibold text-[15px] disabled:opacity-50 transition-all shadow-[0_4px_14px_rgba(92,77,255,0.3)] hover:shadow-[0_6px_20px_rgba(92,77,255,0.4)] active:scale-[0.98]"
                  >
                    {isAnalyzing ? (
                      <><Loader2 size={18} className="animate-spin" /> Analyzing...</>
                    ) : (
                      <><Send size={18} /> Analyze Case</>
                    )}
                  </button>
                </motion.div>

                {/* Results */}
                <AnimatePresence>
                  {hasQueried && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-8 flex flex-col gap-4 flex-1"
                    >
                      <div className="flex items-center gap-4">
                        <h4 className="text-[12px] font-bold tracking-widest text-[#86868b] dark:text-[#a1a1a6] uppercase">
                          AI Legal Analysis
                        </h4>
                        <div className="flex-1 h-px bg-gray-200 dark:bg-white/10"></div>
                      </div>

                      {isAnalyzing ? (
                        <div className="bg-white dark:bg-[#1e1e1e] p-5 rounded-[20px] shadow-sm border border-gray-100 dark:border-white/10">
                          <div className="flex flex-col gap-3 py-4">
                            <div className="h-4 bg-gray-200 dark:bg-white/10 rounded animate-pulse w-3/4"></div>
                            <div className="h-4 bg-gray-200 dark:bg-white/10 rounded animate-pulse w-full"></div>
                            <div className="h-4 bg-gray-200 dark:bg-white/10 rounded animate-pulse w-5/6"></div>
                            <div className="h-4 bg-gray-200 dark:bg-white/10 rounded animate-pulse w-2/3 mt-2"></div>
                            <div className="h-4 bg-gray-200 dark:bg-white/10 rounded animate-pulse w-full"></div>
                          </div>
                        </div>
                      ) : (
                        renderStructured(analysisResult)
                      )}

                      {!isAnalyzing && (
                        <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-500/10 rounded-[16px] border border-amber-100 dark:border-amber-500/20 flex gap-3">
                          <AlertCircle size={18} className="text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
                          <p className="text-[13px] text-amber-800 dark:text-amber-200/80 leading-relaxed">
                            AI suggestions are informational only and do not constitute formal legal advice. Always consult a qualified lawyer.
                          </p>
                        </div>
                      )}

                      {!isAnalyzing && (
                        <button
                          onClick={handleReset}
                          className="mt-4 flex items-center justify-center gap-2 py-3 text-[14px] font-semibold text-[#86868b] dark:text-[#a1a1a6] hover:text-[#1d1d1f] dark:hover:text-white transition-colors"
                        >
                          <RotateCcw size={16} /> Check different issue
                        </button>
                      )}
                      <div ref={resultEndRef} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default AiChatBot;
