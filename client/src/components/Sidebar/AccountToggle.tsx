// src/components/Sidebar/AccountToggle.tsx
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import { User as UserIcon } from "lucide-react";

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
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  // Fetch profile on mount
  useEffect(() => {
    const email = localStorage.getItem("email");
    const token = localStorage.getItem("token");
    if (!email || !token) return;
    axios
      .get(`http://127.0.0.1:5000/profile/${email}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((r) => setProfile(r.data))
      .catch(console.error);
  }, []);

  const toggleDropdown = () => setIsOpen((open) => !open);
  const logOut = () => {
    axios.post("http://127.0.0.1:5000/logout").finally(() => {
      removeToken();
      localStorage.removeItem("email");
      localStorage.removeItem("token");
      navigate("/");
    });
  };

  return (
    <div ref={containerRef} className="px-2 py-2">
      <button
        onClick={toggleDropdown}
        className={`flex items-center space-x-3 bg-white rounded-md shadow-sm px-3 py-2 hover:bg-gray-100 transition ease-in-out duration-150 w-full text-left ${
          collapsed ? "justify-center" : ""
        }`}
      >
        {/* always show the user icon */}
        <div className="w-8 h-8 rounded-sm bg-green-600 flex items-center justify-center">
          <UserIcon className="w-5 h-5 text-white" />
        </div>

        {!collapsed && (
          <>
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-800">
                {profile?.name ?? "User"}
              </div>
              <div className="text-xs text-gray-500 truncate">
                {profile?.email ?? ""}
              </div>
            </div>
            <div className="text-gray-400">
              {isOpen ? <FiChevronUp /> : <FiChevronDown />}
            </div>
          </>
        )}
      </button>

      {/* Slide-down logout */}
      {!collapsed && (
        <div
          className={`overflow-hidden transition-[max-height] duration-300 ease-in-out bg-white rounded-md shadow-sm mt-1 ${
            isOpen ? "max-h-24" : "max-h-0"
          }`}
        >
          <button
            onClick={logOut}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 transition"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
};
