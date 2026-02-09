<p align="center">
  <img src="https://img.shields.io/badge/VidPlay-Video%20Sharing%20Platform-FF0000?style=for-the-badge&labelColor=0d1117" alt="VidPlay" />
</p>

<h1 align="center">🎬 VidPlay</h1>
<p align="center">
  <strong>A modern, full-stack video sharing platform built for creators and viewers</strong>
</p>

<p align="center">
  <a href="https://vidplay-ecru.vercel.app">🌐 Live Demo</a> &nbsp;·&nbsp;
  <a href="#-features">✨ Features</a> &nbsp;·&nbsp;
  <a href="#-quick-start">🚀 Quick Start</a> &nbsp;·&nbsp;
  <a href="#-api-reference">📡 API Reference</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18.2-61DAFB?style=flat-square&logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express-5.2-000000?style=flat-square&logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/MongoDB-Mongoose%209-47A248?style=flat-square&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Vite-5.0-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind" />
  <img src="https://img.shields.io/badge/Redux_Toolkit-2.0-764ABC?style=flat-square&logo=redux&logoColor=white" alt="Redux" />
  <img src="https://img.shields.io/badge/Cloudinary-Media_CDN-3448C5?style=flat-square&logo=cloudinary&logoColor=white" alt="Cloudinary" />
</p>

---

