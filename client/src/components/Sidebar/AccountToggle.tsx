import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";

interface AccountToggleProps {
  removeToken: () => void;
  collapsed: boolean; 
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  occupation: string;
}

export const AccountToggle: React.FC<AccountToggleProps> = ({
  removeToken,
  collapsed,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const navigate = useNavigate();

  const toggleDropdown = () => setIsOpen((prev) => !prev);

  useEffect(() => {
    const email = localStorage.getItem("email");
    const token = localStorage.getItem("token");

    if (email && token) {
      axios
        .get(`http://127.0.0.1:5000/profile/${email}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          setProfile(response.data);
        })
        .catch((error) => {
          console.error("Error fetching profile:", error);
        });
    }
  }, []);

  function logMeOut(): void {
    axios
      .post("http://127.0.0.1:5000/logout")
      .then(() => {
        removeToken();
        localStorage.removeItem("email");
        localStorage.removeItem("token");
        navigate("/");
      })
      .catch((error: any) => {
        if (error.response) {
          console.error(error.response);
        }
      });
  }

  return (
    <div className="border-b mb-4 mt-2 pb-4 border-stone-300">
      <button
        onClick={toggleDropdown}
        className="flex p-0.5 hover:bg-stone-200 rounded transition-colors relative gap-2 w-full items-center"
      >
        {/* Always show avatar */}
        <img
          src="https://api.dicebear.com/9.x/notionists/svg"
          alt="avatar"
          className="w-8 h-8 rounded shrink-0 bg-green-500 shadow"
        />

        {/* Hide name/email if collapsed */}
        {!collapsed && (
          <div className="text-start">
            <span className="text-sm font-bold block">
              {profile ? profile.name : "Loading..."}
            </span>
            <span className="text-xs block text-stone-500">
              {profile ? profile.email : "Loading..."}
            </span>
          </div>
        )}

        {/* Hide chevron if collapsed */}
        {!collapsed && (
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs">
            {isOpen ? <FiChevronUp /> : <FiChevronDown />}
          </div>
        )}
      </button>

      {/* Hide the logout dropdown if collapsed */}
      {!collapsed && (
        <div
          className="overflow-hidden transition-all duration-300"
          style={{ maxHeight: isOpen ? "50px" : "0px" }}
        >
          <button
            onClick={logMeOut}
            className="flex p-2 hover:bg-stone-200 rounded transition-colors w-full text-left"
          >
            <span className="text-sm font-bold block">Logout</span>
          </button>
        </div>
      )}
    </div>
  );
};
