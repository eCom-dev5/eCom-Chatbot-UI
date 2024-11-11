import React, { useState } from 'react';
import ChatBot from 'react-chatbotify';

interface Message {
  type: 'user' | 'bot';
  content: string;
  followupQuestions?: string[];
}

const ChatbotWidget: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [userId] = useState('3'); // Replace with dynamic user ID as needed
  const [parentAsin] = useState('B0B94CZQ3S'); // Replace with dynamic ASIN as needed
  const [isChatOpen, setIsChatOpen] = useState(false);

  const handleUserInput = async (userInput: string) => {
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
        log_langfuse: false,
        stream_tokens: false,
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
    setMessages((prevMessages) => [
      ...prevMessages,
      { type: 'user', content: question },
    ]);
    handleUserInput(question);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && (e.target as HTMLInputElement).value.trim()) {
      const userInput = (e.target as HTMLInputElement).value.trim();
      setMessages((prevMessages) => [
        ...prevMessages,
        { type: 'user', content: userInput },
      ]);
      handleUserInput(userInput);
      (e.target as HTMLInputElement).value = '';
    }
  };

  // Define chatbot settings
  const settings = {
    general: {
      embedded: true,
      primaryColor: '#4A90E2',
      secondaryColor: '#50E3C2',
    },
    chatHistory: {
      storageKey: 'chatbot_widget_history',
    },
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


// import React, { useState } from 'react';
// import ChatBot from 'react-chatbotify';

// const ChatbotWidget: React.FC = () => {
//   const [userId] = useState('3'); // Replace with dynamic user ID as needed
//   const [parentAsin] = useState('B0B94CZQ3S'); // Replace with dynamic ASIN as needed
//   const [isChatOpen, setIsChatOpen] = useState(false);

//   // Define the chatbot flow
//   const flow = {
//     start: {
//       message: 'Hello! How can I assist you today?',
//       path: 'user_input',
//     },
//     user_input: {
//       message: 'Please type your question below:',
//       function: async (params: any) => {
//         const userInput = params.userInput;
//         const response = await fetch('http://localhost:80/dev-invoke', {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//           },
//           body: JSON.stringify({
//             user_input: userInput,
//             config: {},
//             parent_asin: parentAsin,
//             user_id: userId,
//             log_langfuse: false,
//             stream_tokens: false,
//           }),
//         });
    
//         if (!response.ok) {
//           return 'Sorry, there was an error processing your request.';
//         }
    
//         const data = await response.json();
//         console.log("Backend Response:", data);
    
//         // Display the main answer as the initial bot response
//         const mainAnswer = data.answer || 'No response received.';
//         await params.injectMessage(mainAnswer);
    
//         // Display each follow-up question as a separate bot message
//         if (data.followup_questions && data.followup_questions.length > 0) {
//           for (let i = 0; i < data.followup_questions.length; i++) {
//             const followupQuestion = data.followup_questions[i];
//             await new Promise((resolve) => setTimeout(resolve, 500)); // Delay for effect
//             await params.injectMessage(followupQuestion);
//           }
//         }
    
//         // Keep the path at 'user_input' to allow continuous interaction
//         return '';
//       },
//       path: 'user_input',
//     },
    
//   };

//   // Define chatbot settings
//   const settings = {
//     general: {
//       embedded: true,
//       primaryColor: '#4A90E2',
//       secondaryColor: '#50E3C2',
//     },
//     chatHistory: {
//       storageKey: 'chatbot_widget_history',
//     },
//   };

//   // Define custom styles
//   const styles = {
//     headerStyle: {
//       background: '#4A90E2',
//       color: '#FFFFFF',
//       padding: '10px',
//     },
//     chatWindowStyle: {
//       backgroundColor: '#F2F2F2',
//     },
//     botBubbleStyle: {
//       backgroundColor: '#4A90E2',
//       color: '#FFFFFF',
//       maxWidth: '300px', // Adjust width for more space
//       whiteSpace: 'pre-wrap', // Preserve formatting for line breaks
//     },
//     userBubbleStyle: {
//       backgroundColor: '#50E3C2',
//       color: '#FFFFFF',
//     },
//   };

//   return (
//     <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 1000 }}>
//       {isChatOpen && (
//         <div style={{ boxShadow: '0 0 10px rgba(0,0,0,0.1)', borderRadius: '8px', overflow: 'hidden' }}>
//           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', ...styles.headerStyle }}>
//             <span>Chatbot</span>
//             <button
//               onClick={() => setIsChatOpen(false)}
//               style={{
//                 background: 'none',
//                 border: 'none',
//                 color: '#FFFFFF',
//                 fontSize: '16px',
//                 cursor: 'pointer',
//               }}
//             >
//               ✖
//             </button>
//           </div>
//           <ChatBot flow={flow} settings={settings} styles={styles} />
//         </div>
//       )}
//       {!isChatOpen && (
//         <button
//           onClick={() => setIsChatOpen(true)}
//           style={{
//             backgroundColor: '#4A90E2',
//             color: '#FFFFFF',
//             border: 'none',
//             borderRadius: '50%',
//             width: '60px',
//             height: '60px',
//             cursor: 'pointer',
//             fontSize: '24px',
//             display: 'flex',
//             alignItems: 'center',
//             justifyContent: 'center',
//           }}
//         >
//           💬
//         </button>
//       )}
//     </div>
//   );
// };

// export default ChatbotWidget;
