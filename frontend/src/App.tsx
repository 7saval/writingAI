import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import './App.css'
import { routeList } from './utils/routeList';
import Layout from './components/layout/Layout';
import Error from './components/common/Error';
import { useAuthQuery } from './hooks/useAuthQuery';
import { Toaster } from '@/components/ui/sonner';

const router = createBrowserRouter(routeList.map((item) => {
  return {
    ...item,
    element: <Layout>{item.element}</Layout>,
    errorElement: <Error />,
  };
}));

function App() {
  // 사용자 인증 상태 확인
  useAuthQuery();

  return (
    <>
      <RouterProvider router={router} />
      <Toaster />
    </>
  )
}

export default App;
