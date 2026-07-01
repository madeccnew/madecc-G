# MADECC Group Corporate Web Application

A premium, production-ready full-stack website engineered for **MADECC Group**, specializing in high-end Custom Residential Construction and high-performance Commercial building developments.

The project is structured as a robust, fully self-contained **Full-Stack (React/Vite + Express)** application designed for immediate preview, resilient fallback, and seamless migration to persistent production database engines (like PostgreSQL via Prisma or raw SQL).

---

## 🏗️ Core Architectural Features

1. **Full-Stack REST API Integration**
   - Maintained entirely server-side to hide secure keys and SMTP credentials.
   - Built-in transaction-safe database engine storing and updating portfolio projects, blog systems, moderation tables, scheduling, newsletter lists, and incoming customer leads.

2. **Secure Administration Dashboard**
   - Protected behind an authorization barrier verifying password hashes (`bcryptjs`) and issuing secure state sessions (`jsonwebtoken`).
   - Allows administrative management of:
     - Adding, editing, and deleting **Portfolio Projects**.
     - Drafting and updating **SEO Blog Articles** (complete with tags and metadata).
     - Approving or declining user-submitted **Customer Reviews** before public publishing.
     - Monitoring and completing **Consultation Appointments**.
     - Reviewing prospective client **Inquiries** and downloading **Newsletter Lists**.

3. **Technical SEO Integration**
   - Dynamically injected dynamic SEO meta heads (title, descriptions, keywords).
   - Injected compliant **LocalBusiness** and **ConstructionCompany** Schema.org microdata (`JSON-LD`) for direct rich-snippet display in Google Search console.
   - Strictly optimized structure adhering to AdSense-friendly guidelines, incorporating standalone Privacy Policy, Cookie Policy, and Terms agreements.

4. **SMTP Nodemailer Framework**
   - Robust mail dispatching integrated with:
     - Direct administrator alerts upon new contact messages or pending review submissions.
     - Scheduling validation emails for consultations.
     - Confirmation letters for newsletter subscribers.
   - **Graceful Degrade Simulation**: If SMTP credentials are left blank in development, the system automatically falls back to a highly descriptive console-logger, allowing full visual testing without failing or crashing.

---

## 📂 Complete Folder Structure

```
├── .env.example             # Template for secure environment variables
├── .gitignore               # Ignored build outputs and cache directories
├── index.html               # Vite client entry point
├── metadata.json            # AI Studio configuration settings
├── package.json             # NPM dependencies & full-stack bundle scripts
├── server.ts                # Primary Express API backend & asset delivery router
├── tsconfig.json            # Strict TypeScript rules
├── vite.config.ts           # Fast Vite client compiler configuration
├── server/
│   ├── db.ts                # Type-safe, transaction-secure database repository
│   └── mail.ts              # Nodemailer transport & email templates manager
└── src/
    ├── main.tsx             # React client bootstrap loader
    ├── index.css            # Tailwind CSS v4 & custom animations
    ├── App.tsx              # Core single-page router and sub-view layouts
    ├── types.ts             # Shared data schemas & parameters
    ├── assets/
    │   └── images/          # Custom-generated premium construction images
    └── components/
        ├── Navbar.tsx       # Sticky responsive glassmorphism header
        ├── Footer.tsx       # Standard sitemap, newsletter form, and schema injection
        ├── AdminPanel.tsx   # Secured management console
        ├── ReviewWidget.tsx # Live feedback & review moderation submissions
        ├── AppointmentForm.tsx # Detailed consultation booking calendar
        └── ContactForm.tsx  # Validated project lead questionnaire
```

---

## ⚙️ Environment Configuration (`.env`)

To activate real email dispatches and modify security keys, create a `.env` file in the root folder:

```env
# SECURITY SYSTEM KEYS
JWT_SECRET="MADECC_GROUP_JWT_SECRET_2026_PRODUCTION_READY"

# SMTP Nodemailer (e.g. Hostinger, cPanel, Gmail, SendGrid, Mailgun)
SMTP_HOST="smtp.example.com"
SMTP_PORT=465                  # Use 465 for secure SSL, 587 for TLS
SMTP_USER="info@madeccgroup.com"
SMTP_PASSWORD="your-smtp-secure-password"
SMTP_EMAIL="info@madeccgroup.com"
```

---

## 🛠️ Step-by-Step Installation & Local Execution

Ensure you have **Node.js (v18+)** installed.

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
This boots the custom Express server in watch mode using `tsx` (TypeScript Executor). It serves the APIs on port `3000` while hot-mounting Vite's client asset compiler.
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Build for Production
This compiles the static React client code inside `dist/` and compiles the backend `server.ts` into a unified CJS binary (`dist/server.cjs`) using `esbuild`.
```bash
npm run build
```

### 4. Boot Production Output
Starts the compiled Node server. No TypeScript engine or dev-dependencies are required to execute this step.
```bash
npm run start
```

---

## 🗄️ Relational PostgreSQL Database Migration (Prisma ORM)

While the default application runs immediately using a self-contained transaction-safe file-repository (making it incredibly portable), migrating this application to a real PostgreSQL database with Prisma ORM takes less than 2 minutes.