## 📑 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Quick Start](#-quick-start)
- [Environment Variables](#-environment-variables)
- [Project Structure](#-project-structure)
- [API Reference](#-api-reference)
- [Authentication Flows](#-authentication-flows)
- [Frontend Deep Dive](#-frontend-deep-dive)
- [Performance & Optimizations](#-performance--optimizations)
- [Deployment](#-deployment)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [Author](#-author)
- [License](#-license)

---

## ✨ Features

### For Viewers
| Feature | Description |
|---------|-------------|
| 🎥 **Video Streaming** | Custom video player with quality selection, playback speed, keyboard shortcuts, and mobile gestures |
| 🔍 **Search** | Search videos by title, description, and tags |
| 📱 **Responsive Design** | Mobile-first UI with landscape fullscreen, touch gestures, and adaptive layouts |
| 📋 **Playlists** | Create, manage, and save videos to custom playlists |
| 💬 **Comments** | Add, view, and delete comments on videos |
| 👍 **Likes** | Like/unlike videos and view your liked videos |
| 🔔 **Subscriptions** | Subscribe to channels and browse your subscriptions feed |
| 🕒 **Watch History** | Automatically tracked viewing history |

### For Creators
| Feature | Description |
|---------|-------------|
| 📤 **Video Upload** | Upload videos (MP4, WebM, MOV, AVI) with custom thumbnails |
| 📊 **Dashboard** | Analytics with views, subscribers, likes, and video performance |
| ✏️ **Video Management** | Edit titles, descriptions, thumbnails; toggle publish status |
| 👤 **Channel Page** | Public channel profile with videos, playlists, and subscriber count |
| ⚙️ **Settings** | Update profile, avatar, cover image, and change password |

### Security & Auth
| Feature | Description |
|---------|-------------|
| 🔐 **JWT Authentication** | Secure httpOnly cookie-based access & refresh tokens |
| 🔑 **Google OAuth (PKCE)** | Sign in with Google using industry-standard PKCE flow |
| 📧 **Email Verification** | Two-step registration with email verification |
| 🔄 **Password Reset** | Token-based password reset via email |
| 🛡️ **Auto Token Refresh** | Seamless token refresh via Axios interceptors |

---

## 🛠 Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| **React 18** | UI framework with hooks & lazy loading |
| **Vite 5** | Lightning-fast build tool & dev server |
| **Redux Toolkit 2** | Global state management |
| **React Router 6** | Client-side routing with code splitting |
| **React Hook Form** | Performant form handling & validation |
| **Tailwind CSS 3.4** | Utility-first styling |
| **Axios** | HTTP client with interceptors |
| **React Hot Toast** | Toast notifications |
| **React Icons** | Icon library |

### Backend
| Technology | Purpose |
|-----------|---------|
| **Node.js 18+** | JavaScript runtime |
| **Express 5** | Web framework |
| **Mongoose 9** | MongoDB ODM |
| **Cloudinary** | Video & image CDN |
| **JWT** | Token-based authentication |
| **Multer 2** | Multipart file uploads |
| **bcrypt** | Password hashing |
| **google-auth-library** | Google OAuth 2.0 |
| **Nodemon** | Development hot-reload |

---

## 🏗 Architecture

```mermaid
flowchart TB
    subgraph Client["🖥 Frontend — React + Vite"]
        UI["React Pages & Components"]
        Redux["Redux Store<br/>(auth, videos, playlists)"]
        Services["Service Layer<br/>(Axios)"]
        UI --> Redux --> Services
    end

    subgraph Server["⚙️ Backend — Node.js + Express 5"]
        Routes["Route Handlers"]
        Auth["Auth Middleware<br/>(JWT verification)"]
        Controllers["Controllers"]
        Models["Mongoose Models"]
        Routes --> Auth --> Controllers --> Models
    end

    subgraph Cloud["☁️ External Services"]
        Cloudinary["Cloudinary<br/>Video & Image CDN"]
        MongoDB[("MongoDB Atlas<br/>Database")]
        SMTP["Resend / SMTP<br/>Email Service"]
        Google["Google OAuth 2.0"]
    end

    Services <-->|"REST API<br/>httpOnly Cookies"| Routes
    Models --> MongoDB
    Controllers --> Cloudinary
    Controllers --> SMTP
    Controllers <--> Google
```

### Request Flow

```
Client Request
  → Express Router
    → Auth Middleware (JWT verify)
      → Controller (business logic)
        → Mongoose Model (database)
        → Cloudinary (media upload)
      ← ApiResponse / ApiError
    ← JSON Response with httpOnly Cookies
  ← Client receives data
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** v18+ and **npm** v9+
- **MongoDB** (local or [Atlas](https://www.mongodb.com/atlas) free tier)
- **Cloudinary** account ([free signup](https://cloudinary.com/))
- **Google Cloud Console** project (for OAuth — optional)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/vidplay.git
cd vidplay

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Configuration

Create environment files (see [Environment Variables](#-environment-variables) for all options):

```bash
# Backend
cp backend/.env.example backend/.env

# Frontend  
cp frontend/.env.example frontend/.env
```

### Run Development Servers

```bash
# Terminal 1 — Backend (http://localhost:8000)
cd backend
npm run dev

# Terminal 2 — Frontend (http://localhost:5173)
cd frontend
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## 🔧 Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `8000` |
| `NODE_ENV` | Environment | `development` |
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/vidplay` |
| `CORS_ORIGIN` | Allowed frontend origin | `http://localhost:5173` |
| `ACCESS_TOKEN_SECRET` | JWT access token secret (32+ chars) | `your-secret-key` |
| `ACCESS_TOKEN_EXPIRY` | Access token TTL | `1d` |
| `REFRESH_TOKEN_SECRET` | JWT refresh token secret (32+ chars) | `your-secret-key` |
| `REFRESH_TOKEN_EXPIRY` | Refresh token TTL | `10d` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | `your_cloud` |
| `CLOUDINARY_API_KEY` | Cloudinary API key | `123456789` |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | `your_secret` |
| `EMAIL_HOST` | SMTP host | `smtp.resend.com` |
| `EMAIL_PORT` | SMTP port | `587` |
| `EMAIL_USER` | SMTP username | `resend` |
| `EMAIL_PASSWORD` | SMTP password / API key | `re_xxxx` |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | `xxxx.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | `GOCSPX-xxxx` |
| `GOOGLE_REDIRECT_URI` | OAuth callback URL | `http://localhost:5173/oauth/callback` |

### Frontend (`frontend/.env`)

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API base URL | `http://localhost:8000/api/v1` |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth client ID | `xxxx.apps.googleusercontent.com` |

> ⚠️ **Never commit `.env` files.** Both directories have `.gitignore` entries for these files.

---

## 📁 Project Structure

```
vidplay/
├── README.md
├── backend/
│   ├── package.json
│   ├── public/temp/              # Temp file storage (multer uploads)
│   └── src/
│       ├── index.js              # Server entry — DB connect & listen
│       ├── app.js                # Express app — middleware & routes
│       ├── constants.js          # App-wide constants
│       ├── auth/                 # OAuth config
│       ├── controllers/          # Request handlers
│       │   ├── auth.controller.js
│       │   ├── user.controller.js
│       │   ├── video.controller.js
│       │   ├── comment.controller.js
│       │   ├── like.controller.js
│       │   ├── playlist.controller.js
│       │   ├── subscription.controller.js
│       │   ├── dashboard.controller.js
│       │   └── healthcheck.controller.js
│       ├── models/               # Mongoose schemas
│       │   ├── user.model.js
│       │   ├── video.model.js
│       │   ├── comment.model.js
│       │   ├── like.model.js
│       │   ├── playlist.model.js
│       │   ├── subscription.model.js
│       │   ├── token.model.js
│       │   └── pendingEmail.model.js
│       ├── routes/               # Express route definitions
│       ├── middlewares/
│       │   ├── auth.middleware.js     # JWT verification
│       │   ├── multer.middleware.js   # File upload handling
│       │   └── performance.middleware.js
│       ├── utils/
│       │   ├── ApiError.js       # Custom error class
│       │   ├── ApiResponse.js    # Standardized response
│       │   ├── asyncHandler.js   # Async error wrapper
│       │   ├── cloudinary.js     # Media upload/delete
│       │   ├── email.util.js     # Transactional emails
│       │   ├── cache.js          # Caching utilities
│       │   └── keepAlive.js      # Production keep-alive
│       └── db/
│           └── index.js          # MongoDB connection
│
└── frontend/
    ├── package.json
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    ├── vercel.json               # Vercel deployment config
    └── src/
        ├── main.jsx              # React entry point
        ├── App.jsx               # Root component & routing
        ├── index.css             # Global styles + Tailwind
        ├── api/
        │   └── axiosInstance.js   # Axios with interceptors
        ├── components/
        │   ├── layout/           # Navbar, Sidebar
        │   ├── ui/               # Button, Input, Avatar, Modal, Skeleton
        │   └── video/            # VideoCard, VideoGrid, VideoPlayer
        ├── layouts/
        │   ├── MainLayout.jsx    # App shell (navbar + sidebar)
        │   └── AuthLayout.jsx    # Login/register layout
        ├── pages/                # 20+ route pages
        ├── services/             # API service layer (1 per feature)
        ├── store/
        │   ├── store.js          # Redux store config
        │   └── slices/           # authSlice, videoSlice, playlistSlice, etc.
        └── utils/                # Formatters, helpers
```

---

## 📡 API Reference

Base URL: `http://localhost:8000/api/v1`

### Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/auth/login` | Login with email & password | No |
| `POST` | `/auth/logout` | Logout (clear cookies) | Yes |
| `POST` | `/auth/refresh-token` | Refresh access token | No |
| `POST` | `/auth/google` | Google OAuth sign-in | No |

### Users

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/users/initiate-register` | Start email verification | No |
| `POST` | `/users/register` | Complete registration (with token) | No |
| `GET` | `/users/current-user` | Get authenticated user | Yes |
| `PATCH` | `/users/update-account` | Update profile details | Yes |
| `PATCH` | `/users/avatar` | Update avatar | Yes |
| `PATCH` | `/users/cover-image` | Update cover image | Yes |
| `POST` | `/users/change-password` | Change password | Yes |
| `POST` | `/users/forgot-password` | Request password reset email | No |
| `POST` | `/users/reset-password` | Reset password with token | No |
| `GET` | `/users/c/:username` | Get channel profile | No |

### Videos

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/videos` | List all videos (paginated) | No |
| `GET` | `/videos/:videoId` | Get video by ID | No |
| `POST` | `/videos` | Upload new video | Yes |
| `PATCH` | `/videos/:videoId` | Update video | Yes |
| `DELETE` | `/videos/:videoId` | Delete video | Yes |

### Comments

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/comments/:videoId` | Get video comments | No |
| `POST` | `/comments/:videoId` | Add comment | Yes |
| `DELETE` | `/comments/c/:commentId` | Delete comment | Yes |

### Likes

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/likes/toggle/v/:videoId` | Toggle video like | Yes |
| `GET` | `/likes/videos` | Get liked videos | Yes |

### Subscriptions

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/subscriptions/c/:channelId` | Toggle subscription | Yes |
| `GET` | `/subscriptions/c/:channelId` | Get channel subscribers | No |
| `GET` | `/subscriptions/u/:subscriberId` | Get subscribed channels | No |

### Playlists

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/playlist/user/:userId` | Get user's playlists | No |
| `GET` | `/playlist/:playlistId` | Get playlist by ID | No |
| `POST` | `/playlist` | Create playlist | Yes |
| `PATCH` | `/playlist/:playlistId` | Update playlist | Yes |
| `DELETE` | `/playlist/:playlistId` | Delete playlist | Yes |
| `PATCH` | `/playlist/add/:videoId/:playlistId` | Add video to playlist | Yes |
| `PATCH` | `/playlist/remove/:videoId/:playlistId` | Remove video from playlist | Yes |

### Dashboard

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/dashboard/stats` | Get channel stats | Yes |
| `GET` | `/dashboard/videos` | Get channel videos | Yes |

### Response Format

**Success:**
```json
{
    "statusCode": 200,
    "data": { "..." },
    "message": "Operation successful",
    "success": true
}
```

**Error:**
```json
{
    "statusCode": 400,
    "message": "Validation failed",
    "errors": ["Email is required"],
    "success": false
}
```

---

## 🔐 Authentication Flows

### JWT Token Flow

```mermaid
sequenceDiagram
    participant Client
    participant Server
    participant DB

    Client->>Server: POST /auth/login {email, password}
    Server->>DB: Find user, verify password (bcrypt)
    Server->>Server: Generate access token (1d) + refresh token (10d)
    Server-->>Client: Set httpOnly cookies + return user data

    Note over Client: Subsequent API requests

    Client->>Server: GET /videos (with cookies)
    Server->>Server: Verify access token from cookie
    Server-->>Client: 200 OK + data

    Note over Client: Access token expires

    Client->>Server: GET /videos → 401 Unauthorized
    Client->>Server: POST /auth/refresh-token (refresh cookie)
    Server->>DB: Validate refresh token
    Server->>Server: Issue new access + refresh tokens
    Server-->>Client: Set new cookies
    Client->>Server: Retry original request
    Server-->>Client: 200 OK + data
```

### Two-Step Email Registration

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant Email
    participant DB

    User->>Frontend: Enter email
    Frontend->>Backend: POST /users/initiate-register {email}
    Backend->>DB: Check email not taken
    Backend->>DB: Store PendingEmail with verification token
    Backend->>Email: Send verification link
    Backend-->>Frontend: "Check your inbox"

    Note over User: Clicks email link

    User->>Frontend: /register/:token
    User->>Frontend: Fill username, password, upload avatar
    Frontend->>Backend: POST /users/register (multipart form)
    Backend->>DB: Validate token, upload avatar to Cloudinary
    Backend->>DB: Create user, delete PendingEmail
    Backend-->>Frontend: "Account created"
    Frontend-->>User: Redirect to login
```

### Google OAuth (PKCE)

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Google
    participant Backend
    participant DB

    User->>Frontend: Click "Sign in with Google"
    Frontend->>Frontend: Generate code_verifier + code_challenge (SHA256)
    Frontend->>Frontend: Store code_verifier in sessionStorage
    Frontend->>Google: Redirect with code_challenge

    Note over User,Google: User authorizes VidPlay

    Google-->>Frontend: Redirect to /oauth/callback?code=xxx
    Frontend->>Backend: POST /auth/google {code, code_verifier}
    Backend->>Google: Exchange code + verifier for tokens
    Google-->>Backend: {access_token, id_token}
    Backend->>DB: Find or create user from profile
    Backend->>Backend: Generate JWT tokens
    Backend-->>Frontend: Set httpOnly cookies + user data
    Frontend-->>User: Redirect to homepage
```

> **Why PKCE?** — Prevents authorization code interception. No client secret exposed to the browser. Industry standard for SPAs.

---

## 🎨 Frontend Deep Dive

### Routing

| Route | Page | Access | Description |
|-------|------|--------|-------------|
| `/` | Home | Public | Browse recommended videos |
| `/search` | Search | Public | Search results |
| `/video/:videoId` | Video | Public | Watch video, comments, related |
| `/channel/:username` | Channel | Public | Creator's public profile |
| `/login` | Login | Guest only | Sign in |
| `/initiate-register` | Register Step 1 | Guest only | Email verification |
| `/register/:token` | Register Step 2 | Guest only | Complete registration |
| `/forgot-password` | Forgot Password | Guest only | Request reset email |
| `/reset-password` | Reset Password | Guest only | Set new password |
| `/oauth/callback` | OAuth | Guest only | Google callback handler |
| `/upload` | Upload | 🔒 Auth | Upload new video |
| `/video/:videoId/edit` | Edit Video | 🔒 Auth | Edit video details |
| `/dashboard` | Dashboard | 🔒 Auth | Creator analytics |
| `/playlists` | Playlists | 🔒 Auth | Manage playlists |
| `/playlist/:playlistId` | Playlist Detail | 🔒 Auth | View playlist videos |
| `/history` | History | 🔒 Auth | Watch history |
| `/liked-videos` | Liked Videos | 🔒 Auth | Liked videos list |
| `/subscriptions` | Subscriptions | 🔒 Auth | Subscribed channels |
| `/settings` | Settings | 🔒 Auth | Profile & password |

### Video Player Features

The custom-built `<VideoPlayer>` component includes:

- ▶️ Play/pause with center overlay and keyboard (`Space`, `K`)
- ⏩ Skip forward/backward (arrow keys, `J`/`L`, double-tap on mobile)
- 🔊 Volume control with slider (desktop) and toggle (mobile)
- 📊 Progress bar with buffered indicator and seek preview tooltip
- ⚙️ Settings menu — playback speed (0.25x–2x) and quality (Auto, 1080p–360p)
- 📺 Fullscreen with landscape lock on mobile devices
- 📱 Mobile gestures: double-tap to skip, long-press for 2x speed
- ⌨️ Full keyboard shortcuts (`F` fullscreen, `M` mute, `0-9` seek %)

### State Management

| Redux Slice | Purpose | Key Actions |
|-------------|---------|-------------|
| `authSlice` | User auth state | `getCurrentUser`, `setUser`, `logout` |
| `videoSlice` | Videos & current video | `fetchVideos`, `fetchVideoById` |
| `playlistSlice` | User playlists | `fetchUserPlaylists`, `createPlaylist` |
| `subscriptionSlice` | Subscribed channels | `fetchSubscriptions`, `toggleSubscription` |

**When to use Redux vs Local State:**

| Redux (Global) | Local State |
|----------------|-------------|
| Auth / user data | Form inputs |
| Video lists | Modal open/close |
| Playlists | UI toggles |
| Subscriptions | Loading spinners |

---

## ⚡ Performance & Optimizations

| Optimization | Implementation |
|--------------|----------------|
| **Code Splitting** | Lazy-loaded pages with `React.lazy()` + `Suspense` |
| **Response Compression** | Gzip via `compression` middleware (level 6, >1KB threshold) |
| **Image Optimization** | Cloudinary auto-format, quality, and responsive transforms |
| **Static Caching** | 1-day `maxAge` + ETags on static assets |
| **Pagination** | `mongoose-aggregate-paginate-v2` for efficient listing |
| **Skeleton Loading** | Custom skeleton components for perceived performance |
| **Performance Monitoring** | Custom middleware tracking response times |
| **Keep-Alive** | Production self-ping to prevent cold starts on free hosting |
| **Proxy Trust** | `trust proxy` enabled for Render/Vercel deployments |

---

## 🚢 Deployment

### Frontend — Vercel

The frontend is deployed on Vercel with SPA routing support:

```json
// vercel.json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

```bash
# Build for production
cd frontend
npm run build

# Deploy (via Vercel CLI or GitHub integration)
vercel --prod
```

### Backend — Render / Railway

```bash
# Production start command
cd backend
npm start
```

**Required environment variables:** Set all variables from the [Environment Variables](#-environment-variables) section in your hosting platform's dashboard.

**Important:** Update `CORS_ORIGIN` to your deployed frontend URL and `GOOGLE_REDIRECT_URI` to match.

---

## 🔧 Troubleshooting

### Authentication Issues

| Problem | Cause | Fix |
|---------|-------|-----|
| Login works but keeps redirecting to login | Cookies not being set | Ensure `credentials: true` in CORS config and `withCredentials: true` in Axios |
| "Unauthorized" on all requests | Missing or expired token | Check cookie domain matches, re-login |
| Google OAuth fails | Redirect URI mismatch | URI in Google Console must exactly match `GOOGLE_REDIRECT_URI` |
| Token refresh loop | Invalid refresh token | Clear cookies, re-login |

### Upload Issues

| Problem | Cause | Fix |
|---------|-------|-----|
| Upload fails silently | Cloudinary credentials wrong | Verify `CLOUDINARY_*` env vars |
| Large file fails | Size limit exceeded | Video max: 100MB, Thumbnail max: 5MB |
| "Unsupported file type" | Wrong format | Use MP4, WebM, MOV (video) or JPG, PNG, WebP (image) |

### Email Issues

| Problem | Cause | Fix |
|---------|-------|-----|
| Verification email not received | SMTP misconfigured | Test connection: see below |
| "Invalid token" on registration | Token expired (24hr) | Request new verification email |
| Password reset link broken | Wrong `CORS_ORIGIN` | Ensure it matches your frontend URL |

```bash
# Test SMTP connection
node -e "
import('nodemailer').then(nm => {
  const t = nm.default.createTransport({
    host: 'smtp.resend.com', port: 587,
    auth: { user: 'resend', pass: 'YOUR_KEY' }
  });
  t.verify().then(() => console.log('✅ SMTP OK')).catch(console.error);
})
"
```

### General

```bash
# Clear everything and reinstall
rm -rf node_modules package-lock.json
npm install

# Check for outdated packages
npm outdated

# Run with verbose logging
DEBUG=* npm run dev
```

---

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m 'Add amazing feature'`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

### Guidelines

- Follow existing code patterns and project structure
- Keep components small and focused
- Add proper loading and error states
- Use meaningful commit messages
- Test on both desktop and mobile viewports

---

## 👨‍💻 Author

**Nikunj Makwana**

- 🌐 [Live Demo](https://vidplay-ecru.vercel.app)

---

## 📄 License

This project is licensed under the **ISC License** — see the [LICENSE](LICENSE) file for details.
