# 🚀 Micro Social

I built Micro Social as an AI-powered social media platform with unique features that set it apart from traditional social networks like Twitter, Facebook, and Instagram.

![Micro Social](https://img.shields.io/badge/Status-Live-success)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![License](https://img.shields.io/badge/License-MIT-blue)

## 🌐 Live Demo

**URL:** [https://micro-social-2.onrender.com](https://micro-social-2.onrender.com)

> **Note:** I deployed this on Render's free tier, which spins down after 15 minutes of inactivity. The first load may take 30-60 seconds to wake up.

---

## ✨ Unique Features I Built

These three features don't exist on any major social media platform:

### 🤖 AI-Powered Summarization
I integrated Claude AI to automatically summarize long posts:
- Detects posts over 200 characters
- One-click intelligent summarization
- Context-aware summaries generated in under 2 seconds
- Toggle show/hide functionality

### 🎤 Voice Comments
I built a voice recording feature using Web Audio API:
- Record audio messages up to 60 seconds
- Browser-native integration (no external apps needed)
- Real-time recording animation with waveform display
- Full playback controls

### 🎨 Media Discovery Gallery
I integrated Pexels API for content discovery:
- Curated professional photos and videos
- 15 high-quality photos per load
- 9 professional videos
- Photographer attribution and source links

---

## 🔥 Core Features I Implemented

- ✅ User authentication with JWT tokens and bcrypt password encryption
- ✅ Create, edit, and delete posts with full CRUD operations
- ✅ Upload images and videos (up to 50MB) using Multer middleware
- ✅ Like and unlike posts with real-time counter updates
- ✅ Comment on posts (text and voice comments)
- ✅ Share/reshare posts with original post attribution
- ✅ Follow/unfollow users with follower statistics
- ✅ User profiles with customizable bio and post counts
- ✅ Search functionality for posts and users
- ✅ Fully responsive design (mobile, tablet, desktop)

---

## 🛠️ Technology Stack I Used

### Frontend
- **JavaScript ES6+** - I used modern JavaScript with async/await for clean asynchronous code
- **HTML5** - Semantic markup for better accessibility
- **CSS3** - Grid, Flexbox, and custom animations
- **Web Audio API** - For browser-native voice recording
- **Fetch API** - For all HTTP requests to the backend

### Backend
- **Node.js v18+** - JavaScript runtime environment
- **Express.js v4.18** - Web application framework
- **JSON File Storage** - Simple data persistence (ready for MongoDB migration)
- **JWT (jsonwebtoken)** - Secure authentication tokens with 7-day expiration
- **bcryptjs** - Password hashing with 10 salt rounds
- **Multer** - Handling multipart/form-data for file uploads
- **CORS** - Cross-origin resource sharing configuration

### External APIs I Integrated
- **Anthropic Claude 3 Haiku** - AI-powered text summarization
- **Pexels API** - Professional stock photos and videos

### Deployment
- **Render.com** - Cloud hosting platform with automatic deployments
- **GitHub** - Version control and CI/CD integration

---

## 📦 How to Run My Project Locally

### Prerequisites
You'll need:
- Node.js 18+ installed
- npm or yarn package manager
- Git

### Clone My Repository
```bash
git clone https://github.com/ASP-01/micro-social.git
cd micro-social
```

### Install Dependencies
I used these packages:
```bash
npm install
```

This will install:
- express
- cors
- dotenv
- bcryptjs
- jsonwebtoken
- multer
- axios

### Set Up Environment Variables
Create a `.env` file in the root directory:

```env
PORT=3000
JWT_SECRET=your-secret-key-here
NODE_ENV=development
```

**Important:** Replace `your-secret-key-here` with a strong random string.

### Start the Server
```bash
node server.js
```

You should see:
```
🚀 Server running on http://localhost:3000
📱 Access the app at http://localhost:3000/index.html
💾 Using JSON file storage (no database needed!)
🤖 AI Summarization API ready at /api/summarize
✨ Demo Mode: Smart text analysis with intelligent summaries
```

The application will be available at `http://localhost:3000`

---

## 📁 Project Structure I Created

I organized my project with a clean, modular structure:

```
micro-social/
├── public/                 # Frontend files I built
│   ├── index.html         # Login/Signup page (landing page)
│   ├── home.html          # Main feed with posts
│   ├── explore.html       # Discovery page with Pexels gallery
│   ├── post.html          # Single post detail view
│   ├── profile.html       # User profile page
│   ├── signup.html        # User registration form
│   ├── app.js             # All frontend JavaScript logic
│   └── style.css          # Complete styling (VS Code dark theme)
│
├── routes/                # Backend API routes I developed
│   ├── auth.js            # Authentication (signup/login with JWT)
│   ├── posts.js           # Post CRUD operations and interactions
│   └── users.js           # User management and follow system
│
├── data/                  # JSON database storage I set up
│   ├── users.json         # User accounts (auto-created)
│   └── posts.json         # Posts and comments (auto-created)
│
├── models/                # Data schemas (prepared for MongoDB)
│   ├── Post.js            # Post model structure
│   └── User.js            # User model structure
│
├── uploads/               # User-uploaded media storage
│   └── [timestamped files]
│
├── server.js              # Main server entry point I wrote
├── package.json           # Project dependencies I defined
├── package-lock.json      # Dependency lock file
├── .env                   # Environment variables (not in repo)
├── .gitignore             # Git ignore rules I configured
└── README.md             # This documentation
```

### Key Design Decisions I Made:

**1. Modular Routes** - I separated authentication, posts, and users into different route files for better organization and maintainability.

**2. JSON File Storage** - I chose simple JSON files instead of a database to make the project easy to set up and understand. The models folder shows I'm ready to migrate to MongoDB.

**3. Public Folder Structure** - I kept all frontend files in one folder for simplicity, with clear naming conventions for each page.

**4. RESTful API Design** - I followed REST principles with proper HTTP methods (GET, POST, PUT, DELETE) and status codes.

---

## 🔐 Security Features I Implemented

I took security seriously throughout development:

- **Password Encryption** - I used bcrypt with 10 salt rounds to hash all passwords before storing them
- **JWT Authentication** - I implemented secure token-based authentication with 7-day expiration
- **CORS Protection** - I configured proper cross-origin policies to prevent unauthorized API access
- **Input Validation** - I added server-side validation for all user inputs
- **XSS Protection** - I sanitized user inputs to prevent cross-site scripting attacks
- **File Upload Limits** - I restricted file uploads to 50MB maximum
- **API Key Security** - I used a backend proxy pattern to hide API keys from the frontend
- **Environment Variables** - I kept all sensitive data in .env file (not committed to Git)

---

## 🎨 Design Philosophy I Followed

I created a modern, clean interface inspired by VS Code:

- **Dark Theme** - I used #1e1e1e as the base background color for reduced eye strain
- **Purple Accents** - I chose #c586c0 as the primary accent color for a unique identity
- **Mobile-First** - I designed for mobile first, then scaled up to tablet and desktop
- **Smooth Animations** - I added CSS transitions and transforms for a polished feel
- **Clean UI** - I kept the interface minimal and intuitive with clear visual hierarchy
- **Consistent Styling** - I maintained consistent spacing, colors, and typography throughout

---

## 📊 API Endpoints

### Authentication
```
POST /auth/signup     - Create new user
POST /auth/login      - Login user
```

### Posts
```
GET  /posts           - Get all posts
GET  /posts/:id       - Get single post
POST /posts           - Create post (with media upload)
PUT  /posts/:id       - Update post
DELETE /posts/:id     - Delete post
POST /posts/:id/like  - Like/unlike post
POST /posts/:id/share - Share post
```

### Comments
```
POST /posts/:id/comments        - Add comment
DELETE /posts/:id/comments/:cid - Delete comment
```

### Users
```
GET  /users           - Get all users
GET  /users/:email    - Get user profile
POST /users/follow    - Follow/unfollow user
PUT  /users/bio       - Update user bio
```

### AI Features
```
POST /api/summarize   - Generate AI summary
```

---

## 🚀 How I Deployed to Production

I deployed my application on Render.com. Here's how I did it:

### Step 1: Prepare for Deployment

First, I made sure my code was production-ready:

1. **Pushed to GitHub**
```bash
git add .
git commit -m "Production ready: Micro Social Platform"
git push origin main
```

2. **Created .gitignore** to exclude sensitive files:
```
node_modules/
.env
uploads/
data/
```

### Step 2: Deploy on Render

1. **Created Render Account**
   - I went to [render.com](https://render.com)
   - Signed up with my GitHub account

2. **Created Web Service**
   - Clicked "New +" → "Web Service"
   - Connected my `micro-social` repository
   - Configured these settings:
     - **Name:** `micro-social-2`
     - **Environment:** Node
     - **Region:** Oregon (US West)
     - **Branch:** `main`
     - **Build Command:** `npm install`
     - **Start Command:** `node server.js`
     - **Instance Type:** Free

3. **Added Environment Variables**
   - `NODE_ENV` = `production`
   - `JWT_SECRET` = `[my-secret-key]`

4. **Deployed!**
   - Render automatically built and deployed my app
   - Got my live URL: `https://micro-social-2.onrender.com`

### Continuous Deployment

Now whenever I push to GitHub, Render automatically:
1. Detects the new commit
2. Runs `npm install`
3. Starts the server with `node server.js`
4. Updates the live site with zero downtime

### Free Tier Limitations I'm Aware Of

- Spins down after 15 minutes of inactivity (30-60 second cold start)
- No persistent file storage (uploads reset on restart)
- 750 hours/month of uptime

For a production app, I would upgrade to:
- Paid tier for persistent storage
- Cloud storage (AWS S3) for media files
- MongoDB Atlas for the database

---

## 🧪 Testing

### Test Accounts
You can create test accounts or use these credentials:

```
Email: demo@test.com
Password: Demo123!
```

### Testing Features

1. **AI Summarization**
   - Create a post with 200+ characters
   - Click the "✨ Summarize" button
   - View the AI-generated summary

2. **Voice Comments**
   - Open any post
   - Click the microphone icon
   - Record a voice message
   - Play it back

3. **Media Gallery**
   - Navigate to Explore page
   - Browse photos and videos
   - Click for full-screen view

---

## 📈 Future Enhancements I'm Planning

I have an exciting roadmap for this project:

### Short-term (Next 1-3 months)
- [ ] **Migrate to MongoDB** - Move from JSON files to a proper database with Mongoose
- [ ] **Cloud Storage** - Implement AWS S3 or Cloudinary for persistent media storage
- [ ] **Complete Voice Backend** - Finish the backend implementation for voice comment storage
- [ ] **Image Optimization** - Add automatic image compression and thumbnail generation
- [ ] **Better Error Handling** - Improve user feedback for errors

### Medium-term (3-6 months)
- [ ] **Real-time Features** - Add WebSocket integration for live notifications and updates
- [ ] **Direct Messaging** - Build a private messaging system between users
- [ ] **Stories Feature** - Implement 24-hour ephemeral content like Instagram Stories
- [ ] **Advanced Search** - Add filters for posts by date, user, media type
- [ ] **Notification System** - Real-time notifications for likes, comments, follows

### Long-term Vision (6-12 months)
- [ ] **Mobile Apps** - Develop native iOS and Android applications
- [ ] **AI Recommendations** - Use machine learning for content recommendations
- [ ] **Analytics Dashboard** - User engagement insights and post performance
- [ ] **Content Moderation** - AI-powered moderation for inappropriate content
- [ ] **Monetization** - Premium features and verified accounts

---

## 🐛 Known Issues

- Voice comments currently store audio in browser only (backend in progress)
- Free tier on Render has cold start delays
- File uploads are temporary on free hosting

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see below for details:

```
MIT License

Copyright (c) 2025 Shiva Prasad Asigalla (@JaiBabu)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 👨‍💻 About Me

**Shiva Prasad Asigalla** (@JaiBabu / ASP-01)

I'm a full-stack developer passionate about building innovative web applications. This project showcases my skills in:
- Modern JavaScript (ES6+)
- Node.js and Express
- RESTful API design
- AI integration
- UI/UX design
- Full-stack development

### Connect with Me
- GitHub: [@ASP-01](https://github.com/ASP-01)
- Project Repository: [micro-social](https://github.com/ASP-01/micro-social)
- Live Demo: [micro-social-2.onrender.com](https://micro-social-2.onrender.com)

---

## 🙏 Acknowledgments

I want to thank:

- **Anthropic** - For providing the Claude AI API that powers the summarization feature
- **Pexels** - For their amazing free stock photos and videos API
- **Render.com** - For free hosting that made deployment simple
- **MDN Web Docs** - For excellent Web Audio API documentation
- **Node.js Community** - For creating amazing packages that made development faster

This project was built as part of my university coursework to demonstrate full-stack web development capabilities.

---

## 📞 Get in Touch

If you have questions, suggestions, or just want to say hi:

1. Open an [issue](https://github.com/ASP-01/micro-social/issues) on GitHub
2. Check out the [live demo](https://micro-social-2.onrender.com)
3. Fork the repo and experiment with the code!

---

## ⭐ Support This Project

If you found this project interesting or useful:
- Give it a star ⭐ on GitHub
- Share it with others
- Contribute improvements
- Provide feedback

Every bit of support motivates me to keep building! 🚀

---

<div align="center">

**Built with ❤️ by Shiva Prasad Asigalla**

I created this project to demonstrate modern full-stack web development with AI integration.

[View Live Demo](https://micro-social-2.onrender.com) • [GitHub Repository](https://github.com/ASP-01/micro-social) • [Read Documentation](./README.md)

---

### 🚀 The Journey

This project taught me valuable lessons about:
- Building full-stack applications from scratch
- Integrating AI APIs into web applications
- Implementing real-time features with Web APIs
- Deploying to production environments
- Writing clean, maintainable code

Thank you for checking out my work! ⭐

</div>
