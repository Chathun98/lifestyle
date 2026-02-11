const GROQ_API_KEY = "gsk_YOUR_API_KEY_HERE"; // Placeholder
const MONETAG_LINK = "https://omg10.com/4/10565898";

// ---------------------------------------------------------
// 1. DATA: CREATIVE & ROBUST CONTENT
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
});

// ---------------------------------------------------------
// 3. HOME PAGE RENDERING & FILTERING
// ---------------------------------------------------------

function initHomePage() {
    console.log("Initializing Home Page...");
    const grid = document.getElementById("articles-grid");
    const featured = document.getElementById("featured-section");

    // Check for Hash (Filtering)
    const hash = window.location.hash; // e.g. "#gossip"

    // 1. Render Featured Story (First Item) - Only show on main home, hide on filters
    if (featured) {
        if (!hash || hash === '#') {
            const featStory = TRENDING_STORIES[0];
            document.getElementById("featured-image").src = featStory.image;
            document.getElementById("featured-title").innerText = featStory.title;
            document.getElementById("featured-snippet").innerText = featStory.snippet;
            document.getElementById("featured-link").href = `article.html?q=${encodeURIComponent(featStory.title)}`;
            featured.classList.remove("hidden");
        } else {
            featured.classList.add("hidden");
        }
    }

    // 2. Filter & Render Grid
    let storiesToRender = TRENDING_STORIES;
    let sectionTitle = "Latest Stories";

    if (hash === '#trending') {
        // Show Viral, Fashion, Tech
        storiesToRender = TRENDING_STORIES.filter(s => ['Viral', 'Tech', 'Fashion'].includes(s.category));
        sectionTitle = "Trending Now";
    } else if (hash === '#gossip') {
        // Show Gossip, Royalty, Lifestyle
        storiesToRender = TRENDING_STORIES.filter(s => ['Gossip', 'Royalty', 'Lifestyle', 'Travel'].includes(s.category));
        sectionTitle = "Latest Gossip";
    }

    // Update section title if element exists
    const titleEl = document.querySelector('h3.font-serif');
    if (titleEl) titleEl.innerText = sectionTitle;

    // Render Items
    grid.innerHTML = "";
    if (storiesToRender.length === 0) {
        grid.innerHTML = `<p class="text-center col-span-2 text-gray-500 py-10">No stories found in this category.</p>`;
    } else {
        storiesToRender.forEach((story, index) => {
            // Insert Ad Card (Creative Break) - only on main feed
            if (index === 1 && !hash) {
                grid.innerHTML += createAdCard();
            }
            grid.innerHTML += createArticleCard(story);
        });
    }

    // 3. Setup Hashtags & Nav Listeners
    setupHashtags();
    setupNavFilters();
}

function setupNavFilters() {
    // Listen for hash changes (clicking nav links)
    window.addEventListener('hashchange', () => {
        window.scrollTo(0, 0);
        initHomePage(); // Re-render based on new hash
    });
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
// 4. ARTICLE PAGE LOGIC (Context Aware)
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

    // Update Title & Image
    document.title = `${topic} - Trending Pulse`;
    document.getElementById("article-title").innerText = topic;

    // Find matching story
    const matchedStory = TRENDING_STORIES.find(s => s.title === topic) || TRENDING_STORIES[0];
    const category = matchedStory.category || "General";

    const imgEl = document.getElementById("article-image");
    imgEl.src = matchedStory.image || "https://placehold.co/800x400?text=Trending+News";

    // Generate Context-Aware Content
    const contentEl = document.getElementById("article-content");

    // Loading State
    contentEl.innerHTML = `
        <div class="space-y-4 animate-pulse">
            <div class="h-4 bg-gray-100 rounded w-full"></div>
            <div class="h-4 bg-gray-100 rounded w-full"></div>
            <div class="h-4 bg-gray-100 rounded w-3/4"></div>
        </div>
    `;

    // Simulate "Writing" Delay
    setTimeout(() => {
        contentEl.innerHTML = generateContextualArticle(topic, category);
        loadRelevantReadNext(category, topic); // Load RELEVANT suggestions
    }, 500);
}

