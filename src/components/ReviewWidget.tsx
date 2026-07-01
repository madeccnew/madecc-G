/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent } from 'react';
import { Star, MessageSquare, Send, CheckCircle, AlertTriangle } from 'lucide-react';
import { Review } from '../types';

interface ReviewWidgetProps {
  reviews: Review[];
  onReviewSubmitted: () => void;
}

export default function ReviewWidget({ reviews, onReviewSubmitted }: ReviewWidgetProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [botAnswer, setBotAnswer] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name || !email || !reviewText) {
      setStatus('error');
      setMessage('Please complete all requested fields.');
      return;
    }

    if (botAnswer.trim() !== '5') {
      setStatus('error');
      setMessage('Anti-Bot Verification failed. Solve the equation: 2x + 10 = 20 to find the value of x.');
      return;
    }

    setStatus('loading');
    try {
      let isLocalFallback = false;
      let response;
      let data;
      try {
        response = await fetch('/api/reviews', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, rating, review: reviewText }),
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
        const localReviews = JSON.parse(localStorage.getItem('madecc_local_reviews') || '[]');
        const newReview = {
          id: 'local-rev-' + Date.now(),
          name,
          email,
          rating,
          review: reviewText,
          approved: true, // Auto-approve locally so the user can see their own review!
          date: new Date().toISOString().split('T')[0]
        };
        localReviews.push(newReview);
        localStorage.setItem('madecc_local_reviews', JSON.stringify(localReviews));

        setStatus('success');
        setName('');
        setEmail('');
        setRating(5);
        setReviewText('');
        setBotAnswer('');
        setMessage('Thank you! Your verified testimonial was saved locally and loaded immediately into the active view.');
        onReviewSubmitted();
        return;
      }

      if (response && response.ok && data) {
        setStatus('success');
        setName('');
        setEmail('');
        setRating(5);
        setReviewText('');
        setBotAnswer('');
        setMessage(data.message || 'Review submitted successfully!');
        onReviewSubmitted();
      } else {
        setStatus('error');
        setMessage(data?.error || 'Failed to submit review.');
      }
    } catch (err) {
      setStatus('error');
      setMessage('Network error. Please try again.');
    }
  };

  return (
    <div id="review-widget-container" className="space-y-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Left column: Feed of Approved Reviews */}
        <div className="lg:col-span-7 space-y-6">
          <h3 className="text-xl font-bold text-white tracking-tight flex items-center">
            <MessageSquare className="w-5 h-5 mr-3 text-amber-500" />
            <span>Customer Testimonials ({reviews.length})</span>
          </h3>

          <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {reviews.length === 0 ? (
              <p className="text-sm text-gray-500 py-6 italic">No approved customer reviews found. Be the first to leave your feedback below!</p>
            ) : (
              reviews.map((r) => (
                <div key={r.id} className="p-6 bg-gray-900/40 border border-gray-800 rounded-none space-y-3 shadow-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-bold text-gray-100 block">{r.name}</span>
                      <span className="text-[10px] text-gray-500 font-mono">Verified Project Client</span>
                    </div>
                    <div className="flex text-amber-500 text-xs">
                      {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                    </div>
                  </div>
                  <p className="text-xs text-gray-300 italic font-sans leading-relaxed">
                    "{r.review}"
                  </p>
                  <span className="text-[10px] block text-gray-600 text-right font-mono">Published: {r.date}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right column: Submit a Review Form */}
        <div className="lg:col-span-5 bg-gray-900/60 border border-gray-800 p-8 rounded-none shadow-xl">
          <h3 className="text-lg font-bold text-white mb-2">Submit Your Review</h3>
          <p className="text-xs text-gray-500 mb-6 leading-relaxed">
            Your feedback helps us maintain premium quality standards. Reviews undergo administrative validation before posting.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="rev-form-name" className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">Your Name *</label>
              <input
                id="rev-form-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Marcus Vance"
                disabled={status === 'loading'}
                className="w-full bg-gray-950 border border-gray-800 focus:border-amber-500 text-white rounded-none px-4 py-2.5 text-sm focus:outline-none disabled:opacity-50"
              />
            </div>

            <div>
              <label htmlFor="rev-form-email" className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">Email Address *</label>
              <input
                id="rev-form-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="marcus.vance@vancetech.com"
                disabled={status === 'loading'}
                className="w-full bg-gray-950 border border-gray-800 focus:border-amber-500 text-white rounded-none px-4 py-2.5 text-sm focus:outline-none disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Service Rating *</label>
              <div className="flex items-center space-x-2">
                {[1, 2, 3, 4, 5].map((num) => (
                  <button
                    id={`rating-star-btn-${num}`}
                    key={num}
                    type="button"
                    onClick={() => setRating(num)}
                    disabled={status === 'loading'}
                    className="p-1 focus:outline-none cursor-pointer"
                  >
                    <Star
                      className={`w-6 h-6 transition-colors ${
                        num <= rating ? 'text-amber-500 fill-amber-500' : 'text-gray-600'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="rev-form-text" className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">Review Commentary *</label>
              <textarea
                id="rev-form-text"
                required
                rows={4}
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Share details on structural planning, timeline accuracy, value engineering, and communication..."
                disabled={status === 'loading'}
                className="w-full bg-gray-950 border border-gray-800 focus:border-amber-500 text-white rounded-none px-4 py-2.5 text-sm focus:outline-none disabled:opacity-50"
              />
            </div>

            {/* Anti-Bot Challenge */}
            <div className="p-4 bg-gray-950/60 border border-gray-800 rounded-none space-y-2">
              <label htmlFor="rev-bot" className="block text-xs font-semibold uppercase tracking-wider text-amber-500">
                Anti-Bot Verification *
              </label>
              <p className="text-[11px] text-gray-400">
                Solve the mathematical equation to authenticate your session: <span className="text-white font-mono">2x + 10 = 20</span>. Find the value of <span className="text-white font-mono font-bold">x</span>.
              </p>
              <input
                id="rev-bot"
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
              <div id="review-success-msg" className="flex items-start text-xs text-emerald-400 bg-emerald-950/40 p-3 rounded-none border border-emerald-500/20">
                <CheckCircle className="w-4 h-4 mr-2.5 shrink-0 mt-0.5" />
                <span>{message}</span>
              </div>
            )}

            {status === 'error' && (
              <div id="review-error-msg" className="flex items-start text-xs text-rose-400 bg-rose-950/40 p-3 rounded-none border border-rose-500/20">
                <AlertTriangle className="w-4 h-4 mr-2.5 shrink-0 mt-0.5" />
                <span>{message}</span>
              </div>
            )}

            <button
              id="review-submit-btn"
              type="submit"
              disabled={status === 'loading'}
              className="w-full py-3 bg-amber-500 hover:bg-amber-600 active:scale-95 disabled:opacity-50 text-gray-950 font-bold uppercase tracking-widest text-xs rounded-none shadow-md hover:shadow-amber-500/10 flex items-center justify-center space-x-2 transition-all cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{status === 'loading' ? 'Submitting...' : 'Submit Feedback'}</span>
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
