import React, { useState, useEffect, useRef } from "react";

interface FAQModalProps {
  isOpen: boolean;
  closeModal: () => void;
  onQuestionSubmit: (question: string) => void;
}

const FAQModal: React.FC<FAQModalProps> = ({
  isOpen,
  closeModal,
  onQuestionSubmit,
}) => {
  const [userMessage, setUserMessage] = useState<string>("");
  const [chatMessages, setChatMessages] = useState<string[]>([]);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const chatBoxRef = useRef<HTMLDivElement | null>(null);

  const faqAnswers: { [key: string]: string } = {
    "How do I start using the crop monitoring app?":
      "To start using the app, simply sign up, add your farm details, and begin uploading images of your crops for monitoring.",
    "What types of crops can I monitor with the app?":
      "The app can monitor various crops, including vegetables, fruits, and grains. You can add any crop type to the system.",
    "How does the app detect diseases in crops?":
      "The app uses AI-based image recognition to analyze photos of crops and detect early signs of diseases or pests.",
    "Can I monitor multiple farms at the same time?":
      "Yes, you can add multiple farms to your account and monitor them simultaneously, keeping track of each farm’s unique data.",
    "Do I need any special equipment to use the app?":
      "No, you only need a smartphone or a camera to take pictures of your crops. The app works with standard devices.",
    "How do I upload images of my crops?":
      "You can upload images of your crops directly through the app. Just click the 'Upload' button and select the image file from your device.",
    "What should I do if I notice unusual results from the app?":
      "If you notice unusual results, we recommend re-uploading clearer images or contacting our support team for further assistance.",
    "Is the app available in my region?":
      "The app is available in most regions, but please check the app store for availability in your specific location.",
    "Can I access the app from multiple devices?":
      "Yes, you can access your account from multiple devices by logging in with the same credentials.",
    "What should I do if I forgot my password?":
      "If you forgot your password, click on the 'Forgot Password' link on the login page, and follow the instructions to reset it.",
  };

  const getSmartResponse = (message: string): string => {
    const lower = message.toLowerCase();
    if (lower.includes("hi") || lower.includes("hello")) {
      return "Hello! How can I assist you today?";
    }
    if (lower.includes("bye") || lower.includes("goodbye")) {
      return "Goodbye! Have a great day!";
    }
    if (lower.includes("thank") || lower.includes("thanks")) {
      return "You're welcome! Feel free to ask if you have more questions.";
    }
    if (lower.includes("crop monitoring")) {
      return "You can use our app to monitor the health of your crops by uploading pictures. Our AI will analyze them for signs of disease or pests.";
    }
    if (lower.includes("disease detection") || lower.includes("crop disease")) {
      return "Our app uses AI to detect diseases in crops by analyzing uploaded images. It identifies potential issues and suggests solutions.";
    }
    if (lower.includes("ai") || lower.includes("artificial intelligence")) {
      return "Our app utilizes advanced AI algorithms to analyze crop health and provide actionable insights for better farm management.";
    }
    if (lower.includes("farm")) {
      return "Yes, you can monitor multiple farms with our app. Just add each farm's details and start uploading images for monitoring.";
    }
    if (lower.includes("upload image") || lower.includes("upload photo")) {
      return "To upload an image of your crops, click the 'Upload' button in the app and select the photo from your device.";
    }
    if (lower.includes("device") || lower.includes("phone") || lower.includes("camera")) {
      return "You can use any device with a camera, such as a phone, to take pictures of your crops. Our app works with standard devices to analyze the images.";
    }
    if (lower.includes("region") || lower.includes("availability")) {
      return "The app is available in most regions. Please check the app store to see if it's available in your area.";
    }
    return "Thank you for your question! We are currently working on providing specific answers. Check the FAQ to the right for help.";
  };

  const handleUserInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserMessage(e.target.value);
  };

  const handleSubmitMessage = () => {
    if (!userMessage.trim()) return;
    setChatMessages((prev) => [...prev, `You: ${userMessage}`]);
    const reply = getSmartResponse(userMessage);
    setUserMessage("");
    setIsTyping(true);
    setTimeout(() => {
      setChatMessages((prev) => [...prev, `CropBot: ${reply}`]);
      setIsTyping(false);
      onQuestionSubmit(userMessage);
    }, 600);
  };

  const handleFAQClick = (faq: string) => {
    setChatMessages((prev) => [...prev, `You: ${faq}`]);
    const answer = faqAnswers[faq] || "Sorry, I don't have an answer for that question.";
    setIsTyping(true);
    setTimeout(() => {
      setChatMessages((prev) => [...prev, `CropBot: ${answer}`]);
      setIsTyping(false);
      onQuestionSubmit(faq);
    }, 600);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSubmitMessage();
  };

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [chatMessages, isTyping]);

  if (!isOpen) return null;
  return (
    <div className="faq-modal" onClick={closeModal}>
      <div className="faq-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="faq-modal-header">
          <h2>Crop-AI ChatBot</h2>
          <button className="close-btn" onClick={closeModal}>
            &times;
          </button>
        </div>

        <div className="faq-chat-container">
          <div className="faq-list-container">
            <h3>Frequently Asked Questions</h3>
            {Object.keys(faqAnswers).map((faq, i) => (
              <div key={i} className="faq-item">
                <div className="faq-question" onClick={() => handleFAQClick(faq)}>
                  {faq}
                </div>
              </div>
            ))}
          </div>

          <div className="faq-chat-box" ref={chatBoxRef}>
            <div className="chat-messages">
              <div className="chat-bubble bot">How can I assist you today?</div>
              {chatMessages.map((msg, idx) => {
                const isBot = msg.startsWith("CropBot:");
                const isUser = msg.startsWith("You:");
                return (
                  <div
                    key={idx}
                    className={`chat-bubble ${
                      isBot ? "cropbot-message" : isUser ? "user" : "bot"
                    }`}
                    style={{ animationDelay: `${idx * 100}ms` }}
                  >
                    {msg.replace(/^CropBot:|^You:/, isBot ? "CropBot:" : "")}
                  </div>
                );
              })}
              {isTyping && (
                <div className="chat-bubble cropbot-message bot">
                  CropBot is typing...
                </div>
              )}
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
