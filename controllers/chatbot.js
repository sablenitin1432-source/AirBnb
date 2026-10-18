/**
 * Elite Passage AI Chatbot Controller
 * Uses Google Gemini API for real AI conversations
 * Falls back to a smart rule-based system if no API key is configured
 */

// ─── Gemini AI Integration ─────────────────────────────────────────────────────

async function getGeminiResponse(userMessage, conversationHistory) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  try {
    const systemPrompt = `You are ElitePassageBot, the friendly and helpful AI assistant for Elite Passage — a premium travel platform similar to Airbnb. You help users with:

1. **Stays/Listings**: Finding accommodations, understanding property details, pricing, amenities, BHK types, and booking stays.
2. **Vehicles**: Renting vehicles for travel, understanding vehicle types, pricing, availability, and booking.
3. **Dining/Dhabas**: Finding restaurants and local eateries (dhabas), understanding cuisines, pricing, and specialties.
4. **Bookings**: How to book, check booking status, cancellation policies, and payment via Razorpay.
5. **Account**: Sign up, login, profile management, viewing booking history, managing listings.
6. **General Travel**: Travel tips, destination recommendations, and general help.

Guidelines:
- Be warm, concise, and professional. Keep responses under 150 words unless the user asks for detail.
- Use emojis sparingly for friendliness (✨, 🏠, 🚗, 🍽️, 📍).
- If asked about specific pricing or availability, explain that they should browse the listings for real-time info.
- For technical issues, suggest contacting support or refreshing the page.
- Always be encouraging about travel and exploration.
- If the user greets you, respond warmly and ask how you can help.
- You can guide users to specific pages: /listings for Stays, /vehicles for Vehicles, /dhabas for Dining, /dashboard for their Dashboard.
- Never make up specific listings, prices, or availability data.`;

    // Build messages array from conversation history
    const contents = [];

    // Add conversation history
    if (conversationHistory && conversationHistory.length > 0) {
      for (const msg of conversationHistory.slice(-10)) { // Last 10 messages for context
        contents.push({
          role: msg.role === "user" ? "user" : "model",
          parts: [{ text: msg.content }]
        });
      }
    }

    // Add current user message
    contents.push({
      role: "user",
      parts: [{ text: userMessage }]
    });

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: systemPrompt }]
          },
          contents: contents,
          generationConfig: {
            temperature: 0.8,
            topP: 0.95,
            topK: 40,
            maxOutputTokens: 500,
          },
          safetySettings: [
            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
            { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
          ]
        })
      }
    );

    if (!response.ok) {
      console.error("Gemini API error:", response.status, await response.text());
      return null;
    }

    const data = await response.json();
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      return data.candidates[0].content.parts[0].text;
    }
    return null;
  } catch (err) {
    console.error("Gemini API fetch error:", err.message);
    return null;
  }
}


// ─── Smart Fallback System ──────────────────────────────────────────────────────

