import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import './App.css'
import { routeList } from './utils/routeList';

const router = createBrowserRouter(routeList);

function App() {

  return (
    <>
      <RouterProvider router={router} />
    </>
  )
}

export default App;
