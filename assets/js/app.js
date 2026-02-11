const GROQ_API_KEY = "gsk_YOUR_API_KEY_HERE"; // Placeholder - Use backend for real key
const MONETAG_LINK = "https://omg10.com/4/10565898";

// ---------------------------------------------------------
// 1. DATA: CREATIVE & ROBUST CONTENT (No External JSON Dependency)
// ---------------------------------------------------------

const TRENDING_STORIES = [
    {
        title: "The Royal Secret: Summer at Balmoral",
        snippet: "Exclusive insider details on the Royal Family's private retreat. What really happens behind closed doors?",
        category: "Royalty",
        image: "https://images.unsplash.com/photo-1526566762798-8fac9c07aa98?w=800&q=80",
        date: "2 hours ago"
    },
    {
        title: "London Fashion Week: The Grunge Revival",
        snippet: "90s fashion is back with a vengeance. See the leaked runway looks that are shocking critics.",
        category: "Fashion",
        image: "https://images.unsplash.com/photo-1537832816519-0439447f0edf?w=800&q=80",
        date: "4 hours ago"
    },
    {
        title: "NYC's Secret Rooftop Bars Revealed",
        snippet: "The 5 hidden spots in Manhattan that locals are trying to keep secret from tourists.",
        category: "Travel",
        image: "https://images.unsplash.com/photo-1550966871-3ed3c47e2ce2?w=800&q=80",
        date: "6 hours ago"
    },
    {
        title: "Viral Pasta: The Recipe Breaking TikTok",
        snippet: "Millions of views later, we taste test the 'Sunset Spaghetti'. Is it worth the hype?",
        category: "Viral",
        image: "https://images.unsplash.com/photo-1626844131082-256783844137?w=800&q=80",
        date: "8 hours ago"
    },
    {
        title: "Tech Detox: Silicon Valley's New Trend",
        snippet: "Why billionaires are ditching smartphones for 'dumb phones'. The new status symbol explaining.",
        category: "Lifestyle",
        image: "https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=800&q=80",
        date: "12 hours ago"
    },
    {
        title: "Hollywood's AI Crisis: The First AI Movie",
        snippet: "A major studio greenlights a film with NO human actors. The backlash is immediate and fierce.",
        category: "Tech",
        image: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&q=80",
        date: "1 day ago"
    }
];

// ---------------------------------------------------------
// 2. CORE LOGIC: INIT & ROUTING
// ---------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
    // Determine Page Type
    const isArticlePage = document.getElementById('article-content');
    const isHomePage = document.getElementById('articles-grid');

    if (isHomePage) {
        initHomePage();
    } else if (isArticlePage) {
        initArticlePage();
    }

    // Universal Mobile Menu
    setupMobileMenu();

    // Universal Ad Clicks
    setupAdClicks();
});

// ---------------------------------------------------------
// 3. HOME PAGE RENDERING
// ---------------------------------------------------------

function initHomePage() {
    console.log("Initializing Home Page...");
    const grid = document.getElementById("articles-grid");
    const featured = document.getElementById("featured-section");

    // 1. Render Featured Story (First Item)
    const featStory = TRENDING_STORIES[0];
    if (featured) {
        document.getElementById("featured-image").src = featStory.image;
        document.getElementById("featured-title").innerText = featStory.title;
        document.getElementById("featured-snippet").innerText = featStory.snippet;
        document.getElementById("featured-link").href = `article.html?q=${encodeURIComponent(featStory.title)}`;
        featured.classList.remove("hidden");
    }

    // 2. Render Grid (Rest of Items)
    grid.innerHTML = "";
    TRENDING_STORIES.slice(1).forEach((story, index) => {
        // Insert Ad Card (Creative Break)
        if (index === 1) {
            grid.innerHTML += createAdCard();
        }
        grid.innerHTML += createArticleCard(story);
    });

    // 3. Setup Hashtags
    setupHashtags();
}

function createArticleCard(story) {
    return `
        <article class="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group cursor-pointer" onclick="location.href='article.html?q=${encodeURIComponent(story.title)}'">
            <div class="relative h-48 overflow-hidden">
                <img src="${story.image}" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="${story.title}" loading="lazy">
                <div class="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
                <span class="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-xs font-bold px-3 py-1 rounded-full text-primary shadow-sm">
                    ${story.category}
                </span>
            </div>
            <div class="p-6">
                <div class="flex items-center gap-2 text-xs text-gray-400 mb-3">
                    <ion-icon name="time-outline"></ion-icon> ${story.date}
                </div>
                <h3 class="font-serif font-bold text-xl leading-tight mb-3 group-hover:text-primary transition-colors">
                    ${story.title}
                </h3>
                <p class="text-gray-500 text-sm line-clamp-2 mb-4">
                    ${story.snippet}
                </p>
                <div class="flex items-center text-primary font-bold text-sm">
                    Read Story <ion-icon name="arrow-forward" class="ml-1 group-hover:translate-x-1 transition-transform"></ion-icon>
                </div>
            </div>
        </article>
    `;
}

function createAdCard() {
    return `
        <div class="bg-gradient-to-br from-primary/5 to-purple-50 border-2 border-primary/10 rounded-xl p-6 flex flex-col items-center justify-center text-center relative overflow-hidden group cursor-pointer" onclick="window.open('${MONETAG_LINK}', '_blank')">
            <div class="absolute top-0 right-0 w-20 h-20 bg-primary/10 rounded-bl-full -mr-10 -mt-10 transition-all group-hover:scale-150"></div>
            <span class="text-xs font-bold text-primary uppercase tracking-widest mb-3">Sponsored</span>
            <h3 class="font-serif font-bold text-xl mb-4 text-gray-800">Exclusive Deals & Offers</h3>
            <p class="text-sm text-gray-500 mb-6 px-4">Don't miss out on today's limited-time discounts.</p>
            <span class="bg-primary text-white px-8 py-3 rounded-full font-bold shadow-lg hover:shadow-primary/50 hover:-translate-y-0.5 transition-all w-full md:w-auto inline-block">
                View Deals
            </span>
        </div>
    `;
}