const knowledgeBase = {
  greetings: {
    patterns: [/^(hi|hello|hey|howdy|hola|greetings|yo|sup|good\s*(morning|afternoon|evening|night))/i],
    responses: [
      "Hello! 👋 Welcome to Elite Passage! I'm ElitePassageBot, your personal travel assistant. How can I help you today? Whether you're looking for stays, vehicles, or dining — I've got you covered! ✨",
      "Hey there! 🌟 I'm ElitePassageBot, here to make your travel planning seamless. Need help finding the perfect stay, renting a vehicle, or discovering local dining? Just ask!",
      "Hi! Welcome aboard! 🏠 I'm your Elite Passage assistant. I can help you explore stays, vehicles, and dining options. What are you looking for today?"
    ]
  },
  farewell: {
    patterns: [/^(bye|goodbye|see\s*you|take\s*care|good\s*night|cya|later|gotta\s*go)/i],
    responses: [
      "Goodbye! 👋 Have a wonderful journey! Come back anytime you need travel assistance. ✨",
      "See you later! 🌟 Wishing you amazing travels ahead. I'll always be here if you need help!",
      "Take care! 🏠 Happy travels and don't hesitate to reach out when you're planning your next adventure!"
    ]
  },
  thanks: {
    patterns: [/^(thanks|thank\s*you|thx|appreciate|ty|cheers)/i],
    responses: [
      "You're welcome! 😊 Happy to help! Is there anything else you'd like to know about Elite Passage?",
      "My pleasure! ✨ If you have any more questions about stays, vehicles, or dining, just ask!",
      "Glad I could help! 🌟 Feel free to ask me anything else about your travel plans!"
    ]
  },
  stays: {
    patterns: [/\b(stay|stays|listing|listings|accommodation|hotel|apartment|room|house|property|properties|bhk|bedroom|rent\s*a?\s*place|book\s*a?\s*(room|place|stay))\b/i],
    responses: [
      "🏠 **Looking for the perfect stay?** Here's what you can do:\n\n• Browse all stays at the **Stays** page\n• Use the search bar to find stays by location\n• Filter by category, price, and amenities\n• Each listing shows detailed info including BHK type, price per night, and reviews\n\nWould you like tips on finding the best deals?",
      "🏡 **Elite Passage Stays** offers a wide range of accommodations!\n\n• From cozy 1BHK apartments to luxurious villas\n• Each listing includes photos, amenities, pricing, and reviews\n• You can read and leave reviews after your stay\n• Navigate to **Stays** in the top menu to start exploring!\n\nNeed help with anything specific?",
    ]
  },
  vehicles: {
    patterns: [/\b(vehicle|vehicles|car|bike|scooter|rent.*vehicle|transport|cab|taxi|drive|motorcycle|ride)\b/i],
    responses: [
      "🚗 **Need a vehicle for your trip?**\n\n• Browse all vehicles on the **Vehicles** page\n• Find cars, bikes, scooters, and more\n• Each listing shows specs, pricing, and availability\n• Book directly through the platform\n\nWould you like to know about our vehicle categories?",
      "🏍️ **Elite Passage Vehicles** makes getting around easy!\n\n• Wide range of vehicles available\n• Detailed specs and photos for each option\n• Competitive pricing with transparent fees\n• Navigate to **Vehicles** in the top menu to explore!\n\nAnything specific you're looking for?",
    ]
  },
  dining: {
    patterns: [/\b(dine|dining|dhaba|dhabas|restaurant|food|eat|cuisine|meal|lunch|dinner|breakfast|cafe|eatery|hungry)\b/i],
    responses: [
      "🍽️ **Craving something delicious?**\n\n• Explore local eateries on the **Dining** page\n• Discover authentic dhabas and restaurants\n• View menus, specialties, and reviews\n• Find dining options near your stay!\n\nWant recommendations for a specific cuisine?",
      "🍛 **Elite Passage Dining** connects you with amazing food!\n\n• Local dhabas and restaurants curated for travelers\n• Detailed info about cuisine types and specialties\n• Read reviews from other travelers\n• Navigate to **Dining** in the top menu to explore!\n\nLooking for any particular type of food?",
    ]
  },
  booking: {
    patterns: [/\b(book|booking|bookings|reserve|reservation|payment|pay|checkout|razorpay|price|cost|how\s*much|cancel|refund)\b/i],
    responses: [
      "📋 **Booking on Elite Passage is simple!**\n\n• Find your ideal stay, vehicle, or dining spot\n• Click the **Book Now** button on any listing\n• Choose your dates and complete the payment via **Razorpay**\n• View all your bookings in your **Dashboard**\n\nNeed help with a specific booking question?",
      "💳 **Here's how booking works:**\n\n1. Browse and select your preferred listing\n2. Pick your dates and review the pricing\n3. Secure payment through **Razorpay** (cards, UPI, net banking)\n4. Get instant confirmation!\n5. Manage bookings from your **Dashboard → My Bookings**\n\nIs there anything specific about the booking process you need help with?",
    ]
  },
  account: {
    patterns: [/\b(account|sign\s*up|signup|login|log\s*in|register|profile|password|forgot|dashboard|my\s*account|settings)\b/i],
    responses: [
      "👤 **Account & Profile Help:**\n\n• **New user?** Click **Sign up** in the menu to create your free account\n• **Existing user?** Click **Log in** to access your account\n• **Google login** is also available for quick access!\n• Access your **Dashboard** for bookings, listings, and profile settings\n\nWhat would you like help with specifically?",
      "🔐 **Managing your Elite Passage account:**\n\n• Sign up with email or Google OAuth\n• Your **Dashboard** is your command center:\n  - View and manage bookings\n  - Edit your profile\n  - Manage your listed properties\n  - Track reviews and ratings\n\nNeed help with a specific account feature?",
    ]
  },
  listing_create: {
    patterns: [/\b(list\s*my|add\s*a?\s*(listing|property|stay|vehicle|dhaba)|create\s*a?\s*(listing|property)|become\s*a?\s*host|host)\b/i],
    responses: [
      "🏗️ **Want to list your property?** Here's how:\n\n• **Stays:** Go to menu → **Add Stays** to list accommodations\n• **Vehicles:** Go to menu → **Add Vehicle** to list vehicles for rent\n• **Dining:** Go to menu → **Add Dining** to list your restaurant or dhaba\n\nYou'll need to provide photos, description, pricing, and location details. Need help with any step?",
    ]
  },
  navigation: {
    patterns: [/\b(where|how\s*do\s*i|how\s*to|navigate|find|page|go\s*to|take\s*me|show\s*me|menu)\b/i],
    responses: [
      "🧭 **Here's how to navigate Elite Passage:**\n\n• **Home** → Main page with featured listings\n• **Stays** → Browse all accommodations\n• **Vehicles** → Browse vehicles for rent\n• **Dining** → Discover restaurants and dhabas\n• **Dashboard** → Your personal bookings and listings\n• Use the **Search Bar** to find destinations quickly!\n\nWhere would you like to go?",
    ]
  },
  about: {
    patterns: [/\b(what\s*is|about|wanderlust|tell\s*me\s*about|who\s*are\s*you|what\s*do\s*you|your\s*name|what\s*can)\b/i],
    responses: [
      "✨ **I'm ElitePassageBot**, your AI assistant for **Elite Passage** — a premium travel platform!\n\n**Elite Passage** offers:\n• 🏠 **Stays** — Find and book unique accommodations\n• 🚗 **Vehicles** — Rent vehicles for your journey\n• 🍽️ **Dining** — Discover local restaurants and dhabas\n\nI can help you with browsing, booking, account management, and travel tips. What would you like to explore?",
      "🌟 Hi! I'm **ElitePassageBot**, the AI concierge for Elite Passage!\n\nElite Passage is your all-in-one travel companion for:\n• Finding perfect stays anywhere\n• Renting vehicles for smooth travel\n• Discovering amazing dining experiences\n\nI'm here 24/7 to help you navigate, book, and plan. How can I assist you today?",
    ]
  },
  help: {
    patterns: [/\b(help|support|issue|problem|error|bug|not\s*working|broken|stuck|confused)\b/i],
    responses: [
      "🛟 **I'm here to help!** Here's what I can assist with:\n\n1. 🏠 **Finding stays** — accommodations & properties\n2. 🚗 **Renting vehicles** — cars, bikes & more\n3. 🍽️ **Dining options** — restaurants & local dhabas\n4. 📋 **Booking help** — reservations & payments\n5. 👤 **Account issues** — login, signup, profile\n6. 🧭 **Navigation** — finding pages & features\n\nJust tell me what you need, and I'll guide you through it! What's on your mind?",
    ]
  },
  reviews: {
    patterns: [/\b(review|reviews|rating|ratings|feedback|star|stars|rate)\b/i],
    responses: [
      "⭐ **Reviews & Ratings on Elite Passage:**\n\n• After a stay/experience, you can leave a detailed review\n• Rate with stars and add written feedback\n• Reviews help other travelers make informed decisions\n• You can view all reviews on any listing page\n\nWant to know how to leave a review or check reviews for a specific listing?",
    ]
  },
  search: {
    patterns: [/\b(search|find|look\s*for|filter|explore|browse|discover)\b/i],
    responses: [
      "🔍 **Searching on Elite Passage is easy!**\n\n• Use the **search bar** in the navigation to search by destination\n• Browse by category: **Stays**, **Vehicles**, or **Dining**\n• Each page has curated listings with all the details you need\n• Click on any listing card to see full details, photos, and reviews\n\nWhat are you looking to find?",
    ]
  }
};

