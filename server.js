require('dotenv').config();
import express, { json } from 'express';
import cors from 'cors';
import { initializeApp, credential as _credential, firestore } from 'firebase-admin';
import { HfInference } from '@huggingface/inference';

const app = express();
app.use(cors());
app.use(json());

// Initialize Firebase
import serviceAccount from './serviceAccountKey.json';
initializeApp({
  credential: _credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
  })
});
const db = firestore();

// Initialize Hugging Face
const hf = new HfInference(process.env.HF_TOKEN);

// Generate a unique session ID for anonymous users
function generateSessionId() {
  return 'session_' + Math.random().toString(36).substr(2, 9);
}

// Store message in Firestore
async function storeMessage(sessionId, role, content) {
  const messagesRef = db.collection('sessions').doc(sessionId).collection('messages');
  await messagesRef.add({
    role,
    content,
    timestamp: firestore.FieldValue.serverTimestamp()
  });
}

// Get conversation history
async function getConversationHistory(sessionId) {
  const messagesRef = db.collection('sessions').doc(sessionId).collection('messages');
  const snapshot = await messagesRef.orderBy('timestamp').get();
  return snapshot.docs.map(doc => doc.data());
}

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, sessionId = generateSessionId() } = req.body;
    
    // Store user message
    await storeMessage(sessionId, 'user', message);
    
    // Get conversation history
    const conversation = await getConversationHistory(sessionId);
    
    // Format messages for Hugging Face
    const messages = conversation.map(msg => ({
      role: msg.role,
      content: msg.content
    }));
    
    // Get AI response
    const response = await hf.conversational({
      model: 'facebook/blenderbot-400M-distill',
      inputs: {
        past_user_inputs: messages.filter(m => m.role === 'user').map(m => m.content),
        generated_responses: messages.filter(m => m.role === 'assistant').map(m => m.content),
        text: message
      }
    });
    
    const aiResponse = response.generated_text;
    
    // Store AI response
    await storeMessage(sessionId, 'assistant', aiResponse);
    
    res.json({ response: aiResponse, sessionId });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.get('/test-firebase', async (req, res) => {
  try {
    const docRef = db.collection('test').doc('test');
    await docRef.set({ test: new Date() });
    res.send('Firebase connection successful');
  } catch (error) {
    console.error('Firebase error:', error);
    res.status(500).send('Firebase error: ' + error.message);
  }
});