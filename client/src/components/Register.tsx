import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

interface RegisterProps {
  setToken: (token: string) => void;
}

interface RegisterForm {
  name: string;
  occupation: string;
  email: string;
  password: string;
}

const Register: React.FC<RegisterProps> = ({ setToken }) => {
  const [registerForm, setRegisterForm] = useState<RegisterForm>({
    name: "",
    occupation: "",
    email: "",
    password: "",
  });

  const navigate = useNavigate();

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;
    setRegisterForm((prev) => ({ ...prev, [name]: value }));
  }

  function btnRegister(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();

    axios
      .post("http://127.0.0.1:5000/signup", {
        name: registerForm.name,
        occupation: registerForm.occupation,
        email: registerForm.email,
        password: registerForm.password,
      })
      .then(() => {
        // Auto login after registration
        axios
          .post("http://127.0.0.1:5000/logintoken", {
            email: registerForm.email,
            password: registerForm.password,
          })
          .then((loginResponse) => {
            setToken(loginResponse.data.access_token);
            localStorage.setItem("email", registerForm.email);
            navigate("/dashboard");
            setTimeout(() => {
              alert("Registration Successful and Logged In");
            }, 100);
          })
          .catch((error: any) => {
            console.error("Auto-login failed:", error);
            alert(
              "Registration succeeded but auto-login failed. Please login manually."
            );
            navigate("/");
          });
      })
      .catch((error: any) => {
        if (error.response) {
          if (error.response.status === 409) {
            alert("Email already exists");
          } else {
            alert("Registration failed. Please try again.");
          }
        }
      });

    setRegisterForm({
      name: "",
      occupation: "",
      email: "",
      password: "",
    });
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-xl">
        <form>
          <div className="flex items-center justify-center mb-6">
            <p className="text-2xl font-semibold">Register Your Account</p>
          </div>
          <div className="mb-4">
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Name
            </label>
            <input
              type="text"
              name="name"
              id="name"
              value={registerForm.name}
              onChange={handleChange}
              placeholder="Enter your name"
              className="w-full rounded border border-gray-300 py-2 px-3 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="occupation"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Occupation
            </label>
            <input
              type="text"
              name="occupation"
              id="occupation"
              value={registerForm.occupation}
              onChange={handleChange}
              placeholder="Enter your occupation"
              className="w-full rounded border border-gray-300 py-2 px-3 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email address
            </label>
            <input
              type="email"
              name="email"
              id="email"
              value={registerForm.email}
              onChange={handleChange}
              placeholder="Enter a valid email address"
              className="w-full rounded border border-gray-300 py-2 px-3 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password
            </label>
            <input
              type="password"
              name="password"
              id="password"
              value={registerForm.password}
              onChange={handleChange}
              placeholder="Enter password"
              className="w-full rounded border border-gray-300 py-2 px-3 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div className="text-center">
            <button
              type="button"
              onClick={btnRegister}
              className="w-full bg-blue-500 hover:bg-blue-600 text-black font-bold py-2 px-4 rounded"
            >
              Register
            </button>
            <p className="text-sm font-bold mt-2">
              Already have an account?{" "}
              <a href="/login" className="text-red-500 hover:underline">
                Login
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
