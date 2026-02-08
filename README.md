# 🎬 VidPlay

A modern, full-stack video sharing platform built with React and Node.js. Upload, share, and discover videos with a YouTube-like experience.

---

## ✨ Features

| Category | Features |
|----------|----------|
| **User Management** | Registration, Login, Google OAuth (PKCE), Password Reset, Email Verification |
| **Videos** | Upload, Edit, Delete, View, Search, Watch History |
| **Social** | Like/Unlike Videos & Comments, Subscribe to Channels |
| **Playlists** | Create, Edit, Delete, Add/Remove Videos |
| **Dashboard** | Channel Analytics, Video Management |

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| React 18 | UI Framework |
| Vite | Build Tool |
| Redux Toolkit | State Management |
| Tailwind CSS | Styling |
| React Router | Navigation |
| Axios | HTTP Client |
| React Hook Form | Form Handling |

### Backend
| Technology | Purpose |
|------------|---------|
| Node.js + Express | Server Framework |
| MongoDB + Mongoose | Database |
| JWT | Authentication |
| Cloudinary | Media Storage |
| Nodemailer | Email Service |
| Google Auth Library | OAuth Integration |

---

## 🔄 Application Workflows

### 1. Two-Step Registration Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant Resend

    User->>Frontend: Enter email only
    Frontend->>Backend: POST /users/initiate-register {email}
    Backend->>Backend: Check email not already registered
    Backend->>Backend: Store in PendingEmail with token
    Backend->>Resend: Send verification link
    Resend-->>User: Email with verification link
    Backend-->>Frontend: 200 "Check your inbox"
    
    Note over User: User clicks email link
    
    User->>Frontend: GET /register/:token
    Frontend->>Frontend: Show full registration form
    User->>Frontend: Fill name, password, avatar
    Frontend->>Backend: POST /users/register {token, ...data}
    Backend->>Backend: Validate token exists in PendingEmail
    Backend->>Backend: Create user, delete PendingEmail
    Backend-->>Frontend: 201 "Account created"
    Frontend-->>User: Redirect to login
```

### 2. Google OAuth Flow (PKCE)

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Google
    participant Backend

    User->>Frontend: Click "Login with Google"
    Frontend->>Frontend: Generate code_verifier (random)
    Frontend->>Frontend: Create code_challenge (SHA256)
    Frontend->>Frontend: Store code_verifier in sessionStorage
    Frontend->>Google: Redirect to OAuth consent
    
    Note over User,Google: User authorizes application
    
    Google-->>Frontend: Redirect to /oauth/callback?code=xxx
    Frontend->>Frontend: Retrieve code_verifier from sessionStorage
    Frontend->>Backend: POST /auth/google {code, code_verifier}
    Backend->>Google: Exchange code + verifier for tokens
    Google-->>Backend: {access_token, id_token, profile}
    Backend->>Backend: Find or create user
    Backend->>Backend: Generate JWT tokens
    Backend-->>Frontend: Set httpOnly cookies + user data
    Frontend-->>User: Redirect to dashboard
```

### 3. Video Upload Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant Cloudinary

    User->>Frontend: Open upload page
    User->>Frontend: Select video + thumbnail
    User->>Frontend: Enter title, description
    Frontend->>Backend: POST /videos (multipart/form-data)
    Backend->>Cloudinary: Upload video file
    Cloudinary-->>Backend: Video URL + metadata
    Backend->>Cloudinary: Upload thumbnail
    Cloudinary-->>Backend: Thumbnail URL
    Backend->>Backend: Save video document to MongoDB
    Backend-->>Frontend: 201 {video data}
    Frontend-->>User: Show success, redirect to video
```

### 4. Video Playback & Interaction Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend

    User->>Frontend: Click on video card
    Frontend->>Backend: GET /videos/:videoId
    Backend->>Backend: Increment view count
    Backend->>Backend: Add to watch history
    Backend-->>Frontend: {video, owner, likes, comments}
    Frontend-->>User: Render video player

    Note over User,Frontend: User interactions

    User->>Frontend: Click Like button
    Frontend->>Backend: POST /likes/toggle/v/:videoId
    Backend-->>Frontend: {isLiked, totalLikes}

    User->>Frontend: Add comment
    Frontend->>Backend: POST /comments/:videoId
    Backend-->>Frontend: {comment data}

    User->>Frontend: Click Subscribe
    Frontend->>Backend: POST /subscriptions/c/:channelId
    Backend-->>Frontend: {subscribed, subscriberCount}
```

