
import json
import os
import random
import time
import requests

# API Key for Content (Use env var for security)
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "gsk_YOUR_API_KEY_HERE")

# URL for Image Fallback
IMAGE_FALLBACK = "https://picsum.photos/seed/{seed}/800/600"

# Output File
OUTPUT_FILE = os.path.join("assets", "data", "feed.json")

def call_groq_api(messages):
    """
    Calls Groq API to get completion.
    """
    url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {GROQ_API_KEY}"
    }
    body = {
        "model": "llama3-70b-8192",  # Use the strong model for realistic output
        "messages": messages,
        "temperature": 0.8,         # High creativity
        "max_tokens": 2048
    }

    try:
        response = requests.post(url, headers=headers, json=body, timeout=30)
        response.raise_for_status()
        data = response.json()
        return data["choices"][0]["message"]["content"]
    except Exception as e:
        print(f"Error calling Groq API: {e}")
        return None

def generate_feed():
    """
    Generates high-quality, realistic gossip/lifestyle feed content.
    """
    print("Generating new content feed...")

    prompt = """
    You are the Editor-in-Chief of a viral US/UK gossip magazine.
    Generate 10 ULTRA-REALISTIC and SPICY trending news headlines for today.
    The mix should be: 30% Celebrity Gossip, 30% Royal Family Drama, 20% Lifestyle/Health trends, 20% Viral TikTok/Internet Culture.
    
    Output strictly a JSON array of objects. Each object must have:
    - "title": A click-worthy but realistic headline.
    - "snippet": A 2-sentence teaser that makes the reader NEED to know more.
    - "category": One of "Gossip", "Royalty", "Lifestyle", "Viral", "Fashion", "Tech".
    - "image_keyword": A specific, visual search term for an image (e.g. "meghan markle crying", "tiktok pasta recipe", "elon musk yacht").
    - "content": A full 3-paragraph article (HTML format with <p> tags) that sounds like it was written by a real gossip columnist. Be witty, slightly snarky, and use British/American slang appropriate to the topic.
    
    Do NOT include markdown formatting (like ```json). Just the raw JSON string.
    """

    messages = [
        {"role": "system", "content": "You are a professional gossip journalist."},
        {"role": "user", "content": prompt}
    ]

    content = call_groq_api(messages)
    
    if not content:
        print("Failed to generate content.")
        return

    try:
        # Clean potential markdown
        content = content.replace("```json", "").replace("```", "").strip()
        feed_data = json.loads(content)
        
        # Add timestamps and image URLs
        for item in feed_data:
            item["timestamp"] = time.time()
            # We save the prompt, the frontend handles the actual image loading usually, 
            # but let's pre-calculate a stable image URL here if possible or just keep the keyword.
            # We'll use the Pollinations URL structure as the 'image_url' to make it easy for frontend.
            seed = random.randint(1, 99999)
            item["image_url"] = f"https://image.pollinations.ai/prompt/{requests.utils.quote(item['image_keyword'])}?width=800&height=600&nologo=true&seed={seed}"

        # Ensure output directory exists
        os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
        
        # Write to file
        with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
            json.dump(feed_data, f, indent=4)
            
        print(f"Successfully generated {len(feed_data)} articles to {OUTPUT_FILE}")
        
    except json.JSONDecodeError as e:
        print(f"JSON Decode Error: {e}")
        print(f"Raw Content: {content[:500]}...") # Print first 500 chars for debug

if __name__ == "__main__":
    generate_feed()
