const API = window.location.hostname === 'localhost' 
  ? "http://localhost:3000"
  : window.location.origin;

  function getToken() {
    return localStorage.getItem("token");
  }
let token = localStorage.getItem("token");
let currentUser = null;
let selectedMedia = null;
let mediaRecorder = null;
let audioChunks = [];
let recordedAudioBlob = null;

// Pexels API Configuration
const PEXELS_API_KEY = "mqRQgggmLuAFUNeMnigCf28CQFUjsCKMlql3WTwvV2TOi2YVMQvilFCk";
const PEXELS_PHOTOS_API = "https://api.pexels.com/v1/curated";
const PEXELS_VIDEOS_API = "https://api.pexels.com/videos/popular";

function showError(message) {
  const errorDiv = document.getElementById("error-message");
  if (errorDiv) {
    errorDiv.textContent = message;
    errorDiv.classList.add("show");
    setTimeout(() => errorDiv.classList.remove("show"), 5000);
  } else {
    alert(message);
  }
}

function hideLoading() {
  const loading = document.getElementById("loading");
  if (loading) loading.style.display = "none";
}

function setButtonLoading(buttonId, isLoading) {
  const btn = document.getElementById(buttonId);
  if (btn) {
    btn.disabled = isLoading;
    btn.textContent = isLoading ? "Loading..." : btn.dataset.originalText || btn.textContent;
    if (!btn.dataset.originalText) btn.dataset.originalText = btn.textContent;
  }
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function checkAuth() {
  const publicPages = ['index.html', 'signup.html', '/index.html', '/signup.html', '/', '/index', '/signup'];
  const currentPath = window.location.pathname;
  
  // Check if we're on a public page
  const isPublicPage = publicPages.some(page => 
    currentPath === page || currentPath.endsWith(page)
  );
  
  // If no token and NOT on a public page, redirect to login
  if (!token && !isPublicPage) {
    console.log('No token found, redirecting to login');
    location.href = "/index.html";
  }
}

async function loadCurrentUser() {
  if (!token) return;
  try {
    const response = await fetch(`${API}/users/me`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    if (response.ok) {
      currentUser = await response.json();
      const usernameDisplay = document.getElementById("username-display");
      if (usernameDisplay) {
        usernameDisplay.textContent = `@${currentUser.username}`;
      }
      return currentUser;
    }
  } catch (error) {
    console.error("Load user error:", error);
  }
}

async function signup() {
  const username = document.getElementById("username").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  if (!username || !email || !password) {
    showError("Please fill in all fields");
    return;
  }

  if (username.length < 3) {
    showError("Username must be at least 3 characters");
    return;
  }

  if (password.length < 6) {
    showError("Password must be at least 6 characters");
    return;
  }

  setButtonLoading("signup-btn", true);

  try {
    const response = await fetch(`${API}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Signup failed");
    }

    alert("✅ Signup successful! Please login.");
    location.href = "index.html";
  } catch (error) {
    console.error("Signup error:", error);
    showError(error.message || "Signup failed. Please try again.");
  } finally {
    setButtonLoading("signup-btn", false);
  }
}

async function login() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  if (!email || !password) {
    showError("Please fill in all fields");
    return;
  }

  setButtonLoading("login-btn", true);

  try {
    const response = await fetch(`${API}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Login failed");
    }

    localStorage.setItem("token", data.token);
    localStorage.setItem("userEmail", data.email);
    localStorage.setItem("username", data.username);
    location.href = "home.html";
  } catch (error) {
    console.error("Login error:", error);
    showError(error.message || "Login failed. Please check your credentials.");
  } finally {
    setButtonLoading("login-btn", false);
  }
}

function logout() {
  if (confirm("Are you sure you want to logout?")) {
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("username");
    location.href = "index.html";
  }
}

function initMediaUpload() {
  const addMediaBtn = document.getElementById("addMediaBtn");
  const mediaInput = document.getElementById("mediaInput");
  
  if (addMediaBtn && mediaInput) {
    addMediaBtn.addEventListener('click', function() {
      mediaInput.click();
    });
    mediaInput.addEventListener('change', handleMediaSelect);
  }
}

function handleMediaSelect(event) {
  const file = event.target.files[0];
  if (!file) return;

  if (file.size > 50 * 1024 * 1024) {
    alert("File size must be less than 50MB");
    return;
  }

  if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
    alert("Only images and videos are allowed");
    return;
  }

  selectedMedia = file;
  
  const previewDiv = document.getElementById("mediaPreview");
  if (!previewDiv) return;
  
  const reader = new FileReader();

  reader.onload = function(e) {
    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-media';
    removeBtn.innerHTML = '×';
    removeBtn.addEventListener('click', removeMedia);
    
    previewDiv.innerHTML = '';
    
    if (file.type.startsWith('image/')) {
      const img = document.createElement('img');
      img.src = e.target.result;
      img.alt = 'Preview';
      previewDiv.appendChild(img);
    } else if (file.type.startsWith('video/')) {
      const video = document.createElement('video');
      video.src = e.target.result;
      video.controls = true;
      previewDiv.appendChild(video);
    }
    
    previewDiv.appendChild(removeBtn);
  };

  reader.readAsDataURL(file);
}

function removeMedia() {
  selectedMedia = null;
  const previewDiv = document.getElementById("mediaPreview");
  if (previewDiv) previewDiv.innerHTML = "";
  const mediaInput = document.getElementById("mediaInput");
  if (mediaInput) mediaInput.value = "";
}

// ========== AI SUMMARIZATION FEATURE ==========
async function summarizePost(postId) {
  const summaryDiv = document.getElementById(`summary-${postId}`);
  const summarizeBtn = document.getElementById(`summarize-btn-${postId}`);
  
  if (!summaryDiv || !summarizeBtn) {
    console.error('Summary elements not found');
    return;
  }
  
  // Toggle if already shown
  if (summaryDiv.innerHTML && summaryDiv.style.display === 'block') {
    summaryDiv.style.display = 'none';
    summarizeBtn.textContent = '✨ Summarize';
    return;
  }
  
  if (summaryDiv.innerHTML && summaryDiv.style.display === 'none') {
    summaryDiv.style.display = 'block';
    summarizeBtn.textContent = '✨ Hide Summary';
    return;
  }
  
  // Get the post text from the DOM
  const postElement = summarizeBtn.closest('.post, .card');
  if (!postElement) {
    alert('Could not find post element');
    return;
  }
  
  const postTextElement = postElement.querySelector('p');
  if (!postTextElement) {
    alert('Could not find post text');
    return;
  }
  
  const postText = postTextElement.textContent || postTextElement.innerText;
  
  // Show loading
  summarizeBtn.textContent = '⏳ Summarizing...';
  summarizeBtn.disabled = true;
  
  try {
    console.log('📤 Calling summarize API...');
    console.log('Post text:', postText.substring(0, 100) + '...');
    
    // Call backend API
    const response = await fetch(`${API}/api/summarize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ text: postText })
    });
    
    console.log('📥 Response status:', response.status);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to generate summary');
    }
    
    const data = await response.json();
    console.log('✅ Summary received:', data.summary);
    
    summaryDiv.innerHTML = `
      <div class="ai-summary">
        <div class="ai-badge">🤖 AI Summary</div>
        <p>${escapeHtml(data.summary)}</p>
      </div>
    `;
    summaryDiv.style.display = 'block';
    summarizeBtn.textContent = '✨ Hide Summary';
    
  } catch (error) {
    console.error('❌ Summarize error:', error);
    summaryDiv.innerHTML = `
      <div class="ai-summary error">
        <p>⚠️ ${error.message}</p>
      </div>
    `;
    summaryDiv.style.display = 'block';
    summarizeBtn.textContent = '✨ Summarize';
  } finally {
    summarizeBtn.disabled = false;
  }
}

// ========== VOICE COMMENT RECORDING ==========
async function startVoiceRecording(postId) {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    audioChunks = [];
    
    mediaRecorder.ondataavailable = (event) => {
      audioChunks.push(event.data);
    };
    
    mediaRecorder.onstop = () => {
      recordedAudioBlob = new Blob(audioChunks, { type: 'audio/webm' });
      displayAudioPreview(postId);
      stream.getTracks().forEach(track => track.stop());
    };
    
    mediaRecorder.start();
    
    // Update UI
    const recordBtn = document.getElementById('record-voice-btn');
    const stopBtn = document.getElementById('stop-voice-btn');
    if (recordBtn) recordBtn.style.display = 'none';
    if (stopBtn) stopBtn.style.display = 'inline-block';
    
  } catch (error) {
    console.error('Voice recording error:', error);
    alert('Failed to access microphone. Please allow microphone permissions.');
  }
}

function stopVoiceRecording() {
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop();
    
    const recordBtn = document.getElementById('record-voice-btn');
    const stopBtn = document.getElementById('stop-voice-btn');
    if (recordBtn) recordBtn.style.display = 'inline-block';
    if (stopBtn) stopBtn.style.display = 'none';
  }
}

function displayAudioPreview(postId) {
  const previewDiv = document.getElementById('voice-preview');
  if (!previewDiv || !recordedAudioBlob) return;
  
  const audioUrl = URL.createObjectURL(recordedAudioBlob);
  
  previewDiv.innerHTML = `
    <div class="voice-preview-container">
      <audio controls src="${audioUrl}"></audio>
      <button onclick="cancelVoiceComment()" class="cancel-voice-btn">✕</button>
    </div>
  `;
  previewDiv.style.display = 'block';
}

function cancelVoiceComment() {
  recordedAudioBlob = null;
  audioChunks = [];
  const previewDiv = document.getElementById('voice-preview');
  if (previewDiv) {
    previewDiv.innerHTML = '';
    previewDiv.style.display = 'none';
  }
}

async function addVoiceComment(postId) {
  if (!recordedAudioBlob) {
    alert('Please record a voice comment first');
    return;
  }
  
  const formData = new FormData();
  formData.append('voiceComment', recordedAudioBlob, 'voice-comment.webm');
  
  try {
    const response = await fetch(`${API}/posts/${postId}/voice-comment`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });
    
    if (!response.ok) {
      throw new Error('Failed to add voice comment');
    }
    
    alert('✅ Voice comment added successfully!');
    cancelVoiceComment();
    await loadPost();
  } catch (error) {
    console.error('Add voice comment error:', error);
    alert('Failed to add voice comment. Feature may need backend support.');
  }
}

// ========== POST MANAGEMENT ==========
async function loadPosts() {
  hideLoading();
  const feedDiv = document.getElementById("feed");
  if (!feedDiv) return;

  try {
    const response = await fetch(`${API}/posts`);
    const posts = await response.json();

    if (!response.ok) {
      throw new Error("Failed to load posts");
    }

    if (posts.length === 0) {
      feedDiv.innerHTML = "";
      return;
    }

    feedDiv.innerHTML = posts.map(p => {
      const isLiked = p.likes && p.likes.includes(localStorage.getItem('userEmail'));
      const isOwnPost = p.user === localStorage.getItem('userEmail');
      const shouldShowSummarize = p.text.length > 200;
      
      return `
      <div class="post">
        <div class="post-header">
          <span>👤 <strong>@${escapeHtml(p.username)}</strong></span>
          ${isOwnPost ? `<button class="delete-post-btn" onclick="deletePost('${p._id}')">🗑️ Delete</button>` : ''}
        </div>
        <p>${escapeHtml(p.text)}</p>
        ${shouldShowSummarize ? `
          <button class="summarize-btn" id="summarize-btn-${p._id}" onclick="summarizePost('${p._id}')">
            ✨ Summarize
          </button>
          <div id="summary-${p._id}" class="summary-container" style="display: none;"></div>
        ` : ''}
        ${p.sharedFrom ? `<small style="color: #888;">Originally posted by @${escapeHtml(p.sharedFrom.username)}</small><br>` : ''}
        ${p.mediaUrl ? `
          <div class="post-media">
            ${p.mediaType === 'image' ? `<img src="${p.mediaUrl}" alt="Post image">` : `<video controls src="${p.mediaUrl}"></video>`}
          </div>
        ` : ''}
        <div class="post-actions">
          <button class="like-btn ${isLiked ? 'liked' : ''}" onclick="toggleLike('${p._id}', this)">
            ${isLiked ? '❤️' : '🤍'} <span class="like-count">${p.likes ? p.likes.length : 0}</span>
          </button>
          <button class="comment-btn" onclick="location.href='post.html?id=${p._id}'">
            💬 ${p.comments.length}
          </button>
          <button class="share-btn" onclick="sharePost('${p._id}')">
            🔄 Share
          </button>
        </div>
        <small>📅 ${new Date(p.date).toLocaleDateString()} ${new Date(p.date).toLocaleTimeString()}</small><br>
        <a href="post.html?id=${p._id}">View Details →</a>
      </div>
    `;
    }).join("");
  } catch (error) {
    console.error("Load posts error:", error);
  }
}

async function createPost() {
  const textArea = document.getElementById("postText");
  const text = textArea.value.trim();

  if (!text) {
    alert("Please write something before posting");
    return;
  }

  setButtonLoading("post-btn", true);

  try {
    const formData = new FormData();
    formData.append("text", text);
    
    if (selectedMedia) {
      formData.append("media", selectedMedia);
    }

    const response = await fetch(`${API}/posts`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${token}` },
      body: formData
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || "Failed to create post");
    }

    textArea.value = "";
    removeMedia();
    await loadPosts();
    alert("✅ Post created successfully!");
  } catch (error) {
    console.error("Create post error:", error);
    alert(error.message || "Failed to create post");
  } finally {
    setButtonLoading("post-btn", false);
  }
}

