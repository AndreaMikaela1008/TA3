const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
const axios = require('axios');
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Firebase
const serviceAccount = require("./serviceAccountKey.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
});

const db = admin.firestore();

// API Endpoint
app.post("/api/chat", async (req, res) => {
  try {
    const { message, userId } = req.body;
    const chatRef = db.collection("chats").doc(userId);
    const chatDoc = await chatRef.get();
    const conversation = chatDoc.exists ? chatDoc.data().messages : [];
    console.log("Incoming request:", {
      message: req.body.message,
      userId: req.body.userId,
      headers: req.headers
});

    conversation.push({ role: "user", content: message });
    console.log("Using API key:", process.env.OPENROUTER_API_KEY);
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: "openai/gpt-3.5-turbo",
        messages: conversation,
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'chatbooot',
          'Content-Type': 'application/json'
        }
      }
    );
    
    const aiResponse = response.data.choices[0].message.content;
    conversation.push({ role: "assistant", content: aiResponse });
    
    await chatRef.set({ messages: conversation });
    res.json({ response: aiResponse });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Chat processing failed' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

