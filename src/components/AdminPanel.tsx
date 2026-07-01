/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, FormEvent } from 'react';
import {
  Lock, Eye, EyeOff, ShieldAlert, CheckCircle, Plus, Trash, Edit3, Settings,
  LogOut, Calendar, Mail, FileText, MessageSquare, Briefcase, PlusCircle, Check, HelpCircle
} from 'lucide-react';
import { Project, BlogPost, Review, Appointment, ContactMessage, NewsletterSubscriber } from '../types';

interface AdminPanelProps {
  isAdminLoggedIn: boolean;
  onLoginSuccess: (token: string) => void;
  onLogout: () => void;
  projects: Project[];
  blogs: BlogPost[];
  reviews: Review[];
  onRefreshData: () => void;
}

type AdminTab = 'projects' | 'blogs' | 'reviews' | 'appointments' | 'contacts' | 'subscribers' | 'settings';

export default function AdminPanel({
  isAdminLoggedIn,
  onLoginSuccess,
  onLogout,
  projects,
  blogs,
  reviews,
  onRefreshData
}: AdminPanelProps) {
  // Login State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [botAnswer, setBotAnswer] = useState('');

  // Admin Panel Navigation
  const [activeTab, setActiveTab] = useState<AdminTab>('projects');
  
  // Lists from APIs
  const [allReviews, setAllReviews] = useState<Review[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [contacts, setContacts] = useState<ContactMessage[]>([]);
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);

  // Action feedback states
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  // Password Change state
  const [newPassword, setNewPassword] = useState('');
  const [pwChangeLoading, setPwChangeLoading] = useState(false);

  // Modal / Form state for Projects
  const [projectFormOpen, setProjectFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [projectTitle, setProjectTitle] = useState('');
  const [projectCategory, setProjectCategory] = useState<'residential' | 'commercial'>('residential');
  const [projectLocation, setProjectLocation] = useState('');
  const [projectDesc, setProjectDesc] = useState('');
  const [projectImg, setProjectImg] = useState('');
  const [projectDate, setProjectDate] = useState('');
  const [projectClient, setProjectClient] = useState('');
  const [projectArea, setProjectArea] = useState('');

  // Modal / Form state for Blog
  const [blogFormOpen, setBlogFormOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<BlogPost | null>(null);
  const [blogTitle, setBlogTitle] = useState('');
  const [blogSlug, setBlogSlug] = useState('');
  const [blogContent, setBlogContent] = useState('');
  const [blogMeta, setBlogMeta] = useState('');
  const [blogKeywords, setBlogKeywords] = useState('');
  const [blogImg, setBlogImg] = useState('');
  const [blogCategory, setBlogCategory] = useState('');

  // Auto load administrative structures when logged in
  useEffect(() => {
    if (isAdminLoggedIn) {
      fetchAdminData();
    }
  }, [isAdminLoggedIn, activeTab]);

  const fetchAdminData = async () => {
    const token = localStorage.getItem('madecc_admin_token');
    if (!token) return;

    try {
      const headers = { 'Authorization': `Bearer ${token}` };

      if (activeTab === 'reviews' || allReviews.length === 0) {
        const rRes = await fetch('/api/admin/reviews', { headers });
        if (rRes.ok) setAllReviews(await rRes.json());
      }
      if (activeTab === 'appointments') {
        const aRes = await fetch('/api/admin/appointments', { headers });
        if (aRes.ok) setAppointments(await aRes.json());
      }
      if (activeTab === 'contacts') {
        const cRes = await fetch('/api/admin/contacts', { headers });
        if (cRes.ok) setContacts(await cRes.json());
      }
      if (activeTab === 'subscribers') {
        const sRes = await fetch('/api/admin/subscribers', { headers });
        if (sRes.ok) setSubscribers(await sRes.json());
      }
    } catch (err) {
      console.error('Failed to pull admin records:', err);
    }
  };

  const showFeedback = (text: string, isError = false) => {
    if (isError) {
      setErrorMsg(text);
      setTimeout(() => setErrorMsg(''), 5000);
    } else {
      setSuccessMsg(text);
      setTimeout(() => setSuccessMsg(''), 5000);
    }
  };

  // Login handler
  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (botAnswer.trim() !== '5') {
      setLoginError('Anti-Bot Verification failed. Solve the equation: 2x + 10 = 20 to find the value of x.');
      return;
    }

    setLoginLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('madecc_admin_token', data.token);
        onLoginSuccess(data.token);
        fetchAdminData();
        setBotAnswer('');
      } else {
        setLoginError(data.error || 'Invalid credentials.');
      }
    } catch (err) {
      setLoginError('Failed to connect to the login service.');
    } finally {
      setLoginLoading(false);
    }
  };

  // Change Password
  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      showFeedback('Password must contain at least 6 characters.', true);
      return;
    }
    setPwChangeLoading(true);
    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('madecc_admin_token')}`
        },
        body: JSON.stringify({ newPassword }),
      });
      if (response.ok) {
        showFeedback('Administrator security credentials updated successfully.');
        setNewPassword('');
      } else {
        const data = await response.json();
        showFeedback(data.error || 'Failed to update credentials.', true);
      }
    } catch (err) {
      showFeedback('Network error. Failed to execute update.', true);
    } finally {
      setPwChangeLoading(false);
    }
  };

  // Project Add / Edit submits
  const handleProjectSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!projectTitle || !projectLocation || !projectDesc || !projectImg || !projectDate) {
      showFeedback('Please fill out all mandatory specifications.', true);
      return;
    }

    const payload = {
      title: projectTitle,
      category: projectCategory,
      location: projectLocation,
      description: projectDesc,
      image: projectImg,
      completionDate: projectDate,
      client: projectClient,
      area: projectArea
    };

    const url = editingProject ? `/api/projects/${editingProject.id}` : '/api/projects';
    const method = editingProject ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('madecc_admin_token')}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        showFeedback(editingProject ? 'Project record updated.' : 'New project added to portfolio.');
        setProjectFormOpen(false);
        resetProjectForm();
        onRefreshData();
      } else {
        const data = await response.json();
        showFeedback(data.error || 'Failed to persist portfolio item.', true);
      }
    } catch (err) {
      showFeedback('Network error during project configuration.', true);
    }
  };

  const startEditProject = (p: Project) => {
    setEditingProject(p);
    setProjectTitle(p.title);
    setProjectCategory(p.category);
    setProjectLocation(p.location);
    setProjectDesc(p.description);
    setProjectImg(p.image);
    setProjectDate(p.completionDate);
    setProjectClient(p.client || '');
    setProjectArea(p.area || '');
    setProjectFormOpen(true);
  };

  const resetProjectForm = () => {
    setEditingProject(null);
    setProjectTitle('');
    setProjectCategory('residential');
    setProjectLocation('');
    setProjectDesc('');
    setProjectImg('');
    setProjectDate('');
    setProjectClient('');
    setProjectArea('');
  };

  const deleteProject = async (id: string) => {
    if (!confirm('Are you absolutely sure you want to delete this portfolio project? This action is irreversible.')) return;
    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('madecc_admin_token')}` }
      });
      if (response.ok) {
        showFeedback('Project deleted from database.');
        onRefreshData();
      } else {
        showFeedback('Failed to remove project.', true);
      }
    } catch (err) {
      showFeedback('Network error during deletion.', true);
    }
  };

  // Blog submits
  const handleBlogSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!blogTitle || !blogSlug || !blogContent || !blogMeta || !blogKeywords || !blogImg) {
      showFeedback('All main fields are required for technical SEO publishing.', true);
      return;
    }

    const payload = {
      title: blogTitle,
      slug: blogSlug,
      content: blogContent,
      metaDescription: blogMeta,
      keywords: blogKeywords,
      featuredImage: blogImg,
      category: blogCategory || 'General Construction',
      author: editingBlog ? editingBlog.author : 'Chief Estimator'
    };

    const url = editingBlog ? `/api/blog/${editingBlog.id}` : '/api/blog';
    const method = editingBlog ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('madecc_admin_token')}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        showFeedback(editingBlog ? 'SEO Blog article updated.' : 'New blog article published.');
        setBlogFormOpen(false);
        resetBlogForm();
        onRefreshData();
      } else {
        const data = await response.json();
        showFeedback(data.error || 'Failed to save blog post.', true);
      }
    } catch (err) {
      showFeedback('Network error during blog configuration.', true);
    }
  };

  const startEditBlog = (b: BlogPost) => {
    setEditingBlog(b);
    setBlogTitle(b.title);
    setBlogSlug(b.slug);
    setBlogContent(b.content);
    setBlogMeta(b.metaDescription);
    setBlogKeywords(b.keywords);
    setBlogImg(b.featuredImage);
    setBlogCategory(b.category);
    setBlogFormOpen(true);
  };

  const resetBlogForm = () => {
    setEditingBlog(null);
    setBlogTitle('');
    setBlogSlug('');
    setBlogContent('');
    setBlogMeta('');
    setBlogKeywords('');
    setBlogImg('');
    setBlogCategory('');
  };

  const deleteBlog = async (id: string) => {
    if (!confirm('Are you sure you want to delete this blog post?')) return;
    try {
      const response = await fetch(`/api/blog/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('madecc_admin_token')}` }
      });
      if (response.ok) {
        showFeedback('Blog article removed.');
        onRefreshData();
      } else {
        showFeedback('Failed to remove blog post.', true);
      }
    } catch (err) {
      showFeedback('Network error.', true);
    }
  };

  // Review Approvals & deletion
  const approveReview = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/reviews/${id}/approve`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('madecc_admin_token')}` }
      });
      if (response.ok) {
        showFeedback('Review has been approved and is now visible in the customer reviews widget.');
        fetchAdminData();
        onRefreshData();
      } else {
        showFeedback('Failed to approve review.', true);
      }
    } catch (err) {
      showFeedback('Network error.', true);
    }
  };

  const deleteReview = async (id: string) => {
    if (!confirm('Are you sure you want to remove or reject this review?')) return;
    try {
      const response = await fetch(`/api/admin/reviews/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('madecc_admin_token')}` }
      });
      if (response.ok) {
        showFeedback('Review item deleted.');
        fetchAdminData();
        onRefreshData();
      } else {
        showFeedback('Failed to delete review.', true);
      }
    } catch (err) {
      showFeedback('Network error.', true);
    }
  };

  // Delete records for other tabs
  const deleteAppointment = async (id: string) => {
    if (!confirm('Mark appointment proposal as completed/delete?')) return;
    try {
      const response = await fetch(`/api/admin/appointments/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('madecc_admin_token')}` }
      });
      if (response.ok) {
        showFeedback('Appointment record removed.');
        fetchAdminData();
      }
    } catch (err) {
      showFeedback('Error.', true);
    }
  };

  const deleteContact = async (id: string) => {
    if (!confirm('Delete this inquiry?')) return;
    try {
      const response = await fetch(`/api/admin/contacts/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('madecc_admin_token')}` }
      });
      if (response.ok) {
        showFeedback('Client inquiry deleted from logs.');
        fetchAdminData();
      }
    } catch (err) {
      showFeedback('Error.', true);
    }
  };

  const deleteSubscriber = async (id: string) => {
    if (!confirm('Remove subscriber?')) return;
    try {
      const response = await fetch(`/api/admin/subscribers/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('madecc_admin_token')}` }
      });
      if (response.ok) {
        showFeedback('Subscriber deleted.');
        fetchAdminData();
      }
    } catch (err) {
      showFeedback('Error.', true);
    }
  };

  // Form helper: auto-generate slug from title
  const handleTitleChangeForSlug = (title: string) => {
    setBlogTitle(title);
    const slugified = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
    setBlogSlug(slugified);
  };


  // --- LOGIN INTERFACE ---
  if (!isAdminLoggedIn) {
    return (
      <section id="admin-login-section" className="min-h-[80vh] flex items-center justify-center bg-gray-900 px-4 py-20">
        <div className="w-full max-w-md bg-gray-950 p-8 rounded-lg border border-gray-800 shadow-2xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-amber-500/10 text-amber-500 mb-4 border border-amber-500/20">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white font-sans">Corporate Administration Portal</h2>
            <p className="text-sm text-gray-500 mt-2">MADECC Group administrative gateway access panel.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label htmlFor="login-username" className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Username</label>
              <input
                id="login-username"
                type="text"
                placeholder="admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full bg-gray-900 border border-gray-800 focus:border-amber-500 text-white rounded px-4 py-3 text-sm focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="login-password" className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Password</label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-gray-900 border border-gray-800 focus:border-amber-500 text-white rounded pl-4 pr-10 py-3 text-sm focus:outline-none"
                />
                <button
                  id="toggle-login-password-btn"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Anti-Bot Challenge */}
            <div className="p-4 bg-gray-900 border border-gray-800 rounded space-y-2">
              <label htmlFor="admin-bot" className="block text-xs font-semibold uppercase tracking-wider text-amber-500">
                Anti-Bot Verification *
              </label>
              <p className="text-[11px] text-gray-400">
                Solve the mathematical equation to authenticate your session: <span className="text-white font-mono">2x + 10 = 20</span>. Find the value of <span className="text-white font-mono font-bold">x</span>.
              </p>
              <input
                id="admin-bot"
                type="text"
                required
                value={botAnswer}
                onChange={(e) => setBotAnswer(e.target.value)}
                placeholder="Value of x..."
                disabled={loginLoading}
                className="w-full max-w-[120px] bg-gray-950 border border-gray-800 focus:border-amber-500 text-white rounded px-3 py-1.5 text-sm focus:outline-none disabled:opacity-50 font-mono"
              />
            </div>

            {loginError && (
              <div id="login-error-msg" className="flex items-center text-xs text-rose-400 bg-rose-950/30 p-3 rounded border border-rose-500/20">
                <ShieldAlert className="w-4 h-4 mr-2 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <button
              id="admin-login-submit"
              type="submit"
              disabled={loginLoading}
              className="w-full py-3 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-gray-950 font-bold tracking-wider uppercase text-xs rounded transition-all cursor-pointer shadow-md shadow-amber-500/10"
            >
              {loginLoading ? 'Authenticating Credentials...' : 'Sign In'}
            </button>
          </form>
        </div>
      </section>
    );
  }


  // --- ADMIN AUTHENTICATED DASHBOARD ---
  return (
    <section id="admin-dashboard-section" className="bg-gray-950 min-h-[90vh] text-white font-sans">
      
      {/* Dynamic Feedback Banner */}
      {successMsg && (
        <div className="fixed top-24 right-4 z-50 flex items-center bg-emerald-950/95 border border-emerald-500/30 text-emerald-400 p-4 rounded shadow-2xl max-w-md slide-in">
          <CheckCircle className="w-5 h-5 mr-3 shrink-0" />
          <span className="text-sm font-medium">{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="fixed top-24 right-4 z-50 flex items-center bg-rose-950/95 border border-rose-500/30 text-rose-400 p-4 rounded shadow-2xl max-w-md slide-in">
          <ShieldAlert className="w-5 h-5 mr-3 shrink-0" />
          <span className="text-sm font-medium">{errorMsg}</span>
        </div>
      )}

      {/* Admin Subheader Panel */}
      <div className="bg-gray-900 border-b border-gray-800 px-4 sm:px-6 lg:px-8 py-5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">MADECC Management Hub</h1>
            <p className="text-xs text-gray-500 mt-1">Status: Fully authenticated administrator</p>
          </div>
          <button
            id="dashboard-logout-btn"
            onClick={onLogout}
            className="flex items-center space-x-2 text-xs font-semibold bg-gray-800/80 hover:bg-rose-900/40 hover:text-rose-400 border border-gray-700 hover:border-rose-800/50 px-4 py-2 rounded transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Admin Navigation Sidebar */}
          <nav className="lg:col-span-3 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-1 gap-2 bg-gray-900/60 border border-gray-800/80 p-3 rounded-lg">
            {[
              { id: 'projects', label: 'Projects Portfolio', icon: Briefcase },
              { id: 'blogs', label: 'Blog System', icon: FileText },
              { id: 'reviews', label: 'Review Moderation', icon: MessageSquare, badge: allReviews.filter(r => !r.approved).length },
              { id: 'appointments', label: 'Consultations', icon: Calendar, badge: appointments.length },
              { id: 'contacts', label: 'Client Inquiries', icon: Mail, badge: contacts.length },
              { id: 'subscribers', label: 'Subscribers', icon: PlusCircle, badge: subscribers.length },
              { id: 'settings', label: 'Security Panel', icon: Settings },
            ].map((tab) => {
              const IconComp = tab.icon;
              const isSelected = activeTab === tab.id;
              return (
                <button
                  id={`admin-tab-btn-${tab.id}`}
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as AdminTab)}
                  className={`flex items-center justify-between text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider rounded transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500 text-gray-950 font-bold shadow-md'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                  }`}
                >
                  <span className="flex items-center">
                    <IconComp className="w-4 h-4 mr-2.5 shrink-0" />
                    <span>{tab.label}</span>
                  </span>
                  {tab.badge && tab.badge > 0 ? (
                    <span className={`text-[10px] py-0.5 px-1.5 font-sans rounded-full ${isSelected ? 'bg-gray-950 text-amber-500' : 'bg-amber-500/20 text-amber-500'}`}>
                      {tab.badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </nav>

          {/* Admin Action Sandbox Content */}
          <div className="lg:col-span-9 bg-gray-900 border border-gray-800 rounded-lg p-6 sm:p-8">
            
            {/* 1. PROJECTS TAB */}
            {activeTab === 'projects' && (
              <div id="admin-projects-panel" className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-bold">Manage Portfolio Projects</h2>
                    <p className="text-xs text-gray-500 mt-0.5">Publish and edit Residential & Commercial construction projects.</p>
                  </div>
                  <button
                    id="add-project-modal-btn"
                    onClick={() => { resetProjectForm(); setProjectFormOpen(true); }}
                    className="flex items-center justify-center space-x-2 bg-amber-500 hover:bg-amber-600 text-gray-950 px-4 py-2 rounded text-xs font-semibold uppercase tracking-wider cursor-pointer shadow-md"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Project</span>
                  </button>
                </div>

                {projectFormOpen && (
                  <form onSubmit={handleProjectSubmit} className="bg-gray-950 p-6 rounded border border-amber-500/20 space-y-4">
                    <h3 className="text-sm font-bold border-b border-gray-800 pb-2 text-amber-500">
                      {editingProject ? 'Modify Project Credentials' : 'Configure New Portfolio Entry'}
                    </h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="proj-form-title" className="block text-xs text-gray-400 mb-1 font-semibold uppercase tracking-wider">Project Title *</label>
                        <input
                          id="proj-form-title"
                          type="text"
                          required
                          value={projectTitle}
                          onChange={(e) => setProjectTitle(e.target.value)}
                          placeholder="The Pacific Heights Penthouse"
                          className="w-full bg-gray-900 border border-gray-800 focus:border-amber-500 text-white rounded px-3 py-2 text-sm focus:outline-none"
                        />
                      </div>
                      <div>
                        <label htmlFor="proj-form-category" className="block text-xs text-gray-400 mb-1 font-semibold uppercase tracking-wider">Division Category *</label>
                        <select
                          id="proj-form-category"
                          value={projectCategory}
                          onChange={(e) => setProjectCategory(e.target.value as 'residential' | 'commercial')}
                          className="w-full bg-gray-900 border border-gray-800 focus:border-amber-500 text-white rounded px-3 py-2 text-sm focus:outline-none"
                        >
                          <option value="residential">Residential Construction</option>
                          <option value="commercial">Commercial Construction</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="proj-form-location" className="block text-xs text-gray-400 mb-1 font-semibold uppercase tracking-wider">Geographic Location *</label>
                        <input
                          id="proj-form-location"
                          type="text"
                          required
                          value={projectLocation}
                          onChange={(e) => setProjectLocation(e.target.value)}
                          placeholder="Los Angeles, CA"
                          className="w-full bg-gray-900 border border-gray-800 focus:border-amber-500 text-white rounded px-3 py-2 text-sm focus:outline-none"
                        />
                      </div>
                      <div>
                        <label htmlFor="proj-form-date" className="block text-xs text-gray-400 mb-1 font-semibold uppercase tracking-wider">Completion Date *</label>
                        <input
                          id="proj-form-date"
                          type="date"
                          required
                          value={projectDate}
                          onChange={(e) => setProjectDate(e.target.value)}
                          className="w-full bg-gray-900 border border-gray-800 focus:border-amber-500 text-white rounded px-3 py-2 text-sm focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="proj-form-client" className="block text-xs text-gray-400 mb-1 font-semibold uppercase tracking-wider">Client Name (Optional)</label>
                        <input
                          id="proj-form-client"
                          type="text"
                          value={projectClient}
                          onChange={(e) => setProjectClient(e.target.value)}
                          placeholder="Estate Trust Co."
                          className="w-full bg-gray-900 border border-gray-800 focus:border-amber-500 text-white rounded px-3 py-2 text-sm focus:outline-none"
                        />
                      </div>
                      <div>
                        <label htmlFor="proj-form-area" className="block text-xs text-gray-400 mb-1 font-semibold uppercase tracking-wider">Built Area Sq Ft (Optional)</label>
                        <input
                          id="proj-form-area"
                          type="text"
                          value={projectArea}
                          onChange={(e) => setProjectArea(e.target.value)}
                          placeholder="6,500 sq ft"
                          className="w-full bg-gray-900 border border-gray-800 focus:border-amber-500 text-white rounded px-3 py-2 text-sm focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="proj-form-img" className="block text-xs text-gray-400 mb-1 font-semibold uppercase tracking-wider">Featured Asset Image URL *</label>
                      <input
                        id="proj-form-img"
                        type="text"
                        required
                        value={projectImg}
                        onChange={(e) => setProjectImg(e.target.value)}
                        placeholder="/src/assets/images/luxury_residential_1782866705938.jpg or high-quality URL"
                        className="w-full bg-gray-900 border border-gray-800 focus:border-amber-500 text-white rounded px-3 py-2 text-sm focus:outline-none"
                      />
                    </div>

                    <div>
                      <label htmlFor="proj-form-desc" className="block text-xs text-gray-400 mb-1 font-semibold uppercase tracking-wider">Structural & Architectural Description *</label>
                      <textarea
                        id="proj-form-desc"
                        required
                        rows={4}
                        value={projectDesc}
                        onChange={(e) => setProjectDesc(e.target.value)}
                        placeholder="Comprehensive details on building engineering, load systems, material choices, and luxury finishes..."
                        className="w-full bg-gray-900 border border-gray-800 focus:border-amber-500 text-white rounded px-3 py-2 text-sm focus:outline-none"
                      />
                    </div>

                    <div className="flex justify-end space-x-3 pt-2">
                      <button
                        id="proj-form-cancel"
                        type="button"
                        onClick={() => { setProjectFormOpen(false); resetProjectForm(); }}
                        className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-xs font-semibold rounded uppercase tracking-wider cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        id="proj-form-submit"
                        type="submit"
                        className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-gray-950 text-xs font-bold rounded uppercase tracking-wider cursor-pointer shadow-md shadow-amber-500/10"
                      >
                        {editingProject ? 'Save Changes' : 'Confirm & Publish'}
                      </button>
                    </div>
                  </form>
                )}

                <div className="overflow-x-auto rounded border border-gray-800">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-800 text-[10px] uppercase tracking-wider text-gray-400 font-semibold border-b border-gray-800">
                        <th className="p-4">Visual</th>
                        <th className="p-4">Project Title</th>
                        <th className="p-4">Sector</th>
                        <th className="p-4">Location</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800 text-xs text-gray-300">
                      {projects.map((p) => (
                        <tr key={p.id} className="hover:bg-gray-800/20">
                          <td className="p-4">
                            <img src={p.image} alt={p.title} className="w-12 h-8 object-cover rounded" referrerPolicy="no-referrer" />
                          </td>
                          <td className="p-4 font-semibold text-white">{p.title}</td>
                          <td className="p-4 uppercase tracking-wider text-[10px]"><span className={`px-2 py-0.5 rounded ${p.category === 'commercial' ? 'bg-indigo-950 text-indigo-300' : 'bg-amber-950 text-amber-300'}`}>{p.category}</span></td>
                          <td className="p-4">{p.location}</td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                id={`edit-proj-${p.id}`}
                                onClick={() => startEditProject(p)}
                                className="p-1 text-gray-400 hover:text-amber-500 rounded hover:bg-gray-800 transition-colors"
                                title="Edit project specs"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                id={`delete-proj-${p.id}`}
                                onClick={() => deleteProject(p.id)}
                                className="p-1 text-gray-400 hover:text-rose-500 rounded hover:bg-gray-800 transition-colors"
                                title="Remove project"
                              >
                                <Trash className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 2. BLOG TAB */}
            {activeTab === 'blogs' && (
              <div id="admin-blog-panel" className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-bold">Manage Technical Blog Articles</h2>
                    <p className="text-xs text-gray-500 mt-0.5">Edit and dispatch SEO-optimized long-form content.</p>
                  </div>
                  <button
                    id="add-blog-modal-btn"
                    onClick={() => { resetBlogForm(); setBlogFormOpen(true); }}
                    className="flex items-center justify-center space-x-2 bg-amber-500 hover:bg-amber-600 text-gray-950 px-4 py-2 rounded text-xs font-semibold uppercase tracking-wider cursor-pointer shadow-md"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Publish Article</span>
                  </button>
                </div>

                {blogFormOpen && (
                  <form onSubmit={handleBlogSubmit} className="bg-gray-950 p-6 rounded border border-amber-500/20 space-y-4">
                    <h3 className="text-sm font-bold border-b border-gray-800 pb-2 text-amber-500">
                      {editingBlog ? 'Edit Technical Article' : 'Draft New Corporate Article'}
                    </h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="blog-form-title" className="block text-xs text-gray-400 mb-1 font-semibold uppercase tracking-wider">Article Title *</label>
                        <input
                          id="blog-form-title"
                          type="text"
                          required
                          value={blogTitle}
                          onChange={(e) => handleTitleChangeForSlug(e.target.value)}
                          placeholder="Advances in High-Performance Timber Framings"
                          className="w-full bg-gray-900 border border-gray-800 focus:border-amber-500 text-white rounded px-3 py-2 text-sm focus:outline-none"
                        />
                      </div>
                      <div>
                        <label htmlFor="blog-form-slug" className="block text-xs text-gray-400 mb-1 font-semibold uppercase tracking-wider">SEO URL Slug *</label>
                        <input
                          id="blog-form-slug"
                          type="text"
                          required
                          value={blogSlug}
                          onChange={(e) => setBlogSlug(e.target.value)}
                          placeholder="advances-high-performance-timber-framings"
                          className="w-full bg-gray-900 border border-gray-800 focus:border-amber-500 text-white rounded px-3 py-2 text-sm focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="blog-form-cat" className="block text-xs text-gray-400 mb-1 font-semibold uppercase tracking-wider">Topic Category *</label>
                        <input
                          id="blog-form-cat"
                          type="text"
                          required
                          value={blogCategory}
                          onChange={(e) => setBlogCategory(e.target.value)}
                          placeholder="Building Materials"
                          className="w-full bg-gray-900 border border-gray-800 focus:border-amber-500 text-white rounded px-3 py-2 text-sm focus:outline-none"
                        />
                      </div>
                      <div>
                        <label htmlFor="blog-form-keywords" className="block text-xs text-gray-400 mb-1 font-semibold uppercase tracking-wider">SEO Keywords (Comma Separated) *</label>
                        <input
                          id="blog-form-keywords"
                          type="text"
                          required
                          value={blogKeywords}
                          onChange={(e) => setBlogKeywords(e.target.value)}
                          placeholder="mass timber, structural engineering, eco home, MADECC"
                          className="w-full bg-gray-900 border border-gray-800 focus:border-amber-500 text-white rounded px-3 py-2 text-sm focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="blog-form-img" className="block text-xs text-gray-400 mb-1 font-semibold uppercase tracking-wider">Featured Cover Image URL *</label>
                      <input
                        id="blog-form-img"
                        type="text"
                        required
                        value={blogImg}
                        onChange={(e) => setBlogImg(e.target.value)}
                        placeholder="/src/assets/images/luxury_residential_1782866705938.jpg"
                        className="w-full bg-gray-900 border border-gray-800 focus:border-amber-500 text-white rounded px-3 py-2 text-sm focus:outline-none"
                      />
                    </div>

                    <div>
                      <label htmlFor="blog-form-meta" className="block text-xs text-gray-400 mb-1 font-semibold uppercase tracking-wider">SEO Meta Description *</label>
                      <input
                        id="blog-form-meta"
                        type="text"
                        required
                        maxLength={160}
                        value={blogMeta}
                        onChange={(e) => setBlogMeta(e.target.value)}
                        placeholder="Detailed, rich 150-160 character meta description designed to maximize search engine click-throughs."
                        className="w-full bg-gray-900 border border-gray-800 focus:border-amber-500 text-white rounded px-3 py-2 text-sm focus:outline-none"
                      />
                    </div>

                    <div>
                      <label htmlFor="blog-form-content" className="block text-xs text-gray-400 mb-1 font-semibold uppercase tracking-wider">Article Rich Content (HTML Permitted) *</label>
                      <textarea
                        id="blog-form-content"
                        required
                        rows={8}
                        value={blogContent}
                        onChange={(e) => setBlogContent(e.target.value)}
                        placeholder="<h2>The Subheading</h2><p>Provide deep value, helpful insights, and professional analyses here...</p>"
                        className="w-full bg-gray-900 border border-gray-800 focus:border-amber-500 text-white font-mono rounded px-3 py-2 text-xs focus:outline-none"
                      />
                    </div>

                    <div className="flex justify-end space-x-3 pt-2">
                      <button
                        id="blog-form-cancel"
                        type="button"
                        onClick={() => { setBlogFormOpen(false); resetBlogForm(); }}
                        className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-xs font-semibold rounded uppercase tracking-wider cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        id="blog-form-submit"
                        type="submit"
                        className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-gray-950 text-xs font-bold rounded uppercase tracking-wider cursor-pointer shadow-md shadow-amber-500/10"
                      >
                        {editingBlog ? 'Update Article' : 'Publish to Feed'}
                      </button>
                    </div>
                  </form>
                )}

                <div className="overflow-x-auto rounded border border-gray-800">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-800 text-[10px] uppercase tracking-wider text-gray-400 font-semibold border-b border-gray-800">
                        <th className="p-4">Visual</th>
                        <th className="p-4">Article Title</th>
                        <th className="p-4">Category</th>
                        <th className="p-4">Publish Date</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800 text-xs text-gray-300">
                      {blogs.map((b) => (
                        <tr key={b.id} className="hover:bg-gray-800/20">
                          <td className="p-4">
                            <img src={b.featuredImage} alt={b.title} className="w-12 h-8 object-cover rounded" referrerPolicy="no-referrer" />
                          </td>
                          <td className="p-4 font-semibold text-white">{b.title}</td>
                          <td className="p-4 font-mono text-[10px] text-amber-500">{b.category}</td>
                          <td className="p-4">{b.date}</td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                id={`edit-blog-${b.id}`}
                                onClick={() => startEditBlog(b)}
                                className="p-1 text-gray-400 hover:text-amber-500 rounded hover:bg-gray-800 transition-colors"
                                title="Edit blog contents"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                id={`delete-blog-${b.id}`}
                                onClick={() => deleteBlog(b.id)}
                                className="p-1 text-gray-400 hover:text-rose-500 rounded hover:bg-gray-800 transition-colors"
                                title="Remove blog"
                              >
                                <Trash className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 3. REVIEWS TAB */}
            {activeTab === 'reviews' && (
              <div id="admin-reviews-panel" className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold">Client Review Moderation</h2>
                  <p className="text-xs text-gray-500 mt-0.5">Approve customer reviews before publishing them live to the site widget.</p>
                </div>

                <div className="space-y-4">
                  {allReviews.length === 0 ? (
                    <p className="text-xs text-gray-500 py-6 text-center bg-gray-950 rounded border border-gray-800">No client reviews logged in the database.</p>
                  ) : (
                    allReviews.map((r) => (
                      <div key={r.id} className={`p-5 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${r.approved ? 'bg-gray-950/60 border-gray-800' : 'bg-amber-500/5 border-amber-500/20'}`}>
                        <div className="space-y-2 max-w-2xl">
                          <div className="flex items-center space-x-3 flex-wrap gap-y-1">
                            <span className="text-sm font-bold text-white">{r.name}</span>
                            <span className="text-xs text-gray-500">({r.email})</span>
                            <span className="text-xs text-amber-500 font-bold">{'★'.repeat(r.rating)}</span>
                            {r.approved ? (
                              <span className="text-[9px] font-semibold bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded tracking-wide uppercase">Approved & Active</span>
                            ) : (
                              <span className="text-[9px] font-semibold bg-amber-950 text-amber-400 px-2 py-0.5 rounded tracking-wide uppercase">Pending Approval</span>
                            )}
                          </div>
                          <p className="text-xs text-gray-400 italic font-sans leading-relaxed">"{r.review}"</p>
                          <span className="text-[10px] block text-gray-600 font-mono">Submitted: {r.date}</span>
                        </div>

                        <div className="flex items-center space-x-2 self-end sm:self-center">
                          {!r.approved && (
                            <button
                              id={`approve-rev-${r.id}`}
                              onClick={() => approveReview(r.id)}
                              className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-gray-950 font-bold rounded text-xs tracking-wider uppercase cursor-pointer transition-colors"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Approve</span>
                            </button>
                          )}
                          <button
                            id={`delete-rev-${r.id}`}
                            onClick={() => deleteReview(r.id)}
                            className="flex items-center space-x-1.5 px-3 py-1.5 bg-gray-800 hover:bg-rose-950 hover:text-rose-400 text-gray-400 hover:border-rose-900 border border-gray-700 rounded text-xs tracking-wider uppercase cursor-pointer transition-colors"
                          >
                            <Trash className="w-3.5 h-3.5" />
                            <span>Remove</span>
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* 4. APPOINTMENTS TAB */}
            {activeTab === 'appointments' && (
              <div id="admin-appointments-panel" className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold">Consultation Appointment Calendar</h2>
                  <p className="text-xs text-gray-500 mt-0.5">Track requested site visits and design review consultations.</p>
                </div>

                <div className="space-y-4">
                  {appointments.length === 0 ? (
                    <p className="text-xs text-gray-500 py-6 text-center bg-gray-950 rounded border border-gray-800">No scheduled consultation requests logged.</p>
                  ) : (
                    appointments.map((a) => (
                      <div key={a.id} className="p-5 rounded-lg border border-gray-800 bg-gray-950/60 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2.5 flex-wrap gap-y-1">
                            <span className="text-sm font-bold text-white">{a.name}</span>
                            <span className="text-xs text-gray-500 font-mono">({a.phone} | {a.email})</span>
                            <span className="text-[10px] font-semibold bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded uppercase tracking-wider">{a.projectType}</span>
                          </div>

                          <div className="flex items-center space-x-3 text-xs text-amber-500 font-semibold bg-amber-500/5 px-3 py-1.5 rounded border border-amber-500/10 w-fit">
                            <span>📅 DATE: {a.preferredDate}</span>
                            <span>⏰ TIME: {a.preferredTime}</span>
                          </div>

                          <p className="text-xs text-gray-400 italic bg-gray-900/60 p-3 rounded border border-gray-800">
                            <strong>Project Objectives:</strong> {a.message}
                          </p>
                          <span className="text-[10px] block text-gray-600 font-mono">Booked on: {a.date}</span>
                        </div>

                        <button
                          id={`complete-apt-${a.id}`}
                          onClick={() => deleteAppointment(a.id)}
                          className="flex items-center space-x-1.5 px-3 py-1.5 bg-gray-800 hover:bg-emerald-950 hover:text-emerald-400 text-gray-400 hover:border-emerald-900 border border-gray-700 rounded text-xs font-semibold uppercase tracking-wider cursor-pointer self-end sm:self-start transition-colors"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Complete</span>
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* 5. CONTACTS TAB */}
            {activeTab === 'contacts' && (
              <div id="admin-contacts-panel" className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold">Client General Inquiries</h2>
                  <p className="text-xs text-gray-500 mt-0.5">Logs of prospective client messages submitted via the main contact forms.</p>
                </div>

                <div className="space-y-4">
                  {contacts.length === 0 ? (
                    <p className="text-xs text-gray-500 py-6 text-center bg-gray-950 rounded border border-gray-800">No client contact submissions logged.</p>
                  ) : (
                    contacts.map((c) => (
                      <div key={c.id} className="p-5 rounded-lg border border-gray-800 bg-gray-950/60 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2.5 flex-wrap gap-y-1">
                            <span className="text-sm font-bold text-white">{c.name}</span>
                            <span className="text-xs text-gray-500 font-mono">({c.phone} | {c.email})</span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] uppercase tracking-wider text-gray-400">
                            <div><span className="font-bold text-gray-500">Company:</span> {c.company || 'N/A'}</div>
                            <div><span className="font-bold text-gray-500">Division:</span> <span className="text-amber-500 font-bold">{c.projectType}</span></div>
                            <div><span className="font-bold text-gray-500">Budget Range:</span> <span className="text-white font-bold">{c.budgetRange}</span></div>
                          </div>

                          <div className="bg-gray-900/60 p-3 rounded border border-gray-800 text-xs text-gray-400 whitespace-pre-line leading-relaxed">
                            {c.message}
                          </div>

                          <span className="text-[10px] block text-gray-600 font-mono">Received on: {c.date}</span>
                        </div>

                        <button
                          id={`delete-contact-${c.id}`}
                          onClick={() => deleteContact(c.id)}
                          className="flex items-center space-x-1.5 px-3 py-1.5 bg-gray-800 hover:bg-rose-950 hover:text-rose-400 text-gray-400 border border-gray-700 rounded text-xs font-semibold uppercase tracking-wider cursor-pointer self-end sm:self-start transition-colors"
                        >
                          <Trash className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* 6. SUBSCRIBERS TAB */}
            {activeTab === 'subscribers' && (
              <div id="admin-subscribers-panel" className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold">Technical Newsletter Subscribers</h2>
                  <p className="text-xs text-gray-500 mt-0.5">List of email addresses subscribed to receive construction news.</p>
                </div>

                <div className="overflow-x-auto rounded border border-gray-800">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-800 text-[10px] uppercase tracking-wider text-gray-400 font-semibold border-b border-gray-800">
                        <th className="p-4">Subscriber Email</th>
                        <th className="p-4">Registration Date</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800 text-xs text-gray-300">
                      {subscribers.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="p-6 text-center text-gray-500 bg-gray-950">No newsletter subscribers found.</td>
                        </tr>
                      ) : (
                        subscribers.map((s) => (
                          <tr key={s.id} className="hover:bg-gray-800/20">
                            <td className="p-4 font-semibold text-white">{s.email}</td>
                            <td className="p-4 font-mono">{s.date}</td>
                            <td className="p-4"><span className="px-2 py-0.5 text-[10px] bg-emerald-950 text-emerald-300 rounded uppercase font-semibold">Active</span></td>
                            <td className="p-4 text-right">
                              <button
                                id={`delete-sub-${s.id}`}
                                onClick={() => deleteSubscriber(s.id)}
                                className="p-1 text-gray-400 hover:text-rose-500 rounded hover:bg-gray-800 transition-colors cursor-pointer"
                                title="Unsubscribe contact"
                              >
                                <Trash className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 7. SETTINGS PANEL */}
            {activeTab === 'settings' && (
              <div id="admin-settings-panel" className="space-y-6 max-w-md">
                <div>
                  <h2 className="text-lg font-bold">Security & Administration Settings</h2>
                  <p className="text-xs text-gray-500 mt-0.5">Manage administrative access keys to secure this website.</p>
                </div>

                <form onSubmit={handleChangePassword} className="space-y-4 bg-gray-950 p-6 rounded border border-gray-800">
                  <div>
                    <label htmlFor="settings-new-pw" className="block text-xs text-gray-400 mb-1.5 font-semibold uppercase tracking-wider">Configure New Admin Password</label>
                    <input
                      id="settings-new-pw"
                      type="password"
                      required
                      placeholder="Minimum 6 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-gray-900 border border-gray-800 focus:border-amber-500 text-white rounded px-3 py-2 text-sm focus:outline-none"
                    />
                  </div>

                  <button
                    id="save-new-pw-btn"
                    type="submit"
                    disabled={pwChangeLoading}
                    className="flex items-center justify-center space-x-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-gray-950 px-4 py-2.5 rounded text-xs font-bold uppercase tracking-wider cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>{pwChangeLoading ? 'Saving...' : 'Update Password'}</span>
                  </button>
                </form>
              </div>
            )}

          </div>

        </div>
      </div>
    </section>
  );
}
