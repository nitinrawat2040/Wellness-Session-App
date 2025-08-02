# 🌿 Wellness Session Platform

A secure, full-stack wellness session management platform built with React, Node.js, Express.js and MongoDB. Users can create, manage, and discover wellness sessions with features like auto-save, draft management, and JWT authentication.

## ✨ Features

### 🔐 Authentication
- Secure user registration and login
- JWT token-based authentication
- Password hashing with bcrypt
- Protected routes and middleware

### 📝 Session Management
- Create and edit wellness sessions
- Draft and published session states
- Auto-save functionality (5-second debounce)
- Tag-based categorization
- JSON file URL integration

### 🎨 User Interface
- Modern, responsive design
- Real-time auto-save feedback
- Toast notifications
- Mobile-friendly layout
- Beautiful gradient backgrounds

### 🛡️ Security
- Input validation and sanitization
- Rate limiting
- CORS protection
- Helmet security headers
- Secure password storage

## 🚀 Tech Stack

### ✅ Frontend
- **React.js** - UI framework
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **React Hot Toast** - Notifications
- **Lucide React** - Icons

### ✅ Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Express Validator** - Input validation

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- Git

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd wellness-session-manager
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Environment Configuration**
   
   Create `server/config.env`:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_super_secret_jwt_key
   NODE_ENV=development
   ```

4. **Start the application**
   ```bash
   # Development (both frontend and backend)
   npm run dev
   
   # Or start separately
   npm run backend  
   npm run frontend 
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 🗄️ Database Schema

### User Model
```javascript
{
  _id: ObjectId,
  username: String (unique, 3-30 chars),
  email: String (unique, validated),
  password: String (hashed),
  createdAt: Date,
  updatedAt: Date
}
```

### Session Model
```javascript
{
  _id: ObjectId,
  user_id: ObjectId (ref: User),
  title: String (required, max 100 chars),
  tags: [String],
  json_file_url: String (required, URL),
  status: "draft" | "published",
  created_at: Date,
  updated_at: Date
}
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Sessions
- `GET /api/sessions` - Get public sessions
- `GET /api/sessions/my-sessions` - Get user's sessions
- `GET /api/sessions/my-sessions/:id` - Get single session
- `POST /api/sessions/my-sessions/save-draft` - Save draft
- `POST /api/sessions/my-sessions/publish` - Publish session
- `DELETE /api/sessions/my-sessions/:id` - Delete session

## 🌐 Deployment

### Frontend (Netlify)
1. Build the React app:
   ```bash
   cd frontend
   npm run build
   ```

2. Deploy to Netlify:
   - Connect your GitHub repository
   - Set build command: `cd frontend && npm install && npm run build`
   - Set publish directory: `frontend/build`
   - Set environment variables for production API URL

### Backend (Render)
1. Deploy to Render
2. Set environment variables:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `NODE_ENV=production`
   - `PORT`

3. Update CORS settings in `backend/index.js` with your frontend URL

## 🎯 Core Features Implementation

### Auto-Save Functionality
- Debounced input handling (5-second delay)
- Real-time save status feedback
- Automatic draft creation
- Error handling and retry logic

### JWT Authentication
- Secure token generation and validation
- Automatic token refresh
- Protected route middleware
- Secure token storage

### Session Management
- Draft and published states
- Tag-based organization
- JSON file URL integration
- User-specific session ownership

## 🔧 Development

### 📂Project Structure
```
wellness-session-manager/
├── frontend/                 
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── contexts/       # React contexts
│   │   ├── pages/          # Page components
│   │   └── ...
│   └── package.json
├── backend/                
│   ├── models/            # Mongoose models
│   ├── routes/            # API routes
│   ├── middleware/        # Custom middleware
│   └── ...
├── package.json
└── README.md
```

### Available Scripts
- `npm run dev` - Start both frontend and backend
- `npm run backened` - Start backend only
- `npm run frontend` - Start frontend only
- `npm run build` - Build frontend for production
- `npm run install-all` - Install all dependencies

## 🧪 Testing

The application includes comprehensive error handling and validation:

- Input validation on both frontend and backend
- JWT token validation
- Database error handling
- Network error recovery
- User-friendly error messages

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones
- Various screen sizes

## 🔒 Security Features

- Password hashing with bcrypt
- JWT token authentication
- Input validation and sanitization
- CORS protection
- Rate limiting
- Helmet security headers
- Secure environment variable handling

## 🚀 Performance

- Optimized React components
- Efficient database queries with indexes
- Debounced auto-save to reduce API calls
- Optimized bundle size


## 👨‍💻 Author

 **Nitin Singh Rawat** <br>
  You can connect with me on 👇
- 📬 [Email](nitinrawat2040@gmail.com)
- 💼 [LinkedIn](https://www.linkedin.com/in/nitin-singh-rawat-9594b228b)
- 🧑‍💻 [GitHub](https://github.com/nitinrawat2040)

**Built with ❤️ for the wellness community** 
=======
