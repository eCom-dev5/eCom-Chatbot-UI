// import React, { useState, useEffect, CSSProperties } from 'react';

// interface ChatbotWidgetProps {
//   userId: string;
//   parentAsin: string;
// }

// interface Message {
//   type: 'user' | 'bot';
//   content: string;
//   followupQuestions?: string[];
// }

// const ChatbotWidget: React.FC<ChatbotWidgetProps> = ({ userId, parentAsin }) => {
//   const [messages, setMessages] = useState<Message[]>([
//     {
//       type: 'bot',
//       content:
//         "I'm Alpha, your product assistant. I'm here to help answer any questions you have about a product. Feel free to ask away, and I'll do my best to assist you. If you've already received information from Metadata or Review-Vectorstore, please share it with me so I can better understand your query.",
//     },
//   ]);
//   const [isChatOpen, setIsChatOpen] = useState(false);

//   // Load chat history from local storage when the component mounts
//   useEffect(() => {
//     const savedMessages = localStorage.getItem('chatbot_widget_history');
//     if (savedMessages) {
//       setMessages(JSON.parse(savedMessages));
//     }
//   }, []);

//   // Save chat history to local storage whenever messages change
//   useEffect(() => {
//     localStorage.setItem('chatbot_widget_history', JSON.stringify(messages));
//   }, [messages]);

//   const handleUserInput = async (userInput: string) => {
//     setMessages((prevMessages) => [
//       ...prevMessages,
//       { type: 'user', content: userInput },
//     ]);

//     try {
//       const response = await fetch('http://localhost:80/dev-invoke', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           user_input: userInput,
//           config: {},
//           parent_asin: parentAsin,
//           user_id: userId,
//           log_langfuse: false,
//           stream_tokens: false,
//         }),
//       });

//       if (response.ok) {
//         const data = await response.json();
//         setMessages((prevMessages) => [
//           ...prevMessages,
//           { type: 'bot', content: data.answer, followupQuestions: data.followup_questions },
//         ]);
//       } else {
//         setMessages((prevMessages) => [
//           ...prevMessages,
//           { type: 'bot', content: 'Sorry, there was an error processing your request.' },
//         ]);
//       }
//     } catch (error) {
//       console.error('Error:', error);
//       setMessages((prevMessages) => [
//         ...prevMessages,
//         { type: 'bot', content: 'Network error. Please try again.' },
//       ]);
//     }
//   };

//   const handleFollowUpClick = (question: string) => {
//     handleUserInput(question);
//   };

//   const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
//     if (e.key === 'Enter' && (e.target as HTMLInputElement).value.trim()) {
//       const userInput = (e.target as HTMLInputElement).value.trim();
//       (e.target as HTMLInputElement).value = ''; // Clear input field
//       handleUserInput(userInput);
//     }
//   };

//   // Custom styles for the chatbot with CSSProperties type
//   const styles: Record<string, CSSProperties> = {
//     headerStyle: {
//       backgroundColor: '#4A90E2',
//       color: '#FFFFFF',
//       padding: '10px',
//     },
//     chatWindowStyle: {
//       backgroundColor: '#F2F2F2',
//       padding: '10px',
//       height: '400px',
//       overflowY: 'auto' as 'auto',
//     },
//     botBubbleStyle: {
//       backgroundColor: '#4A90E2',
//       color: '#FFFFFF',
//       padding: '10px',
//       borderRadius: '8px',
//       maxWidth: '80%',
//       margin: '5px 0',
//     },
//     userBubbleStyle: {
//       backgroundColor: '#50E3C2',
//       color: '#FFFFFF',
//       padding: '10px',
//       borderRadius: '8px',
//       maxWidth: '80%',
//       alignSelf: 'flex-end',
//       margin: '5px 0',
//     },
//     followUpButton: {
//       backgroundColor: '#e0e0e0',
//       color: '#333',
//       border: 'none',
//       padding: '5px 10px',
//       borderRadius: '5px',
//       margin: '5px 0',
//       cursor: 'pointer',
//       display: 'inline-block',
//     },
//   };

