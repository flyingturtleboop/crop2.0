import React, { useState } from "react";

interface FAQModalProps {
  isOpen: boolean;
  closeModal: () => void;
  onQuestionSubmit: (question: string) => void;
}

const FAQModal: React.FC<FAQModalProps> = ({ isOpen, closeModal, onQuestionSubmit }) => {
  const [userMessage, setUserMessage] = useState<string>("");
  const [chatMessages, setChatMessages] = useState<string[]>([]); // Chat messages state

  // Predefined FAQ Questions and their specific answers
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

  const handleUserInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserMessage(e.target.value);
  };

  const handleSubmitMessage = () => {
    if (userMessage.trim()) {
      // Add user's message to chat
      setChatMessages((prevMessages) => [...prevMessages, `You: ${userMessage}`]);

      // Predefined response for all questions
      const botResponse = "Thank you for your question! We are currently working on providing specific answers.";

      // Add bot's response to chat
      setChatMessages((prevMessages) => [...prevMessages, `Bot: ${botResponse}`]);

      setUserMessage(""); // Clear the input field after submitting

      // Pass the user's question to the parent component (optional for logging)
      onQuestionSubmit(userMessage);
    }
  };

  const handleFAQClick = (faq: string) => {
    // Add FAQ question to chat
    setChatMessages((prevMessages) => [...prevMessages, `You: ${faq}`]);

    // Provide the specific answer for the clicked FAQ question
    const botResponse = faqAnswers[faq] || "Sorry, I don't have an answer for that question.";

    // Add bot's response to chat
    setChatMessages((prevMessages) => [...prevMessages, `Bot: ${botResponse}`]);

    // Pass the FAQ question to the parent component (optional for logging)
    onQuestionSubmit(faq);
  };

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
        <div className="faq-chat-box">
          <div className="chat-messages">
            {/* Add "How can I assist you today?" as the first message */}
            <div className="chat-bubble bot">How can I assist you today?</div>
            {chatMessages.map((message, index) => (
              <div key={index} className="chat-bubble">
                {message}
              </div>
            ))}
          </div>
          <div className="chat-input-container">
            <input
              type="text"
              className="chat-input"
              value={userMessage}
              onChange={handleUserInputChange}
              placeholder="Ask your question..."
            />
            <button className="chat-submit" onClick={handleSubmitMessage}>
              Send
            </button>
          </div>
          <div className="faq-list">
            <h3>Or select from the FAQs:</h3>
            {Object.keys(faqAnswers).map((faq, index) => (
              <div key={index} className="faq-item">
                <div className="faq-question" onClick={() => handleFAQClick(faq)}>
                  {faq}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQModal;
