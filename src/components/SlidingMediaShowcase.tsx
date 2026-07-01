/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Play, Pause, Volume2, VolumeX, Eye } from 'lucide-react';

interface MediaSlide {
  id: string;
  type: 'video' | 'image';
  url: string;
  title: string;
  badge: string;
  description: string;
}

interface SlidingMediaShowcaseProps {
  category: 'residential' | 'commercial' | 'portfolio' | 'blog';
}

const CATEGORY_SLIDES: Record<string, MediaSlide[]> = {
  residential: [
    {
      id: 'res-1',
      type: 'video',
      url: 'https://player.vimeo.com/external/371433846.sd.mp4?s=236da2f3c054ba20378fd55558d9cb6578044342&profile_id=139&oauth2_token_id=57447761',
      badge: 'Featured Project',
      title: 'Architectural Coastal Concrete Villa',
      description: 'Expansive monolithic off-form concrete architecture integrated directly into steep hillside coastal terrain.'
    },
    {
      id: 'res-2',
      type: 'image',
      url: '/src/assets/images/luxury_residential_1782866705938.jpg',
      badge: 'Bespoke Timber Frame',
      title: 'LEED Gold Timber Frameworks',
      description: 'Advanced regenerative timber columns paired with high-performance glass envelopes for thermal self-reliance.'
    },
    {
      id: 'res-3',
      type: 'video',
      url: 'https://player.vimeo.com/external/517602120.sd.mp4?s=d31481b2382da9405d46f55490a614d9b736b7b2&profile_id=139&oauth2_token_id=57447761',
      badge: 'Custom Joinery',
      title: 'Monolithic Stone & Walnut Kitchens',
      description: 'Precision-milled structural wood ceiling grids combined with hand-selected structural natural marble.'
    }
  ],
  commercial: [
    {
      id: 'com-1',
      type: 'video',
      url: 'https://player.vimeo.com/external/459389137.sd.mp4?s=91069eb87b6be007d4b4df9d1b6a22efbe16a9a7&profile_id=139&oauth2_token_id=57447761',
      badge: 'Heavy Infrastructure',
      title: 'Load-Path Engineered Steel Superstructure',
      description: 'High-span steel frames and seismic-resistant columns designed for maximum volumetric freedom.'
    },
    {
      id: 'com-2',
      type: 'image',
      url: '/src/assets/images/premium_commercial_1782866720726.jpg',
      badge: 'Corporate Real Estate',
      title: 'Low-E Thermally Efficient Curtain Walls',
      description: 'Assembled glass facade modules with argon-insulated gaps designed for corporate energy compliance.'
    },
    {
      id: 'com-3',
      type: 'video',
      url: 'https://player.vimeo.com/external/435674703.sd.mp4?s=7f607faaa167d45e3f5cb684fc0b8f60da321a32&profile_id=139&oauth2_token_id=57447761',
      badge: 'Urban Lifestyle',
      title: 'High-Density Premium Lifestyle Retail Pavilions',
      description: 'Mixed-use open plan plazas, maximizing consumer flow rates and commercial layout versatility.'
    }
  ],
  portfolio: [
    {
      id: 'port-1',
      type: 'video',
      url: 'https://player.vimeo.com/external/371433846.sd.mp4?s=236da2f3c054ba20378fd55558d9cb6578044342&profile_id=139&oauth2_token_id=57447761',
      badge: 'Site Logistics',
      title: 'Drone Audited Site Logistics & Progress',
      description: 'Utilizing sub-centimeter GPS coordinates to generate interactive timeline models for stakeholders.'
    },
    {
      id: 'port-2',
      type: 'video',
      url: 'https://player.vimeo.com/external/517602120.sd.mp4?s=d31481b2382da9405d46f55490a614d9b736b7b2&profile_id=139&oauth2_token_id=57447761',
      badge: 'Engineering BIM',
      title: 'Building Information Modeling (BIM) Standards',
      description: 'Virtual stress assessments and material calculations mapping structural load transfers.'
    },
    {
      id: 'port-3',
      type: 'image',
      url: '/src/assets/images/premium_commercial_1782866720726.jpg',
      badge: 'Client Handover',
      title: 'Architectural Structural Assembly Handover',
      description: 'Pristine exterior handover of commercial retail plazas, featuring architectural design continuity.'
    }
  ],
  blog: [
    {
      id: 'blog-1',
      type: 'video',
      url: 'https://player.vimeo.com/external/459389137.sd.mp4?s=91069eb87b6be007d4b4df9d1b6a22efbe16a9a7&profile_id=139&oauth2_token_id=57447761',
      badge: 'Material Innovation',
      title: 'Carbon-Negative Geopolymer Cement Research',
      description: 'Analyzing high-performance binder chemistry to reduce greenfield carbon emissions by 40%.'
    },
    {
      id: 'blog-2',
      type: 'image',
      url: '/src/assets/images/luxury_residential_1782866705938.jpg',
      badge: 'Regulatory Guide',
      title: 'LEED Gold Envelope Isolation Models',
      description: 'Technical outlines for passive solar alignment and building shell resistance calculations.'
    },
    {
      id: 'blog-3',
      type: 'video',
      url: 'https://player.vimeo.com/external/435674703.sd.mp4?s=7f607faaa167d45e3f5cb684fc0b8f60da321a32&profile_id=139&oauth2_token_id=57447761',
      badge: 'Construction Management',
      title: 'Structural Value Engineering & Cost Models',
      description: 'Masterclass series optimizing material quantities without diminishing structural performance limits.'
    }
  ]
};