//   return (
//     <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 1000 }}>
//       {isChatOpen && (
//         <div style={{ boxShadow: '0 0 10px rgba(0,0,0,0.1)', borderRadius: '8px', overflow: 'hidden', width: '350px' }}>
//           <div style={{ ...styles.headerStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
//           <div style={styles.chatWindowStyle}>
//             {messages.map((msg, index) => (
//               <div key={index} style={msg.type === 'user' ? styles.userBubbleStyle : styles.botBubbleStyle}>
//                 {msg.content}
//                 {msg.followupQuestions && (
//                   <div style={{ marginTop: '10px' }}>
//                     {msg.followupQuestions.map((question, qIndex) => (
//                       <button
//                         key={qIndex}
//                         onClick={() => handleFollowUpClick(question)}
//                         style={styles.followUpButton}
//                       >
//                         {question}
//                       </button>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             ))}
//           </div>
//           <div style={{ display: 'flex', padding: '10px', borderTop: '1px solid #ddd' }}>
//             <input
//               type="text"
//               placeholder="Type your message..."
//               style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
//               onKeyDown={handleKeyDown}
//             />
//           </div>
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
import React, { useState, useEffect, CSSProperties } from 'react';

interface ChatbotWidgetProps {
  userId: string;
  parentAsin: string;
}

interface Message {
  type: 'user' | 'bot';
  content: string;
  followupQuestions?: string[];
  feedbackSent?: boolean;
}

