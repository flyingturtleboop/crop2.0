import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

interface LoginProps {
  setToken: (token: string) => void;
}

interface LoginForm {
  email: string;
  password: string;
}

const Login: React.FC<LoginProps> = ({ setToken }) => {
  const [loginForm, setLoginForm] = useState<LoginForm>({
    email: "",
    password: "",
  });

  const navigate = useNavigate();

  function btnlogin(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();

    axios
      .post("http://127.0.0.1:5000/logintoken", {
        email: loginForm.email,
        password: loginForm.password,
      })
      .then((response) => {
        setToken(response.data.access_token);
        localStorage.setItem("email", loginForm.email);
        navigate("/dashboard");
        setTimeout(() => {
          alert("Successfully Login");
        }, 100);
      })
      .catch((error: any) => {
        if (error.response && error.response.status === 401) {
          alert("Invalid credentials");
        }
      });

    setLoginForm({ email: "", password: "" });
  }

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;
    setLoginForm((prev) => ({ ...prev, [name]: value }));
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-xl">
        <form>
          <div className="flex items-center justify-center mb-6">
            <p className="text-2xl font-semibold">Log Into Your Account</p>
          </div>
          <div className="mb-4">
            <label
              htmlFor="form3Example3"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email address
            </label>
            <input
              type="email"
              name="email"
              id="form3Example3"
              value={loginForm.email}
              onChange={handleChange}
              placeholder="Enter a valid email address"
              className="w-full rounded border border-gray-300 py-2 px-3 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="form3Example4"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password
            </label>
            <input
              type="password"
              name="password"
              id="form3Example4"
              value={loginForm.password}
              onChange={handleChange}
              placeholder="Enter password"
              className="w-full rounded border border-gray-300 py-2 px-3 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
              <input type="checkbox" id="form2Example3" className="mr-2" />
              <label htmlFor="form2Example3" className="text-sm">
                Remember me
              </label>
            </div>
            <a href="#!" className="text-blue-500 hover:underline">
              Forgot password?
            </a>
          </div>
          <div className="text-center">
            <button
              type="button"
              onClick={btnlogin}
              className="w-full bg-blue-500 hover:bg-blue-600 text-black font-bold py-2 px-4 rounded"
            >
              Login
            </button>
            <p className="text-sm font-bold mt-2">
              Don't have an account?{" "}
              <a href="/register" className="text-red-500 hover:underline">
                Register
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
