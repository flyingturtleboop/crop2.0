import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

interface HeaderProps {
  token: () => void;
}

const Header: React.FC<HeaderProps> = ({ token }) => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  function logMeOut(): void {
    axios
      .post("http://127.0.0.1:5000/logout")
      .then(() => {
        token();
        localStorage.removeItem("email");
        navigate("/");
      })
      .catch((error: any) => {
        if (error.response) {
          console.log(error.response);
        }
      });
  }

  const logged: string | null = localStorage.getItem("email");

  const toggleMobileMenu = (): void => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <nav className="bg-gray-200 shadow-xl fixed top-0 left-0 w-full z-50">
      <div className="px-4">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <Link to="/" className="text-xl font-bold">
            CropAI
          </Link>
          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-6">
            <Link to="/" className="text-xl text-gray-700 hover:text-gray-900">
              Home
            </Link>
          </div>
          {/* Right Side Controls */}
          <div className="flex items-center">
            {!logged ? (
              <button
                className="text-lg border border-green-500 text-black px-3 py-1 rounded hover:bg-green-500 hover:text-black"
                type="button"
                onClick={() => navigate("/login")}
              >
                Login
              </button>
            ) : (
              <button
                className="text-lg border border-red-500 text-black px-3 py-1 rounded hover:bg-red-500 hover:text-black"
                type="button"
                onClick={logMeOut}
              >
                Logout
              </button>
            )}
            {/* Mobile menu toggle */}
            <button
              className="md:hidden ml-4 focus:outline-none"
              type="button"
              onClick={toggleMobileMenu}
            >
              <svg
                className="w-6 h-6 text-gray-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <ul className="px-2 pt-2 pb-3 space-y-1">
            <li>
              <Link
                to="/"
                className="block px-3 py-2 text-gray-700 hover:bg-gray-200 rounded"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
            </li>
            {!logged ? (
              <li>
                <Link
                  to="/login"
                  className="block px-3 py-2 text-gray-700 hover:bg-gray-200 rounded"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
              </li>
            ) : (
              <li>
                <button
                  onClick={() => {
                    logMeOut();
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 text-red-500 hover:bg-gray-200 rounded"
                >
                  Logout
                </button>
              </li>
            )}
          </ul>
        </div>
      )}
    </nav>
  );
};

export default Header;
