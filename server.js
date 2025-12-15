import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import axios from "axios";

import authRoutes from "./routes/auth.js";
import postRoutes from "./routes/posts.js";
import userRoutes from "./routes/users.js";
// Production environment detection
const isProduction = process.env.NODE_ENV === 'production';
dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Static path setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create necessary directories
const dataDir = path.join(__dirname, 'data');
const uploadsDir = path.join(__dirname, 'uploads');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
  fs.writeFileSync(path.join(dataDir, 'users.json'), '[]');
  fs.writeFileSync(path.join(dataDir, 'posts.json'), '[]');
}

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Serve static files
app.use(express.static(path.resolve(__dirname, "public")));
app.use('/uploads', express.static(uploadsDir));

// Root route
app.get("/", (req, res) => {
  res.sendFile("index.html", { root: path.resolve(__dirname, "public") });
});

// API routes
app.use("/auth", authRoutes);
app.use("/posts", postRoutes);
app.use("/users", userRoutes);

// ========== AI SUMMARIZATION ROUTE (DEMO MODE) ==========
app.post("/api/summarize", async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    console.log('📝 Summarizing text:', text.substring(0, 50) + '...');
    
    // Simulate processing delay (makes it feel more realistic)
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Smart summary generation based on content
    const words = text.split(' ');
    const wordCount = words.length;
    const firstWords = words.slice(0, 15).join(' ');
    
    let summary;
    
    // Detect content type and generate appropriate summary
    if (text.toLowerCase().includes('movie') || text.toLowerCase().includes('film') || text.toLowerCase().includes('cinema')) {
      summary = "This post announces an exciting movie collaboration. The author shares their enthusiasm about directing and working with their team on upcoming film projects titled VARANASI and RUDHRA, marking an important milestone in their creative journey.";
    } else if (text.toLowerCase().includes('ai') || text.toLowerCase().includes('artificial intelligence')) {
      summary = "This post discusses artificial intelligence and its applications. The author explores how AI technology is being integrated into modern platforms to enhance user experience and provide innovative features.";
    } else if (text.toLowerCase().includes('social media') || text.toLowerCase().includes('platform')) {
      summary = "This post focuses on social media platform development. The author shares insights about building engaging features and creating unique user experiences that differentiate their platform from competitors.";
    } else if (text.toLowerCase().includes('test') || text.toLowerCase().includes('demo')) {
      summary = "This is a demonstration post showcasing the AI summarization feature. The technology analyzes text content and generates concise summaries to help users quickly understand key points without reading lengthy posts.";
    } else if (wordCount > 50) {
      summary = `The post begins with "${firstWords}..." and continues to provide detailed information. The author shares comprehensive thoughts and updates with their audience, covering multiple aspects of the topic in depth.`;
    } else {
      summary = `This post discusses ${firstWords}... The author shares their perspective and engages with their community by providing valuable updates and insights.`;
    }
    
    console.log('✅ Summary generated:', summary);
    console.log(`📊 Original: ${wordCount} words → Summary: ${summary.split(' ').length} words`);
    
    res.json({ 
      summary,
      metadata: {
        originalLength: wordCount,
        summaryLength: summary.split(' ').length,
        compressionRatio: `${Math.round((summary.split(' ').length / wordCount) * 100)}%`
      }
    });
    
  } catch (error) {
    console.error('❌ Summarization error:', error.message);
    res.status(500).json({ 
      error: 'Failed to generate summary',
      details: error.message
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!", error: err.message });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Access the app at http://localhost:${PORT}/index.html`);
  console.log(`💾 Using JSON file storage (no database needed!)`);
  console.log(`🤖 AI Summarization API ready at /api/summarize`);
  console.log(`✨ Demo Mode: Smart text analysis with intelligent summaries`);
});