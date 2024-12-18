import { useState, useEffect } from 'react';

export interface ChatbotWidgetProps {
  userId: string;
  parentAsin: string;
}

export interface Message {
  type: 'user' | 'bot';
  content: string;
  followupQuestions?: string[];
  feedbackSent?: boolean;
  run_id?: string;
  isIntro?: boolean;
}

const useChatbotLogic = (userId: string, parentAsin: string) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      type: 'bot',
      content:
        "I'm Verta, your product assistant. I'm here to help answer any questions you have about a product. Feel free to ask away, and I'll do my best to assist you.",
      isIntro: true,
    },
  ]);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const storageKey = `chatbot_widget_history_${parentAsin}`;

  useEffect(() => {
    const savedMessages = localStorage.getItem(storageKey);
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    }
  }, [storageKey]);

  useEffect(() => {
    if (messages.length > 1 || (messages[0] && !messages[0].isIntro)) {
      localStorage.setItem(storageKey, JSON.stringify(messages));
    }
  }, [messages, storageKey]);

  const handleUserInput = async (userInput: string) => {
    setMessages((prevMessages) => [
      ...prevMessages,
      { type: 'user', content: userInput },
    ]);

    let botMessage: Message = { type: 'bot', content: '', followupQuestions: [], feedbackSent: false };
    setMessages((prevMessages) => [...prevMessages, botMessage]);

    console.log('Sending API request with payload:', {
      query: userInput,
      parent_asin: parentAsin,
      user_id: userId,
      log_langfuse: true,
      stream_tokens: true,
      Authorization: `Bearer ${process.env.REACT_APP_Token}`,
    });

    try {
      const response = await fetch(`${process.env.REACT_APP_PYTHON_API_BASE_URL}/dev-stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.REACT_APP_Token}`,
        },
        body: JSON.stringify({
          query: userInput,
          parent_asin: parentAsin,
          user_id: userId,
          log_langfuse: true,
          stream_tokens: true,
        }),
      });

      if (!response.body) throw new Error('ReadableStream not supported in this browser');

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let localBotMessageContent = '';

      const readStream = async () => {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (let line of lines) {
            if (line.trim() === '') continue;

            if (line.trim() === '[DONE]') {
              reader.cancel();
              return;
            }

            if (line.startsWith('data: ')) {
              try {
                const event = JSON.parse(line.slice(5));
                if (event.type === 'token') {
                  // Stream token formatting
                  localBotMessageContent += event.content;
                  let updateTimeout;
                  setMessages((prevMessages) => {
                    clearTimeout(updateTimeout);
                    const updatedMessages = [...prevMessages];
                    const lastMessageIndex = updatedMessages.length - 1;
                    updatedMessages[lastMessageIndex].content = localBotMessageContent;
                    updateTimeout = setTimeout(() => setMessages(updatedMessages), 50); // Debounce
                    return updatedMessages;
                  });
                } else if (event.type === 'message') {
                  const { answer, followup_questions, run_id } = event.content;
                  setMessages((prevMessages) => {
                    const updatedMessages = [...prevMessages];
                    const lastMessageIndex = updatedMessages.length - 1;
                    updatedMessages[lastMessageIndex].content = answer;
                    updatedMessages[lastMessageIndex].followupQuestions = followup_questions;
                    updatedMessages[lastMessageIndex].run_id = run_id;
                    return updatedMessages;
                  });
                }
              } catch (error) {
                console.error('Error parsing JSON:', error);
              }
            }
          }
        }
      };

      await readStream();
    } catch (error) {
      console.error('Error:', error);
      setMessages((prevMessages) => [
        ...prevMessages,
        { type: 'bot', content: 'Network error. Please try again.' },
      ]);
    }
  };

  const clearChatHistory = () => {
    setMessages([
      {
        type: 'bot',
        content:
          "I'm Verta, your product assistant. I'm here to help answer any questions you have about a product.",
        isIntro: true,
      },
    ]);
    localStorage.removeItem(storageKey);
  };

  const handleFeedback = async (feedback: boolean, index: number) => {
    const message = messages[index];
    if (!message.run_id) {
      console.error('Run ID not found for this message. Feedback cannot be sent.');
      return;
    }

    try {
      await fetch(`${process.env.REACT_APP_PYTHON_API_BASE_URL}/score`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.REACT_APP_Token}`,
        },
        body: JSON.stringify({
          run_id: message.run_id,
          user_id: userId,
          parent_asin: parentAsin,
          value: feedback ? 1 : 0,
        }),
      });

      setMessages((prevMessages) => {
        const updatedMessages = [...prevMessages];
        updatedMessages[index].feedbackSent = true;
        return updatedMessages;
      });
    } catch (error) {
      console.error('Error sending feedback:', error);
    }
  };

  const handleFollowUpClick = (question: string) => {
    handleUserInput(question);
  };

  return {
    messages,
    isChatOpen,
    setIsChatOpen,
    handleUserInput,
    clearChatHistory,
    handleFeedback,
    handleFollowUpClick,
  };
};

export { useChatbotLogic };
