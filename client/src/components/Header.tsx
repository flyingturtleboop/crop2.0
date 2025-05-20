import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

interface HeaderProps {
  removeToken: () => void;
}

const Header: React.FC<HeaderProps> = ({ removeToken }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  function logMeOut(): void {
    axios.post("http://127.0.0.1:5000/logout")
      .catch(() => {})
      .finally(() => {
        removeToken();
        localStorage.removeItem("token");
        localStorage.removeItem("email");
        window.location.replace("/");
      });
  }

  const logged = Boolean(localStorage.getItem("token"));
  const toggleMobileMenu = () => setMobileMenuOpen(o => !o);

  return (
    <nav className="bg-white shadow fixed top-0 left-0 w-full z-50">
      <div className="px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-xl font-bold">CropAI</Link>
          <div className="hidden md:flex space-x-6">
            <Link to="/" className="text-gray-700 hover:text-gray-900">Home</Link>
            {logged && <Link to="/profile" className="text-gray-700 hover:text-gray-900">Profile</Link>}
          </div>
          <div className="flex items-center">
            {!logged ? (
              <button
                className="border border-green-500 text-black px-3 py-1 rounded hover:bg-green-500"
                onClick={() => window.location.replace("/login")}
              >Login</button>
            ) : (
              <button
                className="border border-red-500 text-black px-3 py-1 rounded hover:bg-red-500"
                onClick={logMeOut}
              >Logout</button>
            )}
            <button className="md:hidden ml-4" onClick={toggleMobileMenu}>
              {/* hamburger icon */}
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
      {mobileMenuOpen && (
        <div className="md:hidden px-2 pt-2 pb-3 space-y-1">
          <Link to="/" className="block px-3 py-2 hover:bg-gray-200" onClick={toggleMobileMenu}>Home</Link>
          {logged && <Link to="/profile" className="block px-3 py-2 hover:bg-gray-200" onClick={toggleMobileMenu}>Profile</Link>}
          {!logged ? (
            <Link to="/login" className="block px-3 py-2 hover:bg-gray-200" onClick={toggleMobileMenu}>Login</Link>
          ) : (
            <button className="w-full text-left px-3 py-2 hover:bg-gray-200" onClick={() => {logMeOut(); toggleMobileMenu();}}>Logout</button>
          )}
        </div>
      )}
    </nav>
);
};
export default Header;
