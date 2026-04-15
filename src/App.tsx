import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { AuthProvider } from './context/AuthContext';
import Landing from './pages/Landing';
import TestCards from './pages/TestCards';
import FakeAddress from './pages/FakeAddress';
import Forum from './pages/Forum';
import Thread from './pages/Thread';
import Login from './pages/Login';
import Register from './pages/Register';

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Landing />} />
          <Route path="test-cards" element={<TestCards />} />
          <Route path="fake-address" element={<FakeAddress />} />
          <Route path="forum" element={<Forum />} />
          <Route path="forum/:id" element={<Thread />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}
