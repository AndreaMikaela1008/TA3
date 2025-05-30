import React, { useState } from "react";
import { Box, TextField, Button, List, ListItem, ListItemText, Paper } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import axios from "axios";

const Chatbot = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [userId] = useState("guest-" + Math.random().toString(36).substring(2, 9));

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { text: input, sender: "user" };
    setMessages(prev => [...prev, userMessage]);
    setInput("");

    try {
      const res = await axios.post("http://localhost:5000/api/chat", {
        message: input,
        userId: userId
      });
      
      const aiResponse = { text: res.data.response, sender: "ai" };
      setMessages(prev => [...prev, aiResponse]);
      
    } catch (error) {
      console.error("Network error:", {
        status: error.response?.status,
        data: error.response?.data
      });
      alert("Message failed - check console for details");
    }
  };

  return (
    <Box sx={{ maxWidth: 600, margin: "auto", p: 2 }}>
      <Paper elevation={3} sx={{ p: 2, height: 400, overflow: "auto", mb: 2 }}>
        <List>
          {messages.map((msg, i) => (
            <ListItem key={i}>
              <ListItemText
                primary={msg.sender}
                secondary={msg.text}
                sx={{ 
                  textAlign: msg.sender === "user" ? "right" : "left",
                  bgcolor: msg.sender === "user" ? "#e3f2fd" : "#f5f5f5",
                  borderRadius: 2,
                  p: 1
                }}
              />
            </ListItem>
          ))}
        </List>
      </Paper>
      <Box sx={{ display: "flex" }}>
        <TextField
          fullWidth
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          onKeyPress={(e) => e.key === "Enter" && handleSend()}
        />
        <Button 
          variant="contained" 
          onClick={handleSend}
          sx={{ ml: 1 }}
        >
          <SendIcon />
        </Button>
      </Box>
    </Box>
  );
};

export default Chatbot;