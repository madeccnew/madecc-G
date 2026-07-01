/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { Project, BlogPost, Review, Appointment, ContactMessage, NewsletterSubscriber } from '../src/types.js';

const DATA_FILE = path.join(process.cwd(), 'server-data.json');

interface DatabaseSchema {
  projects: Project[];
  blogPosts: BlogPost[];
  reviews: Review[];
  appointments: Appointment[];
  contacts: ContactMessage[];
  subscribers: NewsletterSubscriber[];
  adminHash: string;
}

// Default admin password: AdminMadecc2026!
const DEFAULT_ADMIN_HASH = bcrypt.hashSync('AdminMadecc2026!', 10);

const INITIAL_PROJECTS: Project[] = [
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
];

const INITIAL_BLOGS: BlogPost[] = [
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
];

const INITIAL_REVIEWS: Review[] = [
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
  }
];

export class Database {
  private static data: DatabaseSchema | null = null;

  private static load() {
    if (this.data) return;

    try {
      if (fs.existsSync(DATA_FILE)) {
        const fileContent = fs.readFileSync(DATA_FILE, 'utf-8');
        this.data = JSON.parse(fileContent);
        // Ensure arrays are present
        if (!this.data!.projects) this.data!.projects = [];
        if (!this.data!.blogPosts) this.data!.blogPosts = [];
        if (!this.data!.reviews) this.data!.reviews = [];
        if (!this.data!.appointments) this.data!.appointments = [];
        if (!this.data!.contacts) this.data!.contacts = [];
        if (!this.data!.subscribers) this.data!.subscribers = [];
        if (!this.data!.adminHash) this.data!.adminHash = DEFAULT_ADMIN_HASH;
      } else {
        this.data = {
          projects: INITIAL_PROJECTS,
          blogPosts: INITIAL_BLOGS,
          reviews: INITIAL_REVIEWS,
          appointments: [],
          contacts: [],
          subscribers: [],
          adminHash: DEFAULT_ADMIN_HASH
        };
        this.save();
      }
    } catch (error) {
      console.error('Failed to load database:', error);
      this.data = {
        projects: INITIAL_PROJECTS,
        blogPosts: INITIAL_BLOGS,
        reviews: INITIAL_REVIEWS,
        appointments: [],
        contacts: [],
        subscribers: [],
        adminHash: DEFAULT_ADMIN_HASH
      };
    }
  }

  private static save() {
    if (!this.data) return;
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (error) {
      console.error('Failed to save database file:', error);
    }
  }

  // Admin auth
  static getAdminHash(): string {
    this.load();
    return this.data!.adminHash;
  }

  static updateAdminPassword(newPassword: string) {
    this.load();
    this.data!.adminHash = bcrypt.hashSync(newPassword, 10);
    this.save();
  }

  // Projects
  static getProjects(): Project[] {
    this.load();
    return this.data!.projects;
  }

  static addProject(project: Omit<Project, 'id'>): Project {
    this.load();
    const newProject: Project = {
      ...project,
      id: `proj-${Date.now()}`
    };
    this.data!.projects.push(newProject);
    this.save();
    return newProject;
  }

  static updateProject(id: string, updated: Partial<Project>): Project | null {
    this.load();
    const idx = this.data!.projects.findIndex(p => p.id === id);
    if (idx === -1) return null;
    this.data!.projects[idx] = { ...this.data!.projects[idx], ...updated };
    this.save();
    return this.data!.projects[idx];
  }

  static deleteProject(id: string): boolean {
    this.load();
    const lenBefore = this.data!.projects.length;
    this.data!.projects = this.data!.projects.filter(p => p.id !== id);
    if (this.data!.projects.length < lenBefore) {
      this.save();
      return true;
    }
    return false;
  }

  // Blog posts
  static getBlogPosts(): BlogPost[] {
    this.load();
    return this.data!.blogPosts;
  }

  static addBlogPost(post: Omit<BlogPost, 'id'>): BlogPost {
    this.load();
    const newPost: BlogPost = {
      ...post,
      id: `blog-${Date.now()}`
    };
    this.data!.blogPosts.push(newPost);
    this.save();
    return newPost;
  }

