import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { RouterProvider } from 'react-router-dom';
import { router } from './app/Router';
import { supabase } from './supabaseClient';
import { setUser, logout } from './features/auth/authSlice';

function App() {
  const dispatch = useDispatch();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // 1. Проверяем сессию при загрузке страницы
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        dispatch(setUser(session.user));
      } else {
        dispatch(logout());
      }
      setIsReady(true);
    });

    // 2. Подписываемся на изменения (вход/выход в реальном времени)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        dispatch(setUser(session.user));
      } else {
        dispatch(logout());
      }
    });

    return () => subscription.unsubscribe();
  }, [dispatch]);

  // Пока проверяем авторизацию — показываем черный экран или спиннер
  if (!isReady) return <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">Загрузка...</div>;

  return <RouterProvider router={router} />;
}

export default App;