// ---------------------------------------------------------
// 4. ARTICLE PAGE LOGIC
// ---------------------------------------------------------

function initArticlePage() {
    const params = new URLSearchParams(window.location.search);
    const topic = params.get('q');
    const authorEl = document.querySelector('[itemprop="author"] [itemprop="name"]');

    if (!topic) {
        window.location.href = 'index.html';
        return;
    }

    // Update Author
    if (authorEl) authorEl.innerText = "Chathun Rajapaksha";

    // Update Title
    document.title = `${topic} - Trending Pulse`;
    document.getElementById("article-title").innerText = topic;

    // Find matching story for image or use random default
    const matchedStory = TRENDING_STORIES.find(s => s.title === topic) || TRENDING_STORIES[0];
    const imgEl = document.getElementById("article-image");

    // Use robust image placeholder if random image fails
    imgEl.src = matchedStory.image || "https://placehold.co/800x400?text=Trending+News";
    imgEl.onerror = () => { imgEl.src = "https://placehold.co/800x400?text=Image+Unavailable"; };

    // Generate Content
    const contentEl = document.getElementById("article-content");
    contentEl.innerHTML = `
        <div class="space-y-4 animate-pulse">
            <div class="h-4 bg-gray-100 rounded w-full"></div>
            <div class="h-4 bg-gray-100 rounded w-full"></div>
            <div class="h-4 bg-gray-100 rounded w-3/4"></div>
        </div>
    `;

    // Simulate "Writing" Delay for Effect
    setTimeout(() => {
        contentEl.innerHTML = generateCreativeArticleHTML(topic);
    }, 500);
}

function generateCreativeArticleHTML(topic) {
    const randomViewCount = Math.floor(Math.random() * (50000 - 10000) + 10000).toLocaleString();

    return `
        <p class="lead text-xl text-gray-600 mb-8 font-serif italic border-l-4 border-primary pl-4">
            "It’s the story everyone is whispering about at brunch this weekend. <strong>${topic}</strong> has officially disrupted the timeline."
        </p>
        
        <h2 class="text-2xl font-bold mb-4 font-serif">The Viral Moment</h2>
        <p class="mb-6">
            If you've opened any social media app in the last 24 hours, you've seen it. The hashtags are trending, the memes are flowing, and the takes are piping hot. 
            Industry insiders in both London and New York are scrambling to make sense of what just happened.
        </p>

        <div class="my-10 p-6 bg-gray-50 rounded-2xl border border-gray-100 text-center">
            <p class="text-sm font-bold text-gray-500 uppercase tracking-wide mb-2">Live Engagement</p>
            <p class="text-4xl font-black text-gray-900 mb-1">${randomViewCount}</p>
            <p class="text-xs text-gray-400">Real-time reads in the last hour</p>
        </div>

        <h2 class="text-2xl font-bold mb-4 font-serif">What This Means For You</h2>
        <p class="mb-6">
            Beyond the noise, there's a real shift happening here. Whether it's a fleeting trend or a permanent change, one thing is clear: 
            the conversation has changed. Experts suggest this could redefine how we look at lifestyle trends for the rest of 2026.
        </p>

        <h2 class="text-2xl font-bold mb-4 font-serif">The Internet Reacts</h2>
        <p class="mb-8">
            "I haven't seen a reaction like this since the Met Gala," says one prominent influencer. 
            The consensus? You either love it, or you're wrong.
        </p>

        <!-- Dynamic Ad Insert -->
        <div class="my-12 p-8 bg-gradient-to-r from-pink-500 to-rose-500 rounded-3xl text-white text-center shadow-xl transform hover:scale-[1.02] transition-transform cursor-pointer" onclick="window.open('${MONETAG_LINK}', '_blank')">
            <span class="bg-white/20 text-xs font-bold px-3 py-1 rounded-full backdrop-blur-md">SPONSORED</span>
            <h3 class="font-serif font-bold text-2xl mt-4 mb-2">Want More Exclusive Scoops?</h3>
            <p class="opacity-90 mb-6 text-sm">Join our premium circle for the uncensored details.</p>
            <button class="bg-white text-primary px-8 py-3 rounded-full font-bold hover:bg-gray-100 transition-colors shadow-md">
                Unlock Full Access
            </button>
        </div>
    `;
}

// ---------------------------------------------------------
// 5. UTILITY FUNCTIONS
// ---------------------------------------------------------

function setupMobileMenu() {
    const btn = document.getElementById('mobile-menu-btn');
    const menu = document.getElementById('mobile-menu');
    if (btn && menu) {
        btn.addEventListener('click', () => {
            menu.classList.toggle('hidden');
            const icon = btn.querySelector('ion-icon');
            // If icon exists, toggle its name
            if (icon) {
                icon.name = menu.classList.contains('hidden') ? 'menu-outline' : 'close-outline';
            }
        });
    }
}

function setupHashtags() {
    const tags = document.querySelectorAll('#hashtags-container span');
    tags.forEach(tag => {
        tag.addEventListener('click', function () {
            const topic = this.innerText.replace('#', '');
            window.location.href = `article.html?q=${encodeURIComponent(topic + ' Trend')}`;
        });
    });
}

function setupAdClicks() {
    // Helper to open ads globally
}
