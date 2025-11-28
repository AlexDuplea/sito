// Load posts and categories from JSON files
let posts = [];
let categories = [];
let dataLoaded = false;

// Load data from JSON files
async function loadData() {
    try {
        const [postsResponse, categoriesResponse] = await Promise.all([
            fetch('posts.json'),
            fetch('categories.json')
        ]);

        if (!postsResponse.ok || !categoriesResponse.ok) {
            throw new Error('Failed to load data');
        }

        posts = await postsResponse.json();
        categories = await categoriesResponse.json();
        dataLoaded = true;

        // Initial load of posts if we are on the blog page
        if (!document.getElementById('blog-page').classList.contains('hidden')) {
            loadPosts();
        }
    } catch (error) {
        console.error('Error loading data:', error);
        // Fallback to sample data if JSON files don't exist or fetch fails (e.g. file:// protocol)
        posts = [
            {
                "id": 1,
                "title": "My First Post",
                "date": "2025-07-24",
                "category": "thoughts",
                "content": "Nothing crazy just the first post"
            },
            {
                "id": 2,
                "title": "Learning How To Render",
                "date": "2025-07-25",
                "category": "coding",
                "content": "I'm currently learning how rendering works for a personal project. In short, I want to experiment with building a sort of engine or at least a modular system that can take instructions and render output in the terminal with perspective. The math involved isn't too difficult, but it definitely requires study. Honestly, I'm a bit surprised that this is the only topic the professor completely skipped in the course."
            }
        ];
        categories = [
            { "id": "university", "name": "University" },
            { "id": "coding", "name": "Coding" },
            { "id": "life", "name": "Life" },
            { "id": "thoughts", "name": "Thoughts" }
        ];
        dataLoaded = true;

        if (!document.getElementById('blog-page').classList.contains('hidden')) {
            loadPosts();
        }
    }
}


let currentFilter = 'all';

// Page navigation
function showPage(pageName) {
    const pages = ['home', 'blog', 'cv', 'info', 'post'];
    pages.forEach(page => {
        const el = document.getElementById(page + '-page');
        if (el) el.classList.add('hidden');
    });

    const targetPage = document.getElementById(pageName + '-page');
    if (targetPage) {
        targetPage.classList.remove('hidden');
    }

    if (pageName === 'blog') {
        if (dataLoaded) {
            loadPosts();
        } else {
            // Data will be loaded by loadData() when it finishes
            document.getElementById('post-list').innerHTML = '<div style="text-align:center">Loading posts...</div>';
        }
    }
}

// Time display
function updateTime() {
    const now = new Date();
    const romeTime = new Date(now.toLocaleString("en-US", { timeZone: "Europe/Rome" }));
    const timeString = romeTime.toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    const timeDisplay = document.getElementById('time-display');
    if (timeDisplay) timeDisplay.textContent = timeString;
}

