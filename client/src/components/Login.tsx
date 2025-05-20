import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FcGoogle } from 'react-icons/fc';
import { useNotification } from '../NotificationContext';

interface LoginProps { setToken: (token: string) => void; }
interface LoginForm { email: string; password: string; }

const Login: React.FC<LoginProps> = ({ setToken }) => {
  const [loginForm, setLoginForm] = useState<LoginForm>({ email: '', password: '' });
  const navigate = useNavigate();
  const { notify } = useNotification();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const btnlogin = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    try {
      const { data } = await axios.post('http://localhost:5000/logintoken', loginForm);

      // 1) update React state + persist
      setToken(data.access_token);
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('email', loginForm.email);

      // 2) fire the toast
      notify('Successfully Logged In', 'success');

      // 3) client‐side navigation (no reload!)
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      if (err.response?.status === 401) {
        notify('Invalid credentials', 'error');
      } else {
        console.error(err);
        notify('Login failed. Please try again.', 'error');
      }
    }
    setLoginForm({ email: '', password: '' });
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-xl">
        <form>
          <p className="text-2xl font-semibold text-black text-center mb-6">
            Log Into Your Account
          </p>

          <label className="block mb-2 text-sm text-black">Email address</label>
          <input
            name="email"
            value={loginForm.email}
            onChange={handleChange}
            type="email"
            placeholder="you@example.com"
            className="w-full mb-4 p-2 border rounded focus:outline-none focus:ring"
          />

          <label className="block mb-2 text-sm text-black">Password</label>
          <input
            name="password"
            value={loginForm.password}
            onChange={handleChange}
            type="password"
            placeholder="••••••"
            className="w-full mb-4 p-2 border rounded focus:outline-none focus:ring"
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
            onClick={() => window.location.replace('http://localhost:5000/api/login')}
            className="w-full mb-4 flex items-center justify-center py-2 border rounded hover:bg-gray-50"
          >
            <FcGoogle className="w-6 h-6 mr-2" />
            <span className="text-black">Sign in with Google</span>
          </button>

          <p className="mt-4 text-center text-sm text-black">
            Don't have an account?{' '}
            <a href="/register" className="text-green-600 hover:underline">Register</a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
