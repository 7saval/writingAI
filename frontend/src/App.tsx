import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import './App.css'
import { routeList } from './utils/routeList';
import Layout from './components/layout/Layout';
import Error from './components/common/Error';
import { useEffect } from 'react';
import { verifyUser } from './api/auth.api';
import { useAuthStore } from './store/authStore';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { Toaster } from '@/components/ui/toaster';

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
        if (response.authenticated) {
          useAuthStore.setState({
            isLoggedIn: true,
            username: response.user.username,
          });
        }
      } catch (error) {
        // 비로그인 상태일 때 발생하는 401 에러는 의도된 것이므로 콘솔에 출력하지 않음
        // (Silent Authentication Check)
      }
    };
    checkAuth();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster />
    </QueryClientProvider>
  )
}

export default App;