// Weather API
async function loadWeather() {
    const weatherDisplay = document.getElementById('weather-display');
    if (!weatherDisplay) return;

    try {
        // Check if API key is configured (basic check)
        const apiKey = 'YOUR_API_KEY';
        if (apiKey === 'YOUR_API_KEY') {
            throw new Error('API Key not configured');
        }

        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=Rome,IT&appid=${apiKey}&units=metric`);

        if (!response.ok) {
            throw new Error('Weather API not available');
        }

        const data = await response.json();
        const weatherText = `${data.weather[0].description}, ${Math.round(data.main.temp)}°C`;
        weatherDisplay.textContent = weatherText;
    } catch (error) {
        // Fallback when API is not available
        weatherDisplay.textContent = 'Partly Cloudy, 22°C';
    }
}

// Blog functions
function loadPosts() {
    const postList = document.getElementById('post-list');
    if (!postList) return;

    postList.innerHTML = '';

    const filteredPosts = currentFilter === 'all'
        ? posts
        : posts.filter(post => post.category === currentFilter);

    filteredPosts.sort((a, b) => new Date(b.date) - new Date(a.date));

    if (filteredPosts.length === 0) {
        postList.innerHTML = '<div style="text-align:center; margin-top: 20px;">No posts found.</div>';
        return;
    }

    filteredPosts.forEach(post => {
        const postElement = createPostElement(post);
        postList.appendChild(postElement);
    });
}

function createPostElement(post) {
    const postDiv = document.createElement('div');
    postDiv.className = 'post-item';

    // Security: Use textContent for preview to prevent XSS in preview
    const tempDiv = document.createElement('div');
    tempDiv.textContent = post.content;
    const plainText = tempDiv.textContent;

    const preview = plainText.length > 300
        ? plainText.substring(0, 300) + '...'
        : plainText;

    const needsReadMore = plainText.length > 300;

    // We construct the HTML structure but insert user content safely
    // Title
    const titleDiv = document.createElement('div');
    titleDiv.className = 'post-title';
    titleDiv.textContent = post.title;
    titleDiv.addEventListener('click', () => openPost(post.id));

    // Meta
    const metaDiv = document.createElement('div');
    metaDiv.className = 'post-meta';
    metaDiv.textContent = `${formatDate(post.date)} • ${capitalizeFirst(post.category)}`;

    // Preview
    const previewDiv = document.createElement('div');
    previewDiv.className = 'post-preview';
    previewDiv.textContent = preview;

    postDiv.appendChild(titleDiv);
    postDiv.appendChild(metaDiv);
    postDiv.appendChild(previewDiv);

    if (needsReadMore) {
        const readMoreSpan = document.createElement('span');
        readMoreSpan.className = 'read-more';
        readMoreSpan.textContent = 'Read more';
        readMoreSpan.addEventListener('click', () => openPost(post.id));
        postDiv.appendChild(readMoreSpan);
    }

    return postDiv;
}

function filterPosts(category) {
    currentFilter = category;

    // Update active button
    document.querySelectorAll('.category-filter button').forEach(btn => {
        btn.classList.remove('active');
    });
    const activeBtn = document.querySelector(`.category-filter button[data-filter="${category}"]`);
    if (activeBtn) activeBtn.classList.add('active');

    loadPosts();
}

function openPost(postId) {
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    const postContent = document.getElementById('post-content');
    if (!postContent) return;

    // Clear previous content
    postContent.innerHTML = '';

    const h2 = document.createElement('h2');
    h2.textContent = post.title;

    const meta = document.createElement('div');
    meta.className = 'post-meta';
    meta.textContent = `${formatDate(post.date)} • ${capitalizeFirst(post.category)}`;

    const contentDiv = document.createElement('div');
    contentDiv.style.marginTop = '30px';
    contentDiv.style.lineHeight = '1.8';
    // For the full post, we'll allow HTML if the user intends it, 
    // but since the current JSON is plain text, textContent is safer.
    // However, to support future HTML posts, we might use innerHTML.
    // Given the task "Sanitize... using a simple text node approach if content is plain text",
    // and the current data is plain text, I will use textContent for safety.
    // If rich text is needed later, a sanitizer library should be used.
    contentDiv.textContent = post.content;

    postContent.appendChild(h2);
    postContent.appendChild(meta);
    postContent.appendChild(contentDiv);

    showPage('post');
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
document.addEventListener('DOMContentLoaded', async function () {
    // Event Delegation for Navigation
    document.body.addEventListener('click', function (e) {
        // Handle navigation links
        if (e.target.matches('nav a') || e.target.closest('nav a')) {
            const link = e.target.matches('nav a') ? e.target : e.target.closest('nav a');
            const page = link.getAttribute('data-page');
            if (page) {
                e.preventDefault();
                showPage(page);
            }
        }

        // Handle filter buttons
        if (e.target.matches('.category-filter button')) {
            const filter = e.target.getAttribute('data-filter');
            if (filter) {
                filterPosts(filter);
            }
        }

        // Handle "Alex Duplea" home links
        if (e.target.closest('h1 a')) {
            const link = e.target.closest('h1 a');
            const page = link.getAttribute('data-page');
            if (page) {
                e.preventDefault();
                showPage(page);
            }
        }
    });

    await loadData();
    updateTime();
    setInterval(updateTime, 1000);
    loadWeather();

    // Create placeholder image if it doesn't exist
    const img = document.querySelector('.center-image img');
    if (img) {
        img.onerror = function () {
            this.style.display = 'flex';
            this.style.alignItems = 'center';
            this.style.justifyContent = 'center';
            this.innerHTML = 'Rome Skyline Placeholder'; // This might not work on img tag, but style changes will
            // For img tag, innerHTML doesn't work. We can replace it with a div.
            const div = document.createElement('div');
            div.style.width = this.getAttribute('width') + 'px';
            div.style.height = this.getAttribute('height') + 'px';
            div.style.background = '#f0f0f0';
            div.style.display = 'flex';
            div.style.alignItems = 'center';
            div.style.justifyContent = 'center';
            div.style.color = '#666';
            div.style.margin = '0 auto';
            div.textContent = 'Rome Skyline Placeholder';
            this.parentNode.replaceChild(div, this);
        };
    }
});
