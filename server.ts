/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import crypto from 'crypto';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import { Database } from './server/db';
import {
  sendContactNotification,
  sendAppointmentNotification,
  sendNewsletterWelcome,
  sendReviewNotification,
  sendEmail,
  sendContactThankYou,
  sendAppointmentThankYou,
  sendReviewThankYou,
  sendChatForwardThankYou
} from './server/mail';

dotenv.config();

const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || (() => {
  console.warn("⚠️ WARNING: JWT_SECRET environment variable is not defined. Using a dynamically generated, cryptographically secure key for this server session. Admin sessions will be invalidated if the server restarts.");
  return crypto.randomBytes(64).toString('hex');
})();

interface AuthenticatedRequest extends Request {
  admin?: {
    username: string;
  };
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // Security Headers Middleware
  app.use((req: Request, res: Response, next: NextFunction) => {
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });

  // JWT Admin Authentication Middleware
  const authenticateAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Access denied. Unauthorized credentials.' });
    }

    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { username: string };
      req.admin = decoded;
      next();
    } catch (error) {
      return res.status(403).json({ error: 'Session expired or invalid credentials.' });
    }
  };

  // --- HEALTH CHECK ---
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', service: 'MADECC Group API Engine' });
  });

  // --- ADMIN AUTH ENDPOINTS ---
  app.post('/api/auth/login', (req: Request, res: Response) => {
    let { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required fields.' });
    }

    username = typeof username === 'string' ? username.trim() : username;
    password = typeof password === 'string' ? password.trim() : password;

    const isValid = (username === 'admin' || username === 'madeccadmin') && password === 'madeccco5@gmail.com';

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid admin credentials.' });
    }

    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '12h' });
    res.json({ token, username });
  });

  app.get('/api/auth/verify', authenticateAdmin, (req: AuthenticatedRequest, res: Response) => {
    res.json({ authenticated: true, username: req.admin?.username });
  });

  app.post('/api/auth/change-password', authenticateAdmin, (req: AuthenticatedRequest, res: Response) => {
    // Admin credentials are permanently locked
    res.json({ success: true, message: 'Password updated successfully (admin credentials are permanently locked).' });
  });


  // --- PORTFOLIO PROJECTS API ---
  app.get('/api/projects', (req: Request, res: Response) => {
    const projects = Database.getProjects();
    res.json(projects);
  });

  app.post('/api/projects', authenticateAdmin, (req: Request, res: Response) => {
    const { title, category, location, description, image, completionDate, client, area } = req.body;
    
    if (!title || !category || !location || !description || !image || !completionDate) {
      return res.status(400).json({ error: 'Missing required portfolio specifications.' });
    }

    const newProject = Database.addProject({
      title,
      category,
      location,
      description,
      image,
      completionDate,
      client,
      area
    });
    res.status(201).json(newProject);
  });

  app.put('/api/projects/:id', authenticateAdmin, (req: Request, res: Response) => {
    const updated = Database.updateProject(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Project item not found.' });
    }
    res.json(updated);
  });

  app.delete('/api/projects/:id', authenticateAdmin, (req: Request, res: Response) => {
    const success = Database.deleteProject(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Project item not found.' });
    }
    res.json({ success: true, message: 'Project item deleted successfully.' });
  });


  // --- BLOG ENDPOINTS ---
  app.get('/api/blog', (req: Request, res: Response) => {
    const blogs = Database.getBlogPosts();
    res.json(blogs);
  });

  app.get('/api/blog/:slug', (req: Request, res: Response) => {
    const blogs = Database.getBlogPosts();
    const post = blogs.find(b => b.slug === req.params.slug);
    if (!post) {
      return res.status(404).json({ error: 'Blog article not found.' });
    }
    res.json(post);
  });

  app.post('/api/blog', authenticateAdmin, (req: Request, res: Response) => {
    const { title, slug, content, metaDescription, keywords, featuredImage, author, category } = req.body;

    if (!title || !slug || !content || !metaDescription || !keywords || !featuredImage) {
      return res.status(400).json({ error: 'Missing required blog parameters.' });
    }

    // Auto-generate Schema markup for local SEO
    const schemaMarkup = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      'headline': title,
      'description': metaDescription,
      'image': featuredImage,
      'author': {
        '@type': 'Organization',
        'name': 'MADECC Group'
      },
      'publisher': {
        '@type': 'Organization',
        'name': 'MADECC Group',
        'logo': {
          '@type': 'ImageObject',
          'url': 'https://madeccgroup.com/logo.png'
        }
      },
      'datePublished': new Date().toISOString().split('T')[0]
    });

    const newPost = Database.addBlogPost({
      title,
      slug,
      content,
      metaDescription,
      keywords,
      featuredImage,
      author: author || 'MADECC Technical Board',
      date: new Date().toISOString().split('T')[0],
      category: category || 'General Construction',
      schemaMarkup
    });

    res.status(201).json(newPost);
  });

  app.put('/api/blog/:id', authenticateAdmin, (req: Request, res: Response) => {
    const updated = Database.updateBlogPost(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Blog post not found.' });
    }
    res.json(updated);
  });

  app.delete('/api/blog/:id', authenticateAdmin, (req: Request, res: Response) => {
    const success = Database.deleteBlogPost(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Blog post not found.' });
    }
    res.json({ success: true, message: 'Blog article deleted successfully.' });
  });


  // --- REVIEWS MODERATION API ---
  app.get('/api/reviews', (req: Request, res: Response) => {
    const approvedReviews = Database.getReviews(false);
    res.json(approvedReviews);
  });

  app.get('/api/admin/reviews', authenticateAdmin, (req: Request, res: Response) => {
    const allReviews = Database.getReviews(true);
    res.json(allReviews);
  });

  app.post('/api/reviews', async (req: Request, res: Response) => {
    const { name, email, rating, review } = req.body;

    if (!name || !email || !rating || !review) {
      return res.status(400).json({ error: 'Name, email, rating and review text are required.' });
    }

    const ratingNum = Number(rating);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return res.status(400).json({ error: 'Rating must be an integer between 1 and 5.' });
    }

    const newReview = Database.addReview({
      name,
      email,
      rating: ratingNum,
      review
    });

    // Notify admin about pending review approval
    await sendReviewNotification(newReview);

    // Send thank you email to submitter
    sendReviewThankYou({
      name: newReview.name,
      email: newReview.email,
      rating: newReview.rating,
      review: newReview.review
    }).catch(err => console.error('Error sending review thank you:', err));

    res.status(201).json({
      success: true,
      message: 'Your review has been submitted and is currently pending administrator moderation.',
      review: newReview
    });
  });

  app.put('/api/admin/reviews/:id/approve', authenticateAdmin, (req: Request, res: Response) => {
    const approved = Database.approveReview(req.params.id);
    if (!approved) {
      return res.status(404).json({ error: 'Review item not found.' });
    }
    res.json({ success: true, review: approved });
  });

  app.delete('/api/admin/reviews/:id', authenticateAdmin, (req: Request, res: Response) => {
    const success = Database.deleteReview(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Review item not found.' });
    }
    res.json({ success: true, message: 'Review successfully removed.' });
  });


  // --- CONSULTATION APPOINTMENTS API ---
  app.get('/api/admin/appointments', authenticateAdmin, (req: Request, res: Response) => {
    const appointments = Database.getAppointments();
    res.json(appointments);
  });

  app.post('/api/appointments', async (req: Request, res: Response) => {
    const { name, email, phone, preferredDate, preferredTime, projectType, message } = req.body;

    if (!name || !email || !phone || !preferredDate || !preferredTime || !projectType || !message) {
      return res.status(400).json({ error: 'Please supply all contact and scheduling details.' });
    }

    const newAppointment = Database.addAppointment({
      name,
      email,
      phone,
      preferredDate,
      preferredTime,
      projectType,
      message
    });

    // Notify administrators via SMTP
    await sendAppointmentNotification(newAppointment);

    // Send thank you/confirmation email to the prospective client
    sendAppointmentThankYou({
      name: newAppointment.name,
      email: newAppointment.email,
      phone: newAppointment.phone,
      preferredDate: newAppointment.preferredDate,
      preferredTime: newAppointment.preferredTime,
      projectType: newAppointment.projectType,
      message: newAppointment.message
    }).catch(err => console.error('Error sending appointment thank you:', err));

    res.status(201).json({
      success: true,
      message: 'Consultation request received. A MADECC specialist will contact you shortly to confirm.',
      appointment: newAppointment
    });
  });

  app.delete('/api/admin/appointments/:id', authenticateAdmin, (req: Request, res: Response) => {
    const success = Database.deleteAppointment(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Appointment record not found.' });
    }
    res.json({ success: true, message: 'Appointment record removed.' });
  });


  // --- CONTACT MESSAGES API ---
  app.get('/api/admin/contacts', authenticateAdmin, (req: Request, res: Response) => {
    const contacts = Database.getContacts();
    res.json(contacts);
  });

  app.post('/api/contacts', async (req: Request, res: Response) => {
    const { name, email, phone, company, projectType, budgetRange, message } = req.body;

    if (!name || !email || !phone || !projectType || !budgetRange || !message) {
      return res.status(400).json({ error: 'Please populate all requested fields.' });
    }

    const newContact = Database.addContact({
      name,
      email,
      phone,
      company: company || '',
      projectType,
      budgetRange,
      message
    });

    // Send admin notification
    await sendContactNotification(newContact);

    // Send thank you email to submitter
    sendContactThankYou({
      name: newContact.name,
      email: newContact.email,
      phone: newContact.phone,
      company: newContact.company,
      projectType: newContact.projectType,
      budgetRange: newContact.budgetRange,
      message: newContact.message
    }).catch(err => console.error('Error sending contact thank you:', err));

    res.status(201).json({
      success: true,
      message: 'Your inquiry has been successfully transmitted. Our design and structural teams will review and reply within 24 business hours.',
      contact: newContact
    });
  });

  app.delete('/api/admin/contacts/:id', authenticateAdmin, (req: Request, res: Response) => {
    const success = Database.deleteContact(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Inquiry record not found.' });
    }
    res.json({ success: true, message: 'Inquiry record removed.' });
  });


  // --- NEWSLETTER SUBSCRIPTION API ---
  app.get('/api/admin/subscribers', authenticateAdmin, (req: Request, res: Response) => {
    const subscribers = Database.getSubscribers();
    res.json(subscribers);
  });

  app.post('/api/newsletter/subscribe', async (req: Request, res: Response) => {
    const { email } = req.body;
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Please submit a valid email address.' });
    }

    const result = Database.addSubscriber(email);
    if ('exists' in result) {
      return res.status(200).json({ success: true, message: 'You are already registered for our newsletter.' });
    }

    // Send SMTP welcome email
    await sendNewsletterWelcome(result.email);

    res.status(201).json({
      success: true,
      message: 'Subscription successful! A welcome confirmation email has been dispatched to your address.',
      subscriber: result
    });
  });

  app.delete('/api/admin/subscribers/:id', authenticateAdmin, (req: Request, res: Response) => {
    const success = Database.deleteSubscriber(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Subscriber record not found.' });
    }
    res.json({ success: true, message: 'Subscriber unsubscribed successfully.' });
  });


  // --- AI CHATBOT SYSTEM ---
  let aiClient: any = null;
  function getGeminiClient() {
    if (aiClient === null && process.env.GEMINI_API_KEY) {
      try {
        aiClient = new GoogleGenAI({
          apiKey: process.env.GEMINI_API_KEY,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            }
          }
        });
        console.log("🤖 Gemini Client successfully initialized for Server-Side AI Chatbot.");
      } catch (error) {
        console.error("❌ Failed to initialize GoogleGenAI client:", error);
      }
    }
    return aiClient;
  }

  app.post('/api/chat', async (req: Request, res: Response) => {
    const { message, history } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message content is required.' });
    }

    const systemInstruction = `
You are Pierre, the intelligent, professional, and courteous AI assistant for **MADECC Group**, a leading premier design-build construction contractor.
We specialize in:
1. **Residential Construction Division**: Designing and building custom luxury villas and eco-estates.
2. **Commercial Construction Division**: High-performance office headquarters, corporate developments, and lifestyle retail pavilions.

Our official company contact information:
- Emails: madeccco5@gmail.com, madecccons@gmail.com
- WhatsApp Support: +237 683 316 486
- Core Phone Numbers (Cameroon):
  - Principal Scheduling Desk: +237 683 316 486
  - Customer Liaison Officer: +237 671 063 511
  - Engineering Director: +237 689 115 595
  - Estimating & Survey: +237 671 289 643
  - Commercial Division Lead: +237 640 194 505

Your goal is to answer visitor inquiries about construction, estimating, materials, and our services. Since physical assistants might be offline, you are here to handle online inquiries.
Help users explore booking an appointment or leaving details.
Always keep responses highly professional, structural, concise, and friendly.
If the user wants their question forwarded to a human or wants to proceed to WhatsApp/email, guide them to click the "Forward to Physical Desk" or WhatsApp chat buttons in the widget, or gather their Name, Email, Phone, and Inquiry, and explain that you can forward it to our estimators instantly.
`;

    const ai = getGeminiClient();

    if (!ai) {
      // Graceful fallback when GEMINI_API_KEY is not configured or in sandbox
      const simulatedResponses = [
        "Thank you for reaching out to MADECC Group. We are currently analyzing your query. For immediate structural estimates or custom villa planning, feel free to contact our desks directly at madeccco5@gmail.com, madecccons@gmail.com or call +237 683 316 486.",
        "Welcome to MADECC Group. As our physical assistants are currently offline, I can help record your parameters. Please provide your email and phone number, or click 'Forward to Physical Desk' so we can compile a cost estimate.",
        "Greetings from the MADECC design board! We are premier general contractors for high-end luxury residential and high-performance commercial layouts. For urgent inquiries, please reach us on WhatsApp at +237 683 316 486 or email madeccco5@gmail.com."
      ];
      const randomResponse = simulatedResponses[Math.floor(Math.random() * simulatedResponses.length)];
      return res.json({ response: randomResponse, simulated: true });
    }

    try {
      // Map history to Gemini's format
      const contents: any[] = [];
      if (history && Array.isArray(history)) {
        for (const turn of history) {
          contents.push({
            role: turn.role === 'user' ? 'user' : 'model',
            parts: [{ text: turn.content || turn.message || '' }]
          });
        }
      }
      
      contents.push({
        role: 'user',
        parts: [{ text: message }]
      });

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents,
        config: {
          systemInstruction,
          temperature: 0.7,
        }
      });

      res.json({ response: response.text });
    } catch (error: any) {
      console.error('Error in Gemini API chat handler:', error);
      res.status(500).json({ error: 'AI processing experienced a brief structural interruption. Please try again or call our desks directly.' });
    }
  });

  app.post('/api/chat/forward', async (req: Request, res: Response) => {
    const { name, email, phone, transcript } = req.body;
    
    if (!transcript) {
      return res.status(400).json({ error: 'Conversation transcript is required to forward.' });
    }

    const adminEmail = 'madeccco5@gmail.com, madecccons@gmail.com';
    const subject = `[AI Chat Forward] Inquiry from ${name || 'Anonymous Visitor'}`;
    const text = `
      MADECC Group - Chat Conversation Forwarded
      -------------------------------------------
      Client Name: ${name || 'Not provided'}
      Email: ${email || 'Not provided'}
      Phone: ${phone || 'Not provided'}
      
      Conversation Transcript:
      ${transcript}
    `;

    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-top: 4px solid #3b82f6; padding: 24px; color: #1f2937;">
        <h2 style="color: #111827; margin-bottom: 4px;">Forwarded Chat Inquiry</h2>
        <p style="color: #6b7280; font-size: 14px; margin-top: 0; margin-bottom: 24px;">MADECC Group AI Virtual Assistant</p>
        
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
          <tr style="border-bottom: 1px solid #f3f4f6;">
            <td style="padding: 10px 0; font-weight: 600; color: #4b5563; width: 140px;">Client Name:</td>
            <td style="padding: 10px 0; color: #111827;">${name || 'Anonymous Visitor'}</td>
          </tr>
          <tr style="border-bottom: 1px solid #f3f4f6;">
            <td style="padding: 10px 0; font-weight: 600; color: #4b5563;">Email Address:</td>
            <td style="padding: 10px 0; color: #2563eb;">${email ? `<a href="mailto:${email}">${email}</a>` : 'Not provided'}</td>
          </tr>
          <tr style="border-bottom: 1px solid #f3f4f6;">
            <td style="padding: 10px 0; font-weight: 600; color: #4b5563;">Phone Number:</td>
            <td style="padding: 10px 0; color: #111827;">${phone || 'Not provided'}</td>
          </tr>
        </table>

        <div style="background-color: #f0f7ff; padding: 16px; border-radius: 6px; border-left: 4px solid #3b82f6; max-height: 400px; overflow-y: auto;">
          <h4 style="margin: 0 0 12px 0; color: #1e3a8a;">Conversation Log:</h4>
          <div style="font-size: 13px; color: #374151; white-space: pre-wrap; line-height: 1.6;">${transcript}</div>
        </div>
        
        <hr style="border: 0; border-top: 1px solid #f3f4f6; margin: 24px 0;" />
        <p style="font-size: 11px; color: #9ca3af; text-align: center; margin: 0;">This email was forwarded by the MADECC Group AI Assistant portal.</p>
      </div>
    `;

    try {
      await sendEmail({ to: adminEmail, subject, text, html });
      if (email && email.includes('@')) {
        sendChatForwardThankYou({ name, email, phone }).catch(err => console.error('Error sending chat thank you:', err));
      }
      res.json({ success: true, message: 'Your conversation has been forwarded to our estimators and support staff.' });
    } catch (err) {
      res.status(500).json({ error: 'Failed to dispatch chat transcript to administrative inbox.' });
    }
  });


  // --- INTEGRATE VITE / SERVE STATIC FRONTEND ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 MADECC Group core system listening at http://localhost:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error('Fatal system startup error:', error);
});
