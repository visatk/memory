import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { AuthProvider } from './context/AuthContext';
import TestCards from './pages/TestCards';
import FakeAddress from './pages/FakeAddress';
import CardChecker from './pages/CardChecker'; // <-- Import the new component
import Forum from './pages/Forum';
import Thread from './pages/Thread';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Forum />} />
          <Route path="test-cards" element={<TestCards />} />
          <Route path="fake-address" element={<FakeAddress />} />
          <Route path="card-checker" element={<CardChecker />} /> {/* <-- Add Route */}
          <Route path="forum/:id" element={<Thread />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="profile/:username" element={<Profile />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}
