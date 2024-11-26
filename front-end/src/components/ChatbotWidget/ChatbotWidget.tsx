import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  IconButton,
  TextField,
  Fab,
  Paper,
  CircularProgress,
  useMediaQuery,
  Badge,
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import SendIcon from '@mui/icons-material/Send';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import CloseIcon from '@mui/icons-material/Close';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import { useChatbotLogic, ChatbotWidgetProps } from './ChatbotLogic';

const ChatbotWidget: React.FC<ChatbotWidgetProps> = ({ userId, parentAsin }) => {
  const {
    messages,
    isChatOpen,
    setIsChatOpen,
    handleUserInput,
    clearChatHistory,
    handleFeedback,
    handleFollowUpClick,
  } = useChatbotLogic(userId, parentAsin);

  const isMobile = useMediaQuery('(max-width:600px)');
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatHeight, setChatHeight] = useState(isMobile ? 400 : 500);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const isResizing = useRef(false);
  const startY = useRef(0);
  const startHeight = useRef(chatHeight);

  const handleResizeStart = (
    e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>
  ) => {
    isResizing.current = true;
    startY.current = 'clientY' in e ? e.clientY : e.touches[0]?.clientY || 0;
    startHeight.current = chatHeight;
  };

  const handleResizeMove = (e: MouseEvent | TouchEvent) => {
    if (!isResizing.current) return;
    const currentY = 'clientY' in e ? e.clientY : (e as TouchEvent).touches[0]?.clientY || 0;
    const newHeight = Math.max(300, startHeight.current + (startY.current - currentY));
    setChatHeight(newHeight);
  };

  const handleResizeEnd = () => {
    isResizing.current = false;
  };

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
    setIsAtBottom(true);
  };

  useEffect(() => {
    const handleScroll = () => {
      if (!chatContainerRef.current) return;
      const isAtBottomNow =
        chatContainerRef.current.scrollHeight - chatContainerRef.current.scrollTop ===
        chatContainerRef.current.clientHeight;
      setIsAtBottom(isAtBottomNow);
    };

    chatContainerRef.current?.addEventListener('scroll', handleScroll);
    return () => chatContainerRef.current?.removeEventListener('scroll', handleScroll);
  }, []);

  const sendMessage = async () => {
    if (!inputValue.trim()) return;
    setIsLoading(true);
    await handleUserInput(inputValue);
    setInputValue('');
    setIsLoading(false);
    scrollToBottom();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      sendMessage();
    }
  };

  return (
    <Box>
      {isChatOpen ? (
        <Paper
          elevation={3}
          sx={{
            position: 'fixed',
            bottom: '30px',
            right: '30px',
            width: isMobile ? '95%' : '400px',
            height: `${chatHeight}px`,
            display: 'flex',
            flexDirection: 'column',
            borderRadius: '10px',
            boxShadow: 3,
          }}
          onMouseMove={(e) => handleResizeMove(e as unknown as MouseEvent)}
          onMouseUp={handleResizeEnd}
          onTouchMove={(e) => handleResizeMove(e as unknown as TouchEvent)}
          onTouchEnd={handleResizeEnd}
        >
          {/* Drag Bar */}
          <Box
            onMouseDown={handleResizeStart}
            onTouchStart={handleResizeStart}
            sx={{
              height: '10px',
              backgroundColor: '#E0E0E0',
              cursor: 'ns-resize',
              borderTopLeftRadius: '10px',
              borderTopRightRadius: '10px',
            }}
          />
          {/* Header */}
          <Box
            sx={{
              backgroundColor: '#F5F5F5',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              p: 2,
              borderBottom: '1px solid #E0E0E0',
              position: 'relative',
            }}
          >
            <Typography variant="h6" fontWeight="bold">
              VERTA <span style={{ fontSize: '0.75rem', fontWeight: 400 }}>beta</span>
            </Typography>
            <Box sx={{ position: 'absolute', right: 15 }}>
              <IconButton onClick={clearChatHistory}>
                <DeleteOutlineIcon />
              </IconButton>
              <IconButton onClick={() => setIsChatOpen(false)}>
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>
          {/* Chat Messages */}
          <Box
            ref={chatContainerRef}
            sx={{
              flex: 1,
              p: 2,
              backgroundColor: '#FFFFFF',
              overflowY: 'auto',
              position: 'relative',
            }}
          >
            {messages.map((msg, index) => (
              <Box
                key={index}
                sx={{
                  mb: 2,
                  textAlign: msg.type === 'user' ? 'right' : 'left',
                }}
              >
                <Typography
                  sx={{
                    color: msg.type === 'user' ? '#0073E6' : '#333',
                    fontWeight: 500,
                    fontSize: '1rem',
                    backgroundColor: msg.type === 'user' ? '#E3F2FD' : '#F9EBEA',
                    display: 'inline-block',
                    borderRadius: '10px',
                    padding: '8px 12px',
                    maxWidth: '70%',
                  }}
                >
                  {msg.content}
                </Typography>
                {msg.type === 'bot' && msg.followupQuestions && msg.followupQuestions.length > 0 && (
                  <Box>
                    {msg.followupQuestions.map((question, idx) => (
                      <Typography
                        key={idx}
                        sx={{
                          cursor: 'pointer',
                          color: '#0073E6',
                          mt: 1,
                          fontSize: '0.9rem',
                        }}
                        onClick={() => handleFollowUpClick(question)}
                      >
                        {question}
                      </Typography>
                    ))}
                  </Box>
                )}
              </Box>
            ))}
            {isLoading && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  mt: 2,
                }}
              >
                <CircularProgress size={20} sx={{ mr: 1 }} />
                <Typography variant="body2">Verta is typing...</Typography>
              </Box>
            )}
          </Box>
          {/* Scroll to Bottom Button */}
          {!isAtBottom && (
            <Fab
              size="small"
              onClick={scrollToBottom}
              sx={{
                position: 'absolute',
                bottom: 60,
                right: 20,
                backgroundColor: '#FF8C00',
                color: 'white',
                '&:hover': { backgroundColor: '#E67E22' },
              }}
            >
              <ArrowDownwardIcon />
            </Fab>
          )}
          {/* Input Section */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              p: 2,
              borderTop: '1px solid #E0E0E0',
              backgroundColor: '#FFFFFF',
            }}
          >
            <TextField
              fullWidth
              placeholder="Ask Verta a question"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              sx={{
                mr: 1,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 25,
                },
              }}
            />
            {inputValue.trim() && (
              <IconButton
                onClick={sendMessage}
                sx={{
                  backgroundColor: '#0073E6',
                  color: 'white',
                  '&:hover': { backgroundColor: '#005BB5' },
                  borderRadius: '50%',
                }}
              >
                <SendIcon />
              </IconButton>
            )}
          </Box>
        </Paper>
      ) : (
        <Box
          sx={{
            position: 'fixed',
            bottom: '30px',
            right: '30px',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <Badge badgeContent={messages.length - 1} color="error">
            <Fab
              color="primary"
              onClick={() => setIsChatOpen(true)}
              sx={{ backgroundColor: '#0073E6', color: 'white' }}
            >
              <ChatBubbleOutlineIcon />
            </Fab>
          </Badge>
          <Typography
            sx={{
              color: '#0073E6',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: isMobile ? '0.8rem' : '1rem',
            }}
            onClick={() => setIsChatOpen(true)}
          >
            Need Help? Chat with me!
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default ChatbotWidget;












// // export default ChatbotWidget;
// import React, { useState, useEffect, CSSProperties } from 'react';

// interface ChatbotWidgetProps {
//   userId: string;
//   parentAsin: string;
// }

// interface Message {
//   type: 'user' | 'bot';
//   content: string;
//   followupQuestions?: string[];
//   feedbackSent?: boolean;
//   run_id?: string;
//   isIntro?: boolean; // New property to mark the intro message

// }

// const ChatbotWidget: React.FC<ChatbotWidgetProps> = ({ userId, parentAsin }) => {
//   const [messages, setMessages] = useState<Message[]>([
//     {
//       type: 'bot',
//       content:
//         "I'm Verta, your product assistant. I'm here to help answer any questions you have about a product. Feel free to ask away, and I'll do my best to assist you. If you've already received information from Metadata or Review-Vectorstore, please share it with me so I can better understand your query.",
//       isIntro: true, // Mark this as the intro message

//       },
//   ]);
//   const [isChatOpen, setIsChatOpen] = useState(false);

//   const storageKey = `chatbot_widget_history_${parentAsin}`;

//   useEffect(() => {
//     // Load chat history for the specific product
//     const savedMessages = localStorage.getItem(storageKey);
//     if (savedMessages) {
//       setMessages(JSON.parse(savedMessages));
//     }
//   }, [storageKey]); // Re-run this effect whenever parentAsin changes


//   useEffect(() => {
//     // Only update localStorage if messages have changed from initial state
//     if (messages.length > 1 || (messages[0] && !messages[0].isIntro)) {
//       localStorage.setItem(storageKey, JSON.stringify(messages));
//     }
//   }, [messages, storageKey]); // Save history whenever messages or product ID changes



//   const handleUserInput = async (userInput: string) => {
//     setMessages((prevMessages) => [
//       ...prevMessages,
//       { type: 'user', content: userInput },
//     ]);
  
//     // Placeholder bot message while we fetch the response
//     let botMessage: Message = { type: 'bot', content: '', followupQuestions: [], feedbackSent: false };
//     setMessages((prevMessages) => [...prevMessages, botMessage]);
//     try {
//       // Make a POST request using fetch and handle the streaming response with ReadableStream
//       const response = await fetch(`${process.env.REACT_APP_PYTHON_API_BASE_URL}/dev-stream`, {

//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           query: userInput,
//           parent_asin: parentAsin,
//           user_id: userId,
//           log_langfuse: true,
//           Token: 'ec864c6a-a150-45bf-be00-9c184b3c1f46',
//           stream_tokens: true,
          
//         }),
//       });
  
//       if (!response.body) throw new Error('ReadableStream not supported in this browser');
  
//       const reader = response.body.getReader();
//       const decoder = new TextDecoder('utf-8');
//       let botMessageContent = '';
  
//       // Read the stream
//       const readStream = async () => {
//         while (true) {
//           const { done, value } = await reader.read();
//           if (done) {
//             console.log("Stream complete");
//             break;
//           }
  
//           const chunk = decoder.decode(value, { stream: true });
//           const lines = chunk.split('\n');
  
//           for (let line of lines) {
//             if (line.trim() === '') continue;
  
//              // Skip JSON parsing for the "[DONE]" signal
//             if (line.trim() === '[DONE]') {
//               console.log("Received end of stream signal [DONE]");
//               reader.cancel(); // End the reader to stop further processing
//               return;
//             }
  
//             if (line.startsWith("data: ")) {
//               try {
//                 const event = JSON.parse(line.slice(5)); // Remove "data: " prefix
  
//                 if (event.type === 'token') {
//                   botMessageContent += event.content;
//                   setMessages((prevMessages) => {
//                     const updatedMessages = [...prevMessages];
//                     const lastMessageIndex = updatedMessages.length - 1;
//                     updatedMessages[lastMessageIndex].content = botMessageContent;
//                     return updatedMessages;
//                   });
//                 } else if (event.type === 'message') {
//                   const { answer, followup_questions, run_id } = event.content;
//                   setMessages((prevMessages) => {
//                     const updatedMessages = [...prevMessages];
//                     const lastMessageIndex = updatedMessages.length - 1;
//                     updatedMessages[lastMessageIndex].content = answer;
//                     updatedMessages[lastMessageIndex].followupQuestions = followup_questions; // Set follow-up questions here
//                     updatedMessages[lastMessageIndex].run_id = run_id; // Store the run_id here
//                     return updatedMessages;
//                   });
//                 }
//               } catch (error) {
//                 console.error('Error parsing JSON:', error);
//               }
//             }
//           }
//         }
//       };
  
//       await readStream();
//     } catch (error) {
//       console.error('Error:', error);
//       setMessages((prevMessages) => [
//         ...prevMessages,
//         { type: 'bot', content: 'Network error. Please try again.' },
//       ]);
//     }
//   };
  
//   const clearChatHistory = () => {
//     setMessages([ {
//       type: 'bot',
//       content:
//         "I'm Verta, your product assistant. I'm here to help answer any questions you have about a product. Feel free to ask away, and I'll do my best to assist you. If you've already received information from Metadata or Review-Vectorstore, please share it with me so I can better understand your query.",
//       isIntro: true, // Mark this as the intro message

//       },]);
//     localStorage.removeItem(storageKey);

//     //localStorage.removeItem('chatbot_widget_history');
//   };
  
//   const handleFeedback = async (feedback: boolean, index: number) => {
//     const message = messages[index];
  
//     if (!message.run_id) {
//       console.error("Run ID not found for this message. Feedback cannot be sent.");
//       return;
//     }
  
//     // Mark feedback as sent for this message
//     const updatedMessages = [...messages];
//     updatedMessages[index].feedbackSent = true;
//     setMessages(updatedMessages);
  
//     // Send feedback to the API
//     try {
//       await fetch(`${process.env.REACT_APP_PYTHON_API_BASE_URL}/score`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           run_id: message.run_id, // Use the specific message's run_id
//           user_id: userId,
//           parent_asin: parentAsin,
//           value: feedback ? 1 : 0, // 1 for positive, 0 for negative feedback
//         }),
//       });
//       console.log(`Feedback sent for run_id: ${message.run_id}`);
//     } catch (error) {
//       console.error('Error sending feedback:', error);
//     }
//   };
  
  

//   const handleFollowUpClick = (question: string) => {
//     handleUserInput(question);
//   };

//   const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
//     if (e.key === 'Enter' && (e.target as HTMLInputElement).value.trim()) {
//       const userInput = (e.target as HTMLInputElement).value.trim();
//       (e.target as HTMLInputElement).value = '';
//       handleUserInput(userInput);
//     }
//   };

//   const styles: Record<string, CSSProperties> = {
//     headerStyle: {
//       backgroundColor: '#4A90E2',
//       color: '#FFFFFF',
//       padding: '10px',
//       fontWeight: 'bold',
//       fontSize: '1.2rem',
//       display: 'flex',
//       justifyContent: 'space-between',
//       alignItems: 'center',
//     },
//     chatWindowStyle: {
//       backgroundColor: '#F5F5DC', // Beige background
//       padding: '10px',
//       height: '500px',
//       overflowY: 'auto',
//       display: 'flex',
//       flexDirection: 'column',
//       gap: '10px',
//     },
//     botBubbleStyle: {
//       backgroundColor: '#333333',
//       color: '#FFFFFF',
//       padding: '10px',
//       borderRadius: '15px',
//       maxWidth: '90%',
//       margin: '5px 0',
//       alignSelf: 'flex-start',
//       position: 'relative',
//     },
//     userBubbleStyle: {
//       backgroundColor: '#4A90E2',
//       color: '#FFFFFF',
//       padding: '10px',
//       borderRadius: '15px',
//       maxWidth: '90%',
//       margin: '5px 0',
//       alignSelf: 'flex-end',
//     },
//     feedbackContainer: {
//       display: 'flex',
//       gap: '20px',
//       marginTop: '5px',
//       marginLeft: '5px',
//     },
//     feedbackIcon: {
//       cursor: 'pointer',
//       fontSize: '1.2rem',
//       color: '#FFC107',
//     },
//     followUpSection: {
//       backgroundColor: '#e0e0e0',
//       padding: '2px',
//       borderRadius: '10px',
//       marginTop: '1px',
//       display: 'flex',
//       flexDirection: 'column',
//       gap: '3px',
//     },
//     followUpButton: {
//       backgroundColor: '#F5F5DC',
//       color: '#333',
//       padding: '1px',
//       borderRadius: '10px',
//       fontSize: '0.9rem',
//       border: 'none',
//       cursor: 'pointer',
//       width: '100%',
//     },
//     inputContainer: {
//       display: 'flex',
//       padding: '10px',
//       borderTop: '1px solid #ddd',
//       alignItems: 'center',
//     },
//     inputStyle: {
//       flex: 1,
//       padding: '10px',
//       borderRadius: '20px',
//       border: '1px solid #ddd',
//       marginRight: '10px',
//     },
//     sendButton: {
//       backgroundColor: '#4A90E2',
//       color: '#FFFFFF',
//       border: 'none',
//       borderRadius: '50%',
//       width: '40px',
//       height: '40px',
//       cursor: 'pointer',
//       fontSize: '18px',
//       display: 'flex',
//       alignItems: 'center',
//       justifyContent: 'center',
//     },
//     floatingButtonContainer: {
//       position: 'fixed',
//       bottom: '60px',
//       right: '90px',
//       display: 'flex',
//       alignItems: 'center',
//     },
//     floatingTextBubble: {
//       backgroundColor: '#6A1B9A',
//       color: '#FFFFFF',
//       padding: '10px 15px',
//       borderRadius: '20px',
//       fontSize: '1.4rem',
//       marginRight: '10px',
//     },
//     floatingButton: {
//       backgroundColor: '#4A90E2',
//       color: '#FFFFFF',
//       border: 'none',
//       borderRadius: '50%',
//       width: '70px',
//       height: '70px',
//       cursor: 'pointer',
//       position: 'relative',
//       display: 'flex',
//       alignItems: 'center',
//       justifyContent: 'center',
//       fontSize: '3rem', // Larger font for the chat icon

//     },
//     clearButton: {
//       backgroundColor: '#ff4d4d',
//       color: '#FFFFFF',
//       border: 'none',
//       borderRadius: '5px',
//       padding: '5px 10px',
//       cursor: 'pointer',
//       fontSize: '0.8rem',
//       marginLeft: '10px',
//     },
    
//     notificationBadge: {
//       position: 'absolute',
//       top: '-5px',
//       right: '-5px',
//       backgroundColor: '#FF4081',
//       color: '#FFFFFF',
//       borderRadius: '50%',
//       padding: '5px',
//       fontSize: '0.8rem',
//     },
//   };

//   return (
//     <div>
//       {isChatOpen && (
//         <div style={{ boxShadow: '0 0 10px rgba(0,0,0,0.1)', borderRadius: '8px', overflow: 'hidden', width: '430px', position: 'fixed', bottom: '80px', right: '20px' }}>
//           <div style={styles.headerStyle}>
//             <span>Verta</span>
//             <button style={styles.clearButton} onClick={clearChatHistory}>Clear Chat</button>
//             <button onClick={() => setIsChatOpen(false)} style={{ background: 'none', border: 'none', color: '#FFFFFF', fontSize: '1.5rem', cursor: 'pointer' }}>✖</button>
//           </div>
//           <div style={styles.chatWindowStyle}>
//             {messages.map((msg, index) => (
//               <div key={index} style={msg.type === 'user' ? styles.userBubbleStyle : styles.botBubbleStyle}>
//                 {msg.content}
//                 {msg.type === 'bot' && !msg.feedbackSent && !msg.isIntro && (
//                   <div style={styles.feedbackContainer}>
//                     <span
//                       style={styles.feedbackIcon}
//                       onClick={() => handleFeedback(true, index)} // Thumbs up as true (1)
//                     >
//                       👍
//                     </span>
//                     <span
//                       style={styles.feedbackIcon}
//                       onClick={() => handleFeedback(false, index)} // Thumbs down as false (0)
//                     >
//                       👎
//                     </span>
//                   </div>
//                 )}
//               </div>
//             ))}
//           </div>
//           {/* Separate Follow-up Section */}
//           {messages[messages.length - 1]?.followupQuestions && (
//             <div style={styles.followUpSection}>
//               {messages[messages.length - 1].followupQuestions?.map((question, qIndex) => (
//                 <button
//                   key={qIndex}
//                   onClick={() => handleFollowUpClick(question)}
//                   style={styles.followUpButton}
//                 >
//                   {question}
//                 </button>
//               ))}
//             </div>
//           )}
//           <div style={styles.inputContainer}>
//             <input
//               type="text"
//               placeholder="Type your message..."
//               style={styles.inputStyle}
//               onKeyDown={handleKeyDown}
//             />
//             <button style={styles.sendButton}>➤</button>
//           </div>
//         </div>
//       )}
//       <div style={styles.floatingButtonContainer} onClick={() => setIsChatOpen(!isChatOpen)}>
//         {!isChatOpen && (
//           <>
//             <div style={styles.floatingTextBubble}>Talk to me! 😊</div>
//             <div style={styles.floatingButton}>
//               <span style={styles.notificationBadge}>3</span>
//               💬
//             </div>
//           </>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ChatbotWidget;
