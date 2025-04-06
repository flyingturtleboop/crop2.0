import React from 'react';
import { FaRegComment } from 'react-icons/fa'; // Importing message icon from react-icons

interface ChatButtonProps {
  onClick: () => void;
}

const ChatButton: React.FC<ChatButtonProps> = ({ onClick }) => {
  return (
    <button className="faq-button" onClick={onClick}>
      <FaRegComment size={24} /> {/* Adding the message icon here */}
    </button>
  );
};

export default ChatButton;
