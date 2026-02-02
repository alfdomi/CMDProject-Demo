import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart3,
  ShieldAlert,
  FileSearch,
  TrendingUp,
  LayoutDashboard,
  Cpu,
  RefreshCw,
  Shield,
  Zap,
  LineChart
} from 'lucide-react';
import LaborIntelligence from './views/LaborIntelligence.tsx';
import Automation from './views/Automation.tsx';
import Reporting from './views/Reporting.tsx';
import FinanceAnalytics from './views/FinanceAnalytics.tsx';
import UnionManagement from './views/UnionManagement.tsx';
import FinancialTrends from './views/FinancialTrends.tsx';
import AutomationHub from './views/AutomationHub.tsx';
import { API_BASE_URL } from './api';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { FinanceProvider, useFinanceContext } from './contexts/FinanceContext.tsx';


const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('labor');
  const [insight, setInsight] = useState<string>('');
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'ai', content: string }[]>([]);
  const [userQuery, setUserQuery] = useState<string>('');
  const [aiConfig, setAiConfig] = useState<{ provider: string, model: string } | null>(null);
  const [isThinking, setIsThinking] = useState<boolean>(false);
  const { selectedProject, currentProjectData } = useFinanceContext();

  const fetchInsight = useCallback(async (query?: string) => {
    setIsThinking(true);
    if (query) {
      setChatHistory(prev => [...prev, { role: 'user', content: query }]);
    }

    try {
      let url = `${API_BASE_URL}/agent/insights?view=${activeTab}`;

      if (activeTab === 'finance') {
        url += `&project_filter=${selectedProject}`;
      }

      const body = {
        ...(activeTab === 'finance' ? currentProjectData || {} : {}),
        query: query,
        history: chatHistory.map(msg => ({ role: msg.role === 'ai' ? 'assistant' : 'user', content: msg.content }))
      };

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();

      if (query) {
        setChatHistory(prev => [...prev, { role: 'ai', content: data.insight }]);
        setUserQuery('');
      } else {
        setInsight(data.insight);
      }
    } catch (err) {
      console.error('Error fetching insights:', err);
      const errorMsg = 'Error fetching AI insights. Check connection.';
      if (query) {
        setChatHistory(prev => [...prev, { role: 'ai', content: errorMsg }]);
      } else {
        setInsight(errorMsg);
      }
    } finally {
      setIsThinking(false);
    }
  }, [activeTab, selectedProject, currentProjectData, chatHistory]);

  const handleRefresh = () => {
    setChatHistory([]);
    setInsight('');
    fetchInsight();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && userQuery.trim() && !isThinking) {
      fetchInsight(userQuery);
    }
  };

  const fetchConfig = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/agent/config`);
      const data = await res.json();
      setAiConfig(data);
    } catch (err) {
      console.error('Error fetching AI config:', err);
    }
  };

  useEffect(() => {
    fetchInsight();
    fetchConfig();
  }, [activeTab, selectedProject]); // Refetch on tab or project change

  const tabs = [
    { id: 'labor', name: 'Labor Intelligence', icon: BarChart3 },
    { id: 'unions', name: 'Union Management', icon: Shield },
    { id: 'automation', name: 'Anomaly Detection', icon: ShieldAlert },
    { id: 'process', name: 'Automation Hub', icon: Zap },
    { id: 'reporting', name: 'Reporting', icon: FileSearch },
    { id: 'finance', name: 'Finance Analytics', icon: TrendingUp },
    { id: 'trends', name: 'Financial Trends', icon: LineChart },
  ];

  return (
    <div className="min-h-screen flex flex-col max-w-[1920px] mx-auto">
      {/* Sidebar / Top Nav */}
      <nav className="bg-dark-lighter border-b border-white border-opacity-10 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <LayoutDashboard className="text-primary-500 w-8 h-8" />
            <h1 className="text-xl font-bold tracking-tight">CWC <span className="text-primary-400 font-light text-sm ml-2 border-l border-white/20 pl-2">2029 MODERNIZATION</span></h1>
          </div>
          <div className="flex space-x-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${activeTab === tab.id ? 'tab-active' : 'tab-inactive'
                  }`}
              >
                <tab.icon size={18} />
                <span>{tab.name}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="flex-grow flex overflow-hidden">
        {/* Left: View Content */}
        <main className="flex-grow p-6 overflow-y-auto custom-scrollbar">
          <div className="max-w-5xl mx-auto">
            {activeTab === 'labor' && <LaborIntelligence />}
            {activeTab === 'unions' && <UnionManagement />}
            {activeTab === 'automation' && <Automation />}
            {activeTab === 'process' && <AutomationHub />}
            {activeTab === 'reporting' && <Reporting />}
            {activeTab === 'finance' && <FinanceAnalytics />}
            {activeTab === 'trends' && <FinancialTrends />}
          </div>
        </main>

        {/* Right: AI Lateral Panel */}
        <aside className="w-96 max-h-[900px] border-l border-white/10 bg-white/5 backdrop-blur-md flex flex-col overflow-hidden shadow-2xl">
          <div className="p-6 border-b border-white/10 flex items-center justify-between bg-black/10">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg transition-all duration-1000 ${isThinking ? 'bg-primary-500 animate-pulse scale-110' : 'bg-primary-600'}`}>
                <Cpu size={20} className={isThinking ? 'animate-spin' : ''} />
              </div>
              <div>
                <h2 className="text-sm font-bold uppercase tracking-widest text-primary-400">AI Expert</h2>
                <div className="flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                  <p className="text-[10px] opacity-70 uppercase font-medium">Context: {activeTab}</p>
                </div>
              </div>
            </div>
            <button
              onClick={handleRefresh}
              disabled={isThinking}
              className="p-2 hover:bg-white/10 rounded-lg transition-all text-gray-400 hover:text-white disabled:opacity-30"
              title="Refresh Baseline Insight"
            >
              <RefreshCw size={18} className={isThinking ? 'animate-spin' : ''} />
            </button>
          </div>

          <div className="flex-grow overflow-y-auto p-6 custom-scrollbar space-y-6">
            {aiConfig && (
              <div className="flex justify-center">
                <span className="text-[9px] bg-primary-600/10 text-primary-400 px-3 py-1 rounded-full border border-primary-600/20 uppercase tracking-tighter">
                  {aiConfig.provider} • {aiConfig.model}
                </span>
              </div>
            )}

            {/* Initial Context Insight */}
            <div className={`transition-opacity duration-300 ${isThinking && !chatHistory.length ? 'opacity-50' : 'opacity-100'}`}>
              <div className="markdown-content">
                {insight ? (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {insight}
                  </ReactMarkdown>
                ) : (
                  <div className="flex items-center space-x-2 py-4">
                    <span className="w-1 h-1 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-1 h-1 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-1 h-1 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    <span className="ml-2 italic text-xs text-gray-500">Initializing analytical context...</span>
                  </div>
                )}
              </div>
            </div>

            {/* Chat History */}
            {chatHistory.map((msg, i) => (
              <div key={i} className={`p-4 rounded-xl border ${msg.role === 'user' ? 'bg-primary-600/10 border-primary-500/20' : 'bg-white/5 border-white/5'}`}>
                <div className="text-[10px] uppercase font-bold text-gray-500 mb-2 flex items-center space-x-2">
                  <span className={msg.role === 'user' ? 'text-primary-400' : 'text-primary-600'}>
                    {msg.role === 'user' ? 'Question' : 'AI Analysis'}
                  </span>
                </div>
                <div className="markdown-content prose-invert prose-sm max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {msg.content}
                  </ReactMarkdown>
                </div>
              </div>
            ))}

            {isThinking && chatHistory.length > 0 && chatHistory[chatHistory.length - 1].role === 'user' && (
              <div className="flex items-center space-x-2 p-4 bg-white/5 rounded-xl border border-white/5">
                <span className="w-1 h-1 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-1 h-1 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-1 h-1 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                <span className="ml-2 italic text-[11px] text-gray-400">Expert is formulating response...</span>
              </div>
            )}
          </div>

          {/* User Input - Always Visible Outside Scroll */}
          <div className="p-4 bg-dark-lighter border-t border-white/10 shadow-inner">
            <div className="relative group">
              <input
                type="text"
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={`Ask about ${activeTab} data...`}
                disabled={isThinking}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600/50 transition-all placeholder:text-gray-600 disabled:opacity-50"
              />
              <button
                onClick={() => fetchInsight(userQuery)}
                disabled={!userQuery.trim() || isThinking}
                className={`absolute right-2 top-1.5 p-2 rounded-lg transition-all ${userQuery.trim() && !isThinking ? 'text-primary-500 hover:bg-primary-500/20' : 'text-gray-600 cursor-not-allowed'}`}
              >
                <Zap size={18} fill={userQuery.trim() && !isThinking ? "currentColor" : "none"} />
              </button>
            </div>
            <div className="mt-3 text-[9px] text-gray-600 flex justify-between items-center px-1">
              <span>Press ENTER to Send</span>
              <span className="opacity-50 uppercase tracking-tighter">Powered by {aiConfig?.provider || 'Ollama'}</span>
            </div>
          </div>
        </aside>
      </div>

      {/* Mini Footer */}
      <footer className="bg-dark-lighter border-t border-white/5 py-2 px-6">
        <div className="flex justify-between items-center text-[10px] text-gray-500 uppercase tracking-widest">
          <span>System Status: Optimal</span>
          <span>Last Sync: {new Date().toLocaleTimeString()}</span>
        </div>
      </footer>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <FinanceProvider>
      <AppContent />
    </FinanceProvider>
  );
};

export default App;
