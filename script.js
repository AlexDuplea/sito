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

        // Generate filter buttons from categories
        generateFilterButtons();

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

        generateFilterButtons();

        if (!document.getElementById('blog-page').classList.contains('hidden')) {
            loadPosts();
        }
    }
}


let currentFilter = 'all';

// Show skeleton loading state
function showSkeletonLoading() {
    const postList = document.getElementById('post-list');
    if (!postList) return;
    
    let skeletonHTML = '';
    for (let i = 0; i < 3; i++) {
        skeletonHTML += `
            <div class="skeleton-post">
                <div class="skeleton skeleton-title"></div>
                <div class="skeleton skeleton-meta"></div>
                <div class="skeleton skeleton-preview"></div>
                <div class="skeleton skeleton-preview"></div>
                <div class="skeleton skeleton-preview"></div>
            </div>
        `;
    }
    postList.innerHTML = skeletonHTML;
}

// Page navigation
function showPage(pageName, updateHistory = true) {
    const pages = ['home', 'blog', 'cv', 'info', 'post'];
    
    // Fade out current page
    pages.forEach(page => {
        const el = document.getElementById(page + '-page');
        if (el && !el.classList.contains('hidden')) {
            el.style.opacity = '0';
        }
    });

    setTimeout(() => {
        pages.forEach(page => {
            const el = document.getElementById(page + '-page');
            if (el) el.classList.add('hidden');
        });

        const targetPage = document.getElementById(pageName + '-page');
        if (targetPage) {
            targetPage.classList.remove('hidden');
            targetPage.style.opacity = '0';
            // Trigger reflow then fade in
            requestAnimationFrame(() => {
                targetPage.style.opacity = '1';
            });
            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        // Update URL
        if (updateHistory) {
            const url = pageName === 'home' ? '#' : '#' + pageName;
            history.pushState({ page: pageName }, '', url);
        }

        if (pageName === 'blog') {
            if (dataLoaded) {
                loadPosts();
            } else {
                showSkeletonLoading();
            }
        }
    }, 150);
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
        const emptyMessages = [
            "The void stares back... no posts here.",
            "Tumbleweeds roll by... nothing to see.",
            "404: Posts not found. Have you tried turning it off and on again?",
            "This category is emptier than my coffee cup on Monday.",
            "No posts. The hamsters powering this blog took a break.",
            "Plot twist: the posts were the friends we made along the way.",
            
            "The posts are in another castle.",
            "Schrödinger's posts: they exist until you look for them.",
            "INSERT POSTS HERE (TODO: write actual content)",
            "This space intentionally left blank... or is it?",
            "The posts went out for milk. They'll be back soon.",
            
            "Have you checked under the couch cushions?",
            "The posts are on vacation. Partly cloudy there too."
        ];
        const randomMsg = emptyMessages[Math.floor(Math.random() * emptyMessages.length)];
        postList.innerHTML = `<div style="text-align:center; margin-top: 20px; font-style: italic;">${randomMsg}</div>`;
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

    // Update active button and aria-pressed
    document.querySelectorAll('.category-filter button').forEach(btn => {
        btn.classList.remove('active');
        btn.setAttribute('aria-pressed', 'false');
    });
    const activeBtn = document.querySelector(`.category-filter button[data-filter="${category}"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
        activeBtn.setAttribute('aria-pressed', 'true');
    }

    loadPosts();
}

function openPost(postId) {
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    const postContent = document.getElementById('post-content');
    if (!postContent) return;

    // Clear previous content
    postContent.innerHTML = '';

    // Back to blog link
    const backLink = document.createElement('a');
    backLink.href = '#blog';
    backLink.className = 'back-link';
    backLink.textContent = '← Back to Blog';
    backLink.addEventListener('click', (e) => {
        e.preventDefault();
        showPage('blog');
    });

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

    postContent.appendChild(backLink);
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

// Generate navigation for each page
function generateNavigation() {
    // Fixed order: Blog, CV, Info (always the same)
    const navLinks = ['blog', 'cv', 'info'];
    const pages = ['home', 'blog', 'cv', 'info', 'post'];

    pages.forEach(pageId => {
        const page = document.getElementById(pageId + '-page');
        if (!page) return;

        const nav = page.querySelector('nav');
        if (!nav) return;

        nav.innerHTML = navLinks.map(link =>
            `<a href="#${link}" data-page="${link}">${capitalizeFirst(link)}</a>`
        ).join('');
    });
}

// Generate filter buttons from categories
function generateFilterButtons() {
    const filterContainer = document.querySelector('.category-filter');
    if (!filterContainer) return;

    filterContainer.innerHTML = '';
    
    // Add "All" button first
    const allBtn = document.createElement('button');
    allBtn.setAttribute('data-filter', 'all');
    allBtn.setAttribute('aria-pressed', 'true');
    allBtn.className = 'active';
    allBtn.textContent = 'All';
    filterContainer.appendChild(allBtn);

    // Add category buttons from JSON
    categories.forEach(cat => {
        const btn = document.createElement('button');
        btn.setAttribute('data-filter', cat.id);
        btn.setAttribute('aria-pressed', 'false');
        btn.textContent = cat.name;
        filterContainer.appendChild(btn);
    });
}

// Initialize
document.addEventListener('DOMContentLoaded', async function () {
    // Generate navigation dynamically
    generateNavigation();

    // Display last updated date from meta tag
    const lastUpdatedMeta = document.querySelector('meta[name="last-updated"]');
    const cvLastUpdatedTop = document.getElementById('cv-last-updated-top');
    if (lastUpdatedMeta && cvLastUpdatedTop) {
        const dateStr = lastUpdatedMeta.getAttribute('content');
        const date = new Date(dateStr);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        cvLastUpdatedTop.textContent = `last updated on ${day}/${month}/${year}`;
    }

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

    // Handle URL hash on page load
    const hash = window.location.hash.slice(1);
    if (hash && ['blog', 'cv', 'info'].includes(hash)) {
        showPage(hash, false);
    }

    // Handle browser back/forward
    window.addEventListener('popstate', (e) => {
        const page = e.state?.page || 'home';
        showPage(page, false);
    });

    // Keyboard navigation - Escape to go back
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const postPage = document.getElementById('post-page');
            if (postPage && !postPage.classList.contains('hidden')) {
                showPage('blog');
            } else {
                const currentPage = ['blog', 'cv', 'info'].find(p => 
                    !document.getElementById(p + '-page')?.classList.contains('hidden')
                );
                if (currentPage) showPage('home');
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