const ChatbotWidget: React.FC<ChatbotWidgetProps> = ({ userId, parentAsin }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      type: 'bot',
      content:
        "I'm Alpha, your product assistant. I'm here to help answer any questions you have about a product. Feel free to ask away, and I'll do my best to assist you. If you've already received information from Metadata or Review-Vectorstore, please share it with me so I can better understand your query.",
    },
  ]);
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    const savedMessages = localStorage.getItem('chatbot_widget_history');
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('chatbot_widget_history', JSON.stringify(messages));
  }, [messages]);

  const handleUserInput = async (userInput: string) => {
    setMessages((prevMessages) => [
      ...prevMessages,
      { type: 'user', content: userInput },
    ]);

    try {
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

      if (response.ok) {
        const data = await response.json();
        setMessages((prevMessages) => [
          ...prevMessages,
          { type: 'bot', content: data.answer, followupQuestions: data.followup_questions, feedbackSent: false },
        ]);
      } else {
        setMessages((prevMessages) => [
          ...prevMessages,
          { type: 'bot', content: 'Sorry, there was an error processing your request.' },
        ]);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages((prevMessages) => [
        ...prevMessages,
        { type: 'bot', content: 'Network error. Please try again.' },
      ]);
    }
  };

  const handleFeedback = async (feedback: boolean, index: number) => {
    const updatedMessages = [...messages];
    updatedMessages[index].feedbackSent = true;
    setMessages(updatedMessages);

    // Send feedback to the API as 1 for true/positive and 0 for false/negative
    try {
      await fetch('http://localhost:80/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: updatedMessages[index].content,
          feedback: feedback ? 1 : 0,
          user_id: userId,
        }),
      });
    } catch (error) {
      console.error('Error sending feedback:', error);
    }
  };

  const handleFollowUpClick = (question: string) => {
    handleUserInput(question);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && (e.target as HTMLInputElement).value.trim()) {
      const userInput = (e.target as HTMLInputElement).value.trim();
      (e.target as HTMLInputElement).value = '';
      handleUserInput(userInput);
    }
  };

  const styles: Record<string, CSSProperties> = {
    headerStyle: {
      backgroundColor: '#4A90E2',
      color: '#FFFFFF',
      padding: '10px',
      fontWeight: 'bold',
      fontSize: '1.2rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    chatWindowStyle: {
      backgroundColor: '#F5F5DC', // Beige background
      padding: '10px',
      height: '300px',
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
    },
    botBubbleStyle: {
      backgroundColor: '#333333',
      color: '#FFFFFF',
      padding: '10px',
      borderRadius: '15px',
      maxWidth: '90%',
      margin: '5px 0',
      alignSelf: 'flex-start',
      position: 'relative',
    },
    userBubbleStyle: {
      backgroundColor: '#4A90E2',
      color: '#FFFFFF',
      padding: '10px',
      borderRadius: '15px',
      maxWidth: '90%',
      margin: '5px 0',
      alignSelf: 'flex-end',
    },
    feedbackContainer: {
      display: 'flex',
      gap: '20px',
      marginTop: '5px',
      marginLeft: '5px',
    },
    feedbackIcon: {
      cursor: 'pointer',
      fontSize: '1.2rem',
      color: '#FFC107',
    },
    followUpSection: {
      backgroundColor: '#e0e0e0',
      padding: '2px',
      borderRadius: '10px',
      marginTop: '1px',
      display: 'flex',
      flexDirection: 'column',
      gap: '3px',
    },
    followUpButton: {
      backgroundColor: '#F5F5DC',
      color: '#333',
      padding: '1px',
      borderRadius: '10px',
      fontSize: '0.9rem',
      border: 'none',
      cursor: 'pointer',
      width: '100%',
    },
    inputContainer: {
      display: 'flex',
      padding: '10px',
      borderTop: '1px solid #ddd',
      alignItems: 'center',
    },
    inputStyle: {
      flex: 1,
      padding: '10px',
      borderRadius: '20px',
      border: '1px solid #ddd',
      marginRight: '10px',
    },
    sendButton: {
      backgroundColor: '#4A90E2',
      color: '#FFFFFF',
      border: 'none',
      borderRadius: '50%',
      width: '40px',
      height: '40px',
      cursor: 'pointer',
      fontSize: '18px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    floatingButtonContainer: {
      position: 'fixed',
      bottom: '60px',
      right: '90px',
      display: 'flex',
      alignItems: 'center',
    },
    floatingTextBubble: {
      backgroundColor: '#6A1B9A',
      color: '#FFFFFF',
      padding: '10px 15px',
      borderRadius: '20px',
      fontSize: '1.4rem',
      marginRight: '10px',
    },
    floatingButton: {
      backgroundColor: '#4A90E2',
      color: '#FFFFFF',
      border: 'none',
      borderRadius: '50%',
      width: '70px',
      height: '70px',
      cursor: 'pointer',
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '3rem', // Larger font for the chat icon

    },
    notificationBadge: {
      position: 'absolute',
      top: '-5px',
      right: '-5px',
      backgroundColor: '#FF4081',
      color: '#FFFFFF',
      borderRadius: '50%',
      padding: '5px',
      fontSize: '0.8rem',
    },
  };

  return (
    <div>
      {isChatOpen && (
        <div style={{ boxShadow: '0 0 10px rgba(0,0,0,0.1)', borderRadius: '8px', overflow: 'hidden', width: '430px', position: 'fixed', bottom: '80px', right: '20px' }}>
          <div style={styles.headerStyle}>
            <span>Alpha</span>
            <button onClick={() => setIsChatOpen(false)} style={{ background: 'none', border: 'none', color: '#FFFFFF', fontSize: '1.5rem', cursor: 'pointer' }}>✖</button>
          </div>
          <div style={styles.chatWindowStyle}>
            {messages.map((msg, index) => (
              <div key={index} style={msg.type === 'user' ? styles.userBubbleStyle : styles.botBubbleStyle}>
                {msg.content}
                {msg.type === 'bot' && !msg.feedbackSent && (
                  <div style={styles.feedbackContainer}>
                    <span
                      style={styles.feedbackIcon}
                      onClick={() => handleFeedback(true, index)} // Thumbs up as true (1)
                    >
                      👍
                    </span>
                    <span
                      style={styles.feedbackIcon}
                      onClick={() => handleFeedback(false, index)} // Thumbs down as false (0)
                    >
                      👎
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
          {/* Separate Follow-up Section */}
          {messages[messages.length - 1]?.followupQuestions && (
            <div style={styles.followUpSection}>
              {messages[messages.length - 1].followupQuestions?.map((question, qIndex) => (
                <button
                  key={qIndex}
                  onClick={() => handleFollowUpClick(question)}
                  style={styles.followUpButton}
                >
                  {question}
                </button>
              ))}
            </div>
          )}
          <div style={styles.inputContainer}>
            <input
              type="text"
              placeholder="Type your message..."
              style={styles.inputStyle}
              onKeyDown={handleKeyDown}
            />
            <button style={styles.sendButton}>➤</button>
          </div>
        </div>
      )}
      <div style={styles.floatingButtonContainer} onClick={() => setIsChatOpen(!isChatOpen)}>
        {!isChatOpen && (
          <>
            <div style={styles.floatingTextBubble}>Talk to me! 😊</div>
            <div style={styles.floatingButton}>
              <span style={styles.notificationBadge}>3</span>
              💬
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ChatbotWidget;
