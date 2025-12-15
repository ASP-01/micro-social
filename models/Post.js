import mongoose from "mongoose";

const CommentSchema = new mongoose.Schema({
  text: { 
    type: String, 
    required: true 
  },
  user: { 
    type: String, 
    required: true 
  },
  username: {
    type: String,
    required: true
  },
  date: { 
    type: Date, 
    default: Date.now 
  }
});

const PostSchema = new mongoose.Schema({
  text: { 
    type: String, 
    required: true 
  },
  user: { 
    type: String, 
    required: true 
  },
  username: {
    type: String,
    required: true
  },
  mediaUrl: {
    type: String,
    default: null
  },
  mediaType: {
    type: String,
    enum: ['image', 'video', null],
    default: null
  },
  date: { 
    type: Date, 
    default: Date.now 
  },
  comments: [CommentSchema]
});

export default mongoose.model("Post", PostSchema);