async function toggleLike(postId, button) {
  if (!token) {
    alert("Please login to like posts");
    location.href = "index.html";
    return;
  }

  try {
    const response = await fetch(`${API}/posts/${postId}/like`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to like post");
    }

    if (data.liked) {
      button.classList.add('liked');
      button.innerHTML = `❤️ <span class="like-count">${data.likesCount}</span>`;
    } else {
      button.classList.remove('liked');
      button.innerHTML = `🤍 <span class="like-count">${data.likesCount}</span>`;
    }
  } catch (error) {
    console.error("Like error:", error);
    alert(error.message || "Failed to like post");
  }
}

async function deletePost(postId) {
  if (!confirm("Are you sure you want to delete this post?")) {
    return;
  }

  try {
    const response = await fetch(`${API}/posts/${postId}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${token}` }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to delete post");
    }

    alert("✅ Post deleted successfully!");
    
    if (document.getElementById("feed")) {
      await loadPosts();
    } else {
      location.href = "home.html";
    }
  } catch (error) {
    console.error("Delete post error:", error);
    alert(error.message || "Failed to delete post");
  }
}

async function sharePost(postId) {
  if (!confirm("Share this post to your followers?")) {
    return;
  }

  try {
    const response = await fetch(`${API}/posts/${postId}/share`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to share post");
    }

    alert("✅ Post shared successfully!");
    
    if (document.getElementById("feed")) {
      await loadPosts();
    }
  } catch (error) {
    console.error("Share error:", error);
    alert(error.message || "Failed to share post");
  }
}

