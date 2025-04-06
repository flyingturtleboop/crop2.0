import React, { useState, useEffect, useRef } from "react";

interface FAQModalProps {
  isOpen: boolean;
  closeModal: () => void;
  onQuestionSubmit: (question: string) => void;
}

const FAQModal: React.FC<FAQModalProps> = ({ isOpen, closeModal, onQuestionSubmit }) => {
  const [userMessage, setUserMessage] = useState<string>("");
  const [chatMessages, setChatMessages] = useState<string[]>([]);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const chatBoxRef = useRef<HTMLDivElement | null>(null);

  const faqAnswers: { [key: string]: string } = {
    "How do I start using the crop monitoring app?": "To start using the app, simply sign up, add your farm details, and begin uploading images of your crops for monitoring.",
    "What types of crops can I monitor with the app?": "The app can monitor various crops, including vegetables, fruits, and grains. You can add any crop type to the system.",
    "How does the app detect diseases in crops?": "The app uses AI-based image recognition to analyze photos of crops and detect early signs of diseases or pests.",
    "Can I monitor multiple farms at the same time?": "Yes, you can add multiple farms to your account and monitor them simultaneously, keeping track of each farm’s unique data.",
    "Do I need any special equipment to use the app?": "No, you only need a smartphone or a camera to take pictures of your crops. The app works with standard devices.",
    "How do I upload images of my crops?": "You can upload images of your crops directly through the app. Just click the 'Upload' button and select the image file from your device.",
    "What should I do if I notice unusual results from the app?": "If you notice unusual results, we recommend re-uploading clearer images or contacting our support team for further assistance.",
    "Is the app available in my region?": "The app is available in most regions, but please check the app store for availability in your specific location.",
    "Can I access the app from multiple devices?": "Yes, you can access your account from multiple devices by logging in with the same credentials.",
    "What should I do if I forgot my password?": "If you forgot your password, click on the 'Forgot Password' link on the login page, and follow the instructions to reset it."
  };

  const getSmartResponse = (message: string): string => {
    const lowerCaseMessage = message.toLowerCase();

    // General greetings and farewells
    if (lowerCaseMessage.includes("hi") || lowerCaseMessage.includes("hello")) {
      return "Hello! How can I assist you today?";
    }
    if (lowerCaseMessage.includes("bye") || lowerCaseMessage.includes("goodbye")) {
      return "Goodbye! Have a great day!";
    }
    if (lowerCaseMessage.includes("thank") || lowerCaseMessage.includes("thanks")) {
      return "You're welcome! Feel free to ask if you have more questions.";
    }

    // App-specific responses
    if (lowerCaseMessage.includes("crop monitoring") || lowerCaseMessage.includes("monitor crops")) {
      return "You can use our app to monitor the health of your crops by uploading pictures. Our AI will analyze them for signs of disease or pests.";
    }
    if (lowerCaseMessage.includes("disease detection") || lowerCaseMessage.includes("crop disease")) {
      return "Our app uses AI to detect diseases in crops by analyzing uploaded images. It identifies potential issues and suggests solutions.";
    }
    if (lowerCaseMessage.includes("ai") || lowerCaseMessage.includes("artificial intelligence")) {
      return "Our app utilizes advanced AI algorithms to analyze crop health and provide actionable insights for better farm management.";
    }
    if (lowerCaseMessage.includes("farm") || lowerCaseMessage.includes("multiple farms")) {
      return "Yes, you can monitor multiple farms with our app. Just add each farm's details and start uploading images for monitoring.";
    }
    if (lowerCaseMessage.includes("upload image") || lowerCaseMessage.includes("upload photo")) {
      return "To upload an image of your crops, click the 'Upload' button in the app and select the photo from your device.";
    }
    if (lowerCaseMessage.includes("phone") || lowerCaseMessage.includes("camera")|| lowerCaseMessage.includes("device")) {
      return "You can use any device with a camera, such as a phone, to take pictures of your crops. Our app works with standard devices to analyze the images.";
    }
    if (lowerCaseMessage.includes("region") || lowerCaseMessage.includes("availability")) {
      return "The app is available in most regions. Please check the app store to see if it's available in your area.";
    }

    // Default response for unrecognized input
    return "Thank you for your question! We are currently working on providing specific answers.";
  };

  const handleUserInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserMessage(e.target.value);
  };

  const handleSubmitMessage = () => {
    if (userMessage.trim()) {
      setChatMessages((prevMessages) => [...prevMessages, `You: ${userMessage}`]);
      const smartResponse = getSmartResponse(userMessage);
      setUserMessage("");
      setIsTyping(true);

      setTimeout(() => {
        let botResponse = smartResponse;
        if (!botResponse) {
          botResponse = "Thank you for your question! We are currently working on providing specific answers.";
        }
        setChatMessages((prevMessages) => [...prevMessages, `CropBot: ${botResponse}`]);
        setIsTyping(false);
      }, 600);

      onQuestionSubmit(userMessage);
    }
  };

  const handleFAQClick = (faq: string) => {
    setChatMessages((prevMessages) => [...prevMessages, `You: ${faq}`]);

    const botResponse = faqAnswers[faq] || "Sorry, I don't have an answer for that question.";
    setIsTyping(true);

    setTimeout(() => {
      setChatMessages((prevMessages) => [...prevMessages, `CropBot: ${botResponse}`]);
      setIsTyping(false);
    }, 600);

    onQuestionSubmit(faq);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSubmitMessage();
    }
  };

  const preventScroll = () => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = 0; // Lock scroll position to top
    }
  };

  useEffect(() => {
    preventScroll();
  }, [chatMessages]);

  if (!isOpen) return null;

  return (
    <div className="faq-modal">
      <div className="faq-modal-content">
        <div className="faq-modal-header">
          <h2>Message Us</h2>
          <button className="close-btn" onClick={closeModal}>
            &times;
          </button>
        </div>

        <div className="faq-chat-container">
          {/* FAQ List Container */}
          <div className="faq-list-container">
            <h3>Frequently Asked Questions</h3>
            {Object.keys(faqAnswers).map((faq, index) => (
              <div key={index} className="faq-item">
                <div className="faq-question" onClick={() => handleFAQClick(faq)}>
                  {faq}
                </div>
              </div>
            ))}
          </div>

          {/* Chatbox Container */}
          <div className="faq-chat-box" ref={chatBoxRef}>
            <div className="chat-messages">
              <div className="chat-bubble bot">How can I assist you today?</div>
              {chatMessages.map((message, index) => {
                const isBot = message.startsWith("CropBot:");
                const isUser = message.startsWith("You:");

                return (
                  <div
                    key={index}
                    className={`chat-bubble ${isBot ? "cropbot-message" : ""} ${isUser ? "user" : "bot"}`}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {message.replace(/^CropBot:|^You:/, isBot ? "CropBot:" : "")}
                  </div>
                );
              })}
              {isTyping && <div className="chat-bubble cropbot-message bot">CropBot is typing...</div>}
            </div>

            <div className="chat-input-container">
              <input
                type="text"
                className="chat-input"
                value={userMessage}
                onChange={handleUserInputChange}
                onKeyDown={handleKeyPress}
                placeholder="Ask your question..."
              />
              <button className="chat-submit" onClick={handleSubmitMessage}>
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQModal;
