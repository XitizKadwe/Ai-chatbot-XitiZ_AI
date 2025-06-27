// src/App.js (Updated with react-markdown support)
import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './App.css';

const App = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your XitiZ AI assistant. How can I help you today?",
      sender: 'ai',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (inputText.trim() === '' || isLoading) return;

    const userMessage = {
      id: messages.length + 1,
      text: inputText,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${API_KEY}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'XitiZ AI Chatbot'
        },
        body: JSON.stringify({
          model: 'deepseek/deepseek-chat-v3-0324:free',
          messages: [{ role: 'user', content: inputText }],
          max_tokens: 800,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `API error: ${response.status}`);
      }

      const data = await response.json();
      const aiResponse = data.choices?.[0]?.message?.content || "I couldn't generate a response. Please try again.";

      const aiMessage = {
        id: messages.length + 2,
        text: aiResponse,
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      console.error('API Error:', err);
      setError(err.message || 'Failed to get response. Please try again.');

      const errorMessage = {
        id: messages.length + 2,
        text: "I'm having trouble responding right now. Please try again later.",
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: 1,
        text: "Hello! I'm your XitiZ AI assistant. How can I help you today?",
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setError(null);
  };

  return (
    <div className="app">
      <div className="header">
        <div className="logo-container">
          <div className="logo">
            <div className="logo-icon">XitiZ</div>
            <div className="logo-text">XitiZ AI</div>
          </div>
          <div className="model-info">Model: DeepSeek Chat V3 (free)</div>
        </div>
        <div className="header-right">
          <div className="status">
            <div className={`status-indicator ${isLoading ? 'typing' : ''}`}></div>
            <span>{isLoading ? 'Thinking...' : 'Online'}</span>
          </div>
          <button className="clear-btn" onClick={clearChat}>New Chat</button>
        </div>
      </div>

      <div className="chat-container">
        <div className="messages">
          {messages.map((message) => (
            <div key={message.id} className={`message ${message.sender}`}>
              <div className="avatar">
                <div className={message.sender === 'ai' ? 'ai-avatar' : 'user-avatar'}>
                  🤖
                </div>
              </div>
              <div className="message-content">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({node, ...props}) => <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }} {...props} />,
                    h2: ({node, ...props}) => <h2 style={{ fontSize: '1.3rem', fontWeight: 'bold' }} {...props} />,
                    p: ({node, ...props}) => <p style={{ marginBottom: '0.5rem' }} {...props} />,
                    code: ({inline, children, ...props}) => (
                      <code style={{ background: '#f4f4f4', padding: '2px 4px', borderRadius: '4px',color:'blue' }} {...props}>
                        {children}
                      </code>
                    ),
                    pre: ({node, ...props}) => (
                      <pre style={{ background: '#f4f4f4', padding: '10px', borderRadius: '6px', overflow: 'auto',color: 'black' }} {...props} />
                    )
                  }}
                >
                  {message.text}
                </ReactMarkdown>
                <div className="timestamp">{message.timestamp}</div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="message ai">
              <div className="avatar"><div className="ai-avatar">🤖</div></div>
              <div className="message-content">
                <div className="typing-indicator">
                  <span></span><span></span><span></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {error && (
        <div className="error-message">
          <h3>API Error</h3>
          <div className="error-text">{error}</div>
        </div>
      )}

      <div className="input-area">
        <div className="input-container">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Message XitiZ AI..."
            rows="1"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={inputText.trim() === '' || isLoading}
            className="send-btn"
          >
            Send
          </button>
        </div>
        <div className="input-footer">
          <p>XitiZ AI can make mistakes. Verify important information.</p>
        </div>
      </div>

      <div className="footer">
        <div className="footer-content">
          <div className="footer-logo">XitiZ AI</div>
          <div className="footer-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Status</a>
          </div>
          <div className="footer-copyright">© 2025 XitiZ. All rights reserved.</div>
        </div>
      </div>
    </div>
  );
};

export default App;