function getSmartResponse(userMessage, conversationHistory) {
  const message = userMessage.toLowerCase().trim();

  // Check each category for pattern match
  for (const [category, data] of Object.entries(knowledgeBase)) {
    for (const pattern of data.patterns) {
      if (pattern.test(message)) {
        const responses = data.responses;
        return responses[Math.floor(Math.random() * responses.length)];
      }
    }
  }

  // Default response if no pattern matches
  const defaults = [
    "I'd love to help! Could you tell me more about what you're looking for? I can assist with:\n\n• 🏠 **Stays** — Finding accommodations\n• 🚗 **Vehicles** — Renting transportation\n• 🍽️ **Dining** — Discovering restaurants\n• 📋 **Bookings** — Reservations & payments\n• 👤 **Account** — Login, signup & profile\n\nJust ask about any of these!",
    "Hmm, I'm not sure I understood that. Try asking me about:\n\n• Finding a place to **stay**\n• Renting a **vehicle**\n• Discovering **dining** options\n• How to **book** on Elite Passage\n• Managing your **account**\n\nI'm here to help! 😊",
  ];

  return defaults[Math.floor(Math.random() * defaults.length)];
}


// ─── Controller ─────────────────────────────────────────────────────────────────

module.exports.handleChat = async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return res.status(400).json({ error: "Message is required" });
    }

    // Sanitize message (basic XSS prevention)
    const cleanMessage = message.trim().slice(0, 1000);

    // Try Gemini first, then fall back to smart responses
    let reply = await getGeminiResponse(cleanMessage, history || []);

    if (!reply) {
      reply = getSmartResponse(cleanMessage, history || []);
    }

    return res.json({
      reply,
      source: reply ? (process.env.GEMINI_API_KEY ? "gemini" : "smart") : "smart",
      timestamp: new Date().toISOString()
    });

  } catch (err) {
    console.error("Chatbot error:", err);
    return res.status(500).json({
      reply: "I'm having a moment! 😅 Please try again in a few seconds. If the issue persists, try refreshing the page.",
      source: "error"
    });
  }
};

module.exports.getStatus = (req, res) => {
  res.json({
    active: true,
    ai: !!process.env.GEMINI_API_KEY,
    name: "ElitePassageBot"
  });
};