function generateContextualArticle(topic, category) {
    const randomViewCount = Math.floor(Math.random() * (50000 - 10000) + 10000).toLocaleString();

    // Vocabulary Sets
    const vocab = {
        "Food": ["chef", "flavor profile", "ingredients", "tasty", "kitchen", "recipe", "delicious", "culinary", "restaurant", "menu"],
        "Fashion": ["runway", "designer", "couture", "trend", "style", "aesthetic", "collection", "vogue", "wardrobe", "fabric"],
        "Tech": ["silicon valley", "algorithm", "innovation", "startup", "digital", "feature", "app", "user base", "software", "tech giant"],
        "Royalty": ["palace", "monarch", "protocol", "scandal", "prince", "crown", "tradition", "heir", "castle", "royal duties"],
        "Travel": ["destination", "booking", "view", "tourist", "local gem", "flight", "resort", "vacation", "passport", "itinerary"]
    };

    // fallback vocab
    const defaultVocab = ["trend", "moment", "social media", "reaction", "update", "scene", "world", "story", "news", "buzz"];

    // Select words based on topic keywords
    let selectedVocab = defaultVocab;
    const lowerTopic = topic.toLowerCase();

    if (lowerTopic.includes("pasta") || lowerTopic.includes("recipe") || category === "Viral") selectedVocab = vocab.Food;
    else if (lowerTopic.includes("fashion") || category === "Fashion") selectedVocab = vocab.Fashion;
    else if (lowerTopic.includes("tech") || lowerTopic.includes("ai") || category === "Tech") selectedVocab = vocab.Tech;
    else if (lowerTopic.includes("royal") || category === "Royalty") selectedVocab = vocab.Royalty;
    else if (lowerTopic.includes("travel") || lowerTopic.includes("nyc")) selectedVocab = vocab.Travel;

    // Helper to get random word
    const w = () => selectedVocab[Math.floor(Math.random() * selectedVocab.length)];

    return `
        <p class="lead text-xl text-gray-600 mb-8 font-serif italic border-l-4 border-primary pl-4">
            "It’s the <strong>${w()}</strong> everyone is whispering about. <strong>${topic}</strong> has officially disrupted the ${w()} world."
        </p>
        
        <h2 class="text-2xl font-bold mb-4 font-serif">The ${category} Moment</h2>
        <p class="mb-6">
            If you've checked the latest ${w()} news in the last 24 hours, you've seen it. The hashtags are trending and the ${w()} community is buzzing. 
            Insiders are calling it a "game-changer" for the modern ${w()}. 
            Sources say this ${w()} could change everything we know about the industry.
        </p>

        <div class="my-10 p-6 bg-gray-50 rounded-2xl border border-gray-100 text-center">
            <p class="text-sm font-bold text-gray-500 uppercase tracking-wide mb-2">Live Engagement</p>
            <p class="text-4xl font-black text-gray-900 mb-1">${randomViewCount}</p>
            <p class="text-xs text-gray-400">Real-time reads in the last hour</p>
        </div>

        <h2 class="text-2xl font-bold mb-4 font-serif">What This Means For You</h2>
        <p class="mb-6">
            Beyond the hype, there's a real ${w()} shift happening here. Whether it's a fleeting ${w()} or a permanent change, one thing is clear: 
            this is redefining what we expect from a top-tier ${w()} experience in 2026. 
            Analysts predict that every major ${w()} will try to copy this strategy soon.
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

function loadRelevantReadNext(currentCategory, currentTitle) {
    const relatedDiv = document.getElementById("related-articles");
    if (!relatedDiv) return;

    // Filter stories to find ones in the SAME category, excluding current one
    let relatedStories = TRENDING_STORIES.filter(s => s.category === currentCategory && s.title !== currentTitle);

    // If fewer than 2, fill with generic trending ones
    if (relatedStories.length < 2) {
        relatedStories = [...relatedStories, ...TRENDING_STORIES.filter(s => s.title !== currentTitle)].slice(0, 2);
    } else {
        relatedStories = relatedStories.slice(0, 2);
    }

    relatedDiv.innerHTML = "";

    relatedStories.forEach(item => {
        relatedDiv.innerHTML += `
            <div class="flex items-center gap-4 group cursor-pointer" onclick="window.location.href='article.html?q=${encodeURIComponent(item.title)}'" role="link" tabindex="0">
                <img src="${item.image}" 
                     class="w-20 h-20 object-cover rounded-lg bg-gray-100" 
                     alt="${item.title}"
                     loading="lazy">
                <div>
                    <h4 class="font-bold text-sm group-hover:text-primary leading-tight transition">${item.title}</h4>
                    <span class="text-xs text-gray-400 bg-gray-100 px-1 py-0.5 rounded ml-1">${item.category}</span>
                </div>
            </div>
        `;
    });
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