export function SlidingMediaShowcase({ category }: SlidingMediaShowcaseProps) {
  const slides = CATEGORY_SLIDES[category] || [];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});

  useEffect(() => {
    if (!isPlaying) return;

    const timer = setInterval(() => {
      handleNext();
    }, 6000); // 6 seconds auto rotation

    return () => clearInterval(timer);
  }, [currentIndex, isPlaying]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const currentSlide = slides[currentIndex];

  if (slides.length === 0) return null;

  return (
    <div id={`slider-${category}`} className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Container holding the sliding frames */}
      <div className="relative h-[250px] sm:h-[400px] md:h-[500px] w-full bg-gray-950 overflow-hidden rounded-none border border-gray-800">
        
        {/* Sliding Slides with AnimatePresence */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide.id}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 w-full h-full"
          >
            {/* Dark overlay for typography legibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/40 to-transparent z-10" />
            <div className="absolute inset-0 bg-gray-950/20 z-10" />

            {currentSlide.type === 'video' ? (
              <video
                ref={(el) => {
                  videoRefs.current[currentSlide.id] = el;
                }}
                src={currentSlide.url}
                autoPlay
                loop
                muted={isMuted}
                playsInline
                className="w-full h-full object-cover select-none pointer-events-none"
              />
            ) : (
              <motion.img
                src={currentSlide.url}
                alt={currentSlide.title}
                referrerPolicy="no-referrer"
                animate={{ scale: [1.0, 1.05] }}
                transition={{ duration: 10, ease: 'linear', repeat: Infinity, repeatType: 'reverse' }}
                className="w-full h-full object-cover select-none pointer-events-none"
              />
            )}

            {/* Slide Information Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 z-20 flex flex-col justify-end text-left space-y-2 sm:space-y-3">
              <span className="inline-block self-start px-2 py-0.5 text-[9px] font-mono font-semibold uppercase tracking-widest bg-amber-500 text-gray-950 rounded-none">
                {currentSlide.badge}
              </span>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white font-sans tracking-tight">
                {currentSlide.title}
              </h3>
              <p className="text-xs sm:text-sm text-gray-300 max-w-2xl leading-relaxed font-sans">
                {currentSlide.description}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Media controls (Mute / Pause) */}
        <div className="absolute top-4 right-4 z-30 flex items-center space-x-2">
          {currentSlide.type === 'video' && (
            <button
              id={`mute-btn-${category}`}
              onClick={() => setIsMuted(!isMuted)}
              className="p-2 rounded-none bg-gray-950/80 border border-gray-800 hover:border-amber-500/40 text-gray-400 hover:text-white transition-all cursor-pointer"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          )}
          <button
            id={`pause-btn-${category}`}
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-2 rounded-none bg-gray-950/80 border border-gray-800 hover:border-amber-500/40 text-gray-400 hover:text-white transition-all cursor-pointer"
            title={isPlaying ? 'Pause Slider' : 'Resume Slider'}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
        </div>

        {/* Technical HUD Overlay Indicators */}
        <div className="absolute top-4 left-4 z-30 hidden sm:flex items-center space-x-2 text-[9px] font-mono tracking-widest text-gray-400 bg-gray-950/85 border border-gray-800/80 px-2.5 py-1">
          <Eye className="w-3 h-3 text-amber-500 animate-pulse" />
          <span>FPS: 60 | RENDER: ACTIVE</span>
        </div>

        {/* Side Arrows */}
        <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-4 z-30 pointer-events-none">
          <button
            id={`prev-arrow-${category}`}
            onClick={handlePrev}
            className="pointer-events-auto p-2 sm:p-3 rounded-none bg-gray-950/80 border border-gray-800 hover:border-amber-500 text-gray-400 hover:text-white transition-all cursor-pointer group"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:-translate-x-0.5" />
          </button>
          <button
            id={`next-arrow-${category}`}
            onClick={handleNext}
            className="pointer-events-auto p-2 sm:p-3 rounded-none bg-gray-950/80 border border-gray-800 hover:border-amber-500 text-gray-400 hover:text-white transition-all cursor-pointer group"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>

        {/* Micro progress indicator */}
        <div className="absolute bottom-0 left-0 h-1 bg-amber-500 z-30 transition-all duration-500" style={{ width: `${((currentIndex + 1) / slides.length) * 100}%` }} />
      </div>

      {/* Progress Dots / Slide Selector */}
      <div className="flex items-center justify-center space-x-2 mt-4">
        {slides.map((slide, idx) => (
          <button
            key={slide.id}
            id={`dot-${category}-${idx}`}
            onClick={() => setCurrentIndex(idx)}
            className={`h-1.5 transition-all duration-300 rounded-none cursor-pointer ${currentIndex === idx ? 'w-8 bg-amber-500' : 'w-2 bg-gray-800 hover:bg-gray-700'}`}
          />
        ))}
      </div>
    </div>
  );
}
