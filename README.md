<p align="center">
  <h1 align="center">🎬 VidPlay</h1>
  <p align="center">A modern full-stack video sharing platform built with React and Node.js</p>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18.2-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express-5.0-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/MongoDB-9.0-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Vite-5.0-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/TailwindCSS-3.4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind" />
</p>

---

## 📑 Table of Contents

1. [Getting Started with VidPlay](#1-getting-started-with-vidplay)
2. [Configuration & Environment Variables](#2-configuration--environment-variables)
3. [Core User Workflows](#3-core-user-workflows)
4. [Backend API Server](#4-backend-api-server-nodejs--express--mongodb)
5. [Frontend Application](#5-frontend-application-react--vite)
6. [Infrastructure Utilities & Performance](#6-infrastructure-utilities--performance)
7. [Troubleshooting & Common Issues](#7-troubleshooting--common-issues)

---

## 1. Getting Started with VidPlay

### Project Overview

VidPlay is a **full-stack video sharing platform** that enables users to:
- 📤 Upload and publish video content with thumbnails
- ▶️ Stream and watch videos with a responsive player
- 💬 Engage through likes, comments, and subscriptions
- 📋 Organize content with custom playlists
- 📊 Access creator dashboard with analytics

### System Architecture

```mermaid
flowchart TB
    subgraph Frontend["Frontend (React + Vite)"]
        UI[React Components]
        Redux[Redux Store]
        Services[API Services]
    end
    
    subgraph Backend["Backend (Node.js + Express)"]
        Routes[Express Routes]
        Controllers[Controllers]
        Middleware[Auth Middleware]
        Models[Mongoose Models]
    end
    
    subgraph External["External Services"]
        Cloudinary[(Cloudinary)]
        MongoDB[(MongoDB)]
        Resend[Resend Email]
        Google[Google OAuth]
    end
    
    UI --> Redux --> Services
    Services <-->|REST API| Routes
    Routes --> Middleware --> Controllers
    Controllers --> Models --> MongoDB
    Controllers --> Cloudinary
    Controllers --> Resend
    Controllers <--> Google
```

### Prerequisites

| Requirement | Version | Purpose |
|-------------|---------|---------|
| **Node.js** | v18+ | Runtime environment |
| **npm** | v9+ | Package management |
| **MongoDB** | v6+ | Database (local or Atlas) |
| **Cloudinary Account** | - | Media storage & CDN |
| **Google Cloud Console** | - | OAuth authentication |

### Installation Steps

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/vidplay.git
cd vidplay

# 2. Install backend dependencies
cd backend
npm install

# 3. Install frontend dependencies
cd ../frontend
npm install
```

### Running the Application

**Start Backend Server:**
```bash
cd backend
npm run dev        # Development with hot-reload (nodemon)
npm start          # Production mode
```

**Start Frontend Server:**
```bash
cd frontend
npm run dev        # Development server at http://localhost:5173
npm run build      # Production build
npm run preview    # Preview production build
```

---

## 2. Configuration & Environment Variables

### Backend Environment Configuration

Create `backend/.env`:

```env
# Server Configuration
PORT=8000
NODE_ENV=development

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/vidplay

# CORS
CORS_ORIGIN=http://localhost:5173

# JWT Authentication
ACCESS_TOKEN_SECRET=your-super-secret-access-token-key-min-32-chars
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your-super-secret-refresh-token-key-min-32-chars
REFRESH_TOKEN_EXPIRY=10d

# Cloudinary Media Storage
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=your_api_secret

# Email Service (Resend/SMTP)
EMAIL_HOST=smtp.resend.com
EMAIL_PORT=587
EMAIL_USER=resend
EMAIL_PASSWORD=re_xxxxxxxxxxxx

# Google OAuth
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxx
GOOGLE_REDIRECT_URI=http://localhost:5173/oauth/callback
```

### Frontend Environment Configuration

Create `frontend/.env`:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:8000/api/v1

# Google OAuth
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

> ⚠️ **Security Note**: Never commit `.env` files to version control. Both directories include `.gitignore` entries for these files.

---

## 3. Core User Workflows

### 3.1 Standard Registration and Login

The platform uses **JWT-based authentication** with httpOnly cookies for security.

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant MongoDB

    User->>Frontend: Enter email & password
    Frontend->>Backend: POST /auth/login {email, password}
    Backend->>MongoDB: Find user by email
    MongoDB-->>Backend: User document
    Backend->>Backend: Verify password (bcrypt)
    Backend->>Backend: Generate access + refresh tokens
    Backend-->>Frontend: Set httpOnly cookies + user data
    Frontend->>Frontend: Store user in Redux
    Frontend-->>User: Redirect to dashboard
```

**Authentication Flow Details:**
- **Access Token**: Short-lived (1 day), used for API requests
- **Refresh Token**: Long-lived (10 days), used to obtain new access tokens
- **Token Storage**: httpOnly cookies prevent XSS attacks
- **Auto-refresh**: Frontend interceptor refreshes expired tokens automatically

---

### 3.2 Two-Step Email Registration Flow

New users register through a **two-step email verification process**:

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant Resend
    participant MongoDB

    User->>Frontend: Enter email only
    Frontend->>Backend: POST /users/initiate-register {email}
    Backend->>MongoDB: Check email not registered
    Backend->>Backend: Generate verification token
    Backend->>MongoDB: Store in PendingEmail collection
    Backend->>Resend: Send verification email
    Resend-->>User: Email with verification link
    Backend-->>Frontend: 200 "Check your inbox"
    
    Note over User: User clicks email link
    
    User->>Frontend: GET /register/:token
    Frontend-->>User: Show full registration form
    User->>Frontend: Fill username, password, avatar
    Frontend->>Backend: POST /users/register {token, formData}
    Backend->>MongoDB: Validate token in PendingEmail
    Backend->>Backend: Upload avatar to Cloudinary
    Backend->>MongoDB: Create user, delete PendingEmail
    Backend-->>Frontend: 201 "Account created"
    Frontend-->>User: Redirect to login
```

---

### 3.3 Password Reset via Token

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant Resend
    participant MongoDB

    User->>Frontend: Click "Forgot Password"
    User->>Frontend: Enter email address
    Frontend->>Backend: POST /users/forgot-password {email}
    Backend->>MongoDB: Find user, generate reset token
    Backend->>MongoDB: Store token with 1hr expiry
    Backend->>Resend: Send reset email
    Backend-->>Frontend: 200 "Check your email"

    Note over User: User clicks reset link

    User->>Frontend: GET /reset-password/:token
    Frontend->>Backend: GET /users/verify-reset-token/:token
    Backend->>MongoDB: Validate token exists & not expired
    Backend-->>Frontend: 200 "Token valid"
    User->>Frontend: Enter new password
    Frontend->>Backend: POST /users/reset-password {token, password}
    Backend->>MongoDB: Update password, delete token
    Backend-->>Frontend: 200 "Password updated"
    Frontend-->>User: Redirect to login
```

---

### 3.4 Google OAuth Flow (PKCE)

VidPlay implements **OAuth 2.0 with PKCE** for enhanced security:

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Google
    participant Backend
    participant MongoDB

    User->>Frontend: Click "Sign in with Google"
    Frontend->>Frontend: Generate code_verifier (random 128 chars)
    Frontend->>Frontend: Create code_challenge = SHA256(verifier)
    Frontend->>Frontend: Store code_verifier in sessionStorage
    Frontend->>Google: Redirect with code_challenge
    
    Note over User,Google: User authorizes VidPlay

    Google-->>Frontend: Redirect to /oauth/callback?code=xxx
    Frontend->>Frontend: Retrieve code_verifier
    Frontend->>Backend: POST /auth/google {code, code_verifier}
    Backend->>Google: Exchange code + verifier for tokens
    Google-->>Backend: {access_token, id_token}
    Backend->>Backend: Decode id_token for profile
    Backend->>MongoDB: Find or create user
    Backend->>Backend: Generate JWT tokens
    Backend-->>Frontend: Set httpOnly cookies + user
    Frontend-->>User: Redirect to dashboard
```

**Why PKCE?**
- Prevents authorization code interception attacks
- No client secret exposed to frontend
- Industry-standard for SPAs and mobile apps

---

### 3.5 Video Upload & Publishing Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant Cloudinary
    participant MongoDB

    User->>Frontend: Navigate to /upload
    User->>Frontend: Select video file (MP4, WebM, etc.)
    User->>Frontend: Select thumbnail image
    User->>Frontend: Enter title, description, publish status
    Frontend->>Backend: POST /videos (multipart/form-data)
    
    Backend->>Backend: Validate file types & sizes
    Backend->>Cloudinary: Upload video (resource_type: video)
    Cloudinary-->>Backend: {url, duration, public_id}
    Backend->>Cloudinary: Upload thumbnail (resource_type: image)
    Cloudinary-->>Backend: {url, public_id}
    
    Backend->>MongoDB: Create video document
    MongoDB-->>Backend: Saved video
    Backend-->>Frontend: 201 {video data}
    Frontend-->>User: Success toast, redirect to video
```

**Supported Formats:**
- Video: MP4, WebM, MOV, AVI
- Thumbnail: JPG, PNG, WebP
- Max file size: 100MB (video), 5MB (thumbnail)

---

### 3.6 Video Playback, Likes, Comments & Subscriptions

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant MongoDB

    User->>Frontend: Click video thumbnail
    Frontend->>Backend: GET /videos/:videoId
    Backend->>MongoDB: Fetch video + owner details
    Backend->>MongoDB: Increment view count
    Backend->>MongoDB: Add to user's watch history
    Backend-->>Frontend: {video, owner, isLiked, isSubscribed}
    Frontend-->>User: Render video player

    rect rgb(40, 40, 40)
        Note over User,MongoDB: Social Interactions
        
        User->>Frontend: Click ❤️ Like
        Frontend->>Backend: POST /likes/toggle/v/:videoId
        Backend->>MongoDB: Toggle like document
        Backend-->>Frontend: {isLiked: true, totalLikes: 142}

        User->>Frontend: Type comment & submit
        Frontend->>Backend: POST /comments/:videoId {content}
        Backend->>MongoDB: Create comment
        Backend-->>Frontend: {comment with author}

        User->>Frontend: Click Subscribe
        Frontend->>Backend: POST /subscriptions/c/:channelId
        Backend->>MongoDB: Create subscription
        Backend-->>Frontend: {subscribed: true, count: 1.2K}
    end
```

---

## 4. Backend API Server (Node.js + Express + MongoDB)

### Project Structure

```
backend/
├── src/
│   ├── index.js              # Entry point
│   ├── app.js                # Express app setup
│   ├── constants.js          # App constants
│   ├── auth/                 # OAuth configuration
│   │   └── passport.js       # Google OAuth setup
│   ├── controllers/          # Route handlers
│   │   ├── auth.controller.js
│   │   ├── user.controller.js
│   │   ├── video.controller.js
│   │   ├── like.controller.js
│   │   ├── comment.controller.js
│   │   ├── playlist.controller.js
│   │   ├── subscription.controller.js
│   │   └── dashboard.controller.js
│   ├── models/               # Mongoose schemas
│   │   ├── user.model.js
│   │   ├── video.model.js
│   │   ├── like.model.js
│   │   ├── comment.model.js
│   │   ├── playlist.model.js
│   │   ├── subscription.model.js
│   │   ├── token.model.js
│   │   └── pendingEmail.model.js
│   ├── routes/               # API routes
│   ├── middlewares/          # Custom middleware
│   │   ├── auth.middleware.js
│   │   ├── multer.middleware.js
│   │   └── error.middleware.js
│   ├── utils/                # Utility functions
│   │   ├── ApiError.js
│   │   ├── ApiResponse.js
│   │   ├── asyncHandler.js
│   │   ├── cloudinary.util.js
│   │   └── email.util.js
│   └── db/
│       └── index.js          # MongoDB connection
└── package.json
```

### Authentication & User Management

**Key Endpoints:**

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/users/initiate-register` | Start email verification |
| POST | `/api/v1/users/register` | Complete registration |
| POST | `/api/v1/auth/login` | Login with credentials |
| POST | `/api/v1/auth/logout` | Logout (clear cookies) |
| POST | `/api/v1/auth/refresh-token` | Refresh access token |
| POST | `/api/v1/auth/google` | Google OAuth callback |
| POST | `/api/v1/users/forgot-password` | Request password reset |
| POST | `/api/v1/users/reset-password` | Reset with token |

### Video Management

**CRUD Operations:**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/videos` | List videos (paginated) |
| GET | `/api/v1/videos/:videoId` | Get video details |
| POST | `/api/v1/videos` | Upload new video |
| PATCH | `/api/v1/videos/:videoId` | Update video metadata |
| DELETE | `/api/v1/videos/:videoId` | Delete video |
| GET | `/api/v1/videos/search` | Search videos by query |

### Playlists

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/playlists/user` | Get user's playlists |
| POST | `/api/v1/playlists` | Create playlist |
| PATCH | `/api/v1/playlists/:id` | Update playlist |
| DELETE | `/api/v1/playlists/:id` | Delete playlist |
| PATCH | `/api/v1/playlists/add/:videoId/:playlistId` | Add video |
| PATCH | `/api/v1/playlists/remove/:videoId/:playlistId` | Remove video |

### Express App Initialization

```javascript
// app.js - Middleware Setup
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import compression from "compression";

const app = express();

// CORS - Allow frontend origin with credentials
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

// Parse JSON bodies (limit: 16kb)
app.use(express.json({ limit: "16kb" }));

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

// Static files
app.use(express.static("public"));

// Cookie parser for JWT in cookies
app.use(cookieParser());

// Gzip compression for responses
app.use(compression());

// Routes
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/videos", videoRoutes);
// ... more routes
```

### Standardized API Responses

**Success Response (`ApiResponse`):**
```javascript
{
    "statusCode": 200,
    "data": { /* payload */ },
    "message": "Operation successful",
    "success": true
}
```

**Error Response (`ApiError`):**
```javascript
{
    "statusCode": 400,
    "message": "Validation failed",
    "errors": ["Email is required", "Password too short"],
    "success": false
}
```

---

## 5. Frontend Application (React + Vite)

### Frontend Structure

```
frontend/
├── src/
│   ├── main.jsx              # React entry point
│   ├── App.jsx               # Root component + routing
│   ├── index.css             # Global styles (Tailwind)
│   ├── api/                  # Axios instance
│   │   └── axios.js          # Configured client
│   ├── components/           # Reusable UI components
│   │   ├── Button.jsx
│   │   ├── Input.jsx
│   │   ├── VideoCard.jsx
│   │   ├── CommentSection.jsx
│   │   ├── Sidebar.jsx
│   │   └── ...
│   ├── layouts/              # Page layouts
│   │   ├── MainLayout.jsx
│   │   └── AuthLayout.jsx
│   ├── pages/                # Route pages
│   │   ├── HomePage.jsx
│   │   ├── LoginPage.jsx
│   │   ├── VideoPage.jsx
│   │   ├── DashboardPage.jsx
│   │   └── ...
│   ├── services/             # API service functions
│   │   ├── auth.service.js
│   │   ├── video.service.js
│   │   ├── playlist.service.js
│   │   └── ...
│   ├── store/                # Redux state
│   │   ├── store.js
│   │   └── slices/
│   │       ├── authSlice.js
│   │       └── uiSlice.js
│   └── utils/                # Helper functions
│       ├── formatDuration.js
│       └── pkce.js
├── public/
├── index.html
├── vite.config.js
└── tailwind.config.js
```

### Routing and Pages

| Route | Page | Access |
|-------|------|--------|
| `/` | HomePage | Public |
| `/login` | LoginPage | Guest only |
| `/register/:token?` | RegisterPage | Guest only |
| `/watch/:videoId` | VideoPage | Public |
| `/channel/:username` | ChannelPage | Public |
| `/dashboard` | DashboardPage | Auth required |
| `/upload` | UploadPage | Auth required |
| `/playlists` | PlaylistPage | Auth required |
| `/settings` | SettingsPage | Auth required |
| `/history` | HistoryPage | Auth required |
| `/subscriptions` | SubscriptionsPage | Auth required |

### Google Login UI Component

```jsx
// components/GoogleLoginButton.jsx
import { FcGoogle } from "react-icons/fc";
import { generatePKCE, buildGoogleAuthURL } from "../utils/pkce";

const GoogleLoginButton = () => {
    const handleGoogleLogin = async () => {
        // Generate PKCE parameters
        const { codeVerifier, codeChallenge } = await generatePKCE();
        
        // Store verifier for callback
        sessionStorage.setItem("code_verifier", codeVerifier);
        
        // Redirect to Google
        const authURL = buildGoogleAuthURL(codeChallenge);
        window.location.href = authURL;
    };

    return (
        <button
            onClick={handleGoogleLogin}
            className="flex items-center gap-3 w-full px-4 py-3 
                       border border-gray-600 rounded-lg
                       hover:bg-gray-800 transition-colors"
        >
            <FcGoogle size={24} />
            <span>Continue with Google</span>
        </button>
    );
};
```

### State Management with Redux Toolkit

```javascript
// store/slices/authSlice.js
import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
    name: "auth",
    initialState: {
        user: null,
        isAuthenticated: false,
        isLoading: true,
    },
    reducers: {
        setUser: (state, action) => {
            state.user = action.payload;
            state.isAuthenticated = !!action.payload;
            state.isLoading = false;
        },
        logout: (state) => {
            state.user = null;
            state.isAuthenticated = false;
        },
    },
});

export const { setUser, logout } = authSlice.actions;
export default authSlice.reducer;
```

### Frontend Service Layer (API Clients)

```javascript
// services/video.service.js
import api from "../api/axios";

export const videoService = {
    getAll: (page = 1, limit = 12) => 
        api.get(`/videos?page=${page}&limit=${limit}`),
    
    getById: (videoId) => 
        api.get(`/videos/${videoId}`),
    
    upload: (formData) => 
        api.post("/videos", formData, {
            headers: { "Content-Type": "multipart/form-data" }
        }),
    
    update: (videoId, data) => 
        api.patch(`/videos/${videoId}`, data),
    
    delete: (videoId) => 
        api.delete(`/videos/${videoId}`),
    
    search: (query) => 
        api.get(`/videos/search?q=${encodeURIComponent(query)}`),
};
```

### Working with Playlists

```mermaid
sequenceDiagram
    participant User
    participant PlaylistModal
    participant PlaylistService
    participant Backend

    User->>PlaylistModal: Click "Save" on video
    PlaylistModal->>PlaylistService: getUserPlaylists()
    PlaylistService->>Backend: GET /playlists/user
    Backend-->>PlaylistModal: [playlist1, playlist2, ...]
    PlaylistModal-->>User: Show playlist selection

    alt Create New
        User->>PlaylistModal: Enter name, click "Create"
        PlaylistModal->>Backend: POST /playlists {name, videoId}
        Backend-->>PlaylistModal: {newPlaylist}
    else Add to Existing
        User->>PlaylistModal: Select existing playlist
        PlaylistModal->>Backend: PATCH /playlists/add/:videoId/:playlistId
        Backend-->>PlaylistModal: {updatedPlaylist}
    end

    PlaylistModal-->>User: Success feedback
```

---

## 6. Infrastructure Utilities & Performance

### Cloudinary Media Utilities

VidPlay uses Cloudinary for all media storage and transformations:

```javascript
// utils/cloudinary.util.js
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Upload file to Cloudinary
export const uploadOnCloudinary = async (localFilePath, resourceType = "auto") => {
    if (!localFilePath) return null;
    
    const response = await cloudinary.uploader.upload(localFilePath, {
        resource_type: resourceType,
        folder: "vidplay"
    });
    
    // Clean up local file
    fs.unlinkSync(localFilePath);
    
    return response;
};

// Delete from Cloudinary
export const deleteFromCloudinary = async (publicId, resourceType = "image") => {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
};
```

### Email Utility

Transactional emails for verification and password reset:

```javascript
// utils/email.util.js
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

export const sendVerificationEmail = async (email, token) => {
    const verificationUrl = `${process.env.CORS_ORIGIN}/register/${token}`;
    
    await transporter.sendMail({
        from: '"VidPlay" <noreply@vidplay.com>',
        to: email,
        subject: "Verify your VidPlay account",
        html: `
            <h1>Welcome to VidPlay!</h1>
            <p>Click below to complete your registration:</p>
            <a href="${verificationUrl}">Verify Email</a>
            <p>This link expires in 24 hours.</p>
        `
    });
};

export const sendPasswordResetEmail = async (email, token) => {
    const resetUrl = `${process.env.CORS_ORIGIN}/reset-password/${token}`;
    
    await transporter.sendMail({
        from: '"VidPlay" <noreply@vidplay.com>',
        to: email,
        subject: "Reset your VidPlay password",
        html: `
            <h1>Password Reset Request</h1>
            <p>Click below to reset your password:</p>
            <a href="${resetUrl}">Reset Password</a>
            <p>This link expires in 1 hour.</p>
        `
    });
};
```

### Performance Optimizations

| Optimization | Implementation |
|--------------|----------------|
| **Response Compression** | Gzip via `compression` middleware |
| **Database Indexing** | Indexes on `email`, `username`, `videoId` |
| **Pagination** | `mongoose-aggregate-paginate-v2` for video lists |
| **Lazy Loading** | React lazy imports for route components |
| **Image Optimization** | Cloudinary auto-format and quality |

---

## 7. Troubleshooting & Common Issues

### Authentication Problems

| Issue | Cause | Solution |
|-------|-------|----------|
| "Token expired" error | Access token expired | Frontend auto-refreshes; if persists, re-login |
| Login works but redirects to login | Cookies not set | Check `credentials: true` in CORS and axios |
| Google OAuth fails | Invalid redirect URI | Ensure URI matches Google Console exactly |
| "Unauthorized" on all requests | Missing auth middleware | Verify route has `verifyJWT` middleware |

**Debug Tips:**
```javascript
// Check if cookies are being set (browser console)
document.cookie  // Should show access/refresh tokens

// Check axios is sending credentials
// In api/axios.js:
axios.create({ withCredentials: true })
```

### Email & Password Reset Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| Email not received | SMTP config error | Verify EMAIL_* env variables |
| "Invalid token" on reset | Token expired/used | Request new reset email |
| Token link doesn't work | Wrong frontend URL | Check `CORS_ORIGIN` in backend .env |

**Test Email Setup:**
```bash
# Test SMTP connection
node -e "
const nodemailer = require('nodemailer');
const t = nodemailer.createTransport({
  host: 'smtp.resend.com',
  port: 587,
  auth: { user: 'resend', pass: 'YOUR_KEY' }
});
t.verify().then(() => console.log('SMTP OK')).catch(console.error);
"
```

### API & Network Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| CORS errors | Origin mismatch | Add frontend URL to `CORS_ORIGIN` |
| 500 Internal Server Error | Unhandled exception | Check backend console for stack trace |
| Database connection timeout | MongoDB unreachable | Verify `MONGODB_URI`, check network/Atlas IP whitelist |
| File upload fails | Multer/Cloudinary error | Check file size limits, Cloudinary credentials |

**Common npm Commands:**

```bash
# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Check for outdated packages
npm outdated

# Run with debug logging
DEBUG=* npm run dev
```

---

## 👨‍💻 Author

**Nikunj Makwana**

---

## 📄 License

ISC License - See [LICENSE](LICENSE) for details.
