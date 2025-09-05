# MakeVideo AI — Text-to-Video Generator
Deployed Link-https://make-video-ai.vercel.app/
MakeVideo AI is a full-stack, AI-powered video generation platform that transforms simple text prompts into cinematic video clips. Built with a modern tech stack including Next.js, Tailwind CSS, and Drizzle ORM with a PostgreSQL database, this application demonstrates a complete end-to-end workflow from user input to final output.
The backend leverages a multi-stage pipeline, first enhancing user prompts with the Google Gemini API for richer detail, then generating video content via the Replicate API and ModelLabs API. The result is a seamless and responsive user experience with a beautiful UI for generating, exploring, and saving AI-created videos.

---

## 📷 Screenshots

> Landing Page<img width="1900" height="905" alt="Screenshot 2025-08-24 084458" src="https://github.com/user-attachments/assets/f371f9b6-cc9f-4445-8063-d80ba2e7cbf7" />

> Dashboard<img width="1915" height="905" alt="Screenshot 2025-08-24 084517" src="https://github.com/user-attachments/assets/d39a6011-f6fe-42f8-aeef-5235f99b0f72" />

> Explore Videos<img width="1897" height="906" alt="Screenshot 2025-08-24 084556" src="https://github.com/user-attachments/assets/1ac2a753-95e6-4826-b2bb-9cb7944682f8" />

---

## 🚀 Features

- **Intelligent Video Generation Pipeline:**  
 Takes a user's simple idea and first enhances it for more cinematic results using the Google Gemini API. The enhanced prompt is then sent to a primary AI video model, with built-in, cascading fallbacks to a secondary model and a placeholder video to ensure a 100% success rate during the demo.
- **Persistent Storage & Personal Collections:**  
  All successfully generated videos are saved to a PostgreSQL database for a public "Explore" feed. Users can also curate a personal "My Collection" of their favorite videos, which is saved locally in the browser's localStorage for instant, personalized access.
- **Modern & Responsive UI/UX:**  
 Built with shadcn/ui and Tailwind CSS, the interface features a clean, gradient-rich, and fully responsive design. The user experience is enhanced with smooth animations, clear loading states, and non-intrusive toast notifications for all major actions.
- **Custom Branding:**  
  Includes a unique, custom-designed logo and favicon for a polished, product-like feel.

---

## 🗂️ Project Structure

```
MakeVideo-AI/
│
├── .gitignore                  # Specifies files for Git to ignore (e.g., node_modules, .env)
├── README.md                   # Your project's documentation file
│
├── app/                        # The main application folder (Next.js App Router)
│   ├── (main)/                 # A route group for the main, protected part of the app
│   │   ├── _components/        # Reusable React components for the main layout
│   │   │   ├── AppHeader.jsx   # The header component with navigation
│   │   │   ├── AppSidebar.jsx  # The sidebar component
│   │   │   ├── ReqForm.jsx     # The main form for submitting the video prompt
│   │   │   ├── VideoCard.jsx   # Component to display a single generated video
│   │   │   └── WelcomeBanner.jsx # The banner on the dashboard
│   │   ├── allVideos/
│   │   │   └── page.jsx        # The page for exploring all videos from the database
│   │   ├── dashboard/
│   │   │   └── page.jsx        # The main dashboard page where users generate videos
│   │   ├── layout.jsx          # The layout for the main section (includes header/sidebar)
│   │   └── myVideos/
│   │   │   └── page.jsx        # The page for viewing videos saved to localStorage
│   │
│   ├── api/                    # Backend API routes
│   │   ├── generate-video/
│   │   │   └── route.jsx       # API endpoint to handle video generation
│   │   └── get-videos/
│   │   │   └── route.jsx       # API endpoint to fetch all videos from the database
│   │
│   ├── favicon.ico             # The small icon for the browser tab
│   ├── globals.css             # Global styles applied to the entire application
│   ├── layout.js               # The root layout for the entire application
│   └── page.js                 # The public landing/homepage
│
├── components/                 # UI components folder
│   └── ui/                     # Low-level, reusable UI primitives from shadcn/ui
│       ├── button.jsx
│       └── ...                 # (e.g., Skeleton, Input, Form, etc.)
│
├── config/                     # Configuration files
│   ├── db.jsx                  # Drizzle ORM database connection setup
│   └── schema.js               # Drizzle ORM schema (defines database tables)
│
├── drizzle.config.js           # Configuration file for Drizzle ORM
├── hooks/
│   └── use-mobile.js           # A custom React hook to check for mobile screen sizes
├── lib/
│   └── utils.js                # General utility functions (e.g., for Tailwind CSS class merging)
│
├── next.config.mjs             # Main configuration file for Next.js
├── package.json                # Lists project dependencies and scripts
├── postcss.config.mjs          # Configuration for PostCSS (used with Tailwind)
│
└── public/                     # Folder for static assets (images, videos, etc.)
    ├── ...mp4                  # Placeholder or demo video files
    └── Make_Video_logo.png     # The application's logo
```

