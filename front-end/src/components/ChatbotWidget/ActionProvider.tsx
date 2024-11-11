// // src/components/ChatbotWidget/ActionProvider.tsx

// // Define ChatBotMessage type
// type ChatBotMessage = {
//   message: string;
// };

// class ActionProvider {
//   createChatBotMessage: any;
//   setState: any;

//   constructor(createChatBotMessage: any, setStateFunc: any) {
//     this.createChatBotMessage = createChatBotMessage;
//     this.setState = setStateFunc;
//   }

//   async handleUserMessage(userMessage: string) {
//     const botMessage: ChatBotMessage = this.createChatBotMessage(`Processing...`);
//     this.setState((prev: any) => ({
//       ...prev,
//       messages: [...prev.messages, botMessage],
//     }));

//     try {
//       const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/chat`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ message: userMessage }),
//       });

//       if (!response.ok) throw new Error('Failed to communicate with the bot');
//       const data = await response.json();

//       const botResponseMessage: ChatBotMessage = this.createChatBotMessage(data.response);
//       this.setState((prev: any) => ({
//         ...prev,
//         messages: [...prev.messages, botResponseMessage],
//       }));
//     } catch (error) {
//       console.error('Error:', error);
//       const errorMessage: ChatBotMessage = this.createChatBotMessage("I'm sorry, there was an error. Please try again.");
//       this.setState((prev: any) => ({
//         ...prev,
//         messages: [...prev.messages, errorMessage],
//       }));
//     }
//   }

//   handleOrderInquiry() {
//     const message = this.createChatBotMessage("Here's some information about your order.");
//     this.setState((prev: any) => ({
//       ...prev,
//       messages: [...prev.messages, message],
//     }));
//   }

//   handleDefault(userMessage: string) {
//     const message = this.createChatBotMessage("I'm here to help! Could you clarify your request?");
//     this.setState((prev: any) => ({
//       ...prev,
//       messages: [...prev.messages, message],
//     }));
//   }
// }

// export default ActionProvider;
