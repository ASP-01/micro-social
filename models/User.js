import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: { 
    type: String, 
    required: true 
  },
  bio: {
    type: String,
    default: "Hey there! I'm using Micro Social 👋",
    maxlength: 150
  },
  followers: [{
    type: String // email of followers
  }],
  following: [{
    type: String // email of users being followed
  }],
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

export default mongoose.model("User", UserSchema);