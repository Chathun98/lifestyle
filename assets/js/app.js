const GROQ_API_KEY = "gsk_YOUR_API_KEY_HERE"; // Replace with your key for local dev or use env vars
const MONETAG_LINK = "https://omg10.com/4/10565898";

// ---------------------------------------------------------
// 1. DATA & FALLBACKS
// ---------------------------------------------------------

const FALLBACK_NEWS = [
    { title: "Royal Family's Secret Summer Plans", category: "Royalty", image_keyword: "royal-palace" },
    { title: "Top 10 Street Style Trends London 2026", category: "Fashion", image_keyword: "london-fashion" },
    { title: "Hidden Gems: New York's Speakeasies", category: "Travel", image_keyword: "cocktails" },
    { title: "Hollywood's Shocking New Power Couple", category: "Gossip", image_keyword: "celebrity-couple" },
    { title: "Wellness Hacks: The Matcha Craze", category: "Lifestyle", image_keyword: "matcha-tea" },
    { title: "Tech Billionaires Buy Island in Hawaii", category: "News", image_keyword: "hawaii-luxury" },
    { title: "Viral Meaning Behind That TikTok Sound", category: "Viral", image_keyword: "tiktok-trend" },
    { title: "Met Gala 2026: Theme Predictions", category: "Fashion", image_keyword: "fashion-gala" }
];

// ---------------------------------------------------------
// 2. API HANDLING
// ---------------------------------------------------------

async function callGroqAPI(messages) {
    const url = "https://api.groq.com/openai/v1/chat/completions";
    const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GROQ_API_KEY}`
    };
    const body = {
        model: "llama3-70b-8192", // Using 70b logic here for consistency
        messages: messages,
        temperature: 0.7,
        max_tokens: 1024
    };

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: headers,
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            console.warn(`Groq API Error: ${response.status}`);
            return null;
        }

        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        console.error("Groq API Network Error:", error);
        return null;
    }
}

// ---------------------------------------------------------
// 3. IMAGE HANDLING
// ---------------------------------------------------------

function getImageUrl(keyword) {
    // Strategy: Pollinations (AI) -> Unsplash Source (Real) -> Picsum (Random) -> Placeholder (Text)
    // We add a timestamp to bypass aggressive browser caching
    const seed = Math.floor(Math.random() * 10000);
    return `https://image.pollinations.ai/prompt/${encodeURIComponent(keyword)}?width=800&height=600&nologo=true&seed=${seed}`;
}

// Global handler for image errors 
window.handleImageError = function (img) {
    const errorCount = parseInt(img.getAttribute('data-error-count') || '0');

    if (errorCount > 2) {
        // Ultimate Fallback: Text Placeholder
        img.src = "https://placehold.co/800x600?text=Image+Unavailable";
        return;
    }

    img.setAttribute('data-error-count', errorCount + 1);

    // Fallback Chain
    if (errorCount === 0) {
        // Try Unsplash Source (Random matching keyword)
        const keyword = img.alt.split(' ').slice(-1)[0] || 'lifestyle';
        img.src = `https://source.unsplash.com/800x600/?${encodeURIComponent(keyword)}&t=${new Date().getTime()}`;
    } else if (errorCount === 1) {
        // Try Picsum (Random Abstract)
        const randomId = Math.floor(Math.random() * 1000);
        img.src = `https://picsum.photos/seed/${randomId}/800/600`;
    }

    console.warn(`Image failed, switching to backup ${errorCount + 1} for`, img);
};

// ... existing fetchNews and renderFeed functions ...

// ---------------------------------------------------------
// 6. INITIALIZATION
// ---------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
    // Page Router
    if (document.getElementById('articles-grid')) {
        fetchNews();
    } else if (document.getElementById('article-content')) {
        const params = new URLSearchParams(window.location.search);
        const topic = params.get('q');
        if (topic) {
            generateArticle(topic);
        } else {
            window.location.href = 'index.html';
        }
    }

    // Hashtag Click Handlers (Sidebar)
    const hashtags = document.querySelectorAll('#hashtags-container span');
    hashtags.forEach(tag => {
        tag.addEventListener('click', (e) => {
            const topic = e.target.innerText.replace('#', '');
            window.location.href = `article.html?q=${encodeURIComponent(topic + ' Trend')}`;
        });
    });

    // Mobile Menu
    const btn = document.getElementById('mobile-menu-btn');
    const menu = document.getElementById('mobile-menu');
    if (btn && menu) {
        btn.addEventListener('click', () => menu.classList.toggle('hidden'));
    }
});

// Expanded Fallback topics to simulate updates if API is down

