import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Box, TextField, IconButton, Paper, Typography, List, ListItem, ListItemText, Avatar } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState(null);
  const messagesEndRef = useRef(null);

  // Load conversation history if sessionId exists
  useEffect(() => {
    if (sessionId) {
      // In a real app, you might load previous messages here
      console.log(`Session ID: ${sessionId}`);
    }
  }, [sessionId]);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (input.trim() === '') return;

    // Add user message to UI immediately
    const userMessage = { text: input, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    try {
      // Send to backend
      const API_URL = "https://chatbot-backend-sz02.onrender.com/api/chat";

      const response = await axios.post(`${API_URL}/api/chat`, {
        message: input,
        sessionId
      });

      // Update session ID if it's a new session
      if (!sessionId && response.data.sessionId) {
        setSessionId(response.data.sessionId);
      }

      // Add AI response to UI
      const aiMessage = { text: response.data.response, sender: 'ai' };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, { 
        text: 'Sorry, I encountered an error. Please try again.', 
        sender: 'ai' 
      }]);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '80vh', 
      maxWidth: '800px', 
      margin: 'auto', 
      border: '1px solid #ddd',
      borderRadius: '8px',
      overflow: 'hidden'
    }}>
      <Box sx={{ 
        flexGrow: 1, 
        overflowY: 'auto', 
        padding: '16px',
        backgroundColor: '#f9f9f9'
      }}>
        {messages.length === 0 ? (
          <Typography variant="body1" color="textSecondary" textAlign="center" mt={4}>
            Start a conversation with the chatbot
          </Typography>
        ) : (
          <List>
            {messages.map((msg, index) => (
              <ListItem key={index} sx={{ 
                justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                padding: '8px 16px'
              }}>
                {msg.sender === 'ai' && (
                  <Avatar sx={{ 
                    bgcolor: '#3f51b5', 
                    marginRight: '8px',
                    width: '32px',
                    height: '32px'
                  }}>
                    AI
                  </Avatar>
                )}
                <Paper sx={{
                  padding: '8px 16px',
                  maxWidth: '70%',
                  backgroundColor: msg.sender === 'user' ? '#3f51b5' : '#fff',
                  color: msg.sender === 'user' ? '#fff' : '#000',
                  borderRadius: msg.sender === 'user' 
                    ? '18px 18px 0 18px' 
                    : '18px 18px 18px 0'
                }}>
                  <ListItemText primary={msg.text} />
                </Paper>
                {msg.sender === 'user' && (
                  <Avatar sx={{ 
                    bgcolor: '#f50057', 
                    marginLeft: '8px',
                    width: '32px',
                    height: '32px'
                  }}>
                    U
                  </Avatar>
                )}
              </ListItem>
            ))}
            <div ref={messagesEndRef} />
          </List>
        )}
      </Box>
      <Box sx={{ 
        display: 'flex', 
        padding: '16px', 
        borderTop: '1px solid #ddd',
        backgroundColor: '#fff'
      }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          sx={{ marginRight: '8px' }}
        />
        <IconButton 
          color="primary" 
          onClick={handleSend}
          disabled={!input.trim()}
          sx={{ 
            backgroundColor: '#3f51b5',
            color: '#fff',
            '&:hover': {
              backgroundColor: '#303f9f'
            }
          }}
        >
          <SendIcon />
        </IconButton>
      </Box>
    </Box>
  );
};

export default Chatbot;