async function searchPosts() {
  const searchInput = document.getElementById("search");
  const query = searchInput.value.trim();
  const feedDiv = document.getElementById("feed");

  if (!query) {
    loadPosts();
    return;
  }

  try {
    const response = await fetch(`${API}/posts/search/${encodeURIComponent(query)}`);
    const posts = await response.json();

    if (!response.ok) {
      throw new Error("Search failed");
    }

    if (posts.length === 0) {
      feedDiv.innerHTML = '<div class="post"><p style="text-align:center; color: #666;">No posts found</p></div>';
      return;
    }

    feedDiv.innerHTML = posts.map(p => {
      const isLiked = p.likes && p.likes.includes(localStorage.getItem('userEmail'));
      const isOwnPost = p.user === localStorage.getItem('userEmail');
      const shouldShowSummarize = p.text.length > 200;
      
      return `
      <div class="post">
        <div class="post-header">
          <span>👤 <strong>@${escapeHtml(p.username)}</strong></span>
          ${isOwnPost ? `<button class="delete-post-btn" onclick="deletePost('${p._id}')">🗑️ Delete</button>` : ''}
        </div>
        <p>${escapeHtml(p.text)}</p>
        ${shouldShowSummarize ? `
          <button class="summarize-btn" id="summarize-btn-${p._id}" onclick="summarizePost('${p._id}')">
            ✨ Summarize
          </button>
          <div id="summary-${p._id}" class="summary-container" style="display: none;"></div>
        ` : ''}
        ${p.mediaUrl ? `
          <div class="post-media">
            ${p.mediaType === 'image' ? `<img src="${p.mediaUrl}" alt="Post image">` : `<video controls src="${p.mediaUrl}"></video>`}
          </div>
        ` : ''}
        <div class="post-actions">
          <button class="like-btn ${isLiked ? 'liked' : ''}" onclick="toggleLike('${p._id}', this)">
            ${isLiked ? '❤️' : '🤍'} <span class="like-count">${p.likes ? p.likes.length : 0}</span>
          </button>
          <button class="comment-btn" onclick="location.href='post.html?id=${p._id}'">
            💬 ${p.comments.length}
          </button>
          <button class="share-btn" onclick="sharePost('${p._id}')">
            🔄 Share
          </button>
        </div>
        <small>📅 ${new Date(p.date).toLocaleDateString()}</small><br>
        <a href="post.html?id=${p._id}">View Details →</a>
      </div>
    `;
    }).join("");
  } catch (error) {
    console.error("Search error:", error);
  }
}

