/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ProjectCategory = 'residential' | 'commercial';

export interface Project {
  id: string;
  title: string;
  category: ProjectCategory;
  location: string;
  description: string;
  image: string;
  completionDate: string;
  client?: string;
  area?: string; // e.g. "4,500 sq ft"
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  metaDescription: string;
  keywords: string; // comma-separated
  featuredImage: string;
  schemaMarkup?: string; // JSON-LD schema as string
  author: string;
  date: string;
  category: string;
}

export interface Review {
  id: string;
  name: string;
  email: string;
  rating: number; // 1-5
  review: string;
  approved: boolean;
  date: string;
}

export interface Appointment {
  id: string;
  name: string;
  email: string;
  phone: string;
  preferredDate: string;
  preferredTime: string;
  projectType: ProjectCategory;
  message: string;
  date: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  projectType: ProjectCategory;
  budgetRange: string;
  message: string;
  date: string;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  date: string;
  status: 'active' | 'unsubscribed';
}

export interface AdminSession {
  token: string;
  username: string;
  expiresAt: number;
}
