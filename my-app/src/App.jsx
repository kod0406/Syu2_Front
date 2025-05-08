import { Routes, Route, Link } from 'react-router-dom';
import Login from './pages/Login';
import Menu from './pages/Menu';
import Owner from './pages/Owner';

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Routes>
        <Route path="/" element={<Menu />} />
        <Route path="/customer/login" element={<Login />} />
        <Route path="/owner/dashboard" element={<Owner />} />
      </Routes>
    </div>
  );
}

export default App;