async function loadPost() {
  hideLoading();
  const postDiv = document.getElementById("post");
  if (!postDiv) return;

  const params = new URLSearchParams(location.search);
  const id = params.get("id");

  if (!id) {
    postDiv.innerHTML = '<div class="card"><p>Invalid post ID</p></div>';
    return;
  }

  try {
    const response = await fetch(`${API}/posts/${id}`);
    const post = await response.json();

    if (!response.ok) {
      throw new Error("Post not found");
    }

    const isLiked = post.likes && post.likes.includes(localStorage.getItem('userEmail'));
    const isOwnPost = post.user === localStorage.getItem('userEmail');
    const shouldShowSummarize = post.text.length > 200;
    
    postDiv.innerHTML = `
      <div class="card">
        <div class="post-header">
          <span>👤 <strong>@${escapeHtml(post.username)}</strong></span>
          ${isOwnPost ? `<button class="delete-post-btn" onclick="deletePost('${post._id}')">🗑️ Delete Post</button>` : ''}
        </div>
        <p style="font-size: 16px; margin-bottom: 15px;">${escapeHtml(post.text)}</p>
        ${shouldShowSummarize ? `
          <button class="summarize-btn" id="summarize-btn-${post._id}" onclick="summarizePost('${post._id}')">
            ✨ Summarize with AI
          </button>
          <div id="summary-${post._id}" class="summary-container" style="display: none;"></div>
        ` : ''}
        ${post.mediaUrl ? `
          <div class="post-media">
            ${post.mediaType === 'image' ? `<img src="${post.mediaUrl}" alt="Post image">` : `<video controls src="${post.mediaUrl}"></video>`}
          </div>
        ` : ''}
        
        <div class="post-actions">
          <button class="like-btn ${isLiked ? 'liked' : ''}" onclick="toggleLike('${post._id}', this)">
            ${isLiked ? '❤️' : '🤍'} <span class="like-count">${post.likes ? post.likes.length : 0}</span>
          </button>
          <button class="share-btn" onclick="sharePost('${post._id}')">
            🔄 Share
          </button>
        </div>
        
        <small>📅 ${new Date(post.date).toLocaleDateString()} ${new Date(post.date).toLocaleTimeString()}</small>
        
        <h3 style="margin-top: 25px; margin-bottom: 15px;">💬 Comments (${post.comments.length})</h3>
        
        <div class="voice-comment-section">
          <button id="record-voice-btn" onclick="startVoiceRecording('${post._id}')" class="voice-record-btn">
            🎤 Record Voice Comment
          </button>
          <button id="stop-voice-btn" onclick="stopVoiceRecording()" class="voice-stop-btn" style="display: none;">
            ⏹️ Stop Recording
          </button>
          <div id="voice-preview" style="display: none;"></div>
        </div>
        
        ${post.comments.length === 0 ? '<p style="color: #888; text-align: center; padding: 20px;">No comments yet. Be the first to comment!</p>' : post.comments.map((c, index) => {
            const isOwnComment = c.user === localStorage.getItem('userEmail');
            return `
              <div class="comment">
                <div class="comment-header">
                  <span>👤 <strong>@${escapeHtml(c.username)}</strong></span>
                  ${isOwnComment ? `<button class="delete-comment-btn" onclick="deleteComment('${post._id}', ${index})">🗑️</button>` : ''}
                </div>
                <p>${escapeHtml(c.text)}</p>
                <small>📅 ${new Date(c.date).toLocaleDateString()}</small>
              </div>
            `;
          }).join("")}
      </div>
    `;
  } catch (error) {
    console.error("Load post error:", error);
    postDiv.innerHTML = '<div class="card"><p style="color: #c33;">Failed to load post</p></div>';
  }
}

