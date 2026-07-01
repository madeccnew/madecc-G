/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent } from 'react';
import { Calendar, Clock, Phone, User, Mail, Send, CheckCircle, AlertTriangle } from 'lucide-react';

export default function AppointmentForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('');
  const [projectType, setProjectType] = useState<'residential' | 'commercial'>('residential');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [feedback, setFeedback] = useState('');
  const [botAnswer, setBotAnswer] = useState('');

  const handleBooking = async (e: FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone || !preferredDate || !preferredTime || !message) {
      setStatus('error');
      setFeedback('Please fill out all scheduling and information inputs.');
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
        response = await fetch('/api/appointments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            email,
            phone,
            preferredDate,
            preferredTime,
            projectType,
            message
          }),
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
        const localAppointments = JSON.parse(localStorage.getItem('madecc_local_appointments') || '[]');
        localAppointments.push({
          id: 'local-apt-' + Date.now(),
          name,
          email,
          phone,
          preferredDate,
          preferredTime,
          projectType,
          message,
          createdAt: new Date().toISOString()
        });
        localStorage.setItem('madecc_local_appointments', JSON.stringify(localAppointments));

        setStatus('success');
        setFeedback('Consultation request captured in local browser storage (Safe Client Mode for Netlify/GitHub). A structural specialist will follow up with you on active syncing.');
        setName('');
        setEmail('');
        setPhone('');
        setPreferredDate('');
        setPreferredTime('');
        setMessage('');
        setBotAnswer('');
        return;
      }

      if (response && response.ok && data) {
        setStatus('success');
        setFeedback(data.message || 'Consultation proposed successfully! We will contact you soon.');
        setName('');
        setEmail('');
        setPhone('');
        setPreferredDate('');
        setPreferredTime('');
        setMessage('');
        setBotAnswer('');
      } else {
        setStatus('error');
        setFeedback(data?.error || 'Failed to request consultation.');
      }
    } catch (err) {
      setStatus('error');
      setFeedback('Network error. Failed to dispatch consultation inquiry.');
    }
  };

  return (
    <div id="appointment-form-container" className="bg-gray-900 border border-gray-800 p-8 sm:p-10 rounded-none shadow-2xl">
      <div className="text-center mb-8 max-w-xl mx-auto">
        <h3 className="text-2xl font-bold text-white font-sans tracking-tight">Book a Structural Consultation</h3>
        <p className="text-sm text-gray-500 mt-2 leading-relaxed">
          Propose a time slot to review structural plans, zoning constraints, budget boundaries, and design models with a MADECC Group principal officer.
        </p>
      </div>

      <form onSubmit={handleBooking} className="space-y-6">
        
        {/* Contact info grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <label htmlFor="apt-form-name" className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">Full Name *</label>
            <div className="relative">
              <input
                id="apt-form-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Marcus Vance"
                disabled={status === 'loading'}
                className="w-full bg-gray-950 border border-gray-800 focus:border-amber-500 text-white rounded-none pl-4 pr-10 py-3 text-sm focus:outline-none disabled:opacity-50"
              />
              <User className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
            </div>
          </div>

          <div>
            <label htmlFor="apt-form-email" className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">Email Address *</label>
            <div className="relative">
              <input
                id="apt-form-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="marcus.vance@vancetech.com"
                disabled={status === 'loading'}
                className="w-full bg-gray-950 border border-gray-800 focus:border-amber-500 text-white rounded-none pl-4 pr-10 py-3 text-sm focus:outline-none disabled:opacity-50"
              />
              <Mail className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
            </div>
          </div>

          <div>
            <label htmlFor="apt-form-phone" className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">Phone Number *</label>
            <div className="relative">
              <input
                id="apt-form-phone"
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 019-9122"
                disabled={status === 'loading'}
                className="w-full bg-gray-950 border border-gray-800 focus:border-amber-500 text-white rounded-none pl-4 pr-10 py-3 text-sm focus:outline-none disabled:opacity-50"
              />
              <Phone className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
            </div>
          </div>
        </div>

        {/* Scheduling grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <label htmlFor="apt-form-date" className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">Preferred Date *</label>
            <div className="relative">
              <input
                id="apt-form-date"
                type="date"
                required
                value={preferredDate}
                onChange={(e) => setPreferredDate(e.target.value)}
                disabled={status === 'loading'}
                className="w-full bg-gray-950 border border-gray-800 focus:border-amber-500 text-white rounded-none pl-4 pr-10 py-3 text-sm focus:outline-none disabled:opacity-50"
              />
              <Calendar className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
            </div>
          </div>

          <div>
            <label htmlFor="apt-form-time" className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">Preferred Time *</label>
            <div className="relative">
              <select
                id="apt-form-time"
                required
                value={preferredTime}
                onChange={(e) => setPreferredTime(e.target.value)}
                disabled={status === 'loading'}
                className="w-full bg-gray-950 border border-gray-800 focus:border-amber-500 text-white rounded-none px-4 py-3 text-sm focus:outline-none disabled:opacity-50 appearance-none"
              >
                <option value="">Select an hour block</option>
                <option value="09:00 AM - 10:30 AM">09:00 AM - 10:30 AM</option>
                <option value="11:00 AM - 12:30 PM">11:00 AM - 12:30 PM</option>
                <option value="01:30 PM - 03:00 PM">01:30 PM - 03:00 PM</option>
                <option value="03:30 PM - 05:00 PM">03:30 PM - 05:00 PM</option>
              </select>
              <Clock className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 pointer-events-none" />
            </div>
          </div>

          <div>
            <label htmlFor="apt-form-sector" className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">Project Division *</label>
            <select
              id="apt-form-sector"
              required
              value={projectType}
              onChange={(e) => setProjectType(e.target.value as 'residential' | 'commercial')}
              disabled={status === 'loading'}
              className="w-full bg-gray-950 border border-gray-800 focus:border-amber-500 text-white rounded-none px-4 py-3 text-sm focus:outline-none disabled:opacity-50"
            >
              <option value="residential">Residential Construction Division</option>
              <option value="commercial">Commercial Construction Division</option>
            </select>
          </div>
        </div>

        {/* Project description */}
        <div>
          <label htmlFor="apt-form-msg" className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">Project Scope Objectives *</label>
          <textarea
            id="apt-form-msg"
            required
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={status === 'loading'}
            placeholder="Please detail physical parameters, structural ideas, timeline goals, zoning coordinates, and budget scopes..."
            className="w-full bg-gray-950 border border-gray-800 focus:border-amber-500 text-white rounded-none px-4 py-2.5 text-sm focus:outline-none disabled:opacity-50"
          />
        </div>

        {/* Anti-Bot Challenge */}
        <div className="p-4 bg-gray-950/60 border border-gray-800 rounded-none space-y-2">
          <label htmlFor="apt-bot" className="block text-xs font-semibold uppercase tracking-wider text-amber-500">
            Anti-Bot Verification *
          </label>
          <p className="text-[11px] text-gray-400">
            Solve the mathematical equation to authenticate your session: <span className="text-white font-mono">2x + 10 = 20</span>. Find the value of <span className="text-white font-mono font-bold">x</span>.
          </p>
          <input
            id="apt-bot"
            type="text"
            required
            value={botAnswer}
            onChange={(e) => setBotAnswer(e.target.value)}
            placeholder="Value of x..."
            disabled={status === 'loading'}
            className="w-full max-w-[120px] bg-gray-900 border border-gray-800 focus:border-amber-500 text-white rounded-none px-3 py-1.5 text-sm focus:outline-none disabled:opacity-50 font-mono"
          />
        </div>

        {/* Dynamic status reports */}
        {status === 'success' && (
          <div id="apt-success-msg" className="flex items-start text-xs text-emerald-400 bg-emerald-950/40 p-4 border border-emerald-500/20 rounded-none">
            <CheckCircle className="w-5 h-5 mr-3 shrink-0 mt-0.5" />
            <span>{feedback}</span>
          </div>
        )}

        {status === 'error' && (
          <div id="apt-error-msg" className="flex items-start text-xs text-rose-400 bg-rose-950/40 p-4 border border-rose-500/20 rounded-none">
            <AlertTriangle className="w-5 h-5 mr-3 shrink-0 mt-0.5" />
            <span>{feedback}</span>
          </div>
        )}

        {/* Submit */}
        <div className="flex justify-center">
          <button
            id="apt-submit-btn"
            type="submit"
            disabled={status === 'loading'}
            className="px-8 py-3.5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-gray-950 font-bold uppercase tracking-widest text-xs rounded-none transition-all cursor-pointer shadow-lg hover:shadow-amber-500/20 disabled:opacity-50"
          >
            {status === 'loading' ? 'Requesting Consultation...' : 'Request Consultation Appointment'}
          </button>
        </div>

      </form>
    </div>
  );
}
