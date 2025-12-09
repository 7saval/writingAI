import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import './App.css'
import { routeList } from './utils/routeList';
import Layout from './components/layout/Layout';
import Error from './components/common/Error';

const router = createBrowserRouter(routeList.map((item) => {
  return {
    ...item,
    element: <Layout>{item.element}</Layout>,
    errorElement: <Error />,
  };
}));

function App() {

  return (
    <>
      <RouterProvider router={router} />
    </>
  )
}

export default App;