### 1. Initialize Prisma
Run the following inside your project folder:
```bash
npm install prisma @prisma/client
npx prisma init
```

### 2. Configure Prisma Schema
Open `prisma/schema.prisma` and replace its contents with this highly optimized, relational PostgreSQL schema matching our exact types:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-id"
}

model Project {
  id             String   @id @default(uuid())
  title          String
  category       String   // "residential" | "commercial"
  location       String
  description    String   @db.Text
  image          String
  completionDate String
  client         String?
  area           String?
  createdAt      DateTime @default(now())
}

model BlogPost {
  id              String   @id @default(uuid())
  title           String
  slug            String   @unique
  content         String   @db.Text
  metaDescription String   @db.VarChar(160)
  keywords        String
  featuredImage   String
  schemaMarkup    String?  @db.Text
  author          String
  date            String
  category        String
  createdAt       DateTime @default(now())
}

model Review {
  id        String   @id @default(uuid())
  name      String
  email     String
  rating    Int      // 1-5
  review    String   @db.Text
  approved  Boolean  @default(false)
  date      String
  createdAt DateTime @default(now())
}

model Appointment {
  id            String   @id @default(uuid())
  name          String
  email         String
  phone         String
  preferredDate String
  preferredTime String
  projectType   String
  message       String   @db.Text
  date          String
  createdAt     DateTime @default(now())
}

model ContactMessage {
  id          String   @id @default(uuid())
  name        String
  email       String
  phone       String
  company     String?
  projectType String
  budgetRange String
  message     String   @db.Text
  date        String
  createdAt   DateTime @default(now())
}

model NewsletterSubscriber {
  id        String   @id @default(uuid())
  email     String   @unique
  date      String
  status    String   @default("active") // "active" | "unsubscribed"
  createdAt DateTime @default(now())
}
```

### 3. Run Prisma Migration
Add your PostgreSQL Connection URL inside your `.env` as `DATABASE_URL` and push:
```bash
npx prisma db push
```

---

## 🚀 Deployment Guidelines

### 1. VPS Hosting (Ubuntu, Debian, CentOS)
1. Clone your project code onto your virtual server.
2. Install Node.js & NPM:
   ```bash
   sudo apt install nodejs npm
   ```
3. Set up a process supervisor like **PM2** to run the app persistently:
   ```bash
   npm install -g pm2
   pm2 start npm --name "madecc-website" -- run start
   pm2 save
   pm2 startup
   ```
4. Set up Nginx as a reverse proxy routing incoming traffic on Port 80/443 to Port 3000.

### 2. Netlify & GitHub Pages Deployment (Static SPA Client-Only Mode)
The application is pre-configured with a **Static Client-Only Safe Mode** fallback. If deployed to a static hosting provider like **Netlify** or **GitHub Pages**:
- The portfolio projects, blog posts, and reviews are fully loaded statically.
- Interactivity is preserved: forms (Contact, Booking, Reviews, Newsletter) and live AI chat transcripts automatically detect the absence of the backend server and save submission inputs directly to local browser storage (`localStorage`).
- Verified reviews display instantly in your viewport upon submission!

#### 🚀 Step-by-Step GitHub & Netlify Deployment:
1. **Prepare local workspace**:
   - Download the project ZIP from AI Studio.
   - Extract the files and open the project directory in **VS Code**.
   - Initialize git, commit your changes, and push them to a **GitHub repository**:
     ```bash
     git init
     git add .
     git commit -m "Initial commit - MADECC Group Web Application"
     # Create a repository on GitHub, then link and push:
     git remote add origin https://github.com/your-username/your-repo-name.git
     git branch -M main
     git push -u origin main
     ```

2. **Deploying on Netlify**:
   - Log into your **Netlify Dashboard** and click **Add new site** > **Import an existing project**.
   - Connect your **GitHub** account and select your repository.
   - Configure the Build Settings:
     - **Build Command**: `npm run build`
     - **Publish Directory**: `dist` (This is where Vite compiles the static client application assets).
   - Click **Deploy site**.
   - *SPA Routing Support*: Netlify requires a redirect rule for SPA routing. A `_redirects` file is included in the project root so deep links (e.g., navigating directly to `#about` or `/booking`) resolve seamlessly!

3. **To enable backend full-stack features (SMTP emails & persistence)**:
   - Host the Node.js server (`server.ts` compiled to `dist/server.cjs`) on a platform like **Render**, **Railway**, **Fly.io**, or **Google Cloud Run**.
   - Set up your `.env` variables on your server platform (SMTP settings, database config).
   - Point your frontend API requests to your hosted server by setting up a Netlify rewrite proxy or adding an API base URL in your frontend fetch calls.

### 3. cPanel Hosting (Node.js Selector)
1. Compress and upload your project files (excluding `node_modules` or `dist`).
2. Inside cPanel, open **Setup Node.js App**.
3. Create an Application:
   - **Node.js Version**: v18 or later.
   - **Application Mode**: Production.
   - **Application Startup File**: `dist/server.cjs` (Ensure you run `npm run build` in Terminal or via SSH first).
4. Run npm install from the Node app panel and click **Restart**.
#   m a d e c c - G  
 