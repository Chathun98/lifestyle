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
    // Try Pollinations first with a random seed to avoid caching/limits
    const seed = Math.floor(Math.random() * 10000);
    return `https://image.pollinations.ai/prompt/${encodeURIComponent(keyword)}?width=800&height=600&nologo=true&seed=${seed}`;
}

// Global handler for image errors (Switch to Picsum)
window.handleImageError = function (img) {
    if (img.getAttribute('data-failed')) return;
    img.setAttribute('data-failed', 'true');
    const randomId = Math.floor(Math.random() * 1000);
    img.src = `https://picsum.photos/seed/${randomId}/800/600`;
    console.log("Switched to backup image source.");
};

// ---------------------------------------------------------
// 4. NEWS FEED GENERATION
// ---------------------------------------------------------

async function fetchNews() {
    const grid = document.getElementById("articles-grid");
    const featuredSection = document.getElementById("featured-section");
    if (!grid) return;

    // Loading State
    grid.innerHTML = `
        <div class="col-span-1 md:col-span-2 text-center py-20">
            <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-primary mb-4"></div>
            <p class="text-gray-500 font-medium">Scanning the gossip wires...</p>
        </div>
    `;

    let articles = [];

    // 1. Try Local Generated Feed
    try {
        const localResponse = await fetch('assets/data/feed.json?v=' + new Date().getTime());
        if (localResponse.ok) {
            articles = await localResponse.json();
            console.log("Loaded feed from local JSON.");
        }
    } catch (e) {
        console.warn("Local feed skipped or missing.");
    }

    // 2. If no local feed, use API
    if (articles.length === 0) {
        const prompt = `Generate 6 trending gossip headlines (USA/UK). Return JSON array: [{"title": "...", "snippet": "...", "category": "...", "image_keyword": "..."}]`;
        const jsonResponse = await callGroqAPI([{ role: "user", content: prompt }]);

        try {
            if (jsonResponse) {
                const cleanJson = jsonResponse.replace(/```json/g, "").replace(/```/g, "").trim();
                articles = JSON.parse(cleanJson);
            }
        } catch (e) {
            console.warn("API parsing failed.");
        }
    }

    // 3. Fallback
    if (articles.length === 0) {
        articles = FALLBACK_NEWS.slice(0, 6);
    }

    renderFeed(articles);
}

function renderFeed(articles) {
    const grid = document.getElementById("articles-grid");
    const featuredSection = document.getElementById("featured-section");

    // 1. Render Featured (First Item)
    if (articles.length > 0 && featuredSection) {
        const feat = articles[0];
        document.getElementById("featured-title").innerText = feat.title;
        document.getElementById("featured-snippet").innerText = feat.snippet || "Click to read the full scoop!";
        document.getElementById("featured-link").href = `article.html?q=${encodeURIComponent(feat.title)}`;
        document.getElementById("featured-link").setAttribute("aria-label", `Read full story: ${feat.title}`);

        const featImg = document.getElementById("featured-image");
        featImg.onerror = () => window.handleImageError(featImg);
        featImg.alt = `Featured Story: ${feat.title}`;
        // If feed has image_url, use it, else generate one
        featImg.src = feat.image_url || getImageUrl(feat.image_keyword);

        featuredSection.classList.remove("hidden");
    }

    // 2. Render Grid (Remaining Items)
    grid.innerHTML = "";
    const feedItems = articles.slice(1);

    feedItems.forEach((item, index) => {
        // Insert Ad Card periodically
        if (index === 1) {
            grid.innerHTML += `
                <div class="bg-primary/5 border-2 border-primary/20 rounded-xl p-6 flex flex-col items-center justify-center text-center">
                    <span class="text-xs font-bold text-primary uppercase mb-2">Editor's Pick</span>
                    <h3 class="font-bold text-lg mb-4">Trending Deals</h3>
                    <a href="${MONETAG_LINK}" target="_blank" rel="noopener noreferrer" class="bg-primary text-white px-6 py-2 rounded-full font-bold hover:bg-black transition" aria-label="View trending deals">View Now</a>
                </div>
            `;
        }

        const imgUrl = item.image_url || getImageUrl(item.image_keyword);
        const html = `
            <article class="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition group">
                <a href="article.html?q=${encodeURIComponent(item.title)}" class="block h-48 overflow-hidden relative" aria-label="Read ${item.title}">
                    <img src="${imgUrl}" 
                         class="w-full h-full object-cover transform group-hover:scale-105 transition duration-700"
                         alt="${item.title}"
                         loading="lazy"
                         onerror="window.handleImageError(this)">
                    <span class="absolute top-2 left-2 bg-white/90 backdrop-blur text-xs font-bold px-2 py-1 rounded text-black">${item.category}</span>
                </a>
                <div class="p-5">
                    <h3 class="font-bold text-lg leading-tight mb-2">
                        <a href="article.html?q=${encodeURIComponent(item.title)}" class="hover:text-primary transition">${item.title}</a>
                    </h3>
                    <p class="text-gray-500 text-sm line-clamp-2 mb-4">${item.snippet || "Read the full story..."}</p>
                    <a href="article.html?q=${encodeURIComponent(item.title)}" class="text-primary text-sm font-bold flex items-center gap-1" aria-label="Read more about ${item.title}">
                        Read More <ion-icon name="arrow-forward" aria-hidden="true"></ion-icon>
                    </a>
                </div>
            </article>
        `;
        grid.innerHTML += html;
    });
}
// ---------------------------------------------------------
// 5. ARTICLE GENERATION (WITH AUTO-WRITER)
// ---------------------------------------------------------

