import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";

interface LoginProps {
  setToken: (token: string) => void;
}

interface LoginForm {
  email: string;
  password: string;
}

const Login: React.FC<LoginProps> = ({ setToken }) => {
  const [loginForm, setLoginForm] = useState<LoginForm>({ email: "", password: "" });
  const navigate = useNavigate();

  const btnlogin = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    try {
      const { data } = await axios.post("http://localhost:5000/logintoken", loginForm);
      setToken(data.access_token);
      localStorage.setItem("email", loginForm.email);
      navigate("/dashboard");
      alert("Successfully Logged In");
    } catch (err: any) {
      if (err.response?.status === 401) alert("Invalid credentials");
      else { console.error(err); alert("Login failed. Please try again."); }
    }
    setLoginForm({ email: "", password: "" });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginForm(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-xl">
        <form>
          <div className="mb-6 text-center">
            <p className="text-2xl font-semibold text-black">Log Into Your Account</p>
          </div>

          <label className="block mb-2 text-sm text-black">Email address</label>
          <input
            name="email"
            value={loginForm.email}
            onChange={handleChange}
            type="email"
            placeholder="you@example.com"
            className="w-full mb-4 p-2 border rounded"
          />

          <label className="block mb-2 text-sm text-black">Password</label>
          <input
            name="password"
            value={loginForm.password}
            onChange={handleChange}
            type="password"
            placeholder="••••••"
            className="w-full mb-4 p-2 border rounded"
          />

          <button
            type="button"
            onClick={btnlogin}
            className="w-full mb-4 py-2 bg-blue-500 text-black rounded hover:bg-blue-600"
          >
            Login
          </button>

          <button
            type="button"
            onClick={() => (window.location.href = "http://localhost:5000/api/login")}
            className="w-full mb-4 flex items-center justify-center py-2 border rounded hover:bg-gray-50"
          >
            <FcGoogle className="w-6 h-6 mr-2" />
            <span className="text-black">Sign in with Google</span>
          </button>

          <p className="mt-4 text-center text-sm text-black">
            Don't have an account?{" "}
            <a href="/register" className="text-black hover:underline">
              Register
            </a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
