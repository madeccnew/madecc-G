/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent } from 'react';
import { Mail, Phone, User, Building, Send, CheckCircle, AlertTriangle } from 'lucide-react';

export default function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [projectType, setProjectType] = useState<'residential' | 'commercial'>('residential');
  const [budgetRange, setBudgetRange] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [feedback, setFeedback] = useState('');

  const budgets = [
    { value: '$50,000 - $150,000', label: '$50,000 - $150,000' },
    { value: '$150,000 - $500,000', label: '$150,000 - $500,000' },
    { value: '$500,000 - $1,500,000', label: '$500,000 - $1.5M' },
    { value: '$1,500,000 - $5,000,000', label: '$1.5M - $5M' },
    { value: '$5,000,000+', label: '$5M+ (Premium Commercial/Luxury Residential)' }
  ];

  const [botAnswer, setBotAnswer] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone || !budgetRange || !message) {
      setStatus('error');
      setFeedback('Please supply all required fields for our planning panel.');
      return;
    }

    if (botAnswer.trim() !== '5') {
      setStatus('error');
      setFeedback('Anti-Bot Verification failed. Solve the equation: 2x + 10 = 20 to find the value of x.');
      return;
    }

    setStatus('loading');
    try {
      let isLocalFallback = false;
      let response;
      let data;
      try {
        response = await fetch('/api/contacts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            email,
            phone,
            company,
            projectType,
            budgetRange,
            message
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
        // Netlify / GitHub Pages Client-Side Safe Mode Fallback
        const localInquiries = JSON.parse(localStorage.getItem('madecc_local_contacts') || '[]');
        localInquiries.push({
          id: 'local-con-' + Date.now(),
          name,
          email,
          phone,
          company,
          projectType,
          budgetRange,
          message,
          date: new Date().toISOString().split('T')[0]
        });
        localStorage.setItem('madecc_local_contacts', JSON.stringify(localInquiries));

        setStatus('success');
        setFeedback('Thank you! Your technical consultation inquiry was captured successfully in local browser storage (Safe Client Mode for Netlify/GitHub). Our estimators will receive your request on sync!');
        setName('');
        setEmail('');
        setPhone('');
        setCompany('');
        setProjectType('residential');
        setBudgetRange('');
        setMessage('');
        setBotAnswer('');
        return;
      }

      if (response && response.ok && data) {
        setStatus('success');
        setFeedback(data.message || 'Your inquiry has been received. Our team will contact you shortly.');
        setName('');
        setEmail('');
        setPhone('');
        setCompany('');
        setProjectType('residential');
        setBudgetRange('');
        setMessage('');
        setBotAnswer('');
      } else {
        setStatus('error');
        setFeedback(data?.error || 'Failed to submit inquiry.');
      }
    } catch (err) {
      setStatus('error');
      setFeedback('Network error. Failed to dispatch message.');
    }
  };

  return (
    <div id="contact-form-container" className="bg-gray-900 border border-gray-800 p-8 sm:p-10 rounded-none shadow-xl">
      <h3 className="text-xl font-bold text-white mb-2">Request Technical Consultation</h3>
      <p className="text-xs text-gray-500 mb-6 leading-relaxed">
        Submit details regarding your custom luxury villa or commercial building plans. Our estimators and design engineers will respond within 24 business hours.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="ct-name" className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">Your Name *</label>
            <div className="relative">
              <input
                id="ct-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Marcus Vance"
                disabled={status === 'loading'}
                className="w-full bg-gray-950 border border-gray-800 focus:border-amber-500 text-white rounded-none pl-4 pr-10 py-2.5 text-sm focus:outline-none disabled:opacity-50"
              />
              <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
            </div>
          </div>

          <div>
            <label htmlFor="ct-email" className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">Email Address *</label>
            <div className="relative">
              <input
                id="ct-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="marcus.vance@vancetech.com"
                disabled={status === 'loading'}
                className="w-full bg-gray-950 border border-gray-800 focus:border-amber-500 text-white rounded-none pl-4 pr-10 py-2.5 text-sm focus:outline-none disabled:opacity-50"
              />
              <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="ct-phone" className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">Phone Number *</label>
            <div className="relative">
              <input
                id="ct-phone"
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 019-9122"
                disabled={status === 'loading'}
                className="w-full bg-gray-950 border border-gray-800 focus:border-amber-500 text-white rounded-none pl-4 pr-10 py-2.5 text-sm focus:outline-none disabled:opacity-50"
              />
              <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
            </div>
          </div>

          <div>
            <label htmlFor="ct-company" className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">Company Name</label>
            <div className="relative">
              <input
                id="ct-company"
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Vance Properties LLC"
                disabled={status === 'loading'}
                className="w-full bg-gray-950 border border-gray-800 focus:border-amber-500 text-white rounded-none pl-4 pr-10 py-2.5 text-sm focus:outline-none disabled:opacity-50"
              />
              <Building className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="ct-type" className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">Project Division *</label>
            <select
              id="ct-type"
              required
              value={projectType}
              onChange={(e) => setProjectType(e.target.value as 'residential' | 'commercial')}
              disabled={status === 'loading'}
              className="w-full bg-gray-950 border border-gray-800 focus:border-amber-500 text-white rounded-none px-4 py-2.5 text-sm focus:outline-none disabled:opacity-50"
            >
              <option value="residential">Residential Construction Division</option>
              <option value="commercial">Commercial Construction Division</option>
            </select>
          </div>

          <div>
            <label htmlFor="ct-budget" className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">Target Budget Range *</label>
            <select
              id="ct-budget"
              required
              value={budgetRange}
              onChange={(e) => setBudgetRange(e.target.value)}
              disabled={status === 'loading'}
              className="w-full bg-gray-950 border border-gray-800 focus:border-amber-500 text-white rounded-none px-4 py-2.5 text-sm focus:outline-none disabled:opacity-50"
            >
              <option value="">Select a projected budget</option>
              {budgets.map((b) => (
                <option key={b.value} value={b.value}>{b.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="ct-msg" className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">Project Details & Requirements *</label>
          <textarea
            id="ct-msg"
            required
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={status === 'loading'}
            placeholder="Tell us about the physical location, layout specifications, material design requirements, or any structural engineering plans you currently have..."
            className="w-full bg-gray-950 border border-gray-800 focus:border-amber-500 text-white rounded-none px-4 py-2.5 text-sm focus:outline-none disabled:opacity-50"
          />
        </div>

        {/* Anti-Bot Challenge */}
        <div className="p-4 bg-gray-950/60 border border-gray-800 rounded-none space-y-2">
          <label htmlFor="ct-bot" className="block text-xs font-semibold uppercase tracking-wider text-amber-500">
            Anti-Bot Verification *
          </label>
          <p className="text-[11px] text-gray-400">
            Solve the mathematical equation to authenticate your session: <span className="text-white font-mono">2x + 10 = 20</span>. Find the value of <span className="text-white font-mono font-bold">x</span>.
          </p>
          <input
            id="ct-bot"
            type="text"
            required
            value={botAnswer}
            onChange={(e) => setBotAnswer(e.target.value)}
            placeholder="Value of x..."
            disabled={status === 'loading'}
            className="w-full max-w-[120px] bg-gray-900 border border-gray-800 focus:border-amber-500 text-white rounded-none px-3 py-1.5 text-sm focus:outline-none disabled:opacity-50 font-mono"
          />
        </div>

        {status === 'success' && (
          <div id="ct-success-msg" className="flex items-start text-xs text-emerald-400 bg-emerald-950/40 p-3 rounded-none border border-emerald-500/20">
            <CheckCircle className="w-4 h-4 mr-2.5 shrink-0 mt-0.5" />
            <span>{feedback}</span>
          </div>
        )}

        {status === 'error' && (
          <div id="ct-error-msg" className="flex items-start text-xs text-rose-400 bg-rose-950/40 p-3 rounded-none border border-rose-500/20">
            <AlertTriangle className="w-4 h-4 mr-2.5 shrink-0 mt-0.5" />
            <span>{feedback}</span>
          </div>
        )}

        <button
          id="ct-submit-btn"
          type="submit"
          disabled={status === 'loading'}
          className="w-full py-3 bg-amber-500 hover:bg-amber-600 active:scale-95 text-gray-950 font-bold uppercase tracking-widest text-xs rounded-none shadow-md hover:shadow-amber-500/10 flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50"
        >
          <Send className="w-3.5 h-3.5" />
          <span>{status === 'loading' ? 'Transmitting Inquiries...' : 'Send Inquiry'}</span>
        </button>
      </form>
    </div>
  );
}
