/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASSWORD,
  SMTP_EMAIL
} = process.env;

interface EmailPayload {
  to: string;
  subject: string;
  text: string;
  html: string;
}

let transporter: nodemailer.Transporter | null = null;

// Lazily initialize transporter to avoid crashes during startup if vars are missing
function getTransporter(): nodemailer.Transporter | null {
  if (transporter !== null) return transporter;

  if (SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASSWORD) {
    try {
      transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: Number(SMTP_PORT),
        secure: Number(SMTP_PORT) === 465, // true for 465, false for other ports
        auth: {
          user: SMTP_USER,
          pass: SMTP_PASSWORD
        },
        tls: {
          rejectUnauthorized: false
        }
      });
      console.log('✅ SMTP Transporter successfully initialized for real email routing.');
    } catch (error) {
      console.error('❌ Failed to initialize SMTP Transporter:', error);
      transporter = null;
    }
  } else {
    console.log('⚠️ SMTP Configuration variables missing. Mail system is running in virtual simulation mode.');
  }

  return transporter;
}

export async function sendEmail(payload: EmailPayload): Promise<boolean> {
  const client = getTransporter();
  const fromAddress = SMTP_EMAIL || 'no-reply@madeccgroup.com';

  const mailOptions = {
    from: `"MADECC Group" <${fromAddress}>`,
    to: payload.to,
    subject: payload.subject,
    text: payload.text,
    html: payload.html
  };

  if (client) {
    try {
      await client.sendMail(mailOptions);
      console.log(`📧 Email sent successfully to: ${payload.to} with subject: "${payload.subject}"`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to send real email to ${payload.to}:`, error);
      // Fallback to simulation log on error
    }
  }

  // Virtual Mailbox Log (Simulation Mode)
  console.log(`
╔══════════════════════════════════════════════════════════════════════════════
║ 📧 VIRTUAL MAILBOX SIMULATOR (MADECC GROUP)
╠══════════════════════════════════════════════════════════════════════════════
║ FROM: "MADECC Group" <${fromAddress}>
║ TO: ${payload.to}
║ SUBJECT: ${payload.subject}
╠══════════════════════════════════════════════════════════════════════════════
║ TEXT BODY:
║ ${payload.text}
╚══════════════════════════════════════════════════════════════════════════════
`);
  return true;
}

// Mailer templates
export async function sendContactNotification(data: {
  name: string;
  email: string;
  phone: string;
  company?: string;
  projectType: string;
  budgetRange: string;
  message: string;
}) {
  const adminEmail = 'madeccco5@gmail.com, madecccons@gmail.com';
  const subject = `[New Contact] Commercial/Residential Inquiry from ${data.name}`;
  const text = `
    MADECC Group - New Contact Request Received
    -------------------------------------------
    Name: ${data.name}
    Email: ${data.email}
    Phone: ${data.phone}
    Company: ${data.company || 'N/A'}
    Project Type: ${data.projectType.toUpperCase()}
    Budget Range: ${data.budgetRange}
    
    Message:
    ${data.message}
  `;

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-top: 4px solid #d97706; padding: 24px; color: #1f2937;">
      <h2 style="color: #111827; margin-bottom: 4px;">New Lead Notification</h2>
      <p style="color: #6b7280; font-size: 14px; margin-top: 0; margin-bottom: 24px;">MADECC Group Administration Panel</p>
      
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
        <tr style="border-bottom: 1px solid #f3f4f6;">
          <td style="padding: 10px 0; font-weight: 600; color: #4b5563; width: 140px;">Client Name:</td>
          <td style="padding: 10px 0; color: #111827;">${data.name}</td>
        </tr>
        <tr style="border-bottom: 1px solid #f3f4f6;">
          <td style="padding: 10px 0; font-weight: 600; color: #4b5563;">Email Address:</td>
          <td style="padding: 10px 0; color: #2563eb;"><a href="mailto:${data.email}">${data.email}</a></td>
        </tr>
        <tr style="border-bottom: 1px solid #f3f4f6;">
          <td style="padding: 10px 0; font-weight: 600; color: #4b5563;">Phone Number:</td>
          <td style="padding: 10px 0; color: #111827;">${data.phone}</td>
        </tr>
        <tr style="border-bottom: 1px solid #f3f4f6;">
          <td style="padding: 10px 0; font-weight: 600; color: #4b5563;">Company:</td>
          <td style="padding: 10px 0; color: #111827;">${data.company || 'N/A'}</td>
        </tr>
        <tr style="border-bottom: 1px solid #f3f4f6;">
          <td style="padding: 10px 0; font-weight: 600; color: #4b5563;">Project Type:</td>
          <td style="padding: 10px 0; color: #d97706; font-weight: 600; text-transform: uppercase;">${data.projectType}</td>
        </tr>
        <tr style="border-bottom: 1px solid #f3f4f6;">
          <td style="padding: 10px 0; font-weight: 600; color: #4b5563;">Budget Range:</td>
          <td style="padding: 10px 0; color: #111827; font-weight: 600;">${data.budgetRange}</td>
        </tr>
      </table>

      <div style="background-color: #f9fafb; padding: 16px; border-radius: 6px; border-left: 4px solid #9ca3af;">
        <h4 style="margin: 0 0 8px 0; color: #374151;">Client Message:</h4>
        <p style="margin: 0; color: #4b5563; line-height: 1.5; white-space: pre-line;">${data.message}</p>
      </div>
      
      <hr style="border: 0; border-top: 1px solid #f3f4f6; margin: 24px 0;" />
      <p style="font-size: 11px; color: #9ca3af; text-align: center; margin: 0;">This notification was triggered automatically by the contact system at MADECC Group.</p>
    </div>
  `;

  await sendEmail({ to: adminEmail, subject, text, html });
}

export async function sendAppointmentNotification(data: {
  name: string;
  email: string;
  phone: string;
  preferredDate: string;
  preferredTime: string;
  projectType: string;
  message: string;
}) {
  const adminEmail = 'madeccco5@gmail.com, madecccons@gmail.com';
  const subject = `[New Appointment] Consultation booked by ${data.name}`;
  const text = `
    MADECC Group - Consultation Appointment Booked
    ----------------------------------------------
    Client Name: ${data.name}
    Email: ${data.email}
    Phone: ${data.phone}
    Preferred Date: ${data.preferredDate}
    Preferred Time: ${data.preferredTime}
    Project Sector: ${data.projectType.toUpperCase()}
    
    Message / Project Details:
    ${data.message}
  `;

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-top: 4px solid #10b981; padding: 24px; color: #1f2937;">
      <h2 style="color: #111827; margin-bottom: 4px;">New Consultation Request</h2>
      <p style="color: #6b7280; font-size: 14px; margin-top: 0; margin-bottom: 24px;">MADECC Group Scheduling Desk</p>
      
      <div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; padding: 16px; border-radius: 6px; margin-bottom: 24px;">
        <p style="margin: 0; color: #065f46; font-weight: 600; text-align: center;">
          📅 Appointment Proposed: ${data.preferredDate} at ${data.preferredTime}
        </p>
      </div>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
        <tr style="border-bottom: 1px solid #f3f4f6;">
          <td style="padding: 10px 0; font-weight: 600; color: #4b5563; width: 140px;">Client Name:</td>
          <td style="padding: 10px 0; color: #111827;">${data.name}</td>
        </tr>
        <tr style="border-bottom: 1px solid #f3f4f6;">
          <td style="padding: 10px 0; font-weight: 600; color: #4b5563;">Email Address:</td>
          <td style="padding: 10px 0; color: #2563eb;"><a href="mailto:${data.email}">${data.email}</a></td>
        </tr>
        <tr style="border-bottom: 1px solid #f3f4f6;">
          <td style="padding: 10px 0; font-weight: 600; color: #4b5563;">Phone Number:</td>
          <td style="padding: 10px 0; color: #111827;">${data.phone}</td>
        </tr>
        <tr style="border-bottom: 1px solid #f3f4f6;">
          <td style="padding: 10px 0; font-weight: 600; color: #4b5563;">Project Sector:</td>
          <td style="padding: 10px 0; color: #10b981; font-weight: 600; text-transform: uppercase;">${data.projectType}</td>
        </tr>
      </table>

      <div style="background-color: #f9fafb; padding: 16px; border-radius: 6px; border-left: 4px solid #10b981;">
        <h4 style="margin: 0 0 8px 0; color: #374151;">Project Objectives & Scope:</h4>
        <p style="margin: 0; color: #4b5563; line-height: 1.5; white-space: pre-line;">${data.message}</p>
      </div>
      
      <hr style="border: 0; border-top: 1px solid #f3f4f6; margin: 24px 0;" />
      <p style="font-size: 11px; color: #9ca3af; text-align: center; margin: 0;">MADECC Group scheduling notification systems.</p>
    </div>
  `;

  await sendEmail({ to: adminEmail, subject, text, html });
}

export async function sendNewsletterWelcome(email: string) {
  const subject = `Welcome to MADECC Group Newsletter`;
  const text = `
    Thank you for subscribing to the MADECC Group Newsletter.
    We are excited to share construction news, material tips, home design trends, and premium commercial development updates with you.
    
    Sincerely,
    The MADECC Group Team
    www.madeccgroup.com
  `;

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-top: 4px solid #d97706; padding: 24px; color: #1f2937;">
      <h2 style="color: #111827; margin-bottom: 8px; text-align: center;">Welcome to MADECC Group Insights</h2>
      <p style="color: #4b5563; font-size: 16px; line-height: 1.6; text-align: center; margin-bottom: 24px;">
        Thank you for subscribing to our industry newsletter. You are now connected to premier construction trends and architectural intelligence.
      </p>
      
      <div style="background-color: #fcf6e8; border: 1px solid #fbe5b8; padding: 16px; border-radius: 6px; margin-bottom: 24px; text-align: center;">
        <p style="margin: 0; color: #9a3412; font-weight: 600;">
          💡 What to expect from us:
        </p>
        <ul style="margin: 8px 0 0 0; padding: 0; list-style-type: none; color: #4b5563;">
          <li style="margin-bottom: 6px;">✓ Sustainable luxury home building tips</li>
          <li style="margin-bottom: 6px;">✓ Commercial property value engineering and design models</li>
          <li style="margin-bottom: 6px;">✓ Behind-the-scenes portfolio releases and case studies</li>
        </ul>
      </div>

      <p style="color: #6b7280; font-size: 14px; line-height: 1.5; margin-bottom: 24px;">
        We respect your inbox. You can unsubscribe at any time using the links in our future updates, or by contacting our team.
      </p>

      <hr style="border: 0; border-top: 1px solid #f3f4f6; margin: 24px 0;" />
      <div style="text-align: center;">
        <p style="font-size: 14px; font-weight: 600; color: #111827; margin: 0;">MADECC Group</p>
        <p style="font-size: 12px; color: #9ca3af; margin: 4px 0 0 0;">Residential & Commercial General Contractors</p>
      </div>
    </div>
  `;

  await sendEmail({ to: email, subject, text, html });
}

export async function sendReviewNotification(review: { name: string; email: string; rating: number; review: string }) {
  const adminEmail = 'madeccco5@gmail.com, madecccons@gmail.com';
  const subject = `[New Review - Pending Approval] Review by ${review.name}`;
  const text = `
    MADECC Group - New Review Pending Admin Approval
    ----------------------------------------------
    Name: ${review.name}
    Email: ${review.email}
    Rating: ${review.rating} / 5
    
    Review Content:
    ${review.review}
    
    Log in to the admin dashboard to approve or decline this review.
  `;

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-top: 4px solid #f59e0b; padding: 24px; color: #1f2937;">
      <h2 style="color: #111827; margin-bottom: 4px;">New Customer Review</h2>
      <p style="color: #6b7280; font-size: 14px; margin-top: 0; margin-bottom: 24px;">MADECC Group Moderation Desk</p>
      
      <div style="background-color: #fffbeb; border: 1px solid #fef3c7; padding: 12px; border-radius: 6px; margin-bottom: 24px; text-align: center;">
        <span style="font-size: 24px; color: #d97706;">${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</span>
        <p style="margin: 4px 0 0 0; color: #b45309; font-weight: 600;">Rating: ${review.rating} / 5 stars</p>
      </div>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
        <tr style="border-bottom: 1px solid #f3f4f6;">
          <td style="padding: 10px 0; font-weight: 600; color: #4b5563; width: 140px;">Reviewer Name:</td>
          <td style="padding: 10px 0; color: #111827;">${review.name}</td>
        </tr>
        <tr style="border-bottom: 1px solid #f3f4f6;">
          <td style="padding: 10px 0; font-weight: 600; color: #4b5563;">Email Address:</td>
          <td style="padding: 10px 0; color: #2563eb;"><a href="mailto:${review.email}">${review.email}</a></td>
        </tr>
      </table>

      <div style="background-color: #f9fafb; padding: 16px; border-radius: 6px; border-left: 4px solid #f59e0b;">
        <p style="margin: 0; color: #4b5563; line-height: 1.5; font-style: italic;">"${review.review}"</p>
      </div>

      <p style="margin-top: 24px; text-align: center;">
        <span style="background-color: #1f2937; color: white; padding: 10px 20px; border-radius: 4px; font-size: 14px; font-weight: 600; text-decoration: none; display: inline-block;">
          Go to Dashboard for Approval
        </span>
      </p>
      
      <hr style="border: 0; border-top: 1px solid #f3f4f6; margin: 24px 0;" />
      <p style="font-size: 11px; color: #9ca3af; text-align: center; margin: 0;">This email is for administration review and moderation purposes.</p>
    </div>
  `;

  await sendEmail({ to: adminEmail, subject, text, html });
}

export async function sendContactThankYou(data: {
  name: string;
  email: string;
  phone: string;
  company?: string;
  projectType: string;
  budgetRange: string;
  message: string;
}) {
  const subject = `Thank You for Your Inquiry - MADECC Group`;
  const text = `
    Dear ${data.name},

    Thank you for contacting MADECC Group regarding your interest in our ${data.projectType} structural and design-build services.

    We have successfully received your inquiry and project budget indication (${data.budgetRange}). Our estimators, architects, and site superintendents are already reviewing the details you provided:

    "${data.message}"

    A dedicated project manager will follow up with you directly at ${data.phone} or via email within 24 business hours to discuss initial structural feasibility, cost estimations, and the next steps for your project.

    We appreciate your interest in partnering with MADECC Group to build your vision.

    Sincerely,
    The MADECC Group Estimations Team
    www.madeccgroup.com
  `;

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-top: 4px solid #d97706; padding: 24px; color: #1f2937;">
      <h2 style="color: #111827; margin-bottom: 4px;">Inquiry Received</h2>
      <p style="color: #6b7280; font-size: 14px; margin-top: 0; margin-bottom: 24px;">MADECC Group Estimations & Construction Panel</p>
      
      <p style="font-size: 15px; line-height: 1.6; color: #374151;">
        Dear <strong>${data.name}</strong>,
      </p>
      <p style="font-size: 15px; line-height: 1.6; color: #374151;">
        Thank you for contacting <strong>MADECC Group</strong> regarding your interest in our <strong>${data.projectType.toUpperCase()}</strong> construction and design-build services.
      </p>
      <p style="font-size: 15px; line-height: 1.6; color: #374151;">
        Our engineering, architectural, and planning departments have received your project details and indicated budget scope (<strong style="color: #d97706;">${data.budgetRange}</strong>). We are currently evaluating your technical requirements:
      </p>

      <div style="background-color: #f9fafb; padding: 16px; border-radius: 6px; border-left: 4px solid #d97706; margin: 20px 0;">
        <h4 style="margin: 0 0 8px 0; color: #111827; font-size: 13px; text-transform: uppercase; tracking: 0.5px;">Your Submitted Message:</h4>
        <p style="margin: 0; color: #4b5563; line-height: 1.5; font-size: 14px; font-style: italic; white-space: pre-line;">"${data.message}"</p>
      </div>

      <p style="font-size: 15px; line-height: 1.6; color: #374151;">
        A senior project manager will follow up with you at <strong style="color: #111827;">${data.phone}</strong> or by replying directly to this address within <strong>24 business hours</strong> to deliver structural feasibility feedback or coordinate an on-site survey.
      </p>
      <p style="font-size: 15px; line-height: 1.6; color: #374151; margin-bottom: 24px;">
        We appreciate the opportunity to work together on your development objectives.
      </p>
      
      <hr style="border: 0; border-top: 1px solid #f3f4f6; margin: 24px 0;" />
      <div style="text-align: center;">
        <p style="font-size: 14px; font-weight: bold; color: #111827; margin: 0;">MADECC Group</p>
        <p style="font-size: 11px; color: #9ca3af; margin: 4px 0 0 0;">Residential & Commercial General Contractors</p>
        <p style="font-size: 11px; color: #9ca3af; margin: 2px 0 0 0;">Contact: madeccco5@gmail.com | madecccons@gmail.com</p>
      </div>
    </div>
  `;

  await sendEmail({ to: data.email, subject, text, html });
}

export async function sendAppointmentThankYou(data: {
  name: string;
  email: string;
  phone: string;
  preferredDate: string;
  preferredTime: string;
  projectType: string;
  message: string;
}) {
  const subject = `Consultation Request Received - MADECC Group`;
  const text = `
    Dear ${data.name},

    We have successfully registered your proposed structural and construction consultation details.

    Proposed Consultation Details:
    ------------------------------
    Date: ${data.preferredDate}
    Time: ${data.preferredTime}
    Sector: ${data.projectType.toUpperCase()}

    Summary of Project Details:
    "${data.message}"

    Our scheduling desk is matching your proposal with our senior site superintendents and structural engineers. We will contact you at ${data.phone} or via this email address to confirm or adjust this schedule.

    Thank you for choosing MADECC Group to build your vision.

    Sincerely,
    The MADECC Group Scheduling Desk
    www.madeccgroup.com
  `;

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-top: 4px solid #10b981; padding: 24px; color: #1f2937;">
      <h2 style="color: #111827; margin-bottom: 4px;">Consultation Scheduled</h2>
      <p style="color: #6b7280; font-size: 14px; margin-top: 0; margin-bottom: 24px;">MADECC Group Planning & Scheduling Desk</p>
      
      <p style="font-size: 15px; line-height: 1.6; color: #374151;">
        Dear <strong>${data.name}</strong>,
      </p>
      <p style="font-size: 15px; line-height: 1.6; color: #374151;">
        We have successfully registered your proposed consultation. Our team is coordinating with our regional builders and architects to confirm availability for your session.
      </p>

      <div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; padding: 16px; border-radius: 6px; margin: 20px 0; text-align: center;">
        <span style="font-size: 13px; font-weight: bold; color: #047857; text-transform: uppercase; tracking: 0.5px; display: block; margin-bottom: 4px;">Proposed Appointment Time</span>
        <strong style="font-size: 18px; color: #065f46;">📅 ${data.preferredDate} @ ${data.preferredTime}</strong>
        <span style="font-size: 12px; color: #047857; display: block; margin-top: 4px;">Sector: ${data.projectType.toUpperCase()}</span>
      </div>

      <div style="background-color: #f9fafb; padding: 16px; border-radius: 6px; border-left: 4px solid #10b981; margin: 20px 0;">
        <h4 style="margin: 0 0 8px 0; color: #111827; font-size: 13px; text-transform: uppercase; tracking: 0.5px;">Your Proposed Agenda:</h4>
        <p style="margin: 0; color: #4b5563; line-height: 1.5; font-size: 14px; font-style: italic; white-space: pre-line;">"${data.message}"</p>
      </div>

      <p style="font-size: 15px; line-height: 1.6; color: #374151;">
        Our scheduling desk will verify our field superintendents' schedules and reach out to you at <strong style="color: #111827;">${data.phone}</strong> or via email to lock in this date.
      </p>
      <p style="font-size: 15px; line-height: 1.6; color: #374151; margin-bottom: 24px;">
        Thank you for choosing MADECC Group as your structural partner.
      </p>
      
      <hr style="border: 0; border-top: 1px solid #f3f4f6; margin: 24px 0;" />
      <div style="text-align: center;">
        <p style="font-size: 14px; font-weight: bold; color: #111827; margin: 0;">MADECC Group</p>
        <p style="font-size: 11px; color: #9ca3af; margin: 4px 0 0 0;">Residential & Commercial General Contractors</p>
        <p style="font-size: 11px; color: #9ca3af; margin: 2px 0 0 0;">Contact: madeccco5@gmail.com | madecccons@gmail.com</p>
      </div>
    </div>
  `;

  await sendEmail({ to: data.email, subject, text, html });
}

export async function sendReviewThankYou(data: {
  name: string;
  email: string;
  rating: number;
  review: string;
}) {
  const subject = `Thank You for Reviewing MADECC Group`;
  const text = `
    Dear ${data.name},

    Thank you for taking the time to share your feedback about your experience with MADECC Group.

    We have received your submitted review:
    Rating: ${data.rating} / 5 Stars
    Review: "${data.review}"

    Every review helps our engineering and customer experience teams maintain our high standards of structural craftsmanship and communication. Your feedback has been queued for our administrative board's review and will be published to our site shortly.

    If you need any immediate assistance or have additional project inquiries, do not hesitate to contact our desks directly.

    Sincerely,
    The MADECC Group Administrative Board
    www.madeccgroup.com
  `;

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-top: 4px solid #f59e0b; padding: 24px; color: #1f2937;">
      <h2 style="color: #111827; margin-bottom: 4px;">Thank You for Your Feedback</h2>
      <p style="color: #6b7280; font-size: 14px; margin-top: 0; margin-bottom: 24px;">MADECC Group Customer Relations Desk</p>
      
      <p style="font-size: 15px; line-height: 1.6; color: #374151;">
        Dear <strong>${data.name}</strong>,
      </p>
      <p style="font-size: 15px; line-height: 1.6; color: #374151;">
        Thank you for taking the time to share your review of <strong>MADECC Group</strong>. We greatly value authentic client feedback.
      </p>

      <div style="background-color: #fffbeb; border: 1px solid #fef3c7; padding: 16px; border-radius: 6px; margin: 20px 0; text-align: center;">
        <span style="font-size: 24px; color: #d97706; display: block; margin-bottom: 4px;">${'★'.repeat(data.rating)}${'☆'.repeat(5 - data.rating)}</span>
        <strong style="font-size: 15px; color: #b45309; display: block;">You rated us ${data.rating} / 5 stars</strong>
      </div>

      <div style="background-color: #f9fafb; padding: 16px; border-radius: 6px; border-left: 4px solid #f59e0b; margin: 20px 0;">
        <p style="margin: 0; color: #4b5563; line-height: 1.5; font-size: 14px; font-style: italic;">"${data.review}"</p>
      </div>

      <p style="font-size: 15px; line-height: 1.6; color: #374151;">
        Your submission is currently in our moderation queue and will be published to our testimonials panel shortly. Your insights support our continued commitment to building the highest standard of architectural frameworks.
      </p>
      
      <hr style="border: 0; border-top: 1px solid #f3f4f6; margin: 24px 0;" />
      <div style="text-align: center;">
        <p style="font-size: 14px; font-weight: bold; color: #111827; margin: 0;">MADECC Group</p>
        <p style="font-size: 11px; color: #9ca3af; margin: 4px 0 0 0;">Residential & Commercial General Contractors</p>
        <p style="font-size: 11px; color: #9ca3af; margin: 2px 0 0 0;">Contact: madeccco5@gmail.com | madecccons@gmail.com</p>
      </div>
    </div>
  `;

  await sendEmail({ to: data.email, subject, text, html });
}

export async function sendChatForwardThankYou(data: {
  name?: string;
  email: string;
  phone?: string;
}) {
  const recipientName = data.name || 'Valued Client';
  const subject = `Inquiry Transmission Received - MADECC Group`;
  const text = `
    Dear ${recipientName},

    Thank you for using the MADECC Group Interactive AI Assistant.

    We have successfully received the forwarded copy of your conversation transcript. Our support coordinators and estimator desk have been notified of your dialogue details.

    A specialist will review the conversation parameters and follow up with you directly if required.

    If you have any urgent requests or wish to immediately book a site visit, please call our offices or book directly on our appointment scheduler.

    Sincerely,
    The MADECC Group Support Desk
    www.madeccgroup.com
  `;

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-top: 4px solid #3b82f6; padding: 24px; color: #1f2937;">
      <h2 style="color: #111827; margin-bottom: 4px;">Inquiry Confirmed</h2>
      <p style="color: #6b7280; font-size: 14px; margin-top: 0; margin-bottom: 24px;">MADECC Group Assistant Desk</p>
      
      <p style="font-size: 15px; line-height: 1.6; color: #374151;">
        Dear <strong>${recipientName}</strong>,
      </p>
      <p style="font-size: 15px; line-height: 1.6; color: #374151;">
        Thank you for interacting with our virtual assistant portal. We are pleased to confirm that a formal record of your dialogue has been transmitted to our administrative system.
      </p>
      <p style="font-size: 15px; line-height: 1.6; color: #374151;">
        Our customer support coordinators and construction estimators are reviewing your queries to prepare relevant technical references or design guidance.
      </p>
      <p style="font-size: 15px; line-height: 1.6; color: #374151; margin-bottom: 24px;">
        Should you wish to expedite an evaluation, please feel free to use our consultation appointment scheduler to coordinate a live structural presentation with our superintendents.
      </p>
      
      <hr style="border: 0; border-top: 1px solid #f3f4f6; margin: 24px 0;" />
      <div style="text-align: center;">
        <p style="font-size: 14px; font-weight: bold; color: #111827; margin: 0;">MADECC Group</p>
        <p style="font-size: 11px; color: #9ca3af; margin: 4px 0 0 0;">Residential & Commercial General Contractors</p>
        <p style="font-size: 11px; color: #9ca3af; margin: 2px 0 0 0;">Contact: madeccco5@gmail.com | madecccons@gmail.com</p>
      </div>
    </div>
  `;

  await sendEmail({ to: data.email, subject, text, html });
}