async function generateArticle(topic) {
    const titleEl = document.getElementById("article-title");
    const contentEl = document.getElementById("article-content");
    const imgEl = document.getElementById("article-image");

    if (!topic) return;

    // Set Basics
    titleEl.innerText = topic;
    imgEl.onerror = () => window.handleImageError(imgEl);
    imgEl.alt = `Cover image for ${topic}`;
    imgEl.src = getImageUrl(topic.split(' ')[0]);

    // Show Loading Skeleton
    contentEl.innerHTML = `
        <div class="space-y-4 animate-pulse">
            <div class="h-4 bg-gray-200 rounded w-full"></div>
            <div class="h-4 bg-gray-200 rounded w-full"></div>
            <div class="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
    `;

    // Try API for Text
    const prompt = `Write a fun 400-word blog post about "${topic}" (Lifestyle/Gossip). Use <h2> and <p> tags. No markdown.`;
    let content = await callGroqAPI([{ role: "user", content: prompt }]);

    // If API Fails -> Use Local Generator (No empty pages!)
    if (!content) {
        console.warn("API Failed, generating local content...");
        content = generateLocalArticle(topic);
    }

    // Clean and Inject
    content = content.replace(/```html/g, "").replace(/```/g, "");

    // Inject Ad Link if missing
    if (!content.includes(MONETAG_LINK)) {
        const adHtml = `
            <div class="my-8 p-6 bg-pink-50 border-l-4 border-primary rounded">
                <h4 class="font-bold text-gray-800">✨ Exclusive Update</h4>
                <p class="text-sm mb-2">See the leaked photos related to this story.</p>
                <a href="${MONETAG_LINK}" target="_blank" rel="noopener noreferrer" class="inline-block bg-primary text-white font-bold px-6 py-2 rounded-full hover:bg-red-700 transition" aria-label="View exclusive gallery">View Gallery</a>
            </div>
        `;
        // Insert ads after first paragraph or at end
        if (content.includes("</p>")) {
            content = content.replace("</p>", `</p>${adHtml}`);
        } else {
            content += adHtml;
        }
    }

    contentEl.innerHTML = content;
    loadRelatedArticles();
}

// Local "Mad-Libs" Style Generator (Offline Fallback)
function generateLocalArticle(topic) {
    const keywords = ["shocking", "viral", "exclusive", "trending", "massive"];
    const randomKey = keywords[Math.floor(Math.random() * keywords.length)];

    return `
        <p class="lead text-xl text-gray-600 mb-6">Breaking news from the world of lifestyle and entertainment: <strong>${topic}</strong> has officially gone ${randomKey}!</p>
        
        <h2>The Full Scoop</h2>
        <p>Everyone in the USA and UK is talking about this today. Sources close to the situation tell us that this development has been in the works for weeks, but nobody expected it to drop quite like this. Social media has absolutely exploded with reactions.</p>
        
        <p>"It's basically the biggest thing to happen this month," says one insider. "You can't scroll through your feed without seeing it."</p>

        <div class="my-8">
            <img src="https://picsum.photos/800/400?random=${Math.floor(Math.random() * 1000)}" class="w-full rounded-xl shadow-md" alt="Visual representation of ${topic}" loading="lazy">
            <p class="text-xs text-gray-400 mt-2 text-center">Visual representation</p>
        </div>

        <h2>What Fans Are Saying</h2>
        <p>Twitter and TikTok are having a field day. From hilarious memes to serious deep-dives, the internet remains undefeated. Whether you love it or hate it, you can't ignore it.</p>

        <p>We will keep you updated as this story develops. For now, check out the exclusive gallery below for more behind-the-scenes content.</p>
    `;
}

function loadRelatedArticles() {
    const relatedDiv = document.getElementById("related-articles");
    if (!relatedDiv) return;

    const random = FALLBACK_NEWS.sort(() => 0.5 - Math.random()).slice(0, 4);

    relatedDiv.innerHTML = ""; // Clear existing content to avoid duplicates if called multiple times

    random.forEach(item => {
        relatedDiv.innerHTML += `
            <div class="flex items-center gap-4 group cursor-pointer" onclick="window.location.href='article.html?q=${encodeURIComponent(item.title)}'" role="link" tabindex="0">
                <img src="${getImageUrl(item.image_keyword)}" 
                     class="w-20 h-20 object-cover rounded-lg bg-gray-100" 
                     alt="${item.title}"
                     loading="lazy"
                     onerror="window.handleImageError(this)">
                <div>
                    <h4 class="font-bold text-sm group-hover:text-primary leading-tight transition">${item.title}</h4>
                    <span class="text-xs text-gray-400">Read Now</span>
                </div>
            </div>
        `;
    });
}

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

    // Mobile Menu
    const btn = document.getElementById('mobile-menu-btn');
    const menu = document.getElementById('mobile-menu');
    if (btn && menu) {
        btn.addEventListener('click', () => menu.classList.toggle('hidden'));
    }
});

// Expanded Fallback topics to simulate updates if API is down

