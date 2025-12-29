import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import './App.css'
import { routeList } from './utils/routeList';
import Layout from './components/layout/Layout';
import Error from './components/common/Error';
import { useEffect } from 'react';
import { verifyUser } from './api/auth.api';
import { useAuthStore } from './store/authStore';

const router = createBrowserRouter(routeList.map((item) => {
  return {
    ...item,
    element: <Layout>{item.element}</Layout>,
    errorElement: <Error />,
  };
}));

function App() {

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await verifyUser();
        // 받아온 정보로 스토어 업데이트
        useAuthStore.setState({
          isLoggedIn: true,
          username: response.user.username,
        });
      } catch (error) {
        console.error(error);
      }
    };
    checkAuth();
  }, []);

  return (
    <>
      <RouterProvider router={router} />
    </>
  )
}

export default App;
