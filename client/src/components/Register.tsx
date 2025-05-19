import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";

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
  const [form, setForm] = useState<RegisterForm>({
    name: "",
    occupation: "",
    email: "",
    password: "",
  });
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const btnRegister = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/signup", form);
      const { data } = await axios.post("http://localhost:5000/logintoken", {
        email: form.email,
        password: form.password,
      });
      setToken(data.access_token);
      localStorage.setItem("email", form.email);
      navigate("/dashboard");
      alert("Registration successful and logged in");
    } catch (err: any) {
      if (err.response?.status === 409) alert("Email already exists");
      else { console.error(err); alert("Registration failed. Please try again."); }
    }
    setForm({ name: "", occupation: "", email: "", password: "" });
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-xl">
        <form>
          <div className="mb-6 text-center">
            <p className="text-2xl font-semibold text-black">Register Your Account</p>
          </div>

          <label className="block mb-2 text-sm text-black">Name</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            type="text"
            placeholder="Your name"
            className="w-full mb-4 p-2 border rounded"
          />

          <label className="block mb-2 text-sm text-black">Occupation</label>
          <input
            name="occupation"
            value={form.occupation}
            onChange={handleChange}
            type="text"
            placeholder="Your occupation"
            className="w-full mb-4 p-2 border rounded"
          />

          <label className="block mb-2 text-sm text-black">Email address</label>
          <input
            name="email"
            value={form.email}
            onChange={handleChange}
            type="email"
            placeholder="you@example.com"
            className="w-full mb-4 p-2 border rounded"
          />

          <label className="block mb-2 text-sm text-black">Password</label>
          <input
            name="password"
            value={form.password}
            onChange={handleChange}
            type="password"
            placeholder="••••••"
            className="w-full mb-4 p-2 border rounded"
          />

          <button
            type="button"
            onClick={btnRegister}
            className="w-full mb-4 py-2 bg-blue-500 text-black rounded hover:bg-blue-600"
          >
            Register
          </button>

          <button
            type="button"
            onClick={() => (window.location.href = "http://localhost:5000/api/login")}
            className="w-full flex items-center justify-center py-2 border rounded hover:bg-gray-50"
          >
            <FcGoogle className="w-6 h-6 mr-2" />
            <span className="text-black">Sign in with Google</span>
          </button>

          <p className="mt-4 text-center text-sm text-black">
            Already have an account?{" "}
            <a href="/login" className="text-black hover:underline">
              Login
            </a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;
