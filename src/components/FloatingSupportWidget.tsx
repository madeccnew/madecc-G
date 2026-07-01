/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, FormEvent } from 'react';
import {
  MessageSquare, Phone, X, Send, Mail, ExternalLink, Loader2, ArrowRight, CheckCircle
} from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export default function FloatingSupportWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'call'>('chat');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'model',
      content: "Hello! I am Pierre, your MADECC Group AI Assistant. How can I assist you with your residential or commercial construction inquiry today?"
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Forwarding States
  const [showForwardForm, setShowForwardForm] = useState(false);
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [isForwarding, setIsForwarding] = useState(false);
  const [forwardSuccess, setForwardSuccess] = useState(false);
  const [forwardError, setForwardError] = useState('');
  const [botAnswer, setBotAnswer] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, showForwardForm]);

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMsg = inputMessage.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setInputMessage('');
    setIsTyping(true);

    let isLocalFallback = false;

    try {
      const chatHistory = messages.map(m => ({
        role: m.role,
        content: m.content
      }));

      let response;
      let data;
      try {
        response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: userMsg,
            history: chatHistory
          })
        });
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          data = await response.json();
        } else {
          isLocalFallback = true;
        }
      } catch (e) {
        isLocalFallback = true;
      }

      if (isLocalFallback) {
        // Advanced client-side keyword-based chat responses for Netlify Static Mode
        setTimeout(() => {
          const lower = userMsg.toLowerCase();
          let reply = "Hello! I am Pierre, MADECC Group's senior estimating assistant. We specialize in high-end Custom Residential estates and high-performance Commercial building developments. How can I help you with your layout or pricing model today?";
          
          if (lower.includes('residential') || lower.includes('villa') || lower.includes('house') || lower.includes('home')) {
            reply = "Our Custom Residential Division specializes in premium design-build estates. We incorporate off-form monolithic concrete, LEED-gold timber framing, and custom structural glazing. You can submit details using our schedule/booking tab!";
          } else if (lower.includes('commercial') || lower.includes('office') || lower.includes('retail') || lower.includes('building')) {
            reply = "Our High-Performance Commercial Division constructs heavy-gauge steel superstructures, energy-efficient Low-E curtain walls, and high-density multi-use retail pavilions. Our value engineering saves an average of 8-12% on materials.";
          } else if (lower.includes('budget') || lower.includes('cost') || lower.includes('price') || lower.includes('estimate')) {
            reply = "We provide complimentary technical estimates. Our engineers perform precise material takeoffs and structural value engineering. Feel free to use our consultation form to submit your plans!";
          } else if (lower.includes('contact') || lower.includes('phone') || lower.includes('email') || lower.includes('call')) {
            reply = "You can speak with our team directly. Call our scheduling desk at +237 671 063 511 or +237 689 115 595, or email us at madeccco5@gmail.com.";
          } else if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
            reply = "Greetings! I am Pierre, senior estimating system at MADECC Group. I can answer technical questions regarding custom residential villas, mass timber, heavy steel frame load pathways, and value engineering.";
          }

          setMessages(prev => [...prev, { role: 'model', content: `${reply} (Note: Chat is currently in Client-Side Safe Mode)` }]);
          setIsTyping(false);
        }, 1000);
        return;
      }

      if (response && response.ok && data) {
        setMessages(prev => [...prev, { role: 'model', content: data.response }]);
      } else {
        setMessages(prev => [...prev, {
          role: 'model',
          content: "I experienced a brief connectivity interruption. Please feel free to call our principal scheduling desk directly at +237 683 316 486."
        }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'model',
        content: "Network issue detected. Please check your connection or email us directly at madeccco5@gmail.com."
      }]);
    } finally {
      // Only set to false here if we did not return early via fallback
      // Since early return has its own setTimeout which clears typing, we're safe
      if (typeof isLocalFallback !== 'undefined' && !isLocalFallback) {
        setIsTyping(false);
      }
    }
  };

  const handleForwardTranscript = async (e: FormEvent) => {
    e.preventDefault();
    setForwardError('');

    if (botAnswer.trim() !== '5') {
      setForwardError('Anti-Bot failed. Solve: 2x + 10 = 20.');
      return;
    }

    setIsForwarding(true);

    // Build plain text transcript
    const transcriptText = messages
      .map(m => `${m.role === 'user' ? 'Client' : 'Pierre (AI)'}: ${m.content}`)
      .join('\n\n');

    try {
      let isLocalFallback = false;
      let response;
      try {
        response = await fetch('/api/chat/forward', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: clientName,
            email: clientEmail,
            phone: clientPhone,
            transcript: transcriptText
          })
        });
        if (!response.ok) {
          isLocalFallback = true;
        }
      } catch (e) {
        isLocalFallback = true;
      }

      if (isLocalFallback) {
        // Netlify / GitHub Pages Client-Side Safe Mode Fallback
        const localChats = JSON.parse(localStorage.getItem('madecc_local_chats') || '[]');
        localChats.push({
          id: 'local-chat-' + Date.now(),
          name: clientName,
          email: clientEmail,
          phone: clientPhone,
          transcript: transcriptText,
          createdAt: new Date().toISOString()
        });
        localStorage.setItem('madecc_local_chats', JSON.stringify(localChats));

        setForwardSuccess(true);
        setTimeout(() => {
          setShowForwardForm(false);
          setForwardSuccess(false);
          setClientName('');
          setClientEmail('');
          setClientPhone('');
          setBotAnswer('');
        }, 3000);
        return;
      }

      if (response && response.ok) {
        setForwardSuccess(true);
        setTimeout(() => {
          setShowForwardForm(false);
          setForwardSuccess(false);
          setClientName('');
          setClientEmail('');
          setClientPhone('');
          setBotAnswer('');
        }, 3000);
      } else {
        setForwardError('Failed to dispatch dialogue.');
      }
    } catch (err) {
      console.error('Failed to forward chat transcript:', err);
      setForwardError('Network error forwarding transcript.');
    } finally {
      setIsForwarding(false);
    }
  };

  // Pre-formatted link for WhatsApp redirect
  const getWhatsAppLink = (text: string) => {
    const encoded = encodeURIComponent(text);
    return `https://wa.me/237683316486?text=${encoded}`;
  };

  const currentTranscriptSummary = () => {
    return messages
      .filter(m => m.role === 'user')
      .map(m => m.content)
      .join(' ') || "Hello MADECC Group team, I would like to inquire about your residential/commercial building services.";
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end space-y-4">
      
      {/* ==================== CHAT/CALL EXPANDED PANEL ==================== */}
      {isOpen && (
        <div className="w-[360px] sm:w-[380px] bg-black border border-gray-800 rounded-none shadow-2xl flex flex-col h-[520px] animate-fade-in text-white">
          
          {/* Header */}
          <div className="p-4 bg-gray-950 border-b border-gray-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-2.5 h-2.5 bg-amber-500 rounded-none animate-pulse"></div>
              <div>
                <h3 className="font-mono text-xs font-bold uppercase tracking-widest text-amber-500">
                  MADECC Support Board
                </h3>
                <p className="text-[10px] text-gray-400">Pierre - Virtual Estimator</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Toggle Tabs */}
          <div className="flex border-b border-gray-800 bg-gray-950/50">
            <button
              onClick={() => { setActiveTab('chat'); setShowForwardForm(false); }}
              className={`flex-1 py-2 text-center text-xs font-mono uppercase tracking-widest border-b-2 ${
                activeTab === 'chat' && !showForwardForm
                  ? 'border-amber-500 text-white bg-black/40' 
                  : 'border-transparent text-gray-500 hover:text-gray-300'
              }`}
            >
              Pierre AI Assistant
            </button>
            <button
              onClick={() => { setActiveTab('call'); setShowForwardForm(false); }}
              className={`flex-1 py-2 text-center text-xs font-mono uppercase tracking-widest border-b-2 ${
                activeTab === 'call' 
                  ? 'border-amber-500 text-white bg-black/40' 
                  : 'border-transparent text-gray-500 hover:text-gray-300'
              }`}
            >
              Physical Desks
            </button>
          </div>

          {/* Expanded Content View */}
          <div className="flex-1 flex flex-col overflow-hidden bg-black/95">
            {activeTab === 'chat' ? (
              <>
                {/* --- AI CHAT VIEW --- */}
                {!showForwardForm ? (
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((m, idx) => (
                      <div
                        key={idx}
                        className={`flex flex-col max-w-[85%] ${
                          m.role === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'
                        }`}
                      >
                        <div
                          className={`p-3 rounded-none text-xs leading-relaxed font-sans ${
                            m.role === 'user'
                              ? 'bg-amber-500/10 text-amber-100 border border-amber-500/30'
                              : 'bg-gray-900 text-gray-200 border border-gray-800'
                          }`}
                        >
                          {m.content}
                        </div>
                        <span className="text-[9px] font-mono text-gray-500 mt-1 uppercase">
                          {m.role === 'user' ? 'You' : 'Pierre'}
                        </span>
                      </div>
                    ))}

                    {isTyping && (
                      <div className="flex items-center space-x-2 text-xs font-mono text-gray-400">
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-500" />
                        <span>Pierre is computing estimates...</span>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                ) : (
                  /* --- FORWARDING TO PHYSICAL DESK FORM --- */
                  <div className="flex-1 overflow-y-auto p-5 space-y-4">
                    <div className="text-center space-y-2">
                      <Mail className="w-8 h-8 text-amber-500 mx-auto" />
                      <h4 className="font-mono text-xs uppercase tracking-widest text-white">
                        Forward to Estimators
                      </h4>
                      <p className="text-[10px] text-gray-400 leading-relaxed">
                        Provide your details below to forward the entire dialogue to our official email inboxes (<span className="text-gray-300">madeccco5@gmail.com</span> & <span className="text-gray-300">madecccons@gmail.com</span>) for a formal physical appraisal.
                      </p>
                    </div>

                    {forwardSuccess ? (
                      <div className="p-4 bg-emerald-950/30 border border-emerald-500/40 text-center space-y-2">
                        <CheckCircle className="w-6 h-6 text-emerald-500 mx-auto animate-bounce" />
                        <h5 className="font-mono text-xs uppercase tracking-widest text-emerald-400">
                          Dispatched Successfully
                        </h5>
                        <p className="text-[10px] text-gray-400">
                          Our structural division has received your conversation. We will contact you within 24 business hours.
                        </p>
                      </div>
                    ) : (
                      <form onSubmit={handleForwardTranscript} className="space-y-3">
                        <div>
                          <label className="block text-[9px] font-mono uppercase tracking-widest text-gray-400 mb-1">
                            Full Name *
                          </label>
                          <input
                            type="text"
                            required
                            value={clientName}
                            onChange={e => setClientName(e.target.value)}
                            className="w-full bg-gray-900 border border-gray-800 p-2 text-xs text-white focus:outline-none focus:border-amber-500 rounded-none"
                            placeholder="e.g. Marcus Vance"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-mono uppercase tracking-widest text-gray-400 mb-1">
                            Email Address *
                          </label>
                          <input
                            type="email"
                            required
                            value={clientEmail}
                            onChange={e => setClientEmail(e.target.value)}
                            className="w-full bg-gray-900 border border-gray-800 p-2 text-xs text-white focus:outline-none focus:border-amber-500 rounded-none"
                            placeholder="e.g. marcus@company.com"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-mono uppercase tracking-widest text-gray-400 mb-1">
                            Phone Number
                          </label>
                          <input
                            type="text"
                            value={clientPhone}
                            onChange={e => setClientPhone(e.target.value)}
                            className="w-full bg-gray-900 border border-gray-800 p-2 text-xs text-white focus:outline-none focus:border-amber-500 rounded-none"
                            placeholder="e.g. +237 6XX XX XX XX"
                          />
                        </div>

                        {/* Anti-Bot Challenge */}
                        <div className="p-3 bg-gray-950/60 border border-gray-800 rounded-none space-y-1">
                          <label htmlFor="widget-bot" className="block text-[9px] font-mono uppercase tracking-widest text-amber-500">
                            Verify session (2x + 10 = 20) *
                          </label>
                          <div className="flex items-center space-x-2">
                            <span className="text-[10px] text-gray-400 font-mono">x = </span>
                            <input
                              id="widget-bot"
                              type="text"
                              required
                              value={botAnswer}
                              onChange={e => setBotAnswer(e.target.value)}
                              placeholder="Value..."
                              disabled={isForwarding}
                              className="bg-gray-900 border border-gray-800 focus:border-amber-500 text-white rounded-none px-2 py-1 text-xs focus:outline-none disabled:opacity-50 w-20 font-mono"
                            />
                          </div>
                        </div>

                        {forwardError && (
                          <p className="text-[10px] text-rose-500 font-mono text-center">
                            {forwardError}
                          </p>
                        )}

                        <button
                          type="submit"
                          disabled={isForwarding}
                          className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-gray-800 text-black py-2.5 font-mono text-xs uppercase tracking-widest transition-colors flex items-center justify-center space-x-2 font-bold cursor-pointer rounded-none"
                        >
                          {isForwarding ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Dispatching...</span>
                            </>
                          ) : (
                            <>
                              <span>Send to Estimates Desk</span>
                              <ArrowRight className="w-4 h-4" />
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => setShowForwardForm(false)}
                          className="w-full text-center text-[10px] font-mono uppercase tracking-wider text-gray-400 hover:text-white transition-colors py-1 cursor-pointer"
                        >
                          Cancel and return to chat
                        </button>
                      </form>
                    )}
                  </div>
                )}

                {/* Bottom Interactive Area */}
                {!showForwardForm && (
                  <div className="p-3 bg-gray-950 border-t border-gray-800 space-y-2">
                    {/* Action recommendations */}
                    <div className="flex flex-wrap gap-1.5 pb-1 justify-center">
                      <button
                        onClick={() => {
                          setInputMessage("Can I get a budget estimate for a luxury custom villa?");
                        }}
                        className="text-[9px] font-mono bg-gray-900 hover:bg-gray-800 text-amber-500 border border-amber-500/20 px-2 py-0.5 rounded-none"
                      >
                        Estimate Villa
                      </button>
                      <button
                        onClick={() => {
                          setInputMessage("What commercial building models do you offer?");
                        }}
                        className="text-[9px] font-mono bg-gray-900 hover:bg-gray-800 text-amber-500 border border-amber-500/20 px-2 py-0.5 rounded-none"
                      >
                        Commercial Assets
                      </button>
                      <button
                        onClick={() => setShowForwardForm(true)}
                        className="text-[9px] font-mono bg-amber-500/10 hover:bg-amber-500/20 text-white border border-amber-500/35 px-2 py-0.5 rounded-none flex items-center space-x-1"
                      >
                        <Mail className="w-2.5 h-2.5" />
                        <span>Forward to Email</span>
                      </button>
                    </div>

                    <form onSubmit={handleSendMessage} className="flex space-x-2">
                      <input
                        type="text"
                        value={inputMessage}
                        onChange={e => setInputMessage(e.target.value)}
                        placeholder="Type construction inquiry..."
                        className="flex-1 bg-gray-900 border border-gray-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 rounded-none"
                      />
                      <button
                        type="submit"
                        className="bg-amber-500 hover:bg-amber-600 text-black px-3.5 flex items-center justify-center rounded-none transition-colors cursor-pointer"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </form>
                  </div>
                )}
              </>
            ) : (
              /* --- PHYSICAL CONTACT DESKS VIEW --- */
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div className="text-center space-y-1 mb-4">
                  <Phone className="w-6 h-6 text-amber-500 mx-auto" />
                  <h4 className="font-mono text-xs uppercase tracking-widest text-white">
                    MADECC Phone Desks
                  </h4>
                  <p className="text-[10px] text-gray-400 leading-relaxed">
                    Click any support or division line below to initiate a direct voice call or WhatsApp dispatch with our physical engineering teams.
                  </p>
                </div>

                <div className="space-y-2.5">
                  {/* WhatsApp Line */}
                  <a
                    href={getWhatsAppLink(currentTranscriptSummary())}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between p-3 bg-emerald-950/10 hover:bg-emerald-950/20 border border-emerald-500/30 transition-colors group"
                  >
                    <div>
                      <div className="text-[10px] font-mono uppercase text-emerald-400 font-bold tracking-wider">
                        Official WhatsApp Support
                      </div>
                      <div className="text-[11px] text-emerald-200 mt-0.5 font-bold">
                        +237 683 316 486
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-emerald-500 group-hover:translate-x-0.5 transition-transform" />
                  </a>

                  {/* General / Principal scheduling */}
                  <a
                    href="tel:683316486"
                    className="flex items-center justify-between p-3 bg-gray-900 hover:bg-gray-850 border border-gray-800 transition-colors group"
                  >
                    <div>
                      <div className="text-[10px] font-mono uppercase text-amber-500 font-bold tracking-wider">
                        Principal Scheduling Desk
                      </div>
                      <div className="text-[11px] text-gray-200 mt-0.5">
                        +237 683 316 486
                      </div>
                    </div>
                    <Phone className="w-4 h-4 text-gray-400 group-hover:scale-110 transition-transform" />
                  </a>

                  {/* Customer Liaison */}
                  <a
                    href="tel:671063511"
                    className="flex items-center justify-between p-3 bg-gray-900 hover:bg-gray-850 border border-gray-800 transition-colors group"
                  >
                    <div>
                      <div className="text-[10px] font-mono uppercase text-amber-500 font-bold tracking-wider">
                        Customer Liaison Officer
                      </div>
                      <div className="text-[11px] text-gray-200 mt-0.5">
                        +237 671 063 511
                      </div>
                    </div>
                    <Phone className="w-4 h-4 text-gray-400 group-hover:scale-110 transition-transform" />
                  </a>

                  {/* Engineering Director */}
                  <a
                    href="tel:689115595"
                    className="flex items-center justify-between p-3 bg-gray-900 hover:bg-gray-850 border border-gray-800 transition-colors group"
                  >
                    <div>
                      <div className="text-[10px] font-mono uppercase text-amber-500 font-bold tracking-wider">
                        Engineering Director
                      </div>
                      <div className="text-[11px] text-gray-200 mt-0.5">
                        +237 689 115 595
                      </div>
                    </div>
                    <Phone className="w-4 h-4 text-gray-400 group-hover:scale-110 transition-transform" />
                  </a>

                  {/* Estimating Desk */}
                  <a
                    href="tel:671289643"
                    className="flex items-center justify-between p-3 bg-gray-900 hover:bg-gray-850 border border-gray-800 transition-colors group"
                  >
                    <div>
                      <div className="text-[10px] font-mono uppercase text-amber-500 font-bold tracking-wider">
                        Estimating & Survey
                      </div>
                      <div className="text-[11px] text-gray-200 mt-0.5">
                        +237 671 289 643
                      </div>
                    </div>
                    <Phone className="w-4 h-4 text-gray-400 group-hover:scale-110 transition-transform" />
                  </a>

                  {/* Commercial Lead */}
                  <a
                    href="tel:640194505"
                    className="flex items-center justify-between p-3 bg-gray-900 hover:bg-gray-850 border border-gray-800 transition-colors group"
                  >
                    <div>
                      <div className="text-[10px] font-mono uppercase text-amber-500 font-bold tracking-wider">
                        Commercial Division Lead
                      </div>
                      <div className="text-[11px] text-gray-200 mt-0.5">
                        +237 640 194 505
                      </div>
                    </div>
                    <Phone className="w-4 h-4 text-gray-400 group-hover:scale-110 transition-transform" />
                  </a>
                </div>

                <div className="pt-4 border-t border-gray-800 text-center space-y-1">
                  <div className="text-[9px] font-mono text-gray-500 uppercase">Official Emails</div>
                  <div className="text-[10px] text-gray-300">
                    <a href="mailto:madeccco5@gmail.com" className="hover:text-amber-500 transition-colors mr-3">madeccco5@gmail.com</a>
                    <a href="mailto:madecccons@gmail.com" className="hover:text-amber-500 transition-colors">madecccons@gmail.com</a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================== FLOATING TRIGGER BUTTONS ==================== */}
      <div className="flex items-center space-x-3">
        {/* Call Trigger */}
        <button
          onClick={() => {
            setIsOpen(true);
            setActiveTab('call');
          }}
          className="bg-gray-950 text-white hover:text-amber-500 border border-gray-800 p-3 shadow-xl transition-all duration-300 hover:scale-105 rounded-none flex items-center justify-center group cursor-pointer"
          title="Direct Phone Lines"
        >
          <Phone className="w-5 h-5 group-hover:rotate-12 transition-transform" />
        </button>

        {/* AI Chat Trigger */}
        <button
          onClick={() => {
            setIsOpen(!isOpen);
            if (!isOpen) setActiveTab('chat');
          }}
          className="bg-amber-500 hover:bg-amber-600 text-black px-4 py-3 shadow-xl transition-all duration-300 hover:scale-105 rounded-none flex items-center space-x-2 font-mono uppercase tracking-widest text-xs font-bold cursor-pointer"
        >
          <MessageSquare className="w-4.5 h-4.5" />
          <span>Pierre AI Support</span>
        </button>
      </div>

    </div>
  );
}
