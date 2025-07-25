// Load posts and categories from JSON files
let posts = [];
let categories = [];

// Load data from JSON files
async function loadData() {
    try {
        const postsResponse = await fetch('posts.json');
        posts = await postsResponse.json();
        
        const categoriesResponse = await fetch('categories.json');
        categories = await categoriesResponse.json();
    } catch (error) {
        console.error('Error loading data:', error);
        // Fallback to sample data if JSON files don't exist
    }
}


let currentFilter = 'all';

// Page navigation
function showPage(pageName) {
    const pages = ['home', 'blog', 'cv', 'info', 'post'];
    pages.forEach(page => {
        document.getElementById(page + '-page').classList.add('hidden');
    });
    document.getElementById(pageName + '-page').classList.remove('hidden');
    
    if (pageName === 'blog') {
        loadPosts();
    }
}

// Time display
function updateTime() {
    const now = new Date();
    const romeTime = new Date(now.toLocaleString("en-US", {timeZone: "Europe/Rome"}));
    const timeString = romeTime.toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    document.getElementById('time-display').textContent = timeString;
}

// Weather API
async function loadWeather() {
    try {
        // Using a free weather API - replace with your actual API key
        const apiKey = 'YOUR_API_KEY'; // Replace with actual OpenWeatherMap API key
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=Rome,IT&appid=${apiKey}&units=metric`);
        
        if (!response.ok) {
            throw new Error('Weather API not available');
        }
        
        const data = await response.json();
        const weatherText = `${data.weather[0].description}, ${Math.round(data.main.temp)}°C`;
        document.getElementById('weather-display').textContent = weatherText;
    } catch (error) {
        // Fallback when API is not available
        document.getElementById('weather-display').textContent = 'Partly Cloudy, 22°C';
    }
}

// Blog functions
function loadPosts() {
    const postList = document.getElementById('post-list');
    postList.innerHTML = '';
    
    const filteredPosts = currentFilter === 'all' 
        ? posts 
        : posts.filter(post => post.category === currentFilter);
    
    filteredPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    filteredPosts.forEach(post => {
        const postElement = createPostElement(post);
        postList.appendChild(postElement);
    });
}

function createPostElement(post) {
    const postDiv = document.createElement('div');
    postDiv.className = 'post-item';
    
    const preview = post.content.length > 300 
        ? post.content.substring(0, 300) + '...'
        : post.content;
    
    const needsReadMore = post.content.length > 300;
    
    postDiv.innerHTML = `
        <div class="post-title" onclick="openPost(${post.id})">${post.title}</div>
        <div class="post-meta">${formatDate(post.date)} • ${capitalizeFirst(post.category)}</div>
        <div class="post-preview">${preview}</div>
        ${needsReadMore ? `<span class="read-more" onclick="openPost(${post.id})">Read more</span>` : ''}
    `;
    
    return postDiv;
}

function filterPosts(category) {
    currentFilter = category;
    
    // Update active button
    document.querySelectorAll('.category-filter button').forEach(btn => {
        btn.classList.remove('active');
    });
    document.getElementById('filter-' + category).classList.add('active');
    
    loadPosts();
}

function openPost(postId) {
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    
    const postContent = document.getElementById('post-content');
    postContent.innerHTML = `
        <h2>${post.title}</h2>
        <div class="post-meta">${formatDate(post.date)} • ${capitalizeFirst(post.category)}</div>
        <div style="margin-top: 30px; line-height: 1.8;">${post.content}</div>
    `;
    
    showPage('post');
}

function closePost() {
    showPage('blog');
}

// Utility functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Initialize
document.addEventListener('DOMContentLoaded', async function() {
    await loadData();
    updateTime();
    setInterval(updateTime, 1000);
    loadWeather();
    
    // Create placeholder image if it doesn't exist
    const img = document.querySelector('.center-image img');
    img.onerror = function() {
        this.style.display = 'flex';
        this.style.alignItems = 'center';
        this.style.justifyContent = 'center';
        this.innerHTML = 'Rome Skyline Placeholder';
        this.style.backgroundColor = '#f0f0f0';
        this.style.color = '#666';
        this.style.fontSize = '18px';
    };
});
