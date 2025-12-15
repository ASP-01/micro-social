import express from "express";
import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const usersFile = path.join(__dirname, '..', 'data', 'users.json');

// Helper functions with error handling
function readUsers() {
  try {
    // Create data directory if it doesn't exist
    const dataDir = path.join(__dirname, '..', 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    // Create users file if it doesn't exist
    if (!fs.existsSync(usersFile)) {
      fs.writeFileSync(usersFile, '[]');
      return [];
    }
    
    const data = fs.readFileSync(usersFile, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading users file:", error);
    return [];
  }
}

function writeUsers(users) {
  try {
    // Create data directory if it doesn't exist
    const dataDir = path.join(__dirname, '..', 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
  } catch (error) {
    console.error("Error writing users file:", error);
    throw error;
  }
}

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

// Search users
router.get("/search/:query", auth, async (req, res) => {
  try {
    const { query } = req.params;
    if (!query || query.trim() === "") return res.json([]);
    
    const users = readUsers();
    const filtered = users.filter(u => 
      u.username && (
        u.username.toLowerCase().includes(query.toLowerCase()) ||
        u.email.toLowerCase().includes(query.toLowerCase())
      )
    ).map(u => {
      const { password, ...userWithoutPassword } = u;
      return userWithoutPassword;
    });
    
    res.json(filtered.slice(0, 20));
  } catch (error) {
    console.error("Search users error:", error);
    res.status(500).json({ message: "Error searching users", error: error.message });
  }
});

// Get all users
router.get("/", auth, async (req, res) => {
  try {
    const users = readUsers();
    const filtered = users
      .filter(u => u.email !== req.user.email && u.username)
      .map(u => {
        const { password, ...userWithoutPassword } = u;
        return userWithoutPassword;
      });
    
    res.json(filtered.slice(0, 50));
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ message: "Error fetching users", error: error.message });
  }
});

// Get user profile
router.get("/profile/:username", auth, async (req, res) => {
  try {
    const users = readUsers();
    const user = users.find(u => u.username === req.params.username);
    
    if (!user) return res.status(404).json({ message: "User not found" });
    
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ message: "Error fetching profile", error: error.message });
  }
});

// Follow user
router.post("/follow/:username", auth, async (req, res) => {
  try {
    const users = readUsers();
    const targetUser = users.find(u => u.username === req.params.username);
    const currentUser = users.find(u => u.email === req.user.email);

    if (!targetUser) return res.status(404).json({ message: "User not found" });
    if (!currentUser) return res.status(404).json({ message: "Current user not found" });
    
    if (targetUser.email === req.user.email) {
      return res.status(400).json({ message: "You cannot follow yourself" });
    }
    
    if (!currentUser.following) currentUser.following = [];
    if (!targetUser.followers) targetUser.followers = [];
    
    if (currentUser.following.includes(targetUser.email)) {
      return res.status(400).json({ message: "Already following this user" });
    }

    currentUser.following.push(targetUser.email);
    targetUser.followers.push(currentUser.email);
    
    writeUsers(users);

    console.log(`✅ ${currentUser.username} followed ${targetUser.username}`);
    res.json({ message: "User followed successfully", following: true });
  } catch (error) {
    console.error("Follow error:", error);
    res.status(500).json({ message: "Error following user", error: error.message });
  }
});

// Unfollow user
router.post("/unfollow/:username", auth, async (req, res) => {
  try {
    const users = readUsers();
    const targetUser = users.find(u => u.username === req.params.username);
    const currentUser = users.find(u => u.email === req.user.email);

    if (!targetUser) return res.status(404).json({ message: "User not found" });
    if (!currentUser) return res.status(404).json({ message: "Current user not found" });

    if (!currentUser.following) currentUser.following = [];
    if (!targetUser.followers) targetUser.followers = [];

    currentUser.following = currentUser.following.filter(e => e !== targetUser.email);
    targetUser.followers = targetUser.followers.filter(e => e !== currentUser.email);
    
    writeUsers(users);

    console.log(`✅ ${currentUser.username} unfollowed ${targetUser.username}`);
    res.json({ message: "User unfollowed successfully", following: false });
  } catch (error) {
    console.error("Unfollow error:", error);
    res.status(500).json({ message: "Error unfollowing user", error: error.message });
  }
});

// Get current user
router.get("/me", auth, async (req, res) => {
  try {
    const users = readUsers();
    const user = users.find(u => u.email === req.user.email);
    
    if (!user) return res.status(404).json({ message: "User not found" });
    
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error("Get current user error:", error);
    res.status(500).json({ message: "Error fetching user info", error: error.message });
  }
});

export default router;