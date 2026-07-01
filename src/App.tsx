/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import {
  HardHat, ArrowRight, ShieldCheck, Award, ThumbsUp, CheckCircle, Clock,
  MapPin, Phone, Mail, ChevronRight, HelpCircle, Star, Calendar, FileText,
  TrendingUp, Compass, HeartHandshake, ShieldAlert
} from 'lucide-react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AdminPanel from './components/AdminPanel';
import ReviewWidget from './components/ReviewWidget';
import AppointmentForm from './components/AppointmentForm';
import ContactForm from './components/ContactForm';
import FloatingSupportWidget from './components/FloatingSupportWidget';
import SEOHead from './components/SEOHead';
import { SlidingMediaShowcase } from './components/SlidingMediaShowcase';
import { Project, BlogPost, Review } from './types';

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedBlogSlug, setSelectedBlogSlug] = useState<string | null>(null);

  // Core Data State fetched from backend APIs
  const [projects, setProjects] = useState<Project[]>([]);
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [approvedReviews, setApprovedReviews] = useState<Review[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  // Authentication State
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  // Initial authentication and data loading
  useEffect(() => {
    checkAdminToken();
    loadAllData();
  }, []);

  const checkAdminToken = async () => {
    const token = localStorage.getItem('madecc_admin_token');
    if (!token) return;

    try {
      const response = await fetch('/api/auth/verify', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setIsAdminLoggedIn(true);
      } else {
        localStorage.removeItem('madecc_admin_token');
        setIsAdminLoggedIn(false);
      }
    } catch (err) {
      console.error('Verify token failed:', err);
    }
  };

  const loadAllData = async () => {
    setDataLoading(true);
    let success = false;
    try {
      const [pRes, bRes, rRes] = await Promise.all([
        fetch('/api/projects'),
        fetch('/api/blog'),
        fetch('/api/reviews')
      ]);

      if (pRes.ok && bRes.ok && rRes.ok) {
        const pContentType = pRes.headers.get('content-type');
        const bContentType = bRes.headers.get('content-type');
        const rContentType = rRes.headers.get('content-type');
        
        if (pContentType?.includes('application/json') && 
            bContentType?.includes('application/json') && 
            rContentType?.includes('application/json')) {
          setProjects(await pRes.json());
          setBlogs(await bRes.json());
          setApprovedReviews(await rRes.json());
          success = true;
        }
      }
    } catch (error) {
      console.warn('API fetch failed, falling back to local static data:', error);
    }

    if (!success) {
      console.log('💡 Website running in Static Client-Only Safe Mode (Optimized for Netlify / GitHub Pages)');
      // Default fallback projects
      setProjects([
        {
          id: 'proj-1',
          title: 'The Crestwood Luxury Villa',
          category: 'residential',
          location: 'Beverly Hills, CA',
          description: 'A bespoke 6-bedroom architectural masterpiece featuring off-form architectural concrete, floor-to-ceiling high-performance structural glazing, integrated smart automation, an infinity pool with passive heating, and certified LEED-gold sustainability frameworks. Designed and executed as the signature residential reference of MADECC Group.',
          image: '/src/assets/images/luxury_residential_1782866705938.jpg',
          completionDate: '2025-11-15',
          client: 'The Crestwood Trust',
          area: '8,200 sq ft'
        },
        {
          id: 'proj-2',
          title: 'AeroCenter Corporate Headquarters',
          category: 'commercial',
          location: 'Silicon Valley, CA',
          description: 'An iconic 5-story commercial development boasting steel-frame structural integrity, energy-reflective low-E curtain wall facades, a sprawling rooftop sky deck with greywater irrigation, and flexible open-plan smart workspace interiors. Engineered for high-density occupancy and modern commercial efficiency.',
          image: '/src/assets/images/premium_commercial_1782866720726.jpg',
          completionDate: '2026-03-22',
          client: 'AeroCenter Inc.',
          area: '45,000 sq ft'
        },
        {
          id: 'proj-3',
          title: 'The Heights Eco-Estates',
          category: 'residential',
          location: 'Pacific Palisades, CA',
          description: 'A private residential enclave prioritizing regenerative home design, high-insulation timber frame structures, custom interior wood joinery, solar microgrids, and local rainwater harvesting. It represents the pinnacle of sustainable luxury living, blending seamlessly into the hillside topography.',
          image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop',
          completionDate: '2025-08-10',
          client: 'Palisades Living LLC',
          area: '12,500 sq ft (Total)'
        },
        {
          id: 'proj-4',
          title: 'Vanguard Retail Pavilion',
          category: 'commercial',
          location: 'Los Angeles, CA',
          description: 'A premium lifestyle retail development showcasing structural timber elements, polished architectural concrete, spacious double-height galleries, and optimized customer-flow logistics. Designed to provide high-visibility retail spaces with maximum flexible layout potential.',
          image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop',
          completionDate: '2026-01-05',
          client: 'Vanguard Properties',
          area: '22,000 sq ft'
        }
      ]);

      // Default fallback blogs
      setBlogs([
        {
          id: 'blog-1',
          title: 'Top 5 Sustainable Materials for Modern Residential Construction',
          slug: 'sustainable-materials-modern-residential-construction',
          content: `<h2>The Rise of Sustainable Construction in Luxury Homes</h2>\n<p>As the construction industry advances, sustainability has transitioned from an optional feature to the core foundation of high-end home design. Homeowners and real estate developers today prioritize eco-conscious materials that reduce carbon footprints while simultaneously improving thermal efficiency, air quality, and visual luxury. At <strong>MADECC Group</strong>, we specialize in implementing advanced materials that perform excellently over decades.</p>\n\n<h3>1. Mass Timber and Cross-Laminated Timber (CLT)</h3>\n<p>Mass timber is revolutionizing multi-story and custom residential construction. It provides the strength of steel and concrete but with a fraction of the carbon footprint. Cross-laminated timber (CLT) acts as a beautiful carbon sink, locking carbon inside the structural walls of the building while offering outstanding acoustic insulation and warm natural aesthetics for interior design.</p>\n\n<h3>2. Low-Carbon Off-Form Concrete</h3>\n<p>Concrete is the bedrock of strong, durable structures, but traditional concrete contributes significantly to industrial carbon output. Modern low-carbon concrete utilizes supplementary cementitious materials (SCMs) like slag or fly ash, reducing chemical carbon emissions by up to 50% while maintaining equivalent high structural load performance and a beautiful polished, modernist industrial aesthetic.</p>\n\n<h3>3. High-Performance Insulated Concrete Forms (ICFs)</h3>\n<p>Insulated Concrete Forms (ICFs) consist of interlocking panels of high-density insulation that remain in place after concrete is poured. This creates a monolithic concrete wall sandwiched between two layers of premium insulation, offering unmatched thermal massing, hurricane resistance, and reduced energy costs for heating and cooling.</p>\n\n<h3>4. Recycled Steel and Smart Glass</h3>\n<p>Steel provides structural agility and is highly recyclable. Pairing structural steel frames with solar-control low-emissivity (Low-E) smart glass ensures that large-format panoramic windows can be integrated into luxury homes without compromising the building's thermal performance or causing solar heat glare.</p>\n\n<h3>Conclusion</h3>\n<p>Investing in premium sustainable materials increases property value, complies with tightening local green building regulations, and creates a healthy, quiet environment for families. Partnering with an experienced builder like MADECC Group ensures that these advanced materials are correctly detailed, planned, and assembled.</p>`,
          metaDescription: 'Discover the top 5 sustainable building materials transforming luxury custom homes. Learn how mass timber, low-carbon concrete, and smart glass improve energy efficiency.',
          keywords: 'sustainable construction, custom home building, eco-friendly materials, luxury residential contractors, green building design, MADECC Group',
          featuredImage: '/src/assets/images/luxury_residential_1782866705938.jpg',
          author: 'Chief Engineering Officer, MADECC Group',
          date: '2026-06-15',
          category: 'Building Materials'
        },
        {
          id: 'blog-2',
          title: 'Demystifying Commercial Construction: A Strategic Guide for Developers',
          slug: 'commercial-construction-strategic-guide-developers',
          content: `<h2>Navigating the Complexity of Commercial Projects</h2>\n<p>Developing a commercial project—be it a premium office space, retail center, or industrial facility—requires meticulously synchronized planning, strict cost control, and specialized regulatory alignment. A delay in commercial development directly translates to lost revenue, making contractor selection one of the most critical decisions a property developer can make.</p>\n\n<h3>The Pre-Construction Planning Phase</h3>\n<p>Comprehensive pre-construction planning is where projects succeed or fail. This stage involves absolute alignment between structural engineers, commercial architects, safety officers, and estimators. It includes:</p>\n<ul>\n<li>Detailed geotechnical and environmental site surveys</li>\n<li>Zoning compliance and municipal utility coordination</li>\n<li>Accurate materials estimating to lock down the budget early</li>\n</ul>\n\n<h3>The Importance of Value Engineering</h3>\n<p>Value engineering is the practice of analyzing design choices to find more cost-effective alternatives without compromising quality, durability, or safety. For instance, selecting premium steel structures can offer more open-span layouts inside retail spaces, increasing rentable square footage and enhancing long-term value.</p>\n\n<h3>Selecting Your Project Delivery Method</h3>\n<p>Depending on your budget and timeline risk tolerance, you might select between <strong>Design-Bid-Build</strong> or <strong>Design-Build</strong>. Under the Design-Build model pioneered by premium general contractors like MADECC Group, a single contract covers both the architectural drafting and actual physical assembly. This minimizes miscommunications and drastically shortens construction schedules.</p>\n\n<h3>Summary</h3>\n<p>Successful commercial real estate development relies on professional management systems, transparent progress reporting, and reliable builders. Contact MADECC Group to discover how our value engineering and project delivery methods can secure your next commercial development.</p>`,
          metaDescription: 'A developer guide to commercial construction. Learn about pre-construction planning, value engineering, and choosing between Design-Build and Design-Bid-Build models.',
          keywords: 'commercial construction company, commercial property developers, design-build contractors, value engineering, office construction, MADECC Group',
          featuredImage: '/src/assets/images/premium_commercial_1782866720726.jpg',
          author: 'Principal Developer, MADECC Group',
          date: '2026-06-20',
          category: 'Commercial Development'
        }
      ]);

      // Default fallback reviews
      const localReviews = JSON.parse(localStorage.getItem('madecc_local_reviews') || '[]');
      setApprovedReviews([
        {
          id: 'rev-1',
          name: 'Marcus K. Vance',
          email: 'marcus.vance@vancetech.com',
          rating: 5,
          review: 'MADECC Group built our brand new commercial headquarters and their attention to detail was stellar. From the complex foundation work to the structural glass curtain wall installation, everything was delivered on schedule. Their value engineering saved us over 8% on material costs without sacrificing design.',
          approved: true,
          date: '2026-04-18'
        },
        {
          id: 'rev-2',
          name: 'Eleanor and David Sterling',
          email: 'e.sterling@palisades.org',
          rating: 5,
          review: 'Building a custom luxury villa is a highly emotional and complex journey. The team at MADECC Group acted as trusted partners. They understood our architectural vision, accommodated advanced green home designs, and completed beautiful exposed concrete finishes that are now the centerpiece of our home.',
          approved: true,
          date: '2026-05-12'
        },
        {
          id: 'rev-3',
          name: 'Samantha Lopez',
          email: 'sam@lopezretail.co',
          rating: 4,
          review: 'Excellent renovation job on our retail boutique storefronts. The site coordination team kept construction noise and dust contained, allowing neighboring shops to remain open. Professional communication from start to finish.',
          approved: true,
          date: '2026-06-02'
        },
        ...localReviews
      ]);
    }
    setDataLoading(false);
  };

  const handleAdminLoginSuccess = (token: string) => {
    setIsAdminLoggedIn(true);
    setCurrentPage('admin');
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('madecc_admin_token');
    setIsAdminLoggedIn(false);
    setCurrentPage('home');
  };

  // SEO Configurations based on page state
  const getSEOConfig = () => {
    switch (currentPage) {
      case 'home':
        return {
          title: 'Building Your Vision with Quality & Trust',
          description: 'MADECC Group is California’s premium construction company specializing in luxury Custom Residential Construction and high-performance Commercial building developments.',
          keywords: 'construction company, residential construction services, commercial construction company, building contractors, property development, MADECC Group'
        };
      case 'about':
        return {
          title: 'Corporate Profile, Values & Commitments',
          description: 'Learn about the history, vision, safety commitment, and quality engineering standards that define the prestige of MADECC Group Construction.',
          keywords: 'about construction firm, general contractor profile, building specialists, safety standard construction, MADECC Group history'
        };
      case 'residential':
        return {
          title: 'Premium Residential Construction Division',
          description: 'Specialized luxury residential building services including custom architectural estates, complete structural renovations, and modern home extensions.',
          keywords: 'residential construction services, luxury custom homes, renovation contractors, building expansions, interior finishing, custom residential projects'
        };
      case 'commercial':
        return {
          title: 'Corporate Commercial Construction & Renovations',
          description: 'Sleek corporate offices, retail pavilions, and industrial development. Discover how our engineering optimizations create high-yield commercial properties.',
          keywords: 'commercial construction company, commercial renovators, office construction, retail building development, property developer California'
        };
      case 'portfolio':
        return {
          title: 'Contractor Project Portfolio & Gallery',
          description: 'Explore our filterable gallery of award-winning residential and commercial projects completed across California by MADECC Group.',
          keywords: 'completed construction projects, portfolio villa, building case studies, retail project gallery, architecture photos'
        };
      case 'blog':
        if (selectedBlogSlug) {
          const currentPost = blogs.find(b => b.slug === selectedBlogSlug);
          return {
            title: currentPost ? currentPost.title : 'Technical Insights',
            description: currentPost ? currentPost.metaDescription : 'Technical analyses from our building panel.',
            keywords: currentPost ? currentPost.keywords : 'construction trends, building materials, design'
          };
        }
        return {
          title: 'Technical Building Insights & Construction Blog',
          description: 'Articles regarding advanced sustainable materials, value engineering guidelines, commercial site choices, and architectural aesthetics.',
          keywords: 'construction tips, building materials, home design, commercial development, construction trends, MADECC Group blog'
        };
      case 'contact':
        return {
          title: 'Contact Our Planning Panel',
          description: 'Get in touch with MADECC Group. Inquire about pricing estimations, structural feasibility, or office locations in Beverly Hills.',
          keywords: 'contact construction company, request price estimation, general contractor phone, Beverly Hills builder office'
        };
      case 'booking':
        return {
          title: 'Book a Consultation Appointment',
          description: 'Schedule a secure, detailed consultation with a MADECC Group project officer. Propose a date to review structural drawings and budgets.',
          keywords: 'book appointment builder, scheduling consultation, construction project review'
        };
      default:
        return {
          title: 'Corporate Portal',
          description: 'Welcome to the official web portal of MADECC Group.',
          keywords: 'MADECC Group, general contractor'
        };
    }
  };

  const seo = getSEOConfig();

  // Route helper
  const navigateTo = (page: string) => {
    setCurrentPage(page);
    setSelectedBlogSlug(null);
  };

  // Blog post selection helper
  const selectBlogPost = (slug: string) => {
    setSelectedBlogSlug(slug);
    setCurrentPage('blog');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };


  return (
    <div className="min-h-screen flex flex-col bg-gray-950 text-gray-100 font-sans selection:bg-amber-500 selection:text-gray-950">
      
      {/* Technical Dynamic SEO and Schema.org Management */}
      <SEOHead
        title={seo.title}
        description={seo.description}
        keywords={seo.keywords}
      />

      {/* Persistent Navigation Header */}
      <Navbar
        currentPage={currentPage}
        onNavigate={navigateTo}
        isAdminLoggedIn={isAdminLoggedIn}
        onAdminLogout={handleAdminLogout}
      />

      {/* Main Content Area */}
      <main className="flex-grow">
        
        {/* ==================== 1. HOME SHOWCASE ==================== */}
        {currentPage === 'home' && (
          <div id="view-home" className="space-y-24 pb-24 animate-fade-in">
            
            {/* Massive Hero Section */}
            <section id="hero-section" className="relative min-h-[85vh] flex items-center bg-[url('https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=1920&auto=format&fit=crop&q=80')] bg-cover bg-center">
              {/* Dark Charcoal Vignette Gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-gray-950 via-gray-950/85 to-transparent"></div>
              
              {/* Blueprint Grid/Dot Structural Overlay */}
              <div className="absolute inset-0 opacity-15 pointer-events-none" style={{ backgroundImage: 'radial-gradient(rgba(196, 155, 72, 0.25) 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-gray-950/40"></div>
              
              <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 z-10 w-full">
                <div className="max-w-3xl space-y-6">
                  <div className="inline-flex items-center space-x-2 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-none text-amber-500 text-xs font-semibold tracking-widest uppercase">
                    <HardHat className="w-3.5 h-3.5 mr-1" />
                    <span>Established Quality & Safety</span>
                  </div>
                  
                  <h1 id="hero-title" className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-none font-sans uppercase">
                    BUILDING YOUR <span className="text-amber-500">VISION</span> WITH <br />
                    PRECISION & TRUST
                  </h1>
                  
                  <p id="hero-description" className="text-base sm:text-lg text-gray-400 leading-relaxed max-w-2xl">
                    MADECC Group is a premier design-build construction contractor. We specialize exclusively in engineering high-end custom Residential developments and constructing high-performance Commercial infrastructure.
                  </p>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4">
                    <button
                      id="hero-cta-consult"
                      onClick={() => navigateTo('booking')}
                      className="px-10 py-4 bg-amber-500 hover:bg-amber-600 active:scale-95 text-gray-950 font-bold uppercase tracking-widest text-xs rounded-none transition-all cursor-pointer shadow-xl hover:shadow-amber-500/20 text-center"
                    >
                      Request Consultation
                    </button>
                    <button
                      id="hero-cta-portfolio"
                      onClick={() => navigateTo('portfolio')}
                      className="px-10 py-4 bg-transparent hover:bg-gray-900 border border-gray-700 hover:border-white text-white font-bold uppercase tracking-widest text-xs rounded-none transition-all cursor-pointer text-center"
                    >
                      Explore Project Gallery
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Introductory Statement Block */}
            <section id="intro-statement" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="bg-gray-900 border border-gray-800 p-8 sm:p-12 rounded-lg grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-8 space-y-4">
                  <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-sans">Engineering Landmarks, Securing Structures</h2>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    At MADECC Group, we do not build from standard templates. Every architectural blueprint is treated as a unique spatial puzzle requiring advanced materials analysis, strict cost modeling, and robust safety protocols. Whether completing an expansive off-form concrete estate or a multi-level commercial pavilion, we maintain certified local compliance and a pristine project execution track record.
                  </p>
                </div>
                <div className="lg:col-span-4 flex justify-start lg:justify-end">
                  <button
                    id="intro-about-btn"
                    onClick={() => navigateTo('about')}
                    className="flex items-center space-x-2 text-sm text-amber-500 font-bold uppercase tracking-wider hover:text-white transition-colors cursor-pointer group"
                  >
                    <span>Read Corporate Story</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              </div>
            </section>

            {/* Division Highlight Blocks */}
            <section id="divisions-showcase" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
              <div className="text-center space-y-3">
                <span className="text-xs uppercase font-semibold text-amber-500 tracking-widest block">Division Highlights</span>
                <h2 className="text-3xl font-extrabold text-white tracking-tight">Our Specialized Sectors</h2>
                <div className="w-12 h-1 bg-amber-500 mx-auto rounded"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Residential Block */}
                <div className="group bg-gray-900 border border-gray-800 rounded-lg overflow-hidden flex flex-col justify-between transition-all duration-300 hover:border-amber-500/40 hover:-translate-y-1 shadow-xl">
                  <div>
                    <div className="relative h-64 overflow-hidden">
                      <img
                        src="/src/assets/images/luxury_residential_1782866705938.jpg"
                        alt="Bespoke luxury home"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent"></div>
                      <span className="absolute bottom-4 left-4 bg-amber-500 text-gray-950 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded">Residential Division</span>
                    </div>
                    <div className="p-6 sm:p-8 space-y-4">
                      <h3 className="text-xl font-bold text-white group-hover:text-amber-500 transition-colors">Custom Luxury Living</h3>
                      <p className="text-xs text-gray-400 leading-relaxed">
                        From monolithic architectural concrete villas on coastal slopes to certified LEED-gold regenerative timber framework estates. We manage advanced site grading, smart automation integration, high-insulation envelopes, and luxurious custom finishes.
                      </p>
                    </div>
                  </div>
                  <div className="p-6 sm:p-8 pt-0">
                    <button
                      id="home-residential-btn"
                      onClick={() => navigateTo('residential')}
                      className="flex items-center text-xs text-amber-500 font-bold uppercase tracking-wider group-hover:text-white transition-colors cursor-pointer"
                    >
                      <span>Explore Residential Division</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Commercial Block */}
                <div className="group bg-gray-900 border border-gray-800 rounded-lg overflow-hidden flex flex-col justify-between transition-all duration-300 hover:border-amber-500/40 hover:-translate-y-1 shadow-xl">
                  <div>
                    <div className="relative h-64 overflow-hidden">
                      <img
                        src="/src/assets/images/premium_commercial_1782866720726.jpg"
                        alt="High performance commercial building"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent"></div>
                      <span className="absolute bottom-4 left-4 bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded">Commercial Division</span>
                    </div>
                    <div className="p-6 sm:p-8 space-y-4">
                      <h3 className="text-xl font-bold text-white group-hover:text-amber-500 transition-colors">High-Performance Corporate Space</h3>
                      <p className="text-xs text-gray-400 leading-relaxed">
                        We design and construct premium multi-story corporate headquarters, high-density lifestyle retail pavilions, and modern commercial hubs. Focused heavily on load-path efficiency, low-E glazing systems, value engineering, and accelerated timelines.
                      </p>
                    </div>
                  </div>
                  <div className="p-6 sm:p-8 pt-0">
                    <button
                      id="home-commercial-btn"
                      onClick={() => navigateTo('commercial')}
                      className="flex items-center text-xs text-amber-500 font-bold uppercase tracking-wider group-hover:text-white transition-colors cursor-pointer"
                    >
                      <span>Explore Commercial Division</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>
            </section>

            {/* Why Choose Us: Grid of Pillars */}
            <section id="why-choose-us" className="bg-[#111827]/40 border-y border-gray-900 py-24">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
                <div className="text-center space-y-3">
                  <span className="text-xs uppercase font-semibold text-amber-500 tracking-widest block">Structural Excellence</span>
                  <h2 className="text-3xl font-extrabold text-white tracking-tight">Why Choose MADECC Group?</h2>
                  <div className="w-12 h-1 bg-amber-500 mx-auto rounded"></div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                  {[
                    { title: 'Rigid Safety Oversight', icon: ShieldCheck, desc: 'Every field crew operates under strict OSHA compliance, certified site-specific safety plans, and proactive risk-mitigation audits.' },
                    { title: 'Value Engineering', icon: Award, desc: 'We systematically analyze layout options to optimize structural materials, reducing costs by 8-12% while maintaining absolute architectural integrity.' },
                    { title: 'Design-Build Delivery', icon: Compass, desc: 'Single-source contractor management covers planning, structural calculations, grading, and actual physical assembly, preventing communication gaps.' },
                    { title: 'Durable Compliance', icon: HeartHandshake, desc: 'Every concrete pour, structural weld, and electrical loop is certified by local code specialists, securing durable property equity.' }
                  ].map((pillar, idx) => {
                    const IconComp = pillar.icon;
                    return (
                      <div key={idx} className="p-6 bg-gray-900 border border-gray-800 rounded-lg hover:border-amber-500/20 transition-colors text-center space-y-4">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20 mb-2">
                          <IconComp className="w-5 h-5" />
                        </div>
                        <h3 className="text-base font-bold text-white font-sans">{pillar.title}</h3>
                        <p className="text-xs text-gray-400 leading-relaxed">{pillar.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* Featured Projects Bento Grid */}
            <section id="featured-projects" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div className="space-y-2">
                  <span className="text-xs uppercase font-semibold text-amber-500 tracking-widest block">Featured Commissions</span>
                  <h2 className="text-3xl font-extrabold text-white tracking-tight">Built Masterpieces</h2>
                </div>
                <button
                  id="view-all-projects-btn"
                  onClick={() => navigateTo('portfolio')}
                  className="flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold text-amber-500 border border-amber-500/20 rounded bg-amber-500/5 hover:bg-amber-500 hover:text-gray-950 transition-colors cursor-pointer"
                >
                  <span>Explore All Commissions</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {projects.length === 0 ? (
                <div className="text-center py-12 text-gray-500">Loading featured projects...</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {projects.slice(0, 2).map((p) => (
                    <div key={p.id} className="group bg-gray-900 border border-gray-800 rounded-lg overflow-hidden flex flex-col justify-between shadow-lg">
                      <div className="relative h-72 overflow-hidden">
                        <img src={p.image} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
                        <span className="absolute top-4 left-4 bg-gray-950/80 text-amber-500 text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded border border-gray-800">{p.location}</span>
                      </div>
                      <div className="p-6 sm:p-8 space-y-4">
                        <span className="text-[10px] uppercase font-bold text-amber-500 tracking-wider block">{p.category}</span>
                        <h3 className="text-lg font-bold text-white">{p.title}</h3>
                        <p className="text-xs text-gray-400 leading-relaxed line-clamp-3">{p.description}</p>
                      </div>
                      <div className="p-6 sm:p-8 pt-0 border-t border-gray-800/50 flex justify-between items-center text-xs text-gray-500">
                        <span>Client: <strong>{p.client}</strong></span>
                        <span>Built: <strong>{p.completionDate}</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Testimonials Review Widget Wrapper */}
            <section id="home-testimonials" className="bg-[#111827]/40 border-y border-gray-900 py-24">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
                <div className="text-center space-y-3">
                  <span className="text-xs uppercase font-semibold text-amber-500 tracking-widest block">Client Feedback</span>
                  <h2 className="text-3xl font-extrabold text-white tracking-tight font-sans">What Our Clients Say</h2>
                  <div className="w-12 h-1 bg-amber-500 mx-auto rounded"></div>
                </div>

                <ReviewWidget
                  reviews={approvedReviews}
                  onReviewSubmitted={loadAllData}
                />
              </div>
            </section>

            {/* Core home contact CTA Banner */}
            <section id="contact-cta-banner" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="bg-gradient-to-r from-gray-900 to-gray-950 border border-amber-500/20 p-8 sm:p-16 rounded-xl text-center space-y-6 relative overflow-hidden shadow-2xl">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-500/5 rounded-full blur-3xl"></div>
                
                <h2 className="text-3xl font-extrabold text-white font-sans tracking-tight">Ready to Discuss Your Project?</h2>
                <p className="text-sm text-gray-400 max-w-xl mx-auto leading-relaxed">
                  Connect with our estimators to outline spatial goals, request budget projections, and review engineering parameters. We are ready to execute your design-build blueprints.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
                  <button
                    id="cta-banner-consult"
                    onClick={() => navigateTo('booking')}
                    className="px-8 py-3.5 bg-amber-500 hover:bg-amber-600 text-gray-950 font-bold uppercase tracking-wider text-xs rounded shadow-lg shadow-amber-500/15 cursor-pointer"
                  >
                    Schedule Consult
                  </button>
                  <button
                    id="cta-banner-contact"
                    onClick={() => navigateTo('contact')}
                    className="px-8 py-3.5 bg-gray-800 hover:bg-gray-700 text-white font-bold uppercase tracking-wider text-xs rounded cursor-pointer border border-gray-700 hover:border-gray-500"
                  >
                    Contact Office
                  </button>
                </div>
              </div>
            </section>

          </div>
        )}


        {/* ==================== 2. ABOUT PAGE ==================== */}
        {currentPage === 'about' && (
          <div id="view-about" className="py-16 sm:py-24 space-y-24 animate-fade-in">
            
            {/* Page Header */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
              <span className="text-xs uppercase font-semibold text-amber-500 tracking-widest block">Corporate Profile</span>
              <h1 className="text-4xl font-extrabold text-white tracking-tight sm:text-5xl font-sans">About MADECC Group</h1>
              <div className="w-16 h-1 bg-amber-500 mx-auto rounded"></div>
              <p className="text-sm text-gray-400 max-w-xl mx-auto leading-relaxed">
                A design-build construction company providing elite engineering and structural services for high-end residential estates and premium commercial hubs.
              </p>
            </div>

            {/* Corporate Story and Mission Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-6 space-y-6">
                <h2 className="text-2xl font-bold text-white tracking-tight">Our Story & Core Philosophy</h2>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Established with a commitment to raise the bar in structural execution, <strong>MADECC Group</strong> has grown into a trusted construction partner in California. Our founders recognized that the modern construction landscape was plagued by miscommunications between separate architectural drafting agencies and physical contracting crews, which led to timeline expansions and budget inflation.
                </p>
                <p className="text-xs text-gray-400 leading-relaxed">
                  By pioneering a comprehensive, single-source <strong>Design-Build</strong> process, we integrated technical architects, structural engineers, cost analysts, and skilled field operators into a unified planning panel. This ensures that every drawing is calibrated for structural efficiency, material cost minimization, and local code compliance from day one.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-900">
                  <div className="p-4 bg-gray-900/60 rounded border border-gray-800">
                    <h3 className="text-sm font-bold text-amber-500">Our Corporate Mission</h3>
                    <p className="text-[11px] text-gray-400 mt-2 leading-relaxed">To engineer enduring physical landmark structures that fuse custom spatial luxury, rigorous technical safety, and highly optimized budgets.</p>
                  </div>
                  <div className="p-4 bg-gray-900/60 rounded border border-gray-800">
                    <h3 className="text-sm font-bold text-amber-500">Our Strategic Vision</h3>
                    <p className="text-[11px] text-gray-400 mt-2 leading-relaxed">To define modern standards in California design-build construction, leading the industry in value engineering, and sustainable materials.</p>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-6">
                <img
                  src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&auto=format&fit=crop"
                  alt="Construction structure steel"
                  referrerPolicy="no-referrer"
                  className="rounded-lg shadow-2xl border border-gray-800 w-full object-cover h-96"
                />
              </div>
            </div>

            {/* Values Grid */}
            <div className="bg-[#111827]/40 border-y border-gray-900 py-24">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
                <div className="text-center space-y-3">
                  <span className="text-xs uppercase font-semibold text-amber-500 tracking-widest block">Company Pillars</span>
                  <h2 className="text-3xl font-extrabold text-white tracking-tight">Our Core Values</h2>
                  <div className="w-12 h-1 bg-amber-500 mx-auto rounded"></div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                  {[
                    { title: 'Absolute Integrity', desc: 'No hidden contingencies, transparent cost tracking, honest materials appraisal, and open-book progress reporting.' },
                    { title: 'Rigid Engineering Quality', desc: 'We operate to standards exceeding general local codes, employing meticulous soil analysis and steel testing.' },
                    { title: 'Empathetic Client Partnership', desc: 'We align deeply to your spatial objectives, adapting plans dynamically while protecting budget boundaries.' }
                  ].map((val, idx) => (
                    <div key={idx} className="bg-gray-900 border border-gray-800 p-6 rounded-lg space-y-3 text-center">
                      <span className="text-3xl font-extrabold text-amber-500/40">0{idx + 1}</span>
                      <h3 className="text-base font-bold text-white">{val.title}</h3>
                      <p className="text-xs text-gray-400 leading-relaxed">{val.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Safety Commitment, Quality Standards, and Process Timeline */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="p-8 bg-gray-900 border border-gray-800 rounded-lg space-y-4">
                  <span className="inline-flex items-center text-xs font-semibold uppercase tracking-wider text-amber-500"><ShieldCheck className="w-4 h-4 mr-1.5" /> Safety Commitment</span>
                  <h3 className="text-xl font-bold text-white">OSHA compliant, site-specific safety plans</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    At MADECC Group, safety is not a line item—it is our first operational filter. No structural element is raised, no foundation is poured, and no trench is cut without a certified site-specific safety plan (SSSP). We maintain an outstanding Experience Modification Rate (EMR) through constant safety officer on-site presence, daily pre-shift danger reviews, and structured rigging equipment certifications.
                  </p>
                </div>
                <div className="p-8 bg-gray-900 border border-gray-800 rounded-lg space-y-4">
                  <span className="inline-flex items-center text-xs font-semibold uppercase tracking-wider text-amber-500"><Award className="w-4 h-4 mr-1.5" /> Quality Standards</span>
                  <h3 className="text-xl font-bold text-white">Rigorous structural material auditing</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Our structural concrete formulas, rebar layouts, load-bearing timber frameworks, and structural glass curtain walls are sourced exclusively from audited local suppliers. We carry out third-party independent slump, compression, and weld testing on every commercial project. This guarantees that your physical property is constructed to resist geographic shifts, extreme winds, and seismic loads.
                  </p>
                </div>
              </div>

              {/* Construction Process Timeline */}
              <div className="space-y-12">
                <div className="text-center space-y-2">
                  <span className="text-xs uppercase font-semibold text-amber-500 tracking-widest block">Operations Roadmap</span>
                  <h3 className="text-2xl font-bold text-white">Our Construction Process</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-5 gap-6 relative">
                  {[
                    { step: '01', title: 'Consultation', desc: 'Identify objectives, structural parameters, and budget scopes.' },
                    { step: '02', title: 'Design & Draft', desc: 'Synthesize architecture blueprints and structural formulas.' },
                    { step: '03', title: 'Pre-Con Planning', desc: 'Execute grading reviews, municipal zoning, and lock final costs.' },
                    { step: '04', title: 'Construction', desc: 'Raise steel, pour certified concrete, and fit custom layouts.' },
                    { step: '05', title: 'Final Review', desc: 'Pass rigorous code audits and execute final handover.' }
                  ].map((proc, idx) => (
                    <div key={idx} className="p-5 bg-gray-900 border border-gray-800 rounded relative group hover:border-amber-500/20 transition-colors">
                      <span className="text-xs font-extrabold text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2 py-1 rounded inline-block mb-3">{proc.step}</span>
                      <h4 className="text-xs font-bold text-white tracking-wider uppercase mb-1">{proc.title}</h4>
                      <p className="text-[11px] text-gray-500 leading-normal">{proc.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        )}


        {/* ==================== 3. RESIDENTIAL CONSTRUCTION ==================== */}
        {currentPage === 'residential' && (
          <div id="view-residential" className="py-16 sm:py-24 space-y-24 animate-fade-in">
            
            {/* Header */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
              <span className="text-xs uppercase font-semibold text-amber-500 tracking-widest block">Residential Division</span>
              <h1 className="text-4xl font-extrabold text-white tracking-tight sm:text-5xl font-sans">Residential Construction</h1>
              <div className="w-16 h-1 bg-amber-500 mx-auto rounded"></div>
              <p className="text-sm text-gray-400 max-w-xl mx-auto leading-relaxed">
                SEO-optimized premium residential builders specializing in high-end luxury custom estates, extensions, renovations, and architectural concrete layouts.
              </p>
            </div>

            {/* Sliding Media Gallery */}
            <SlidingMediaShowcase category="residential" />

            {/* Service catalog grids */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { title: 'New Custom Estates', desc: 'Designing and executing high-end luxury homes from the ground up, utilizing modern concrete foundations, custom timber post-and-beams, and off-form concrete feature walls.' },
                { title: 'Luxury Villa Renovation', desc: 'Complete high-end structural remodel. Re-configuring load path columns to open up expansive panoramic glass ocean views or modern kitchens.' },
                { title: 'Home Extensions', desc: 'Expanding physical square footage cleanly. Adding custom home offices, guest houses, and high-insulation pool pavilions.' },
                { title: 'Interior Finishing & Joinery', desc: 'Bespoke custom wood paneling, architectural ceiling grids, built-in library structures, and hand-selected luxury natural stone surfaces.' },
                { title: 'Sustainable Envelopes', desc: 'Certified LEED-gold framework systems, custom solar microgrid hookups, high-efficiency mechanical HVAC loops, and greywater management.' },
                { title: 'Hillside Structural Stabilization', desc: 'Securing complex hillside residential sites using engineered deep concrete soldier piles, grade beams, and retaining walls.' }
              ].map((serv, idx) => (
                <div key={idx} className="p-6 bg-gray-900 border border-gray-800 rounded-lg space-y-3 hover:border-amber-500/20 transition-all">
                  <div className="w-8 h-8 rounded bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 font-bold text-sm mb-2">{idx + 1}</div>
                  <h3 className="text-base font-bold text-white font-sans">{serv.title}</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">{serv.desc}</p>
                </div>
              ))}
            </div>

            {/* Custom Process Details with bullet points */}
            <div className="bg-[#111827]/40 border-y border-gray-900 py-24">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                <div className="lg:col-span-6 space-y-6">
                  <h2 className="text-2xl font-bold text-white tracking-tight">Our Residential Process Roadmap</h2>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Building a custom home is an intricate coordination of civil engineering, zoning constraints, architectural goals, and fine finishes. We divide each residential project into five clear milestones:
                  </p>

                  <ul className="space-y-4 text-xs text-gray-300">
                    <li className="flex items-start"><CheckCircle className="w-4 h-4 text-amber-500 mr-2.5 shrink-0 mt-0.5" /> <strong>Phase 1 - Consultation & Soil Review:</strong> Civil analysis to evaluate geological parameters and hillside load bearing capacity.</li>
                    <li className="flex items-start"><CheckCircle className="w-4 h-4 text-amber-500 mr-2.5 shrink-0 mt-0.5" /> <strong>Phase 2 - Design Optimization:</strong> Architectural drafting synchronized with estimating to prevent layout cost creep.</li>
                    <li className="flex items-start"><CheckCircle className="w-4 h-4 text-amber-500 mr-2.5 shrink-0 mt-0.5" /> <strong>Phase 3 - Structural Framing:</strong> Execution of heavy engineered steel, CLT post-and-beam elements, and roof systems.</li>
                    <li className="flex items-start"><CheckCircle className="w-4 h-4 text-amber-500 mr-2.5 shrink-0 mt-0.5" /> <strong>Phase 4 - Mechanical Integration:</strong> Placement of high-efficiency HVAC loops, smart automation wiring, and plumbing networks.</li>
                    <li className="flex items-start"><CheckCircle className="w-4 h-4 text-amber-500 mr-2.5 shrink-0 mt-0.5" /> <strong>Phase 5 - Custom Handover:</strong> Execution of meticulous custom joinery, code audits, and key handover.</li>
                  </ul>
                </div>
                <div className="lg:col-span-6">
                  <img src="/src/assets/images/luxury_residential_1782866705938.jpg" alt="Luxury home close up" className="rounded-lg shadow-xl border border-gray-800" referrerPolicy="no-referrer" />
                </div>
              </div>
            </div>

            {/* Call to action for scheduler */}
            <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center space-y-6">
              <h2 className="text-2xl font-bold text-white tracking-tight">Embark on Your Custom Build</h2>
              <p className="text-xs text-gray-400 leading-relaxed">
                Connect with our design-build panel to evaluate site drawings, structural blueprints, or requested extensions. We specialize in bringing complex luxury designs to physical reality.
              </p>
              <button
                id="residential-booking-btn"
                onClick={() => navigateTo('booking')}
                className="inline-block px-8 py-3.5 bg-amber-500 hover:bg-amber-600 text-gray-950 font-bold uppercase tracking-wider text-xs rounded shadow-lg hover:shadow-amber-500/15 cursor-pointer"
              >
                Schedule Residential Review
              </button>
            </div>

          </div>
        )}


        {/* ==================== 4. COMMERCIAL CONSTRUCTION ==================== */}
        {currentPage === 'commercial' && (
          <div id="view-commercial" className="py-16 sm:py-24 space-y-24 animate-fade-in">
            
            {/* Header */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
              <span className="text-xs uppercase font-semibold text-amber-500 tracking-widest block">Commercial & Industrial Division</span>
              <h1 className="text-4xl font-extrabold text-white tracking-tight sm:text-5xl font-sans">Commercial Construction</h1>
              <div className="w-16 h-1 bg-amber-500 mx-auto rounded"></div>
              <p className="text-sm text-gray-400 max-w-xl mx-auto leading-relaxed">
                Sleek corporate offices, retail pavilions, industrial warehouses, and commercial value-engineering solutions delivered on accelerated timelines.
              </p>
            </div>

            {/* Sliding Media Gallery */}
            <SlidingMediaShowcase category="commercial" />

            {/* Core Service Cards */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { title: 'Corporate Offices', desc: 'Multi-story corporate headquarters featuring rigid steel framing, optimized columns, and open-plan flexible floorplan configurations.' },
                { title: 'Retail Spaces & Pavilions', desc: 'High-visibility lifestyle retail spaces designed with spacious double-height glass galleries and customer-flow optimizations.' },
                { title: 'Industrial Warehouses', desc: 'Heavy-duty steel-span logistics warehouses, featuring high-capacity concrete slabs, loading bays, and compliance controls.' },
                { title: 'Commercial Renovations', desc: 'Complete structural and cosmetic refit of active spaces. Managed carefully to keep neighboring businesses operational.' },
                { title: 'Property Development', desc: 'Partnering with commercial real estate developers for master-planned urban plazas, retail centers, and parking developments.' },
                { title: 'Façade Engineering', desc: 'Design and physical assembly of energy-reflective low-E double glazed glass curtain walls and insulated composite panels.' }
              ].map((serv, idx) => (
                <div key={idx} className="p-6 bg-gray-900 border border-gray-800 rounded-lg space-y-3 hover:border-amber-500/20 transition-all">
                  <div className="w-8 h-8 rounded bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 font-bold text-sm mb-2">{idx + 1}</div>
                  <h3 className="text-base font-bold text-white font-sans">{serv.title}</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">{serv.desc}</p>
                </div>
              ))}
            </div>

            {/* Value Engineering Showcase banner */}
            <div className="bg-[#111827]/40 border-y border-gray-900 py-24">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                <div className="lg:col-span-6">
                  <img src="/src/assets/images/premium_commercial_1782866720726.jpg" alt="Commercial steel frame" className="rounded-lg shadow-xl border border-gray-800" referrerPolicy="no-referrer" />
                </div>
                <div className="lg:col-span-6 space-y-6">
                  <h2 className="text-2xl font-bold text-white tracking-tight">The Value Engineering Paradigm</h2>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    For commercial property developers, every week in construction schedules represents capital interest cost. We prioritize **Value Engineering** in our Design-Build process. By auditing drawings, structural dimensions, and foundation designs before ordering, we find optimizations that save substantial costs:
                  </p>

                  <ul className="space-y-4 text-xs text-gray-300">
                    <li className="flex items-start"><CheckCircle className="w-4 h-4 text-amber-500 mr-2.5 shrink-0 mt-0.5" /> <strong>Material Sourcing Auditing:</strong> Replacing expensive over-specified steel profiles with optimized custom-welded structural shapes.</li>
                    <li className="flex items-start"><CheckCircle className="w-4 h-4 text-amber-500 mr-2.5 shrink-0 mt-0.5" /> <strong>Foundation Calibration:</strong> Utilizing concrete additives to accelerate setting times, reducing foundation steps.</li>
                    <li className="flex items-start"><CheckCircle className="w-4 h-4 text-amber-500 mr-2.5 shrink-0 mt-0.5" /> <strong>Open-Span Layouts:</strong> Reducing internal columns to maximize net-rentable corporate space for office leases.</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* CTA for Commercial scheduling */}
            <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center space-y-6">
              <h2 className="text-2xl font-bold text-white tracking-tight">Secure Your Next Development Target</h2>
              <p className="text-xs text-gray-400 leading-relaxed">
                Our commercial bidding desk is ready to review RFP documents, architectural specifications, and site surveys. Connect with our principal developers to initiate structural cost models.
              </p>
              <button
                id="commercial-booking-btn"
                onClick={() => navigateTo('booking')}
                className="inline-block px-8 py-3.5 bg-amber-500 hover:bg-amber-600 text-gray-950 font-bold uppercase tracking-wider text-xs rounded shadow-lg hover:shadow-amber-500/15 cursor-pointer"
              >
                Schedule Commercial Consultation
              </button>
            </div>

          </div>
        )}


        {/* ==================== 5. PROJECT PORTFOLIO ==================== */}
        {currentPage === 'portfolio' && (
          <div id="view-portfolio" className="py-16 sm:py-24 space-y-16 animate-fade-in">
            
            {/* Header */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
              <span className="text-xs uppercase font-semibold text-amber-500 tracking-widest block">Project Gallery</span>
              <h1 className="text-4xl font-extrabold text-white tracking-tight sm:text-5xl font-sans">Our Completed Commissions</h1>
              <div className="w-16 h-1 bg-amber-500 mx-auto rounded"></div>
              <p className="text-sm text-gray-400 max-w-xl mx-auto leading-relaxed">
                Explore our portfolio of bespoke, custom luxury Residential estates and high-performance Commercial developments constructed by MADECC Group.
              </p>
            </div>

            {/* Sliding Media Gallery */}
            <SlidingMediaShowcase category="portfolio" />

            {/* Portfolio Grid and dynamic filters */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
              {projects.length === 0 ? (
                <p className="text-center text-gray-500">Loading portfolio...</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  {projects.map((p) => (
                    <div key={p.id} className="group bg-gray-900 border border-gray-800 rounded-lg overflow-hidden flex flex-col justify-between shadow-lg hover:border-amber-500/10 transition-colors">
                      <div>
                        <div className="relative h-80 overflow-hidden">
                          <img src={p.image} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
                          <span className="absolute top-4 left-4 bg-gray-950/90 text-amber-500 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded border border-gray-800">{p.category}</span>
                        </div>
                        <div className="p-8 space-y-4">
                          <div className="flex items-center space-x-2 text-gray-500 text-xs">
                            <MapPin className="w-4 h-4 text-amber-500" />
                            <span>{p.location}</span>
                          </div>
                          <h3 className="text-xl font-bold text-white">{p.title}</h3>
                          <p className="text-xs text-gray-400 leading-relaxed font-sans">{p.description}</p>
                        </div>
                      </div>
                      
                      <div className="p-8 pt-0 border-t border-gray-800/60 grid grid-cols-2 gap-4 text-xs text-gray-400 font-mono">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-gray-600 block">Project Client</span>
                          <strong className="text-gray-200">{p.client || 'Estate Trust'}</strong>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-gray-600 block">Completion Date</span>
                          <strong className="text-gray-200">{p.completionDate}</strong>
                        </div>
                        {p.area && (
                          <div className="col-span-2 pt-2 border-t border-gray-800/40">
                            <span className="text-[10px] uppercase font-bold text-gray-600 block">Built Gross Area</span>
                            <strong className="text-amber-500">{p.area}</strong>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}


        {/* ==================== 6. BLOG SECTION ==================== */}
        {currentPage === 'blog' && (
          <div id="view-blog" className="py-16 sm:py-24 animate-fade-in">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              
              {/* Dynamic Sub-router for Single Blog view */}
              {selectedBlogSlug ? (
                (() => {
                  const currentPost = blogs.find(b => b.slug === selectedBlogSlug);
                  if (!currentPost) {
                    return (
                      <div className="text-center py-20">
                        <p className="text-sm text-gray-500 mb-4">Blog post not found.</p>
                        <button onClick={() => setSelectedBlogSlug(null)} className="text-amber-500 font-bold uppercase tracking-wider text-xs">Back to Blog Feed</button>
                      </div>
                    );
                  }

                  return (
                    <article className="max-w-3xl mx-auto space-y-8" id={`blog-post-${currentPost.id}`}>
                      {/* SEO structured script */}
                      {currentPost.schemaMarkup && (
                        <script
                          type="application/ld+json"
                          dangerouslySetInnerHTML={{ __html: currentPost.schemaMarkup }}
                        />
                      )}

                      <button
                        id="back-to-blogs-btn"
                        onClick={() => setSelectedBlogSlug(null)}
                        className="text-xs text-amber-500 font-bold uppercase tracking-widest hover:text-white transition-colors cursor-pointer"
                      >
                        ← Back to Insights Feed
                      </button>

                      <div className="space-y-4">
                        <span className="text-[10px] uppercase font-extrabold text-amber-500 tracking-wider bg-amber-500/10 px-2.5 py-1 rounded inline-block">{currentPost.category}</span>
                        <h1 className="text-3xl sm:text-5xl font-extrabold text-white leading-tight font-sans tracking-tight">{currentPost.title}</h1>
                        <div className="flex items-center space-x-4 text-xs text-gray-500 font-mono">
                          <span>By: <strong>{currentPost.author}</strong></span>
                          <span>•</span>
                          <span>Published: {currentPost.date}</span>
                        </div>
                      </div>

                      <img src={currentPost.featuredImage} alt={currentPost.title} className="w-full h-96 object-cover rounded-lg border border-gray-800" referrerPolicy="no-referrer" />

                      {/* Render Content Safely with clean SEO typography classes */}
                      <div
                        id="blog-rich-content"
                        className="prose prose-invert prose-amber max-w-none text-xs text-gray-300 leading-relaxed space-y-6"
                        dangerouslySetInnerHTML={{ __html: currentPost.content }}
                      />

                      <hr className="border-gray-900 pt-6" />

                      <div className="space-y-4">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">SEO Meta Indicators</h4>
                        <div className="bg-gray-900 border border-gray-800 p-4 rounded text-xs space-y-2">
                          <p><strong className="text-amber-500">Keywords:</strong> {currentPost.keywords}</p>
                          <p><strong className="text-gray-400">Meta Description:</strong> {currentPost.metaDescription}</p>
                        </div>
                      </div>
                    </article>
                  );
                })()
              ) : (
                /* Regular Blog Feed list view */
                <div className="space-y-16">
                  <div className="text-center space-y-4">
                    <span className="text-xs uppercase font-semibold text-amber-500 tracking-widest block">Technical Insights</span>
                    <h1 className="text-4xl font-extrabold text-white tracking-tight sm:text-5xl font-sans">Engineering & Design Blog</h1>
                    <div className="w-16 h-1 bg-amber-500 mx-auto rounded"></div>
                    <p className="text-sm text-gray-400 max-w-xl mx-auto leading-relaxed">
                      Industry guidelines, material research papers, and home design insights published by our structural estimators.
                    </p>
                  </div>

                  {/* Sliding Media Gallery */}
                  <SlidingMediaShowcase category="blog" />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {blogs.map((b) => (
                      <div key={b.id} className="group bg-gray-900 border border-gray-800 rounded-lg overflow-hidden flex flex-col justify-between shadow-lg">
                        <div>
                          <div className="relative h-60 overflow-hidden">
                            <img src={b.featuredImage} alt={b.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
                            <span className="absolute bottom-4 left-4 bg-gray-950/95 text-amber-500 text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded border border-gray-800">{b.category}</span>
                          </div>
                          <div className="p-6 sm:p-8 space-y-4">
                            <span className="text-[10px] font-mono text-gray-500 block">Published: {b.date}</span>
                            <h3 className="text-lg font-bold text-white group-hover:text-amber-500 transition-colors line-clamp-2">{b.title}</h3>
                            <p className="text-xs text-gray-400 leading-relaxed line-clamp-3">{b.metaDescription}</p>
                          </div>
                        </div>
                        <div className="p-6 sm:p-8 pt-0 flex justify-between items-center">
                          <span className="text-xs text-gray-500">Author: <strong>{b.author}</strong></span>
                          <button
                            id={`read-blog-btn-${b.id}`}
                            onClick={() => selectBlogPost(b.slug)}
                            className="flex items-center space-x-1 text-xs text-amber-500 font-bold uppercase tracking-wider hover:text-white transition-colors cursor-pointer"
                          >
                            <span>Read Paper</span>
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Dynamic FAQ module for rich SEO content */}
                  <section id="blog-faq" className="max-w-4xl mx-auto pt-16 border-t border-gray-900 space-y-8">
                    <h2 className="text-2xl font-bold text-center text-white tracking-tight">Frequently Asked Construction Questions & Structural FAQ</h2>
                    <div className="grid grid-cols-1 gap-6 text-xs text-gray-400">
                      <div className="p-6 bg-gray-900/40 rounded-none border border-gray-800 space-y-2">
                        <h4 className="font-bold text-amber-500">What is the Design-Build delivery method and why is it preferred?</h4>
                        <p className="leading-relaxed">Design-Build is an integrated construction delivery model where a single entity—MADECC Group—manages both the architectural design layouts and the actual physical structural construction. This contrasts with traditional design-bid-build, eliminating friction between independent engineering desks, shortening project execution schedules, and preventing budget slippage. Under this framework, our estimators, architects, and site superintendents work in perfect synergy from the initial geotechnical survey to the final interior fit-outs.</p>
                      </div>
                      <div className="p-6 bg-gray-900/40 rounded-none border border-gray-800 space-y-2">
                        <h4 className="font-bold text-amber-500">How do you assure construction safety, local code compliance, and structural engineering integrity?</h4>
                        <p className="leading-relaxed">Every site managed by MADECC operates under a strict Site-Specific Safety Plan (SSSP) that strictly complies with municipal planning permissions and international OSHA safety regulations. We enforce detailed material testing protocols, including compressive cylinder strength testing for all concrete pours and non-destructive ultrasonic testing for structural steel welds. Our structural frameworks undergo rigid multi-stage audits by licensed structural engineers and municipal building inspectors before certificate of occupancy handovers.</p>
                      </div>
                      <div className="p-6 bg-gray-900/40 rounded-none border border-gray-800 space-y-2">
                        <h4 className="font-bold text-amber-500">What is the timeline for procuring building permits and environmental impact reviews?</h4>
                        <p className="leading-relaxed">Permit procurement timelines vary depending on geographic zone parameters, commercial scale, and local zoning laws. For luxury residential estates, standard local municipal planning reviews take between 4 to 8 weeks. For commercial lifestyle pavilions or multi-story corporate headquarters, local municipal approvals combined with standard environmental impact assessments may take 12 to 24 weeks. MADECC Group handles all zoning clearance dockets, structural calculations submissions, and civil utility liaison processes end-to-end to streamline this phase.</p>
                      </div>
                      <div className="p-6 bg-gray-900/40 rounded-none border border-gray-800 space-y-2">
                        <h4 className="font-bold text-amber-500">How does MADECC Group conduct structural cost estimates and feasibility studies?</h4>
                        <p className="leading-relaxed">Our surveying division utilizes advanced Building Information Modeling (BIM) software to calculate precise material takeoffs. Estimates are based on real-time commodity pricing (steel rebar, high-grade Portland cement, custom timber formwork) and local skilled labor indices. This granular, transparent costing methodology ensures that our clients receive detailed, binding commercial proposals, preventing unexpected price escalations during active structural execution phases.</p>
                      </div>
                      <div className="p-6 bg-gray-900/40 rounded-none border border-gray-800 space-y-2">
                        <h4 className="font-bold text-amber-500">Do you offer eco-friendly and energy-efficient building options?</h4>
                        <p className="leading-relaxed">Yes. Our eco-estate division specializes in sustainable construction practices, incorporating passive solar design, natural thermal insulation materials, rainwater harvesting structures, and high-efficiency solar grid integration. We build utilizing low-carbon concrete alternatives and sustainable timber sourcing, aligning our luxury residential projects with global green building standards (LEED / EDGE certification models) to lower long-term carbon footprint indicators.</p>
                      </div>
                    </div>
                  </section>
                </div>
              )}

            </div>
          </div>
        )}


        {/* ==================== 7. CONTACT PAGE ==================== */}
        {currentPage === 'contact' && (
          <div id="view-contact" className="py-16 sm:py-24 animate-fade-in">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
              
              {/* Header */}
              <div className="text-center space-y-4">
                <span className="text-xs uppercase font-semibold text-amber-500 tracking-widest block">Connect With Us</span>
                <h1 className="text-4xl font-extrabold text-white tracking-tight sm:text-5xl font-sans">Contact MADECC Group</h1>
                <div className="w-16 h-1 bg-amber-500 mx-auto rounded"></div>
                <p className="text-sm text-gray-400 max-w-xl mx-auto leading-relaxed">
                  Discuss pricing parameters, spatial layouts, or structural scopes. Our administrators are ready to reply.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                
                {/* Contact information pane */}
                <div className="lg:col-span-5 space-y-8 bg-gray-900/40 border border-gray-800 p-8 rounded-lg shadow-lg">
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-white">Beverly Hills HQ</h3>
                    <p className="text-xs text-gray-400 leading-relaxed">Our headquarters processes design drafting, value engineering, and commercial estimates.</p>
                  </div>

                  <div className="space-y-4 text-xs text-gray-300">
                    <div className="flex items-start">
                      <MapPin className="w-5 h-5 text-amber-500 mr-3 mt-0.5 shrink-0" />
                      <div>
                        <strong className="text-white block font-sans">Physical Address:</strong>
                        <span>9465 Wilshire Blvd, Suite 300, Beverly Hills, CA 90212</span>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <Phone className="w-5 h-5 text-amber-500 mr-3 shrink-0" />
                      <div>
                        <strong className="text-white block font-sans">Corporate Phones:</strong>
                        <span className="block text-gray-300">+237 683 316 486 (General Scheduling)</span>
                        <span className="block text-gray-300">+237 671 063 511 (Customer Liaison)</span>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <Mail className="w-5 h-5 text-amber-500 mr-3 shrink-0" />
                      <div>
                        <strong className="text-white block font-sans">Official Group Emails:</strong>
                        <span className="block text-gray-300">madeccco5@gmail.com</span>
                        <span className="block text-gray-300">madecccons@gmail.com</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-800 pt-6">
                    <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest block mb-1">State Certification</span>
                    <p className="text-xs text-gray-400">California General Engineering A & B Class Contractor License #986542. Fully bonded and insured for heavy commercial structural limits.</p>
                  </div>
                </div>

                {/* Form column */}
                <div className="lg:col-span-7">
                  <ContactForm />
                </div>

              </div>

            </div>
          </div>
        )}


        {/* ==================== 8. APPOINTMENT SCHEDULER ==================== */}
        {currentPage === 'booking' && (
          <div id="view-booking" className="py-16 sm:py-24 animate-fade-in">
            <div className="max-w-4xl mx-auto px-4 sm:px-6">
              
              <button
                id="back-from-booking"
                onClick={() => navigateTo('home')}
                className="text-xs text-amber-500 font-bold uppercase tracking-wider mb-6 hover:text-white transition-colors cursor-pointer"
              >
                ← Back to Home
              </button>

              <AppointmentForm />

            </div>
          </div>
        )}


        {/* ==================== 9. SECURITY ADMIN PANEL ==================== */}
        {currentPage === 'admin' && (
          <div id="view-admin" className="animate-fade-in">
            <AdminPanel
              isAdminLoggedIn={isAdminLoggedIn}
              onLoginSuccess={handleAdminLoginSuccess}
              onLogout={handleAdminLogout}
              projects={projects}
              blogs={blogs}
              reviews={approvedReviews}
              onRefreshData={loadAllData}
            />
          </div>
        )}


        {/* ==================== 10. LEGAL PRIVACY POLICY ==================== */}
        {currentPage === 'privacy' && (
          <div id="view-privacy" className="py-16 sm:py-24 animate-fade-in">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-6">
              <h1 className="text-3xl font-extrabold text-white">Privacy Policy</h1>
              <span className="text-xs text-gray-500 block">Effective Date: June 30, 2026 | Last Updated: June 30, 2026</span>
              <div className="w-12 h-1 bg-amber-500 rounded"></div>

              <div className="text-xs text-gray-400 leading-relaxed space-y-4">
                <p>At <strong>MADECC Group</strong>, we prioritize user transparency and privacy. This Privacy Policy documents our handling of names, emails, phones, and metadata collected through our consultation booking, newsletter subscription, and project contact forms on our digital portals.</p>
                
                <h3 className="text-sm font-bold text-white mt-6">1. Information We Collect & Structural Metadata</h3>
                <p>We collect information directly provided by users when requesting appointments, subscribing to newsletter feeds, submitting reviews, or transmitting project scope blueprints. This data contains personal identifiers including full names, primary email addresses, mobile telephone numbers, corporate affiliations, projected project budgets, location coordinates, and custom layout text files.</p>
                
                <h3 className="text-sm font-bold text-white mt-6">2. Purpose of Data Processing</h3>
                <p>All personal data is processed strictly for legitimate commercial construction purposes, specifically to:
                <br />• Compute accurate material takeoffs and structural design estimates.
                <br />• Coordinate physical site consultation schedules and dispatch regional general contractors.
                <br />• Send periodic technical building newsletters and structural engineering whitepapers.
                <br />• Administer and approve legitimate client review submissions.</p>

                <h3 className="text-sm font-bold text-white mt-6">3. Third-Party Ad Serving & Tracking (Google AdSense)</h3>
                <p>This website may integrate Google AdSense services to serve non-intrusive contextual ads. Google and third-party advertising partners use cookies to serve ads based on prior visits to this website or other internet domains. You can opt out of personalized advertising by visiting Google Ads Settings. We do not transmit your private form data to these advertising partners.</p>
                
                <h3 className="text-sm font-bold text-white mt-6">4. Data Security, SMTP Transmissions, & Retention</h3>
                <p>We transmit notification parameters securely using TLS/SSL encrypted SMTP channels. Personal identifiers are protected by advanced server-side authentication protocols and physical data centers. We retain personal client directories for as long as required to fulfill active project estimates or structural warranties, after which the data is purged or completely anonymized.</p>

                <h3 className="text-sm font-bold text-white mt-6">5. Your Privacy Rights</h3>
                <p>Under international privacy regulations (including GDPR and CCPA), you reserve the absolute right to access your stored data, demand immediate erasure, request file transport, or object to promotional newsletter distributions. For all privacy compliance inquiries, reach our administrative desks at <span className="text-gray-300 font-semibold">madeccco5@gmail.com</span>.</p>
              </div>
            </div>
          </div>
        )}


        {/* ==================== 11. LEGAL TERMS & CONDITIONS ==================== */}
        {currentPage === 'terms' && (
          <div id="view-terms" className="py-16 sm:py-24 animate-fade-in">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-6">
              <h1 className="text-3xl font-extrabold text-white">Terms & Conditions</h1>
              <span className="text-xs text-gray-500 block">Effective Date: June 30, 2026 | Last Updated: June 30, 2026</span>
              <div className="w-12 h-1 bg-amber-500 rounded"></div>

              <div className="text-xs text-gray-400 leading-relaxed space-y-4">
                <p>These Terms & Conditions govern your access to and use of the official web portal of <strong>MADECC Group</strong>. By accessing this site, requesting consultations, using our interactive AI chatbot support system, or subscribing to newsletter streams, you indicate complete acceptance of these terms.</p>
                
                <h3 className="text-sm font-bold text-white mt-6">1. Architectural & Engineering Disclaimer</h3>
                <p>All structural designs, engineering metrics, passive energy specifications, spatial layouts, or cost estimates published on this website are for general informational guidance only. A binding building contract or guaranteed estimation model is only established after physical site surveys, geotechnical drilling reviews, concrete structural testing, and formal design-build agreements are mutually executed.</p>
                
                <h3 className="text-sm font-bold text-white mt-6">2. User Conduct, Form Submission, & Anti-Bot Security</h3>
                <p>Users are strictly forbidden from submitting fraudulent, abusive, spam, or malicious payloads inside our consultation, contact, or review forms. We have integrated mandatory mathematical anti-bot verifications on all digital submissions to prevent robotic interference. We reserve the absolute right to audit, flag, and delete entries from our administrative logs without prior notification.</p>

                <h3 className="text-sm font-bold text-white mt-6">3. Intellectual Property Rights</h3>
                <p>All architectural blueprints, dynamic layout renderings, textual content, design logos, structural photography, and software source code contained within this website are the exclusive property of MADECC Group. Unauthorized copying, hotlinking, distribution, or reproduction of these materials is strictly prohibited and subject to civil prosecution.</p>

                <h3 className="text-sm font-bold text-white mt-6">4. Limitation of Liability</h3>
                <p>MADECC Group, its subsidiaries, structural engineers, general contractors, or directors shall not be held liable for any indirect, consequential, punitive, or special damages arising out of your reliance on information published on this site or the use of our automated AI Pierre support widget.</p>

                <h3 className="text-sm font-bold text-white mt-6">5. Dispute Resolution & Governing Law</h3>
                <p>These terms and any disputes relating to this digital portal are governed by the laws of our primary operational jurisdictions. Any legal challenges must be resolved in competent arbitration courts designated by our corporate administrative desks.</p>
              </div>
            </div>
          </div>
        )}


        {/* ==================== 12. LEGAL COOKIE POLICY ==================== */}
        {currentPage === 'cookie' && (
          <div id="view-cookie" className="py-16 sm:py-24 animate-fade-in">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-6">
              <h1 className="text-3xl font-extrabold text-white">Cookie Policy</h1>
              <span className="text-xs text-gray-500 block">Effective Date: June 30, 2026 | Last Updated: June 30, 2026</span>
              <div className="w-12 h-1 bg-amber-500 rounded"></div>

              <div className="text-xs text-gray-400 leading-relaxed space-y-4">
                <p>This website utilizes standard browser cookies to optimize site loading speeds, remember user page selections, secure interactive form submissions, and facilitate Google AdSense contextual ad serving.</p>
                
                <h3 className="text-sm font-bold text-white mt-6">What are cookies?</h3>
                <p>Cookies are small text files placed on your computer or mobile device when browsing websites. They facilitate basic layout functions, security checks (preventing CSRF and bot submissions), and anonymous analytical logs tracking page visits and interaction rates.</p>
                
                <h3 className="text-sm font-bold text-white mt-6">Categories of Cookies We Employ</h3>
                <p>We classify our browser cookies into the following functional containers:
                <br />• <strong>Strictly Necessary Cookies</strong>: Crucial for page routing, user sessions, and secure form token authentication. Disabling these will cause form errors.
                <br />• <strong>Analytical/Performance Cookies</strong>: Compile anonymous metrics regarding page load speed bottlenecks, layout interaction rates, and user drop-off indices.
                <br />• <strong>Ad Target Cookies</strong>: Handled by Google AdSense to serve non-intrusive, relevant building and engineering ads based on your prior browsing history.</p>

                <h3 className="text-sm font-bold text-white mt-6">Managing and Opting-Out of Cookies</h3>
                <p>You can block or disable cookies by modifying your specific web browser configurations (e.g., Safari, Chrome, Edge). However, this may restrict access to certain interactive forms or slow loading performance. To block personalized contextual ads, you may visit the official Google Ad Settings portal.</p>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Persistent Global Footer with newsletter & schema */}
      <Footer onNavigate={navigateTo} />

      {/* Floating Action Buttons for Phone Desks, WhatsApp, and AI Chatbot */}
      <FloatingSupportWidget />

    </div>
  );
}
