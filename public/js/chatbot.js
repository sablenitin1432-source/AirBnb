/**
 * ElitePassageBot — Frontend Chat Engine
 * Handles UI interactions, message rendering, and API communication
 */

(function () {
  "use strict";

  // ─── State ──────────────────────────────────────────────
  const state = {
    isOpen: false,
    isFirstOpen: true,
    isTyping: false,
    history: [], // {role: "user"|"bot", content: string}
    suggestions: [
      { icon: "fa-house", text: "Find stays" },
      { icon: "fa-car", text: "Rent a vehicle" },
      { icon: "fa-utensils", text: "Dining options" },
      { icon: "fa-circle-question", text: "Help me" },
    ]
  };

  // ─── DOM References ─────────────────────────────────────
  let toggleBtn, chatWindow, messagesContainer, inputField, sendBtn, suggestionsContainer;

  // ─── Initialization ─────────────────────────────────────
  document.addEventListener("DOMContentLoaded", init);

  function init() {
    createChatbotDOM();
    bindEvents();
    checkStatus();
  }

  // ─── Create DOM Structure ───────────────────────────────
  function createChatbotDOM() {
    // Toggle Button
    const toggle = document.createElement("button");
    toggle.className = "chatbot-toggle";
    toggle.id = "chatbot-toggle";
    toggle.setAttribute("aria-label", "Open chat assistant");
    toggle.innerHTML = `<i class="fas fa-comments"></i><div class="chat-badge">1</div>`;
    document.body.appendChild(toggle);
    toggleBtn = toggle;

    // Chat Window
    const win = document.createElement("div");
    win.className = "chatbot-window";
    win.id = "chatbot-window";
    win.innerHTML = `
      <!-- Header -->
      <div class="chatbot-header">
        <div class="chatbot-header-avatar">
          <i class="fas fa-robot"></i>
          <div class="status-dot"></div>
        </div>
        <div class="chatbot-header-info">
          <h4>ElitePassageBot</h4>
          <span>● Online — AI Assistant</span>
        </div>
        <div class="chatbot-header-actions">
          <button id="chatbot-clear" title="Clear chat"><i class="fas fa-rotate-right"></i></button>
          <button id="chatbot-close" title="Close chat"><i class="fas fa-xmark"></i></button>
        </div>
      </div>

      <!-- Messages -->
      <div class="chatbot-messages" id="chatbot-messages">
        <!-- Welcome Screen -->
        <div class="chatbot-welcome" id="chatbot-welcome">
          <div class="chatbot-welcome-icon">
            <i class="fas fa-sparkles"></i>
          </div>
          <h3>Welcome to ElitePassageBot</h3>
          <p>Your personal AI concierge for stays, vehicles,<br>dining, and everything travel.</p>
          <div class="chatbot-welcome-actions">
            <div class="chatbot-welcome-btn" data-msg="I'm looking for a place to stay">
              <i class="fas fa-house"></i>
              <div class="chatbot-welcome-btn-text">
                <span>Find a Stay</span>
                <span>Explore accommodations & properties</span>
              </div>
            </div>
            <div class="chatbot-welcome-btn" data-msg="I need to rent a vehicle">
              <i class="fas fa-car"></i>
              <div class="chatbot-welcome-btn-text">
                <span>Rent a Vehicle</span>
                <span>Cars, bikes & more for your trip</span>
              </div>
            </div>
            <div class="chatbot-welcome-btn" data-msg="Show me dining options">
              <i class="fas fa-utensils"></i>
              <div class="chatbot-welcome-btn-text">
                <span>Discover Dining</span>
                <span>Local restaurants & dhabas</span>
              </div>
            </div>
            <div class="chatbot-welcome-btn" data-msg="Tell me about Elite Passage">
              <i class="fas fa-circle-info"></i>
              <div class="chatbot-welcome-btn-text">
                <span>About Elite Passage</span>
                <span>Learn what we offer</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Suggestions -->
      <div class="chat-suggestions" id="chatbot-suggestions" style="display: none;"></div>

      <!-- Input Area -->
      <div class="chatbot-input-area">
        <div class="chatbot-input-wrapper">
          <input type="text" id="chatbot-input" placeholder="Ask me anything..." autocomplete="off" maxlength="500" />
        </div>
        <button class="chatbot-send-btn" id="chatbot-send" disabled title="Send message">
          <i class="fas fa-paper-plane"></i>
        </button>
      </div>

      <!-- Footer -->
      <div class="chatbot-footer">
        <span>Powered by <i class="fas fa-sparkles"></i> Elite Passage AI</span>
      </div>
    `;
    document.body.appendChild(win);

    chatWindow = win;
    messagesContainer = win.querySelector("#chatbot-messages");
    inputField = win.querySelector("#chatbot-input");
    sendBtn = win.querySelector("#chatbot-send");
    suggestionsContainer = win.querySelector("#chatbot-suggestions");
  }

  // ─── Event Bindings ─────────────────────────────────────
  function bindEvents() {
    // Toggle open/close
    toggleBtn.addEventListener("click", toggleChat);
    document.getElementById("chatbot-close").addEventListener("click", toggleChat);
    document.getElementById("chatbot-clear").addEventListener("click", clearChat);

    // Send message
    sendBtn.addEventListener("click", sendMessage);
    inputField.addEventListener("keydown", function (e) {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });

    // Enable/disable send button
    inputField.addEventListener("input", function () {
      sendBtn.disabled = !this.value.trim();
    });

    // Welcome buttons
    document.querySelectorAll(".chatbot-welcome-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        const msg = this.getAttribute("data-msg");
        if (msg) {
          hideWelcome();
          inputField.value = msg;
          sendBtn.disabled = false;
          sendMessage();
        }
      });
    });

    // Close on outside click (desktop)
    document.addEventListener("click", function (e) {
      if (state.isOpen && !chatWindow.contains(e.target) && !toggleBtn.contains(e.target)) {
        if (window.innerWidth > 480) {
          toggleChat();
        }
      }
    });

    // Escape key to close
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && state.isOpen) {
        toggleChat();
      }
    });
  }

  // ─── Toggle Chat ────────────────────────────────────────
  function toggleChat() {
    state.isOpen = !state.isOpen;
    chatWindow.classList.toggle("open", state.isOpen);
    toggleBtn.classList.toggle("active", state.isOpen);

    // Change icon
    const icon = toggleBtn.querySelector("i");
    icon.className = state.isOpen ? "fas fa-xmark" : "fas fa-comments";

    // Hide badge
    const badge = toggleBtn.querySelector(".chat-badge");
    if (badge && state.isOpen) {
      badge.style.display = "none";
    }

    if (state.isOpen) {
      // Focus input on open
      setTimeout(function () { inputField.focus(); }, 350);

      // Send welcome message on first open
      if (state.isFirstOpen) {
        state.isFirstOpen = false;
      }
    }
  }

  // ─── Hide Welcome Screen ───────────────────────────────
  function hideWelcome() {
    const welcome = document.getElementById("chatbot-welcome");
    if (welcome) {
      welcome.style.animation = "welcomeFadeIn 0.3s ease reverse";
      setTimeout(function () { welcome.remove(); }, 300);
    }
  }

  // ─── Clear Chat ─────────────────────────────────────────
  function clearChat() {
    state.history = [];
    messagesContainer.innerHTML = "";
    suggestionsContainer.style.display = "none";
    suggestionsContainer.innerHTML = "";

    // Re-add welcome
    const welcomeHTML = `
      <div class="chatbot-welcome" id="chatbot-welcome">
        <div class="chatbot-welcome-icon">
          <i class="fas fa-sparkles"></i>
        </div>
        <h3>Welcome to ElitePassageBot</h3>
        <p>Your personal AI concierge for stays, vehicles,<br>dining, and everything travel.</p>
        <div class="chatbot-welcome-actions">
          <div class="chatbot-welcome-btn" data-msg="I'm looking for a place to stay">
            <i class="fas fa-house"></i>
            <div class="chatbot-welcome-btn-text">
              <span>Find a Stay</span>
              <span>Explore accommodations & properties</span>
            </div>
          </div>
          <div class="chatbot-welcome-btn" data-msg="I need to rent a vehicle">
            <i class="fas fa-car"></i>
            <div class="chatbot-welcome-btn-text">
              <span>Rent a Vehicle</span>
              <span>Cars, bikes & more for your trip</span>
            </div>
          </div>
          <div class="chatbot-welcome-btn" data-msg="Show me dining options">
            <i class="fas fa-utensils"></i>
            <div class="chatbot-welcome-btn-text">
              <span>Discover Dining</span>
              <span>Local restaurants & dhabas</span>
            </div>
          </div>
          <div class="chatbot-welcome-btn" data-msg="Tell me about Elite Passage">
            <i class="fas fa-circle-info"></i>
            <div class="chatbot-welcome-btn-text">
              <span>About Elite Passage</span>
              <span>Learn what we offer</span>
            </div>
          </div>
        </div>
      </div>
    `;
    messagesContainer.innerHTML = welcomeHTML;

    // Re-bind welcome buttons
    document.querySelectorAll(".chatbot-welcome-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        const msg = this.getAttribute("data-msg");
        if (msg) {
          hideWelcome();
          inputField.value = msg;
          sendBtn.disabled = false;
          sendMessage();
        }
      });
    });
  }

  // ─── Send Message ───────────────────────────────────────
  async function sendMessage() {
    const text = inputField.value.trim();
    if (!text || state.isTyping) return;

    // Hide welcome if still visible
    hideWelcome();

    // Add user message to UI
    addMessage("user", text);
    state.history.push({ role: "user", content: text });

    // Clear input
    inputField.value = "";
    sendBtn.disabled = true;

    // Show typing indicator
    showTyping();

    try {
      // Call API
      const response = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: state.history.slice(-10)
        })
      });

      const data = await response.json();
      hideTyping();

      if (data.reply) {
        addMessage("bot", data.reply);
        state.history.push({ role: "bot", content: data.reply });
        showSuggestions();
      } else {
        addMessage("bot", "I'm sorry, I couldn't process that. Could you try rephrasing?");
      }
    } catch (err) {
      hideTyping();
      addMessage("bot", "Oops! I'm having trouble connecting. Please check your internet and try again. 🔄");
      console.error("Chatbot API error:", err);
    }
  }

  // ─── Add Message to UI ─────────────────────────────────
  function addMessage(role, content) {
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const formattedContent = formatMessage(content);

    const msgDiv = document.createElement("div");
    msgDiv.className = `chat-message ${role}`;

    const avatarIcon = role === "bot" ? "fa-robot" : "fa-user";

    msgDiv.innerHTML = `
      <div class="chat-message-avatar">
        <i class="fas ${avatarIcon}"></i>
      </div>
      <div class="chat-message-content">
        <div class="chat-bubble">${formattedContent}</div>
        <span class="chat-message-time">${time}</span>
      </div>
    `;

    messagesContainer.appendChild(msgDiv);
    scrollToBottom();
  }

  // ─── Format Message (Markdown-lite) ─────────────────────
  function formatMessage(text) {
    // Escape HTML first
    let formatted = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // Bold: **text** or __text__
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    formatted = formatted.replace(/__(.*?)__/g, "<strong>$1</strong>");

    // Italic: *text* or _text_
    formatted = formatted.replace(/(?<!\*)\*(?!\*)(.*?)\*(?!\*)/g, "<em>$1</em>");

    // Inline code: `code`
    formatted = formatted.replace(/`(.*?)`/g, "<code>$1</code>");

    // Links: format page references
    formatted = formatted.replace(/\*\*Stays\*\*/g, '<strong><a href="/listings" style="color: inherit; text-decoration: underline;">Stays</a></strong>');
    formatted = formatted.replace(/\*\*Vehicles\*\*/g, '<strong><a href="/vehicles" style="color: inherit; text-decoration: underline;">Vehicles</a></strong>');
    formatted = formatted.replace(/\*\*Dining\*\*/g, '<strong><a href="/dhabas" style="color: inherit; text-decoration: underline;">Dining</a></strong>');
    formatted = formatted.replace(/\*\*Dashboard\*\*/g, '<strong><a href="/dashboard" style="color: inherit; text-decoration: underline;">Dashboard</a></strong>');

    // Bullet points: • or - at start of line
    formatted = formatted.replace(/^[•\-]\s+(.*)$/gm, "<li>$1</li>");
    formatted = formatted.replace(/(<li>.*<\/li>)/gs, "<ul>$1</ul>");

    // Numbered lists: 1. 2. etc
    formatted = formatted.replace(/^\d+\.\s+(.*)$/gm, "<li>$1</li>");

    // Line breaks
    formatted = formatted.replace(/\n\n/g, "</p><p>");
    formatted = formatted.replace(/\n/g, "<br>");

    // Wrap in paragraph if not already
    if (!formatted.startsWith("<")) {
      formatted = "<p>" + formatted + "</p>";
    }

    return formatted;
  }

  // ─── Typing Indicator ──────────────────────────────────
  function showTyping() {
    state.isTyping = true;
    const typingDiv = document.createElement("div");
    typingDiv.className = "typing-indicator";
    typingDiv.id = "typing-indicator";
    typingDiv.innerHTML = `
      <div class="chat-message-avatar">
        <i class="fas fa-robot"></i>
      </div>
      <div class="typing-dots">
        <span></span><span></span><span></span>
      </div>
    `;
    messagesContainer.appendChild(typingDiv);
    scrollToBottom();
  }

  function hideTyping() {
    state.isTyping = false;
    const typing = document.getElementById("typing-indicator");
    if (typing) typing.remove();
  }

  // ─── Suggestions ────────────────────────────────────────
  function showSuggestions() {
    // Show contextual suggestions based on last bot message
    const lastBotMsg = state.history.filter(function (m) { return m.role === "bot"; }).slice(-1)[0];
    let suggestions = [];

    if (lastBotMsg) {
      const content = lastBotMsg.content.toLowerCase();
      if (content.includes("stay") || content.includes("listing") || content.includes("accommodation")) {
        suggestions = [
          { icon: "fa-magnifying-glass", text: "Search stays" },
          { icon: "fa-car", text: "Rent a vehicle too" },
          { icon: "fa-circle-question", text: "Booking help" },
        ];
      } else if (content.includes("vehicle") || content.includes("car") || content.includes("bike")) {
        suggestions = [
          { icon: "fa-magnifying-glass", text: "Browse vehicles" },
          { icon: "fa-house", text: "Find a stay too" },
          { icon: "fa-circle-question", text: "How to book?" },
        ];
      } else if (content.includes("dining") || content.includes("dhaba") || content.includes("food")) {
        suggestions = [
          { icon: "fa-utensils", text: "See all dining" },
          { icon: "fa-house", text: "Find a stay" },
          { icon: "fa-car", text: "Get a vehicle" },
        ];
      } else {
        suggestions = [
          { icon: "fa-house", text: "Find stays" },
          { icon: "fa-car", text: "Rent vehicle" },
          { icon: "fa-utensils", text: "Dining" },
          { icon: "fa-circle-question", text: "Help" },
        ];
      }
    }

    if (suggestions.length > 0) {
      suggestionsContainer.innerHTML = suggestions.map(function (s) {
        return `<div class="chat-suggestion-chip" data-msg="${s.text}"><i class="fas ${s.icon}"></i>${s.text}</div>`;
      }).join("");
      suggestionsContainer.style.display = "flex";

      // Bind click events
      suggestionsContainer.querySelectorAll(".chat-suggestion-chip").forEach(function (chip) {
        chip.addEventListener("click", function () {
          const msg = this.getAttribute("data-msg");
          inputField.value = msg;
          sendBtn.disabled = false;
          sendMessage();
        });
      });
    }
  }

  // ─── Scroll to Bottom ──────────────────────────────────
  function scrollToBottom() {
    requestAnimationFrame(function () {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    });
  }

  // ─── Check API Status ──────────────────────────────────
  async function checkStatus() {
    try {
      const res = await fetch("/api/chatbot/status");
      const data = await res.json();
      if (data.ai) {
        const statusSpan = chatWindow.querySelector(".chatbot-header-info span");
        if (statusSpan) {
          statusSpan.textContent = "● Online — AI Powered";
        }
      }
    } catch (e) {
      // Silently fail
    }
  }

})();
