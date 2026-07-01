/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent } from 'react';
import { HardHat, MapPin, Phone, Mail, Clock, Send, CheckCircle, AlertTriangle } from 'lucide-react';

interface FooterProps {
  onNavigate: (page: string) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [botAnswer, setBotAnswer] = useState('');

  const handleSubscribe = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setStatus('error');
      setMessage('Please enter a valid email address.');
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
        response = await fetch('/api/newsletter/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
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
        const localSubs = JSON.parse(localStorage.getItem('madecc_local_subscribers') || '[]');
        localSubs.push({
          id: 'local-sub-' + Date.now(),
          email,
          createdAt: new Date().toISOString()
        });
        localStorage.setItem('madecc_local_subscribers', JSON.stringify(localSubs));

        setStatus('success');
        setEmail('');
        setBotAnswer('');
        setMessage('Thank you! You have subscribed to the newsletter (Saved in local storage safe mode).');
        return;
      }

      if (response && response.ok && data) {
        setStatus('success');
        setEmail('');
        setBotAnswer('');
        setMessage(data.message || 'Subscribed successfully!');
      } else {
        setStatus('error');
        setMessage(data?.error || 'Failed to subscribe.');
      }
    } catch (err) {
      setStatus('error');
      setMessage('Network error. Please try again.');
    }
  };

  const handleLink = (page: string) => {
    onNavigate(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Structured Data (JSON-LD Schemas) for LocalBusiness & ConstructionCompany
  const schemaMarkup = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'ConstructionCompany',
        '@id': 'https://madeccgroup.com/#organization',
        'name': 'MADECC Group',
        'url': 'https://madeccgroup.com',
        'logo': 'https://madeccgroup.com/logo.png',
        'image': 'https://madeccgroup.com/src/assets/images/luxury_residential_1782866705938.jpg',
        'description': 'MADECC Group is a premium design-build construction firm specializing in custom luxury Residential Construction and high-performance Commercial Construction projects.',
        'telephone': '+237-683-316-486',
        'email': 'madeccco5@gmail.com',
        'priceRange': '$$$$',
        'address': {
          '@type': 'PostalAddress',
          'streetAddress': '9465 Wilshire Blvd, Suite 300',
          'addressLocality': 'Beverly Hills',
          'addressRegion': 'CA',
          'postalCode': '90212',
          'addressCountry': 'US'
        },
        'geo': {
          '@type': 'GeoCoordinates',
          'latitude': 34.0674,
          'longitude': -118.3995
        },
        'openingHoursSpecification': [
          {
            '@type': 'OpeningHoursSpecification',
            'dayOfWeek': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
            'opens': '08:00',
            'closes': '18:00'
          }
        ],
        'sameAs': [
          'https://www.linkedin.com/company/madecc-group',
          'https://twitter.com/madeccgroup'
        ]
      },
      {
        '@type': 'WebSite',
        '@id': 'https://madeccgroup.com/#website',
        'url': 'https://madeccgroup.com',
        'name': 'MADECC Group',
        'publisher': {
          '@id': 'https://madeccgroup.com/#organization'
        }
      }
    ]
  };

  return (
    <footer id="site-footer" className="bg-[#0A0C0E] border-t border-white/10 text-gray-400 font-sans">
      
      {/* Inject Schema.org JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }}
      />

      {/* FOOTER / STATS BAR */}
      <div className="border-b border-white/10 flex items-center py-10 px-6 sm:px-10">
        <div className="max-w-7xl mx-auto w-full flex flex-col md:flex-row gap-8 justify-between items-center">
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
            <div className="text-center">
              <div className="text-3xl font-black text-white tracking-tighter">500+</div>
              <div className="text-[10px] uppercase tracking-widest text-amber-500 font-bold mt-1">Projects Done</div>
            </div>
            <div className="hidden md:block h-10 w-[1px] bg-white/10"></div>
            <div className="text-center">
              <div className="text-3xl font-black text-white tracking-tighter">15 Yrs</div>
              <div className="text-[10px] uppercase tracking-widest text-amber-500 font-bold mt-1">Experience</div>
            </div>
            <div className="hidden md:block h-10 w-[1px] bg-white/10"></div>
            <div className="text-center">
              <div className="text-3xl font-black text-white tracking-tighter">100%</div>
              <div className="text-[10px] uppercase tracking-widest text-amber-500 font-bold mt-1">Safety Record</div>
            </div>
          </div>
          <div className="flex gap-6 text-[10px] uppercase tracking-widest text-gray-500 font-bold">
            <span>Licensed & Insured</span>
            <span>•</span>
            <span>ISO 9001 Certified</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          
          {/* Brand Identity */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 cursor-pointer select-none" onClick={() => handleLink('home')}>
              <img src="/logo.jpg" alt="MADECC Logo" className="h-9 w-9 object-contain rounded-none border border-amber-500/20" referrerPolicy="no-referrer" />
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black tracking-tighter text-white">MADECC</span>
                <span className="text-2xl font-light text-amber-500">GROUP</span>
              </div>
            </div>
            
            <p className="text-sm text-gray-400 leading-relaxed">
              Establishing modern standards in custom luxury residential developments and smart, high-performance commercial construction frameworks. Building trust and value engineering across California.
            </p>

            <div className="space-y-3.5 text-sm">
              <div className="flex items-start">
                <MapPin className="w-5 h-5 text-amber-500 mr-3 shrink-0 mt-0.5" />
                <span className="text-gray-300">9465 Wilshire Blvd, Suite 300, Beverly Hills, CA 90212</span>
              </div>
              <div className="flex items-start">
                <Phone className="w-5 h-5 text-amber-500 mr-3 shrink-0 mt-0.5" />
                <div className="text-gray-300">
                  <span className="block">+237 683 316 486 (General)</span>
                  <span className="block">+237 671 063 511 (Liaison)</span>
                </div>
              </div>
              <div className="flex items-start">
                <Mail className="w-5 h-5 text-amber-500 mr-3 shrink-0 mt-0.5" />
                <div className="text-gray-300">
                  <a href="mailto:madeccco5@gmail.com" className="block hover:text-amber-500 transition-colors">madeccco5@gmail.com</a>
                  <a href="mailto:madecccons@gmail.com" className="block hover:text-amber-500 transition-colors">madecccons@gmail.com</a>
                </div>
              </div>
              <div className="flex items-center">
                <Clock className="w-5 h-5 text-amber-500 mr-3 shrink-0" />
                <span className="text-gray-300">Mon - Fri: 8:00 AM - 6:00 PM</span>
              </div>
            </div>
          </div>

          {/* Quick Sitemap */}
          <div>
            <h3 id="footer-sitemap-title" className="text-white font-semibold text-base uppercase tracking-wider mb-6 pb-2 border-b border-gray-800">Sitemap</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <button onClick={() => handleLink('home')} className="hover:text-amber-500 transition-colors text-left cursor-pointer">
                  Home Showcase
                </button>
              </li>
              <li>
                <button onClick={() => handleLink('about')} className="hover:text-amber-500 transition-colors text-left cursor-pointer">
                  Our Corporate Profile
                </button>
              </li>
              <li>
                <button onClick={() => handleLink('residential')} className="hover:text-amber-500 transition-colors text-left cursor-pointer">
                  Residential Division
                </button>
              </li>
              <li>
                <button onClick={() => handleLink('commercial')} className="hover:text-amber-500 transition-colors text-left cursor-pointer">
                  Commercial & Industrial
                </button>
              </li>
              <li>
                <button onClick={() => handleLink('portfolio')} className="hover:text-amber-500 transition-colors text-left cursor-pointer">
                  Project Gallery
                </button>
              </li>
              <li>
                <button onClick={() => handleLink('blog')} className="hover:text-amber-500 transition-colors text-left cursor-pointer">
                  Technical Blog
                </button>
              </li>
              <li>
                <button onClick={() => handleLink('booking')} className="hover:text-amber-500 transition-colors text-left cursor-pointer text-amber-500 font-semibold">
                  Schedule Consultation
                </button>
              </li>
            </ul>
          </div>

          {/* Divisions Summary */}
          <div>
            <h3 id="footer-services-title" className="text-white font-semibold text-base uppercase tracking-wider mb-6 pb-2 border-b border-gray-800">Our Core Specialties</h3>
            <ul className="space-y-3 text-sm">
              <li className="text-gray-400">
                <span className="font-semibold text-gray-200 block">Custom Luxury Homes</span>
                <span className="text-xs text-gray-500">Premium design-build estate villas</span>
              </li>
              <li className="text-gray-400">
                <span className="font-semibold text-gray-200 block">Residential Renovations</span>
                <span className="text-xs text-gray-500">High-end structural refits & extension</span>
              </li>
              <li className="text-gray-400">
                <span className="font-semibold text-gray-200 block">Corporate Office Hubs</span>
                <span className="text-xs text-gray-500">Modern steel-frame corporate headquarters</span>
              </li>
              <li className="text-gray-400">
                <span className="font-semibold text-gray-200 block">Premium Commercial Retail</span>
                <span className="text-xs text-gray-500">Lifestyle centers & high-visibility galleries</span>
              </li>
            </ul>
          </div>

          {/* Newsletter Form */}
          <div>
            <h3 id="footer-newsletter-title" className="text-white font-semibold text-base uppercase tracking-wider mb-6 pb-2 border-b border-gray-800">Industry Insights</h3>
            <p className="text-sm text-gray-400 mb-4 leading-relaxed">
              Subscribe to the MADECC Group technical newsletter to receive professional updates on material sciences, engineering guidelines, and home layouts.
            </p>
            
            <form onSubmit={handleSubscribe} className="space-y-3">
              <div className="flex rounded-none overflow-hidden shadow-sm border border-gray-800 focus-within:border-amber-500 transition-colors">
                <input
                  id="newsletter-email-input"
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={status === 'loading'}
                  required
                  className="bg-gray-900 border-none px-4 py-3 text-sm text-white focus:outline-none w-full placeholder-gray-600 disabled:opacity-50 rounded-none"
                />
                <button
                  id="newsletter-submit-btn"
                  type="submit"
                  disabled={status === 'loading'}
                  className="bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-gray-950 px-4 flex items-center justify-center transition-colors cursor-pointer rounded-none"
                  aria-label="Submit newsletter registration"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>

              {/* Anti-Bot Challenge */}
              <div className="p-3 bg-gray-950/60 border border-gray-800 rounded-none space-y-1">
                <label htmlFor="newsletter-bot" className="block text-[10px] font-semibold uppercase tracking-wider text-amber-500">
                  Verify session (2x + 10 = 20)
                </label>
                <div className="flex items-center space-x-2">
                  <span className="text-[11px] text-gray-400 font-mono">x = </span>
                  <input
                    id="newsletter-bot"
                    type="text"
                    required
                    value={botAnswer}
                    onChange={(e) => setBotAnswer(e.target.value)}
                    placeholder="Value..."
                    disabled={status === 'loading'}
                    className="bg-gray-900 border border-gray-800 focus:border-amber-500 text-white rounded-none px-2 py-1 text-xs focus:outline-none disabled:opacity-50 w-20 font-mono"
                  />
                </div>
              </div>

              {/* Status Notifications */}
              {status === 'success' && (
                <div id="newsletter-success-msg" className="flex items-center text-xs text-emerald-400 bg-emerald-950/40 p-2.5 rounded-none border border-emerald-500/20">
                  <CheckCircle className="w-4 h-4 mr-2 shrink-0" />
                  <span>{message}</span>
                </div>
              )}

              {status === 'error' && (
                <div id="newsletter-error-msg" className="flex items-center text-xs text-rose-400 bg-rose-950/40 p-2.5 rounded-none border border-rose-500/20">
                  <AlertTriangle className="w-4 h-4 mr-2 shrink-0" />
                  <span>{message}</span>
                </div>
              )}
            </form>
          </div>

        </div>

        <hr className="border-gray-900 my-12" />

        {/* Legal and AdSense Compliance Row */}
        <div className="flex flex-col md:flex-row items-center justify-between text-xs space-y-4 md:space-y-0 text-gray-500">
          <p>© {new Date().getFullYear()} MADECC Group. All Rights Reserved. CA State Contractor License #986542.</p>
          <div className="flex flex-wrap gap-x-6 gap-y-2 justify-center">
            <button onClick={() => handleLink('privacy')} className="hover:text-amber-500 transition-colors cursor-pointer">
              Privacy Policy
            </button>
            <button onClick={() => handleLink('terms')} className="hover:text-amber-500 transition-colors cursor-pointer">
              Terms & Conditions
            </button>
            <button onClick={() => handleLink('cookie')} className="hover:text-amber-500 transition-colors cursor-pointer">
              Cookie Policy
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
}
