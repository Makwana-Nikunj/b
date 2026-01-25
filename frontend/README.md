# VidPlay Frontend

A production-ready React frontend for the VidPlay video sharing platform.

## Tech Stack

- **React 18** with Vite
- **React Router v6** for routing
- **Redux Toolkit** for global state management
- **React Hook Form** for form handling
- **Axios** for API calls
- **Tailwind CSS** for styling
- **React Hot Toast** for notifications

## Project Structure

```
src/
├── api/                  # Axios instance and configuration
│   └── axiosInstance.js  # Centralized axios with interceptors
├── components/
│   ├── layout/           # Layout components (Navbar, Sidebar)
│   ├── ui/               # Reusable UI components
│   └── video/            # Video-related components
├── layouts/              # Page layouts
├── pages/                # Page components (data fetching happens here)
├── services/             # API service layer (one per feature)
├── store/
│   ├── slices/           # Redux slices
│   └── store.js          # Redux store configuration
└── utils/                # Utility functions
```

## Architecture Principles

1. **Backend is source of truth** - No mocked data
2. **Centralized API layer** - All calls go through axios instance
3. **Redux for server state** - Auth, videos, playlists, subscriptions
4. **React Hook Form for forms** - Login, register, upload
5. **Presentational components** - Pages handle data fetching
6. **No business logic in JSX**
7. **Proper loading & error states**

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Start development server:
```bash
npm run dev
```

The app will run at `http://localhost:3000`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## API Endpoints

The frontend expects the backend to be running at `http://localhost:8000/api/v1`

### Authentication
- `POST /users/register` - Register new user
- `POST /users/login` - Login
- `POST /users/logout` - Logout
- `GET /users/current-user` - Get current user
- `POST /users/refresh-token` - Refresh access token

### Videos
- `GET /videos` - Get all videos
- `GET /videos/:id` - Get video by ID
- `POST /videos` - Upload video
- `PATCH /videos/:id` - Update video
- `DELETE /videos/:id` - Delete video

### Playlists
- `GET /playlist/user/:userId` - Get user playlists
- `POST /playlist` - Create playlist
- `PATCH /playlist/:id` - Update playlist
- `DELETE /playlist/:id` - Delete playlist

### Subscriptions
- `POST /subscriptions/c/:channelId` - Toggle subscription
- `GET /subscriptions/c/:channelId` - Get subscribed channels

### Comments
- `GET /comments/:videoId` - Get video comments
- `POST /comments/:videoId` - Add comment
- `DELETE /comments/c/:commentId` - Delete comment

### Likes
- `POST /likes/toggle/v/:videoId` - Toggle video like
- `GET /likes/videos` - Get liked videos

## Features

- ✅ User authentication (register, login, logout)
- ✅ Video browsing and playback
- ✅ Video upload with thumbnail
- ✅ Channel pages with subscribe functionality
- ✅ Playlists (create, edit, delete)
- ✅ Comments and likes
- ✅ Watch history
- ✅ Search functionality
- ✅ Dashboard with analytics
- ✅ User settings (profile, password)
- ✅ Tweets/Community posts
- ✅ Responsive design

## State Management

### Redux Slices

- **authSlice** - User authentication state
- **videoSlice** - Videos list and current video
- **playlistSlice** - User playlists
- **subscriptionSlice** - Subscribed channels

### When to use Redux vs Local State

| Redux (Global State) | Local State |
|---------------------|-------------|
| Auth/user data | Form inputs |
| Videos list | UI toggles |
| Playlists | Modal open/close |
| Subscriptions | Loading states |

## Error Handling

- Global error handler in axios interceptor
- 401 errors trigger token refresh
- Toast notifications for user feedback
- Proper error boundaries (can be added)

## Contributing

1. Follow the existing code patterns
2. Keep components small and focused
3. Use TypeScript types where possible
4. Write meaningful commit messages
