import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import Landing from './pages/Landing';
import TestCards from './pages/TestCards';
import FakeAddress from './pages/FakeAddress';
import Forum from './pages/Forum';
import Thread from './pages/Thread';

export default function App() {
  return (
    <Routes>
      {/* The Layout component wraps all child routes */}
      <Route path="/" element={<Layout />}>
        {/* Child routes injected into Layout's <Outlet /> */}
        <Route index element={<Landing />} />
        <Route path="test-cards" element={<TestCards />} />
        <Route path="fake-address" element={<FakeAddress />} />
        <Route path="forum" element={<Forum />} />
        <Route path="forum/:id" element={<Thread />} />
      </Route>
    </Routes>
  );
}
