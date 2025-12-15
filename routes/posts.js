import express from "express";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const postsFile = path.join(__dirname, '..', 'data', 'posts.json');
const uploadsDir = path.join(__dirname, '..', 'uploads');

// Helper functions
function readPosts() {
  const data = fs.readFileSync(postsFile, 'utf8');
  return JSON.parse(data);
}

function writePosts(posts) {
  fs.writeFileSync(postsFile, JSON.stringify(posts, null, 2));
}

// Configure multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image and video files are allowed!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }
});

// Auth middleware
function auth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: "No token provided" });
    
    const token = authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Invalid token format" });
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error("Auth error:", error);
    res.status(401).json({ message: "Invalid or expired token" });
  }
}

// Create post
router.post("/", auth, upload.single('media'), async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || text.trim() === "") {
      return res.status(400).json({ message: "Post text is required" });
    }

    const posts = readPosts();
    const newPost = {
      _id: Date.now().toString(),
      text: text.trim(),
      user: req.user.email,
      username: req.user.username,
      mediaUrl: req.file ? `/uploads/${req.file.filename}` : null,
      mediaType: req.file ? (req.file.mimetype.startsWith('image/') ? 'image' : 'video') : null,
      likes: [],
      date: new Date().toISOString(),
      comments: []
    };

    posts.unshift(newPost);
    writePosts(posts);

    console.log("✅ Post created by:", req.user.email);
    res.status(201).json(newPost);
  } catch (error) {
    console.error("Create post error:", error);
    res.status(500).json({ message: "Error creating post", error: error.message });
  }
});

// Get all posts
router.get("/", async (req, res) => {
  try {
    const posts = readPosts();
    res.json(posts.slice(0, 100));
  } catch (error) {
    console.error("Get posts error:", error);
    res.status(500).json({ message: "Error fetching posts", error: error.message });
  }
});

// Search posts
router.get("/search/:query", async (req, res) => {
  try {
    const { query } = req.params;
    if (!query || query.trim() === "") return res.json([]);
    
    const posts = readPosts();
    const filtered = posts.filter(p => 
      p.text.toLowerCase().includes(query.toLowerCase())
    );
    
    res.json(filtered.slice(0, 50));
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ message: "Error searching posts", error: error.message });
  }
});

// Get single post
router.get("/:id", async (req, res) => {
  try {
    const posts = readPosts();
    const post = posts.find(p => p._id === req.params.id);
    
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.json(post);
  } catch (error) {
    console.error("Get post error:", error);
    res.status(500).json({ message: "Error fetching post", error: error.message });
  }
});

// Add comment
router.post("/:id/comment", auth, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || text.trim() === "") {
      return res.status(400).json({ message: "Comment text is required" });
    }

    const posts = readPosts();
    const post = posts.find(p => p._id === req.params.id);
    
    if (!post) return res.status(404).json({ message: "Post not found" });

    const newComment = {
      text: text.trim(),
      user: req.user.email,
      username: req.user.username,
      date: new Date().toISOString()
    };

    post.comments.push(newComment);
    writePosts(posts);

    console.log("✅ Comment added by:", req.user.email);
    res.json(post);
  } catch (error) {
    console.error("Add comment error:", error);
    res.status(500).json({ message: "Error adding comment", error: error.message });
  }
});

// Delete post
router.delete("/:id", auth, async (req, res) => {
  try {
    const posts = readPosts();
    const postIndex = posts.findIndex(p => p._id === req.params.id);
    
    if (postIndex === -1) return res.status(404).json({ message: "Post not found" });
    
    const post = posts[postIndex];
    if (post.user !== req.user.email) {
      return res.status(403).json({ message: "You can only delete your own posts" });
    }

    // Delete media file if exists
    if (post.mediaUrl) {
      const filepath = path.join(__dirname, '..', post.mediaUrl);
      if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
    }

    posts.splice(postIndex, 1);
    writePosts(posts);
    
    console.log("✅ Post deleted by:", req.user.email);
    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Delete post error:", error);
    res.status(500).json({ message: "Error deleting post", error: error.message });
  }
});

// Like/Unlike post
router.post("/:id/like", auth, async (req, res) => {
  try {
    const posts = readPosts();
    const post = posts.find(p => p._id === req.params.id);
    
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (!post.likes) post.likes = [];

    const likeIndex = post.likes.indexOf(req.user.email);
    
    if (likeIndex > -1) {
      // Unlike
      post.likes.splice(likeIndex, 1);
      writePosts(posts);
      console.log("✅ Post unliked by:", req.user.email);
      res.json({ liked: false, likesCount: post.likes.length });
    } else {
      // Like
      post.likes.push(req.user.email);
      writePosts(posts);
      console.log("✅ Post liked by:", req.user.email);
      res.json({ liked: true, likesCount: post.likes.length });
    }
  } catch (error) {
    console.error("Like post error:", error);
    res.status(500).json({ message: "Error liking post", error: error.message });
  }
});

// Delete comment
router.delete("/:postId/comment/:commentIndex", auth, async (req, res) => {
  try {
    const posts = readPosts();
    const post = posts.find(p => p._id === req.params.postId);
    
    if (!post) return res.status(404).json({ message: "Post not found" });

    const commentIndex = parseInt(req.params.commentIndex);
    
    if (commentIndex < 0 || commentIndex >= post.comments.length) {
      return res.status(404).json({ message: "Comment not found" });
    }

    const comment = post.comments[commentIndex];
    
    if (comment.user !== req.user.email) {
      return res.status(403).json({ message: "You can only delete your own comments" });
    }

    post.comments.splice(commentIndex, 1);
    writePosts(posts);
    
    console.log("✅ Comment deleted by:", req.user.email);
    res.json(post);
  } catch (error) {
    console.error("Delete comment error:", error);
    res.status(500).json({ message: "Error deleting comment", error: error.message });
  }
});

// Share post to followers
router.post("/:id/share", auth, async (req, res) => {
  try {
    const posts = readPosts();
    const post = posts.find(p => p._id === req.params.id);
    
    if (!post) return res.status(404).json({ message: "Post not found" });

    // Create a shared post
    const sharedPost = {
      _id: Date.now().toString(),
      text: `🔄 @${req.user.username} shared: ${post.text}`,
      user: req.user.email,
      username: req.user.username,
      mediaUrl: post.mediaUrl,
      mediaType: post.mediaType,
      likes: [],
      date: new Date().toISOString(),
      comments: [],
      sharedFrom: {
        username: post.username,
        postId: post._id
      }
    };

    posts.unshift(sharedPost);
    writePosts(posts);

    console.log("✅ Post shared by:", req.user.email);
    res.status(201).json({ message: "Post shared successfully", post: sharedPost });
  } catch (error) {
    console.error("Share post error:", error);
    res.status(500).json({ message: "Error sharing post", error: error.message });
  }
});

export default router;