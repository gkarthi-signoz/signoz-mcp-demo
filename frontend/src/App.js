import React, { useState, useRef, useEffect } from 'react';
import './App.css';
import ReactMarkdown from "react-markdown";


function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false); // New loading state
  const chatDisplayRef = useRef(null); // Reference for the chat display container

  useEffect(() => {
    if (chatDisplayRef.current) {
      chatDisplayRef.current.scrollTop = chatDisplayRef.current.scrollHeight;
    }
  }, [messages]); // Scroll to the bottom whenever messages change

  const handleSend = async () => {
    if (input.trim()) {
      const userMessage = input;
      setMessages([...messages, { sender: 'User', text: userMessage, fadeIn: true }]);
      setInput('');
      setLoading(true); // Set loading to true

      try {
        const response = await fetch('http://localhost:8001/query', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query: userMessage }),
        });

        const data = await response.json();
        setMessages((prevMessages) => [...prevMessages, { sender: 'Agent', text: data.response || 'No response received.', fadeIn: true }]);
      } catch (error) {
        setMessages((prevMessages) => [...prevMessages, { sender: 'Agent', text: 'Error: Unable to fetch response.', fadeIn: true }]);
      } finally {
        setLoading(false); // Set loading to false
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="App">
      <div className="app-container">
        <header className="app-header">
          <h1 className="app-title">SigNoz MCP Assistant</h1>
          <p className="app-subtitle">Your intelligent observability companion</p>
        </header>
        
        <div className="chat-container">
          <div className="chat-messages" ref={chatDisplayRef}>
            {messages.length === 0 && (
              <div className="welcome-message">
                <h3>Welcome to SigNoz MCP Assistant!</h3>
                <p>Ask me anything about your observability data, metrics, traces, or logs.</p>
              </div>
            )}
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`message-wrapper ${msg.sender === 'User' ? 'user-message' : 'agent-message'} ${msg.fadeIn ? 'fade-in' : ''}`}
              >
                <div className="message-bubble">
                  <div className="message-header">
                    <span className="message-sender">{msg.sender}</span>
                  </div>
                  <div className="message-content">
                    {msg.sender === 'User' ? (
                      <div>{msg.text}</div>
                    ) : (
                      <ReactMarkdown>{msg.text}</ReactMarkdown>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="loading-container">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <span className="loading-text">Agent is thinking...</span>
              </div>
            )}
          </div>
          
          <div className="chat-input-container">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message here... (Press Enter to send)"
              className="chat-input"
              rows="2"
            />
            <button
              onClick={handleSend}
              className="send-button"
              disabled={!input.trim() || loading}
            >
              <svg 
                className="send-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
