import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Menu from './pages/Menu';
import OwnerDashboard from './pages/Owner.jsx'; // 파일명은 실제 OwnerDashboard여도 jsx가 Owner로 되어 있다면 그대로 OK
import SignUp from './pages/Signup.jsx';
import OwnerLogin from './pages/Owner_Login.jsx';
import Review from './pages/Review.jsx';
import ReviewWrite from './pages/Review_write.jsx';
import Index from './pages/Index.jsx';
import Home from './pages/Home.jsx';

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Routes>
        <Route path="/menu/:storeId" element={<Menu />} />
        <Route path="/customer/login" element={<Login />} />
        <Route path="/owner/login" element={<OwnerLogin />} />
        <Route path="/signup" element={<SignUp />} />
        {/* ✅ 수정된 부분: storeId를 경로 파라미터로 전달 */}
        <Route path="/owner/dashboard/:storeId" element={<OwnerDashboard />} />
        <Route path="/review" element={<Review />} />
        <Route path="/review/write" element={<ReviewWrite />} /> 
        <Route path="/index" element={<Index />} />
        <Route path="/" element={<Home />} />
      </Routes>
    </div>
  );
}

export default App;