### 5. Password Reset Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant Resend

    User->>Frontend: Click "Forgot Password"
    User->>Frontend: Enter email address
    Frontend->>Backend: POST /users/forgot-password {email}
    Backend->>Backend: Generate reset token
    Backend->>Backend: Store token with expiry
    Backend->>Resend: Send reset email
    Resend-->>User: Email with reset link
    Backend-->>Frontend: 200 "Check your email"

    Note over User: User clicks reset link

    User->>Frontend: GET /reset-password/:token
    Frontend->>Backend: GET /users/verify-reset-token/:token
    Backend-->>Frontend: 200 "Token valid"
    User->>Frontend: Enter new password
    Frontend->>Backend: POST /users/reset-password {token, password}
    Backend->>Backend: Update password, delete token
    Backend-->>Frontend: 200 "Password reset successful"
    Frontend-->>User: Redirect to login
```

### 6. Playlist Management Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend

    User->>Frontend: Click "Save to Playlist"
    Frontend->>Backend: GET /playlists/user
    Backend-->>Frontend: {user's playlists}
    Frontend-->>User: Show playlist modal

    alt Create new playlist
        User->>Frontend: Enter playlist name
        Frontend->>Backend: POST /playlists {name, videoId}
        Backend-->>Frontend: {new playlist}
    else Add to existing
        User->>Frontend: Select playlist
        Frontend->>Backend: PATCH /playlists/add/:videoId/:playlistId
        Backend-->>Frontend: {updated playlist}
    end

    Frontend-->>User: Show success toast
```

---

## 📁 Project Structure

```
vidplay/
├── frontend/                 # React + Vite Frontend
│   ├── src/
│   │   ├── api/             # Axios configuration
│   │   ├── components/      # Reusable UI components
│   │   ├── layouts/         # Page layouts
│   │   ├── pages/           # Route pages
│   │   ├── services/        # API service functions
│   │   ├── store/           # Redux store & slices
│   │   └── utils/           # Utility functions
│   └── ...
│
└── backend/                  # Express Backend
    ├── src/
    │   ├── auth/            # OAuth configuration
    │   ├── controllers/     # Route controllers
    │   ├── db/              # Database connection
    │   ├── middlewares/     # Express middlewares
    │   ├── models/          # Mongoose models
    │   ├── routes/          # API routes
    │   └── utils/           # Utility functions
    └── ...
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- MongoDB
- Cloudinary Account
- Google Cloud Console Project (for OAuth)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd vidplay
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   ```
   
   Create `.env` file:
   ```env
   PORT=8000
   MONGODB_URI=your_mongodb_connection_string
   CORS_ORIGIN=http://localhost:5173
   
   ACCESS_TOKEN_SECRET=your_access_token_secret
   ACCESS_TOKEN_EXPIRY=1d
   REFRESH_TOKEN_SECRET=your_refresh_token_secret
   REFRESH_TOKEN_EXPIRY=10d
   
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   
   # Email Configuration
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_email
   EMAIL_PASSWORD=your_app_password
   
   # Google OAuth
   GOOGLE_CLIENT_ID=your_client_id
   GOOGLE_CLIENT_SECRET=your_client_secret
   GOOGLE_REDIRECT_URI=http://localhost:5173/oauth/callback
   ```

3. **Setup Frontend**
   ```bash
   cd frontend
   npm install
   ```
   
   Create `.env` file:
   ```env
   VITE_API_BASE_URL=http://localhost:8000/api/v1
   VITE_GOOGLE_CLIENT_ID=your_google_client_id
   ```

4. **Run the application**
   
   Backend:
   ```bash
   cd backend
   npm run dev
   ```
   
   Frontend:
   ```bash
   cd frontend
   npm run dev
   ```

5. **Open in browser**: `http://localhost:5173`

---

## 📡 API Endpoints

| Module | Endpoints |
|--------|-----------|
| **Auth** | `/api/v1/auth/*` - Login, Logout, Refresh Token, OAuth |
| **Users** | `/api/v1/users/*` - Profile, Register, Password Reset |
| **Videos** | `/api/v1/videos/*` - CRUD, Search, History |
| **Likes** | `/api/v1/likes/*` - Like/Unlike Videos & Comments |
| **Comments** | `/api/v1/comments/*` - CRUD on Video Comments |
| **Subscriptions** | `/api/v1/subscriptions/*` - Subscribe/Unsubscribe |
| **Playlists** | `/api/v1/playlists/*` - CRUD, Add/Remove Videos |
| **Dashboard** | `/api/v1/dashboard/*` - Channel Stats |

---

## 📜 Scripts

### Backend
| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with nodemon |
| `npm start` | Start production server |

### Frontend
| Script | Description |
|--------|-------------|
| `npm run dev` | Start Vite development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

---

## 👨‍💻 Author

**Nikunj Makwana**

---

## 📄 License

ISC License
