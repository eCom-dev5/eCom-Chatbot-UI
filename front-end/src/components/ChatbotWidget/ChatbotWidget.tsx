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
  Avatar,
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
  const [chatWidth, setChatWidth] = useState(isMobile ? 300 : 400);

  const [isAtBottom, setIsAtBottom] = useState(true);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const isResizing = useRef(false);
  const startX = useRef(0);
  const startY = useRef(0);
  const startWidth = useRef(chatWidth);
  const startHeight = useRef(chatHeight);

  const handleCornerResizeStart = (
    e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>
  ) => {
    e.preventDefault();
    isResizing.current = true;
    startX.current = 'clientX' in e ? e.clientX : e.touches[0]?.clientX || 0;
    startY.current = 'clientY' in e ? e.clientY : e.touches[0]?.clientY || 0;
    startWidth.current = chatWidth;
    startHeight.current = chatHeight;

    window.addEventListener('mousemove', handleResizeMove as any);
    window.addEventListener('touchmove', handleResizeMove as any, { passive: false });
    window.addEventListener('mouseup', handleResizeEnd);
    window.addEventListener('touchend', handleResizeEnd);
  };

  const handleResizeMove = (e: MouseEvent | TouchEvent) => {
    if (!isResizing.current) return;
    const currentX = 'clientX' in e ? e.clientX : (e as TouchEvent).touches[0]?.clientX || 0;
    const currentY = 'clientY' in e ? e.clientY : (e as TouchEvent).touches[0]?.clientY || 0;

    // Adjusted deltas so that moving handle upwards/leftwards can also resize correctly
    const deltaX = startX.current - currentX;
    const deltaY = startY.current - currentY;

    const newWidth = startWidth.current + deltaX;
    const newHeight = startHeight.current + deltaY;

    setChatWidth(newWidth);
    setChatHeight(newHeight);
  };

  const handleResizeEnd = () => {
    isResizing.current = false;
    window.removeEventListener('mousemove', handleResizeMove as any);
    window.removeEventListener('touchmove', handleResizeMove as any);
    window.removeEventListener('mouseup', handleResizeEnd);
    window.removeEventListener('touchend', handleResizeEnd);
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
    <Box
      sx={{
        fontFamily: 'Inter, Roboto, sans-serif', 
      }}
    >
      {isChatOpen ? (
        <Paper
          elevation={3}
          sx={{
            position: 'fixed',
            bottom: '30px',
            right: '30px',
            width: `${chatWidth}px`,
            height: `${chatHeight}px`,
            display: 'flex',
            flexDirection: 'column',
            borderRadius: '16px',
            // More pronounced shadow and color
            boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
            overflow: 'hidden',
            '& .smooth-scroll': {
              scrollBehavior: 'smooth',
            },
          }}
        >
          {/* Single handle at top-right corner */}
          <Box
            onMouseDown={handleCornerResizeStart}
            onTouchStart={handleCornerResizeStart}
            sx={{
              position: 'absolute',
              width: '20px',
              height: '20px',
              top: 0,
              left: 0,
              backgroundColor: '#E0E0E0',
              cursor: 'nw-resize',
              zIndex: 999,
              borderTopLeftRadius: '16px',
            }}
          />
          {/* Header with gradient and brand colors + Avatar and subtle "powered by" */}
          <Box
            sx={{
              background: 'linear-gradient(to right, #ccefff, #ffffff)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              p: 3,
              borderBottom: '1px solid #E0E0E0',
              position: 'relative',
            }}
          >
            {/* Bot Avatar for personality */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar sx={{ bgcolor: '#0073E6', width: 30, height: 30, fontSize: '0.9rem' }}>V</Avatar>
              <Typography
                variant="h6"
                fontWeight="bold"
                sx={{
                  fontFamily: 'Inter, Roboto, sans-serif',
                  lineHeight: 1.3,
                }}
              >
                VERTA <span style={{ fontSize: '0.75rem', fontWeight: 400 }}>Latest</span>
              </Typography>
            </Box>
            <Box sx={{ position: 'absolute', right: 15, display:'flex', gap:1 }}>
              <IconButton
                onClick={clearChatHistory}
                sx={{
                  color: '#333',
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'scale(1.1)' },
                }}
              >
                <DeleteOutlineIcon />
              </IconButton>
              <IconButton
                onClick={() => setIsChatOpen(false)}
                sx={{
                  color: '#333',
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'scale(1.1)' },
                }}
              >
                <CloseIcon />
              </IconButton>
            </Box>
            {/* Powered by label in subtle font */}
            <Typography
              sx={{
                position: 'absolute',
                bottom: 5,
                left: 15,
                fontSize: '0.7rem',
                color: '#999',
                fontFamily: 'Inter, Roboto, sans-serif',
              }}
            >
              Powered by Verta
            </Typography>
          </Box>
          {/* Chat Messages */}
          <Box
            ref={chatContainerRef}
            className="smooth-scroll"
            sx={{
              flex: 1,
              p: 3,
              backgroundColor: '#FFFFFF',
              overflowY: 'auto',
              position: 'relative',
            }}
          >
            {messages.map((msg, index) => {
              const isUser = msg.type === 'user';
              return (
                <Box
                  key={index}
                  sx={{
                    mb: 3,
                    textAlign: isUser ? 'right' : 'left',
                  }}
                >
                  <Typography
                    sx={{
                      borderRadius: '12px',
                      padding: '10px 14px',
                      // Extend message box width
                      maxWidth: '90%',
                      fontSize: '1rem',
                      lineHeight: 1.4,
                      fontFamily: 'Inter, Roboto, sans-serif',
                      backgroundColor: isUser ? '#E3F2FD' : '#FFF7F0',
                      color: '#333',
                      display: 'inline-block',
                      transition: 'transform 0.2s',
                      '&:hover': { transform: 'scale(1.02)' },
                      // Add a subtle border for more definition
                      border: '1px solid #e0e0e0',
                    }}
                  >
                    {msg.content}
                  </Typography>

                  {/* Feedback Section for Bot Messages */}
                  {msg.type === 'bot' && msg.run_id && !msg.feedbackSent && (
                    <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: .5}}>
                      <IconButton
                        onClick={() => handleFeedback(true, index)}
                        sx={{
                          color: '#4CAF50',
                          transition: 'transform 0.2s',
                          '&:hover': { transform: 'scale(1.1)' },
                        }}
                      >
                        <ThumbUpIcon />
                      </IconButton>
                      <IconButton
                        onClick={() => handleFeedback(false, index)}
                        sx={{
                          color: '#F44336',
                          transition: 'transform 0.2s',
                          '&:hover': { transform: 'scale(1.1)' },
                        }}
                      >
                        <ThumbDownIcon />
                      </IconButton>
                    </Box>
                  )}

                  {/* Follow-up Questions as bubble style */}
                  {msg.type === 'bot' && msg.followupQuestions && msg.followupQuestions.length > 0 && (
                    <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {msg.followupQuestions.map((question, idx) => (
                        <Box
                          key={idx}
                          onClick={() => handleFollowUpClick(question)}
                          sx={{
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            fontFamily: 'Inter, Roboto, sans-serif',
                            color: '#005BB5',
                            backgroundColor: '#ECF3FF',
                            borderRadius: '8px',
                            display: 'inline-block',
                            padding: '6px 10px',
                            transition: 'background-color 0.2s',
                            '&:hover': {
                              backgroundColor: '#DCE9FF',
                            },
                            maxWidth: 'fit-content'
                          }}
                        >
                          {question}
                        </Box>
                      ))}
                    </Box>
                  )}
                </Box>
              );
            })}
            {isLoading && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  mt: 2,
                }}
              >
                <CircularProgress size={20} sx={{ mr: 1 }} />
                <Typography
                  variant="body2"
                  sx={{ fontFamily: 'Inter, Roboto, sans-serif', display:'flex', alignItems:'center' }}
                >
                  Verta is typing
                  <Box
                    sx={{
                      ml: 1,
                      width: '1em',
                      textAlign: 'left',
                      display: 'inline-block',
                      '&::after': {
                        content: '"..."',
                        animation: 'dots 1.5s steps(3, end) infinite',
                      },
                      '@keyframes dots': {
                        '0%, 20%': {
                          color: 'transparent',
                        },
                        '40%': {
                          color: 'black',
                        },
                        '60%': {
                          color: 'transparent',
                        },
                        '80%,100%': {
                          color: 'black',
                        },
                      },
                    }}
                  />
                </Typography>
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
                transition: 'transform 0.2s',
                '&:hover': { backgroundColor: '#E67E22', transform: 'scale(1.1)' },
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
              p: 3,
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
                  fontFamily: 'Inter, Roboto, sans-serif',
                  transition: 'box-shadow 0.2s',
                  '&:hover': {
                    boxShadow: '0 0 5px rgba(0,0,0,0.1)',
                  },
                },
              }}
            />
            {inputValue.trim() && (
              <IconButton
                onClick={sendMessage}
                sx={{
                  backgroundColor: '#0073E6',
                  color: 'white',
                  borderRadius: '50%',
                  transition: 'transform 0.2s',
                  '&:hover': { backgroundColor: '#005BB5', transform: 'scale(1.1)' },
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
              sx={{
                backgroundColor: '#0073E6',
                color: 'white',
                transition: 'transform 0.2s',
                '&:hover': { backgroundColor: '#005BB5', transform: 'scale(1.1)' },
              }}
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
              fontFamily: 'Inter, Roboto, sans-serif',
              transition: 'color 0.2s',
              '&:hover': { color: '#005BB5' },
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