---

## ⚡ Quick Start

### 1. **Clone the Repository**
```sh
git clone https://github.com/Shubhraj-Shubh/MakeVideo-AI.git
cd makevideo-ai
```

### 2. **Install Dependencies**
```sh
npm install
```

### 3. **Configure Environment Variables**

Create a `.env` file in the root directory:

```
DATABASE_URL=your_postgres_connection_url
REPLICATE_API_TOKEN=your_replicate_api_key
GEMINI_API_KEY=your_google_gemini_api_key
MODELSLAB_API=your_modelslab_api_key
```

### 4. **Run Database Migrations**
Drizzle ORM will use your schema to manage the database.

```sh
npx drizzle-kit push
```

### 5. **Start the Development Server**
```sh
npm run dev
```
Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛠️ Deployment

- **Vercel:**  
  This project is Next.js 15+ compatible and deploys easily to Vercel.
- **Environment Variables:**  
  Set all required API keys and database URLs in your Vercel dashboard.
- **Database:**  
  Use NeonDB, Supabase, or any PostgreSQL provider.

---

## 📚 API Documentation

### **POST `/api/generate-video`**
- **Body:** `{ formPrompt: string }`
- **Response:**  
  - Success: `{ message: "Video Created...", videoUrl: "..." }`
  - Error: `{ error: "..." }`
- **Logic:**  
  - Enhances prompt with Gemini.
  - Tries Replicate for video generation.
  - Tries ModelsLab for short video genration.
  - Returns default video if needed.
  - Saves videoUrl and prompt to DB.

### **GET `/api/get-videos`**
- **Response:**  
  - Array of all videos `{ id, prompt, videoUrl }`

---

## 🧩 Components

- **ReqForm:**  
  Textarea for prompt input, gradient styling, responsive, calls API.
- **WelcomeBanner:**  
  Rotating taglines, gradient background, animated.
- **VideoCard:**  
  Shows video, save/unsave to localStorage, responsive, toast feedback.
- **AppHeader/AppSidebar:**  
  Navigation, sidebar, branding.
- **Skeleton:**  
  Loading placeholder for videos.

---

## 💡 Customization

- **UI Colors:**  
  Easily change gradients and colors in Tailwind classes.
- **Video Model:**  
  Use Replicate/ModelsLab endpoints as needed.
- **Database:**  
  Extend schema for more metadata (user, likes, etc).

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v18 or later)
- [npm](https://www.npmjs.com/) 
- A [PostgreSQL](https://www.postgresql.org/) database (you can get one for free from NeonDB or Supabase)

---

## 👤 Credits

Made by Shubhraj  
Powered by Next.js, Replicate, Google Gemini, Drizzle ORM, Tailwind CSS.

---


## ❓ FAQ

- **Q:** Why fallback video?  
  **A:** If Replicate/ModelsLab credits expire, users still get a demo video.

- **Q:** How are videos stored?  
  **A:** In PostgreSQL via Drizzle ORM.

- **Q:** Can I use my own video model?  
  **A:** Yes, update the API route logic.

---





