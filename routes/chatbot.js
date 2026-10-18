const express = require("express");
const router = express.Router();
const chatbotController = require("../controllers/chatbot.js");

// POST /api/chatbot - Handle chat messages
router.post("/", chatbotController.handleChat);

// GET /api/chatbot/status - Check chatbot status
router.get("/status", chatbotController.getStatus);

module.exports = router;
