import React, { useState, useEffect } from 'react';
import ChatBot from 'react-chatbotify';

interface ChatbotWidgetProps {
  userId: string;
  parentAsin: string;
}
interface Message {
  type: 'user' | 'bot';
  content: string;
  followupQuestions?: string[];
}

const ChatbotWidget: React.FC<ChatbotWidgetProps> = ({ userId, parentAsin }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      type: 'bot',
      content: "I'm Alpha, your product assistant. I'm here to help answer any questions you have about a product. Feel free to ask away, and I'll do my best to assist you. If you've already received information from Metadata or Review-Vectorstore, please share it with me.",
      followupQuestions: [
        "What can you help me with?",
        "What is your purpose or function?",
        "How do you handle sensitive information?"
      ],
    },
  ]);
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    // Load chat history from localStorage
    const savedMessages = localStorage.getItem('chatbot_widget_history');
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    }
  }, []);

  useEffect(() => {
    // Save chat history to localStorage
    localStorage.setItem('chatbot_widget_history', JSON.stringify(messages));
  }, [messages]);

  const handleUserInput = async (userInput: string) => {
    setMessages((prevMessages) => [...prevMessages, { type: 'user', content: userInput }]);

    const response = await fetch('http://localhost:80/dev-invoke', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_input: userInput,
        config: {},
        parent_asin: parentAsin,
        user_id: userId,
        log_langfuse: true,
        stream_tokens: true,
      }),
    });

    if (!response.ok) {
      setMessages((prevMessages) => [
        ...prevMessages,
        { type: 'bot', content: 'Sorry, there was an error processing your request.' },
      ]);
      return;
    }

    const data = await response.json();
    setMessages((prevMessages) => [
      ...prevMessages,
      { type: 'bot', content: data.answer, followupQuestions: data.followup_questions },
    ]);
  };

  const handleFollowUpClick = (question: string) => {
    handleUserInput(question);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && (e.target as HTMLInputElement).value.trim()) {
      const userInput = (e.target as HTMLInputElement).value.trim();
      handleUserInput(userInput);
      (e.target as HTMLInputElement).value = '';
    }
  };

  // Define custom styles
  const styles = {
    headerStyle: {
      background: '#4A90E2',
      color: '#FFFFFF',
      padding: '10px',
    },
    chatWindowStyle: {
      backgroundColor: '#F2F2F2',
    },
    botBubbleStyle: {
      backgroundColor: '#4A90E2',
      color: '#FFFFFF',
    },
    userBubbleStyle: {
      backgroundColor: '#50E3C2',
      color: '#FFFFFF',
    },
  };

  return (
    <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 1000 }}>
      {isChatOpen && (
        <div style={{ boxShadow: '0 0 10px rgba(0,0,0,0.1)', borderRadius: '8px', overflow: 'hidden', width: '350px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', ...styles.headerStyle }}>
            <span>Chatbot</span>
            <button
              onClick={() => setIsChatOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                color: '#FFFFFF',
                fontSize: '16px',
                cursor: 'pointer',
              }}
            >
              ✖
            </button>
          </div>
          <div style={{ ...styles.chatWindowStyle, padding: '10px', height: '400px', overflowY: 'auto' }}>
            {messages.map((msg, index) => (
              <div key={index} style={{ marginBottom: '10px' }}>
                <div
                  style={{
                    backgroundColor: msg.type === 'user' ? styles.userBubbleStyle.backgroundColor : styles.botBubbleStyle.backgroundColor,
                    color: msg.type === 'user' ? styles.userBubbleStyle.color : styles.botBubbleStyle.color,
                    padding: '10px',
                    borderRadius: '8px',
                    alignSelf: msg.type === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '80%',
                  }}
                >
                  {msg.content}
                </div>
                {msg.followupQuestions && (
                  <div style={{ marginTop: '10px' }}>
                    {msg.followupQuestions.map((question, qIndex) => (
                      <button
                        key={qIndex}
                        onClick={() => handleFollowUpClick(question)}
                        style={{
                          backgroundColor: '#e0e0e0',
                          color: '#333',
                          border: 'none',
                          padding: '5px 10px',
                          borderRadius: '5px',
                          margin: '5px',
                          cursor: 'pointer',
                        }}
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', padding: '10px', borderTop: '1px solid #ddd' }}>
            <input
              type="text"
              placeholder="Type your message..."
              style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
              onKeyDown={handleKeyDown}
            />
          </div>
        </div>
      )}
      {!isChatOpen && (
        <button
          onClick={() => setIsChatOpen(true)}
          style={{
            backgroundColor: '#4A90E2',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '50%',
            width: '60px',
            height: '60px',
            cursor: 'pointer',
            fontSize: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          💬
        </button>
      )}
    </div>
  );
};

export default ChatbotWidget;
