# 🎬 VidPlay — Frontend

> Modern, responsive React frontend for the VidPlay video sharing platform.  
> **Live:** [vidplay-ecru.vercel.app](https://vidplay-ecru.vercel.app)

---

## Tech Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| **React** | 18.2 | UI framework (hooks, lazy loading) |
| **Vite** | 5.0 | Build tool & dev server |
| **Redux Toolkit** | 2.0 | Global state management |
| **React Router** | 6.21 | Client-side routing |
| **React Hook Form** | 7.49 | Performant form handling |
| **Axios** | 1.6 | HTTP client with interceptors |
| **Tailwind CSS** | 3.4 | Utility-first styling |
| **React Hot Toast** | 2.4 | Toast notifications |
| **React Icons** | 5.0 | Icon library (Hi, Hi2) |

---

## Project Structure

```
src/
├── api/
│   └── axiosInstance.js      # Axios with auth interceptors & token refresh
├── components/
│   ├── layout/               # Navbar, Sidebar, responsive shell
│   ├── ui/                   # Button, Input, Avatar, Modal, Skeleton, Textarea
│   ├── video/                # VideoCard, VideoGrid, VideoListItem, VideoPlayer
│   ├── ProtectedRoute.jsx    # Auth guard for protected routes
│   └── index.js              # Barrel exports
├── layouts/
│   ├── MainLayout.jsx        # App shell (navbar + collapsible sidebar)
│   └── AuthLayout.jsx        # Centered auth forms layout
├── pages/                    # 20+ route pages (lazy loaded)
│   ├── HomePage.jsx          # Browse recommended videos
│   ├── VideoPage.jsx         # Watch video + comments + related
│   ├── ChannelPage.jsx       # Creator's public profile
│   ├── DashboardPage.jsx     # Creator analytics
│   ├── UploadPage.jsx        # Upload new video
│   ├── SearchPage.jsx        # Search results
│   ├── PlaylistPage.jsx      # Manage playlists
│   ├── SettingsPage.jsx      # Profile & password settings
│   └── ...                   # History, Liked, Subscriptions, Auth pages
├── services/                 # API service layer (1 file per feature)
│   ├── authService.js
│   ├── videoService.js
│   ├── commentService.js
│   ├── likeService.js
│   ├── playlistService.js
│   ├── subscriptionService.js
│   ├── dashboardService.js
│   └── index.js              # Barrel exports
├── store/
│   ├── store.js              # Redux store configuration
│   └── slices/               # authSlice, videoSlice, playlistSlice, subscriptionSlice
└── utils/                    # formatDate, formatNumber, formatDuration, optimizeImage
```

---

## Architecture Principles

1. **Backend is the source of truth** — no mocked data, all state from API
2. **Centralized API layer** — all HTTP calls go through the Axios instance with interceptors
3. **Redux for server state** — auth, videos, playlists, subscriptions
4. **Local state for UI** — form inputs, modals, toggles, loading spinners
5. **Code splitting** — all pages lazy-loaded with `React.lazy()` + `Suspense`
6. **Presentational separation** — pages handle data fetching, components handle rendering
7. **Proper loading & error states** — skeleton loaders and toast notifications everywhere

---

## Getting Started

```bash
# Install dependencies
npm install

# Create env file
cp .env.example .env
# Edit .env with your values:
#   VITE_API_BASE_URL=http://localhost:8000/api/v1
#   VITE_GOOGLE_CLIENT_ID=your-google-client-id

# Start development server
npm run dev
```

App runs at **http://localhost:5173** (Vite default).

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with HMR |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |

---

## Routing

| Route | Page | Access |
|-------|------|--------|
| `/` | Home | Public |
| `/search` | Search results | Public |
| `/video/:videoId` | Video player | Public |
| `/channel/:username` | Channel profile | Public |
| `/login` | Login | Guest only |
| `/initiate-register` | Enter email | Guest only |
| `/register/:token` | Complete registration | Guest only |
| `/forgot-password` | Request reset email | Guest only |
| `/reset-password` | Set new password | Guest only |
| `/oauth/callback` | Google OAuth handler | Guest only |
| `/upload` | Upload video | Auth required |
| `/video/:videoId/edit` | Edit video | Auth required |
| `/dashboard` | Creator analytics | Auth required |
| `/playlists` | Manage playlists | Auth required |
| `/playlist/:playlistId` | Playlist detail | Auth required |
| `/history` | Watch history | Auth required |
| `/liked-videos` | Liked videos | Auth required |
| `/subscriptions` | Subscribed channels | Auth required |
| `/settings` | Profile settings | Auth required |

---

## Key Features

### Custom Video Player
- Play/pause, skip forward/backward, volume control
- Progress bar with buffered indicator & seek preview
- Settings menu: playback speed (0.25x–2x), quality (Auto to 360p)
- Fullscreen with landscape orientation lock on mobile
- Mobile: double-tap to skip, long-press for 2x speed
- Keyboard shortcuts: `Space`/`K` play, `F` fullscreen, `M` mute, `J`/`L` skip, `0-9` seek

### State Management

| Redux Slice | Data |
|-------------|------|
| `authSlice` | User, auth status, loading |
| `videoSlice` | Video list, current video |
| `playlistSlice` | User playlists |
| `subscriptionSlice` | Subscribed channels |

### Error Handling
- Axios interceptor auto-refreshes 401 tokens
- Toast notifications for all user-facing errors
- Skeleton loading states for perceived performance

---

## API Configuration

The frontend expects the backend API at the URL set in `VITE_API_BASE_URL`.

Default: `http://localhost:8000/api/v1`

All requests include `withCredentials: true` for httpOnly cookie auth.

---

## Deployment

Deployed on **Vercel** with SPA routing:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```
