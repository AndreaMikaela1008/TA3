import React from 'react';
import Chatbot from './chatbot';
import { Container, Typography, CssBaseline } from '@mui/material';

function App() {
  return (
    <>
      <CssBaseline />
      <Container maxWidth="md" sx={{ padding: '24px' }}>
        <Typography variant="h3" component="h1" gutterBottom align="center">
          AI Chatbot
        </Typography>
        <Chatbot />
      </Container>
    </>
  );
}

export default App;