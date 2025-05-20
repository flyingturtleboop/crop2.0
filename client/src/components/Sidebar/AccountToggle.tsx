// src/components/Sidebar/AccountToggle.tsx
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

  const toggleDropdown = () => setIsOpen((o) => !o);
  const logOut = () => {
    axios.post("http://127.0.0.1:5000/logout").finally(() => {
      removeToken();
      localStorage.removeItem("email");
      localStorage.removeItem("token");
      navigate("/");
    });
  };

  return (
    <div>
      <button
        onClick={toggleDropdown}
        className="w-full flex items-center justify-between px-3 py-2 hover:bg-stone-400 rounded transition"
      >
        <div className="flex items-center gap-3">
          <img
            src="https://api.dicebear.com/9.x/notionists/svg"
            alt="avatar"
            className="w-8 h-8 rounded bg-green-500 shadow"
          />
          {/* hide text if sidebar is collapsed */}
          {!collapsed && (
            <div className="text-left">
              <div className="font-semibold text-sm">
                {profile?.name ?? "Loading..."}
              </div>
              <div className="text-xs text-stone-500">
                {profile?.email ?? ""}
              </div>
            </div>
          )}
        </div>
        {/* chevron always on the right if not collapsed */}
        {!collapsed &&
          (isOpen ? (
            <FiChevronUp className="text-stone-500" />
          ) : (
            <FiChevronDown className="text-stone-500" />
          ))}
      </button>

      {/* dropdown menu */}
      {!collapsed && (
        <div
          className="overflow-hidden transition-[max-height] duration-300"
          style={{ maxHeight: isOpen ? "100px" : "0px" }}
        >
          <button
            onClick={logOut}
            className="w-full text-left px-4 py-2 hover:bg-stone-200 transition rounded-b"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
};
