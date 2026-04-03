import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Info, ShieldAlert, FileText, Plus, Search } from 'lucide-react';
import { verifyClaim, getHistory, getConversationDetails } from '../services/api';

const MedicalFactChecker = () => {
  const [claim, setClaim] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [selectedConvoId, setSelectedConvoId] = useState(null);
  const [activeResults, setActiveResults] = useState([]);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await getHistory();
      setHistory(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("History Load Error:", error);
      setHistory([]);
    }
  };

  const parseCitations = (citations) => {
    try {
      if (typeof citations === 'string') return JSON.parse(citations);
      if (Array.isArray(citations)) return citations;
      return [];
    } catch (e) { return []; }
  };

  const loadConversation = async (id) => {
    setLoading(true);
    setSelectedConvoId(id);
    try {
      const response = await getConversationDetails(id);
      const data = Array.isArray(response.data) ? response.data : [];
      const formatted = data.map(item => ({
        ...item,
        citations: parseCitations(item.citations)
      }));
      setActiveResults(formatted);
    } catch (error) {
      console.error("Report Load Error:", error);
      setActiveResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    if (e) e.preventDefault();
    if (!claim || loading) return;
    setLoading(true);
    try {
      const response = await verifyClaim(claim, selectedConvoId);
      const data = response.data;
      const newResult = {
        ...data,
        citations: parseCitations(data.citations)
      };
      if (!selectedConvoId) {
        setSelectedConvoId(newResult.conversation_id);
        setActiveResults([newResult]);
        fetchHistory();
      } else {
        setActiveResults(prev => [...(prev || []), newResult]);
      }
      setClaim('');
    } catch (error) {
      console.error("Verification Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleVerify();
    }
  };

  const getVerdictStyle = (verdict) => {
    switch (verdict) {
      case 'TRUE': return 'border-green-500 bg-white';
      case 'FALSE': return 'border-red-500 bg-white';
      case 'MISLEADING': return 'border-amber-500 bg-white';
      default: return 'border-slate-300 bg-white';
    }
  };

  return (
    <div className="flex h-screen w-screen bg-slate-50 overflow-hidden font-sans text-slate-900 m-0 p-0">
      {/* Updated Sidebar */}
      <aside className="w-72 bg-[#1e293b] text-slate-300 flex flex-col shadow-2xl h-full">
        <div className="p-6">
          <div className="mb-8">
            <span className="font-bold tracking-tighter text-2xl text-white">SwasthyaSathi</span>
          </div>
          <button 
            onClick={() => { setSelectedConvoId(null); setActiveResults([]); setClaim(''); }}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg"
          >
            <Plus size={20} /> New Analysis
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto px-4 pb-6">
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2 mb-4">Medical Reports</h3>
          {history.map((convo) => (
            <button
              key={convo.id}
              onClick={() => loadConversation(convo.id)}
              className={`w-full text-left p-4 rounded-xl mb-2 transition-all flex items-center gap-3 border ${
                selectedConvoId === convo.id 
                ? 'bg-slate-800 border-slate-700 text-white shadow-lg' 
                : 'border-transparent hover:bg-slate-800/50 hover:text-slate-100'
              }`}
            >
              <FileText size={18} className={selectedConvoId === convo.id ? 'text-blue-400' : 'opacity-30'} />
              <div className="flex flex-col">
                <span className="text-sm font-bold">Report #{convo.id}</span>
                <span className="text-[10px] opacity-40 font-medium">{new Date(convo.created_at).toLocaleDateString()}</span>
              </div>
            </button>
          ))}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden h-full">
        <div className="flex-1 overflow-y-auto px-8 pt-12 pb-40">
          <div className="max-w-3xl mx-auto">
            <header className="mb-10">
              <h1 className="text-4xl font-black text-slate-900 mb-2">Fact-Checker</h1>
              <div className="h-1 w-20 bg-blue-600 rounded-full"></div>
            </header>

            <div className="mb-10 p-5 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-4">
              <ShieldAlert className="text-amber-600 flex-shrink-0" size={24} />
              <p className="text-sm text-amber-900 leading-relaxed font-medium">
                <strong>Disclaimer:</strong> This tool uses AI and can make mistakes. Always consult a doctor.
              </p>
            </div>

            <div className="space-y-8">
              {activeResults.map((check) => (
                <div key={check.id} className={`border-l-[8px] rounded-2xl shadow-sm border ${getVerdictStyle(check.verdict)}`}>
                  <div className="p-8">
                    <div className="flex justify-between items-start gap-4 mb-6">
                      <h2 className="text-xl font-bold text-slate-800 leading-snug">"{check.user_claim}"</h2>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`px-4 py-1.5 rounded-lg text-[11px] font-black tracking-tighter ${
                          check.verdict === 'TRUE' ? 'bg-green-600 text-white' : 
                          check.verdict === 'FALSE' ? 'bg-red-600 text-white' : 'bg-amber-500 text-white'
                        }`}>
                          {check.verdict}
                        </span>
                        <span className="text-[10px] font-black text-slate-400 uppercase">Confidence: {check.confidence}</span>
                      </div>
                    </div>
                    <div className="prose prose-slate max-w-none text-slate-700 font-medium leading-relaxed mb-10">
                      <ReactMarkdown>{check.explanation}</ReactMarkdown>
                    </div>
                    <div className="border-t border-slate-100 pt-6">
                      <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-4">
                        <Info size={14} /> Medical References
                      </h4>
                      <ul className="space-y-3">
                        {check.citations?.map((cite, idx) => (
                          <li key={idx} className="text-xs text-slate-500 flex gap-3 items-start bg-slate-50 p-3 rounded-lg border border-slate-100">
                            <span className="text-blue-600 font-bold">[{idx + 1}]</span>
                            <span className="leading-normal">{cite}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Input Area */}
        <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-slate-50 via-slate-50 to-transparent">
          <div className="max-w-3xl mx-auto relative">
            <textarea
              className="w-full p-6 pr-40 bg-white border-2 border-slate-200 rounded-3xl shadow-2xl focus:border-blue-600 outline-none transition-all resize-none text-slate-800 font-medium placeholder-slate-400"
              placeholder="Type medical claim and press Enter..."
              rows="2"
              value={claim}
              onChange={(e) => setClaim(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button
              disabled={loading}
              onClick={handleVerify}
              className="absolute right-3 bottom-3 bg-slate-900 hover:bg-black text-white font-black py-4 px-10 rounded-2xl transition-all disabled:opacity-50 text-sm flex items-center gap-2 shadow-xl"
            >
              {loading ? 'Verifying...' : 'Verify'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MedicalFactChecker;