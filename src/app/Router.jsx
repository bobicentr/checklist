import { createBrowserRouter, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Home from '../pages/Home';
import Login from '../pages/Login';
import AddMedia from '../pages/AddMedia';

// Защитник: если нет юзера, кидай на логин
const PrivateRoute = ({ children }) => {
  const isAuth = useSelector((state) => state.auth.isAuth);
  // В реальном приложении тут еще можно добавить проверку на загрузку
  return isAuth ? children : <Navigate to="/login" />;
};

export const router = createBrowserRouter([
  {
    path: '/',
    element: <PrivateRoute><Home /></PrivateRoute>,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/addmedia',
    element: <AddMedia />
  }
]);