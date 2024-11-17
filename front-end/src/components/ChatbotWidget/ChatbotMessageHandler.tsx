import React from 'react';

export interface Message {
  type: 'user' | 'bot';
  content: string;
  followupQuestions?: string[];
  feedbackSent?: boolean;
  run_id?: string;
  isIntro?: boolean;
}

interface ChatbotMessageHandlerProps {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  userId: string;
  parentAsin: string;
}

const ChatbotMessageHandler: React.FC<ChatbotMessageHandlerProps> = ({
  messages,
  setMessages,
  userId,
  parentAsin,
}) => {
  const handleUserInput = async (userInput: string) => {
    setMessages((prevMessages) => [
      ...prevMessages,
      { type: 'user', content: userInput },
    ]);

    let botMessage: Message = { type: 'bot', content: '', feedbackSent: false };
    setMessages((prevMessages) => [...prevMessages, botMessage]);

    try {
      const response = await fetch(`${process.env.REACT_APP_PYTHON_API_BASE_URL}/dev-stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: userInput,
          parent_asin: parentAsin,
          user_id: userId,
          log_langfuse: true,
          stream_tokens: true,
        }),
      });

      if (!response.body) throw new Error('ReadableStream not supported');

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let botMessageContent = '';

      const readStream = async () => {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (let line of lines) {
            if (line.trim() === '') continue;
            if (line.trim() === '[DONE]') return;

            if (line.startsWith('data: ')) {
              try {
                const event = JSON.parse(line.slice(5));
                if (event.type === 'token') {
                  botMessageContent += event.content;
                  setMessages((prevMessages) => {
                    const updatedMessages = [...prevMessages];
                    const lastMessageIndex = updatedMessages.length - 1;
                    updatedMessages[lastMessageIndex].content = botMessageContent;
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && (e.target as HTMLInputElement).value.trim()) {
      const userInput = (e.target as HTMLInputElement).value.trim();
      (e.target as HTMLInputElement).value = '';
      handleUserInput(userInput);
    }
  };

  return (
    <div>
      <div>
        {messages.map((msg, index) => (
          <div key={index} style={{ marginBottom: '10px' }}>
            {msg.type === 'bot' ? 'Bot: ' : 'User: '}
            {msg.content}
          </div>
        ))}
      </div>
      <input
        type="text"
        placeholder="Type your message..."
        onKeyDown={handleKeyDown}
      />
    </div>
  );
};

export default ChatbotMessageHandler;
