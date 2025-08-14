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
      setMessages([...messages, { sender: 'User', text: input, fadeIn: true }]);
      setInput('');
      setLoading(true); // Set loading to true

      try {
        const response = await fetch('http://localhost:8001/query', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query: input }),
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

  return (
    <div className="App">
      <header className="App-header">
        <h1>SigNoz MCP Chatbot</h1>
        <div className="chat-container" style={{ width: '600px' }}>
          <div
            className="chat-display"
            ref={chatDisplayRef} // Attach the ref to the chat display container
            style={{ overflowY: 'auto', maxHeight: '550px' }} // Ensure scrollable container
          >
            {messages.map((msg, index) => (
              <div
                key={index}
                className={msg.fadeIn ? 'fade-in' : ''}
                style={{
                  color: 'black',
                  textAlign: msg.sender === 'User' ? 'right' : 'left',
                  margin: '5px 10px', // Added horizontal margin to move text away from edges
                  padding: '10px',
                  backgroundColor: msg.sender === 'User' ? '#e0f7fa' : '#f1f8e9',
                  borderRadius: '5px',
                  fontSize: '0.8em', // Smaller font size
                }}
              >
                <strong>{msg.sender === 'Bot' ? 'Agent' : msg.sender}:</strong>
                {msg.sender === 'User' ? (
                  <div style={{ whiteSpace: 'pre-wrap', marginTop: '14px' }}>{msg.text}</div>
                ) : (
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                )}
              </div>
            ))}
            {loading && (
              <div className="loading-spinner"></div> // Display loading spinner
            )}
          </div>
          <div className="chat-input" style={{ display: 'flex', width: '100%', marginTop: '20px' }}> {/* Adjusted styles */}
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              style={{ flex: 1, padding: '8px', fontSize: '0.9em' }} // Reduced height input
            />
            <button
              onClick={handleSend}
              style={{
                padding: '10px 15px',
                fontSize: '0.9em',
                marginLeft: '5px',
                backgroundColor: '#007BFF',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                transition: 'background-color 0.3s ease',
              }}
              onMouseEnter={(e) => (e.target.style.backgroundColor = '#0056b3')}
              onMouseLeave={(e) => (e.target.style.backgroundColor = '#007BFF')}
            >
              Send
            </button>
          </div>
        </div>
      </header>
    </div>
  );
}

export default App;
