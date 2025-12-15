import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (error) {
      alert('Ошибка: ' + error.message);
    } else {
      navigate('/'); // Если всё ок, кидаем на главную
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950 text-white">
      <form onSubmit={handleLogin} className="w-80 space-y-4 p-6 bg-gray-900 rounded-xl border border-gray-800">
        <h1 className="text-2xl font-bold text-center">Вход</h1>
        <input 
          className="w-full p-2 rounded bg-gray-800 border border-gray-700 focus:border-blue-500 outline-none"
          type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} 
        />
        <input 
          className="w-full p-2 rounded bg-gray-800 border border-gray-700 focus:border-blue-500 outline-none"
          type="password" placeholder="Пароль" value={password} onChange={e => setPassword(e.target.value)} 
        />
        <button 
          disabled={loading}
          className="w-full bg-blue-600 py-2 rounded hover:bg-blue-500 transition disabled:opacity-50 cursor-pointer">
          {loading ? 'Входим...' : 'Войти'}
        </button>
      </form>
    </div>
  );
}