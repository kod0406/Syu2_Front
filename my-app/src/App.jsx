import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Menu from './pages/Menu';
import Owner from './pages/Owner.jsx';
import SignUp from './pages/Signup.jsx';
import OwnerLogin from './pages/Owner_Login.jsx';

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Routes>
        <Route path="/menu" element={<Menu />} />
        <Route path="/customer/login" element={<Login />} />
        <Route path="/owner/dashboard" element={<Owner />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/owner/login" element={<OwnerLogin />} />
      </Routes>
    </div>
  );
}

export default App;
