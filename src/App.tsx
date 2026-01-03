
import { RouterProvider } from '@tanstack/react-router';
import { router } from './routeTree';
import './App.css';

import { useAuthSync } from './hooks/useAuthSync';

function App() {
  useAuthSync();
  return (
    <RouterProvider router={router} />
  );
}

export default App;