  static updateBlogPost(id: string, updated: Partial<BlogPost>): BlogPost | null {
    this.load();
    const idx = this.data!.blogPosts.findIndex(b => b.id === id);
    if (idx === -1) return null;
    this.data!.blogPosts[idx] = { ...this.data!.blogPosts[idx], ...updated };
    this.save();
    return this.data!.blogPosts[idx];
  }

  static deleteBlogPost(id: string): boolean {
    this.load();
    const lenBefore = this.data!.blogPosts.length;
    this.data!.blogPosts = this.data!.blogPosts.filter(b => b.id !== id);
    if (this.data!.blogPosts.length < lenBefore) {
      this.save();
      return true;
    }
    return false;
  }

  // Reviews
  static getReviews(includeUnapproved = false): Review[] {
    this.load();
    if (includeUnapproved) {
      return this.data!.reviews;
    }
    return this.data!.reviews.filter(r => r.approved);
  }

  static addReview(review: Omit<Review, 'id' | 'approved' | 'date'>): Review {
    this.load();
    const newReview: Review = {
      ...review,
      id: `rev-${Date.now()}`,
      approved: false, // requires admin approval by default
      date: new Date().toISOString().split('T')[0]
    };
    this.data!.reviews.push(newReview);
    this.save();
    return newReview;
  }

  static approveReview(id: string): Review | null {
    this.load();
    const idx = this.data!.reviews.findIndex(r => r.id === id);
    if (idx === -1) return null;
    this.data!.reviews[idx].approved = true;
    this.save();
    return this.data!.reviews[idx];
  }

  static deleteReview(id: string): boolean {
    this.load();
    const lenBefore = this.data!.reviews.length;
    this.data!.reviews = this.data!.reviews.filter(r => r.id !== id);
    if (this.data!.reviews.length < lenBefore) {
      this.save();
      return true;
    }
    return false;
  }

  // Appointments
  static getAppointments(): Appointment[] {
    this.load();
    return this.data!.appointments;
  }

  static addAppointment(apt: Omit<Appointment, 'id' | 'date'>): Appointment {
    this.load();
    const newApt: Appointment = {
      ...apt,
      id: `apt-${Date.now()}`,
      date: new Date().toISOString().split('T')[0]
    };
    this.data!.appointments.push(newApt);
    this.save();
    return newApt;
  }

  static deleteAppointment(id: string): boolean {
    this.load();
    const lenBefore = this.data!.appointments.length;
    this.data!.appointments = this.data!.appointments.filter(a => a.id !== id);
    if (this.data!.appointments.length < lenBefore) {
      this.save();
      return true;
    }
    return false;
  }

  // Contacts
  static getContacts(): ContactMessage[] {
    this.load();
    return this.data!.contacts;
  }

  static addContact(contact: Omit<ContactMessage, 'id' | 'date'>): ContactMessage {
    this.load();
    const newContact: ContactMessage = {
      ...contact,
      id: `contact-${Date.now()}`,
      date: new Date().toISOString().split('T')[0]
    };
    this.data!.contacts.push(newContact);
    this.save();
    return newContact;
  }

  static deleteContact(id: string): boolean {
    this.load();
    const lenBefore = this.data!.contacts.length;
    this.data!.contacts = this.data!.contacts.filter(c => c.id !== id);
    if (this.data!.contacts.length < lenBefore) {
      this.save();
      return true;
    }
    return false;
  }

  // Subscribers
  static getSubscribers(): NewsletterSubscriber[] {
    this.load();
    return this.data!.subscribers;
  }

  static addSubscriber(email: string): NewsletterSubscriber | { exists: true } {
    this.load();
    const trimmedEmail = email.trim().toLowerCase();
    const exists = this.data!.subscribers.find(s => s.email.toLowerCase() === trimmedEmail);
    if (exists) {
      return { exists: true };
    }
    const newSub: NewsletterSubscriber = {
      id: `sub-${Date.now()}`,
      email: trimmedEmail,
      date: new Date().toISOString().split('T')[0],
      status: 'active'
    };
    this.data!.subscribers.push(newSub);
    this.save();
    return newSub;
  }

  static deleteSubscriber(id: string): boolean {
    this.load();
    const lenBefore = this.data!.subscribers.length;
    this.data!.subscribers = this.data!.subscribers.filter(s => s.id !== id);
    if (this.data!.subscribers.length < lenBefore) {
      this.save();
      return true;
    }
    return false;
  }
}