async function addComment() {
  const params = new URLSearchParams(location.search);
  const id = params.get("id");
  const textArea = document.getElementById("commentText");
  const text = textArea.value.trim();

  if (!text) {
    alert("Please write a comment");
    return;
  }

  if (!token) {
    alert("Please login to comment");
    location.href = "index.html";
    return;
  }

  setButtonLoading("comment-btn", true);

  try {
    const response = await fetch(`${API}/posts/${id}/comment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ text })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to add comment");
    }

    textArea.value = "";
    await loadPost();
    alert("✅ Comment added successfully!");
  } catch (error) {
    console.error("Add comment error:", error);
    alert(error.message || "Failed to add comment. Please try again.");
  } finally {
    setButtonLoading("comment-btn", false);
  }
}

async function deleteComment(postId, commentIndex) {
  if (!confirm("Are you sure you want to delete this comment?")) {
    return;
  }

  try {
    const response = await fetch(`${API}/posts/${postId}/comment/${commentIndex}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${token}` }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to delete comment");
    }

    alert("✅ Comment deleted successfully!");
    await loadPost();
  } catch (error) {
    console.error("Delete comment error:", error);
    alert(error.message || "Failed to delete comment");
  }
}

// ========== PEXELS API INTEGRATION ==========
async function loadPexelsMedia() {
  hideLoading();
  const exploreGrid = document.getElementById("explore-grid");
  if (!exploreGrid) return;

  exploreGrid.innerHTML = '<div class="loading-message">Loading amazing content...</div>';

  try {
    const [photosResponse, videosResponse] = await Promise.all([
      fetch(`${PEXELS_PHOTOS_API}?per_page=15&page=${Math.floor(Math.random() * 10) + 1}`, {
        headers: { "Authorization": PEXELS_API_KEY }
      }),
      fetch(`${PEXELS_VIDEOS_API}?per_page=9&page=${Math.floor(Math.random() * 5) + 1}`, {
        headers: { "Authorization": PEXELS_API_KEY }
      })
    ]);

    if (!photosResponse.ok || !videosResponse.ok) {
      throw new Error("Failed to fetch media from Pexels");
    }

    const photosData = await photosResponse.json();
    const videosData = await videosResponse.json();

    const allMedia = [
      ...photosData.photos.map(photo => ({
        type: 'image',
        id: photo.id,
        url: photo.src.large,
        thumbnail: photo.src.medium,
        photographer: photo.photographer,
        photographerUrl: photo.photographer_url,
        alt: photo.alt || 'Beautiful image'
      })),
      ...videosData.videos.map(video => ({
        type: 'video',
        id: video.id,
        url: video.video_files[0].link,
        thumbnail: video.image,
        photographer: video.user.name,
        photographerUrl: video.user.url,
        alt: 'Amazing video'
      }))
    ];

    const shuffledMedia = allMedia.sort(() => Math.random() - 0.5);

    exploreGrid.innerHTML = shuffledMedia.map(media => `
      <div class="explore-card" onclick="openMediaModal('${media.type}', '${media.url}', '${escapeHtml(media.photographer)}', '${media.photographerUrl}')">
        <div class="explore-media">
          ${media.type === 'image' 
            ? `<img src="${media.thumbnail}" alt="${escapeHtml(media.alt)}" loading="lazy">` 
            : `
              <div class="video-thumbnail">
                <img src="${media.thumbnail}" alt="${escapeHtml(media.alt)}" loading="lazy">
                <div class="play-icon">▶</div>
              </div>
            `
          }
        </div>
        <div class="explore-info">
          <span class="photographer">📷 ${escapeHtml(media.photographer)}</span>
        </div>
      </div>
    `).join("");

  } catch (error) {
    console.error("Load Pexels media error:", error);
    exploreGrid.innerHTML = `
      <div class="error-message">
        <p>⚠️ Failed to load content</p>
        <p style="font-size: 14px; margin-top: 10px;">Please make sure you've added your Pexels API key in app.js</p>
        <button onclick="loadPexelsMedia()" style="margin-top: 15px; padding: 10px 20px; background: #667eea; color: white; border: none; border-radius: 5px; cursor: pointer;">Try Again</button>
      </div>
    `;
  }
}

function openMediaModal(type, url, photographer, photographerUrl) {
  const modal = document.getElementById("media-modal");
  const modalContent = document.getElementById("modal-content");
  
  if (!modal || !modalContent) return;

  modalContent.innerHTML = `
    <span class="close-modal" onclick="closeMediaModal()">&times;</span>
    ${type === 'image' 
      ? `<img src="${url}" alt="Full size image" style="max-width: 100%; max-height: 80vh; border-radius: 8px;">` 
      : `<video controls autoplay style="max-width: 100%; max-height: 80vh; border-radius: 8px;">
           <source src="${url}" type="video/mp4">
         </video>`
    }
    <p style="margin-top: 15px; text-align: center; color: #888;">
      Photo/Video by <a href="${photographerUrl}" target="_blank" style="color: #667eea; text-decoration: none;">${escapeHtml(photographer)}</a> on Pexels
    </p>
  `;

  modal.style.display = "flex";
}

function closeMediaModal() {
  const modal = document.getElementById("media-modal");
  if (modal) {
    modal.style.display = "none";
    const video = modal.querySelector("video");
    if (video) video.pause();
  }
}

window.onclick = function(event) {
  const modal = document.getElementById("media-modal");
  if (event.target === modal) {
    closeMediaModal();
  }
}

// ========== USER MANAGEMENT ==========
async function loadUsers() {
  hideLoading();
  const userListDiv = document.getElementById("user-list");
  if (!userListDiv) return;

  try {
    await loadCurrentUser();
    
    if (!currentUser) {
      userListDiv.innerHTML = '<div class="card"><p style="text-align:center;">Please refresh the page</p></div>';
      return;
    }

    const response = await fetch(`${API}/users`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    const users = await response.json();

    if (!response.ok) {
      throw new Error("Failed to load users");
    }

    if (users.length === 0) {
      userListDiv.innerHTML = '<div class="card"><p style="text-align:center;">No users found</p></div>';
      return;
    }

    const validUsers = users.filter(u => u.username && u.username !== 'undefined');
    userListDiv.innerHTML = validUsers.map(user => renderUserCard(user)).join("");
  } catch (error) {
    console.error("Load users error:", error);
    userListDiv.innerHTML = '<div class="card"><p style="text-align:center; color: #c33;">Failed to load users</p></div>';
  }
}

async function searchUsers() {
  const searchInput = document.getElementById("user-search");
  const query = searchInput.value.trim();
  const resultsDiv = document.getElementById("search-results");
  const userListDiv = document.getElementById("user-list");

  if (!query) {
    resultsDiv.innerHTML = "";
    userListDiv.style.display = "block";
    return;
  }

  userListDiv.style.display = "none";

  try {
    await loadCurrentUser();
    
    if (!currentUser) {
      resultsDiv.innerHTML = '<div class="card"><p style="text-align:center;">Please refresh the page</p></div>';
      return;
    }

    const response = await fetch(`${API}/users/search/${encodeURIComponent(query)}`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    const users = await response.json();

    if (!response.ok) {
      throw new Error("Search failed");
    }

    if (users.length === 0) {
      resultsDiv.innerHTML = '<div class="card"><p style="text-align:center;">No users found</p></div>';
      return;
    }

    const validUsers = users.filter(u => u.username && u.username !== 'undefined');
    resultsDiv.innerHTML = validUsers.map(user => renderUserCard(user)).join("");
  } catch (error) {
    console.error("Search users error:", error);
    resultsDiv.innerHTML = '<div class="card"><p style="text-align:center; color: #c33;">Search failed</p></div>';
  }
}

function renderUserCard(user) {
  if (!currentUser) return "";
  
  const isFollowing = currentUser.following && currentUser.following.includes(user.email);
  const isOwnProfile = user.email === currentUser.email;

  return `
    <div class="user-card">
      <div class="user-info">
        <h4>@${escapeHtml(user.username)}</h4>
        <p>${escapeHtml(user.bio)}</p>
        <div class="user-stats">
          <span class="stat"><strong>${user.followers ? user.followers.length : 0}</strong> Followers</span>
          <span class="stat"><strong>${user.following ? user.following.length : 0}</strong> Following</span>
        </div>
      </div>
      <div class="user-actions">
        ${!isOwnProfile ? `
          <button class="${isFollowing ? 'unfollow-btn' : 'follow-btn'}" onclick="event.preventDefault(); ${isFollowing ? 'unfollowUser' : 'followUser'}('${escapeHtml(user.username)}')">
            ${isFollowing ? 'Unfollow' : 'Follow'}
          </button>
        ` : ''}
        <button class="view-profile-btn" onclick="event.preventDefault(); location.href='profile.html?username=${encodeURIComponent(user.username)}'">
          View Profile
        </button>
      </div>
    </div>
  `;
}

async function followUser(username) {
  if (!username) {
    alert("Invalid username");
    return;
  }

  try {
    const response = await fetch(`${API}/users/follow/${encodeURIComponent(username)}`, {
      method: "POST",
      headers: { 
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to follow user");
    }

    alert(`✅ You are now following @${username}`);
    await loadCurrentUser();

    if (document.getElementById("user-list")) await loadUsers();
    if (document.getElementById("search-results") && document.getElementById("search-results").innerHTML) await searchUsers();
    if (document.getElementById("profile-content")) await loadProfile();
  } catch (error) {
    console.error("Follow error:", error);
    alert(error.message || "Failed to follow user. Please try again.");
  }
}

async function unfollowUser(username) {
  if (!username) {
    alert("Invalid username");
    return;
  }

  try {
    const response = await fetch(`${API}/users/unfollow/${encodeURIComponent(username)}`, {
      method: "POST",
      headers: { 
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to unfollow user");
    }

    alert(`✅ You unfollowed @${username}`);
    await loadCurrentUser();

    if (document.getElementById("user-list")) await loadUsers();
    if (document.getElementById("search-results") && document.getElementById("search-results").innerHTML) await searchUsers();
    if (document.getElementById("profile-content")) await loadProfile();
  } catch (error) {
    console.error("Unfollow error:", error);
    alert(error.message || "Failed to unfollow user. Please try again.");
  }
}

async function loadProfile() {
   console.log('=== loadProfile called ===');
  console.log('Token:', token);
  console.log('localStorage token:', localStorage.getItem('token'));
  console.log('API:', API);
  hideLoading();
  const profileDiv = document.getElementById("profile-content");
  if (!profileDiv) return;

  const params = new URLSearchParams(location.search);
  const username = params.get("username");

  try {
    let user;

    if (username && username !== "undefined" && username !== "null") {
      // Loading someone else's profile
      const response = await fetch(`${API}/users/profile/${encodeURIComponent(username)}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error("User not found");
      }

      user = await response.json();
    } else {
      // Loading MY profile - use /users/me endpoint
      const response = await fetch(`${API}/users/me`, {
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Token invalid - redirect to login
          localStorage.clear();
          window.location.href = '/index.html';
          return;
        }
        throw new Error("Failed to load profile");
      }

      user = await response.json();
      currentUser = user; // Update currentUser
    }

    if (!user) {
      throw new Error("User not found");
    }

    // Load currentUser if not already loaded
    if (!currentUser) {
      const meResponse = await fetch(`${API}/users/me`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (meResponse.ok) {
        currentUser = await meResponse.json();
      }
    }

    const isFollowing = currentUser && currentUser.following && currentUser.following.includes(user.email);
    const isOwnProfile = currentUser && user.email === currentUser.email;

    profileDiv.innerHTML = `
      <div class="profile-header">
        <div class="profile-avatar">${user.username.charAt(0).toUpperCase()}</div>
        <h2>@${escapeHtml(user.username)}</h2>
        <p>${escapeHtml(user.email)}</p>
        <p style="color: #888; font-style: italic;">${escapeHtml(user.bio || 'No bio yet')}</p>
        
        ${!isOwnProfile ? `
          <button class="${isFollowing ? 'unfollow-btn' : 'follow-btn'}" onclick="event.preventDefault(); ${isFollowing ? 'unfollowUser' : 'followUser'}('${escapeHtml(user.username)}')" style="width: 200px; margin: 15px auto 0;">
            ${isFollowing ? 'Unfollow' : 'Follow'}
          </button>
        ` : ''}
        
        <div class="profile-stats">
          <div class="profile-stat">
            <strong>${user.followers ? user.followers.length : 0}</strong>
            <span>Followers</span>
          </div>
          <div class="profile-stat">
            <strong>${user.following ? user.following.length : 0}</strong>
            <span>Following</span>
          </div>
          <div class="profile-stat">
            <strong>${new Date(user.createdAt).toLocaleDateString()}</strong>
            <span>Joined</span>
          </div>
        </div>
      </div>
    `;
  } catch (error) {
    console.error("Load profile error:", error);
    profileDiv.innerHTML = `
      <div style="text-align: center; padding: 40px; color: #ff6b6b;">
        <h3>Failed to load profile</h3>
        <p>${error.message}</p>
        <a href="/explore.html" style="color: #c586c0;">← Back to Explore</a>
      </div>
    `;
  }
}

// ========== INITIALIZATION ==========
checkAuth();

if (document.getElementById("feed")) {
  loadCurrentUser();
  loadPosts();
  initMediaUpload();
}

if (location.pathname.includes("post.html")) {
  loadPost();
}

if (location.pathname.includes("explore.html")) {
  loadCurrentUser();
  
  if (document.getElementById("explore-grid")) {
    loadPexelsMedia();
  } else {
    loadUsers();
  }
}

if (location.pathname.includes("profile.html")) {
  loadProfile();
}
