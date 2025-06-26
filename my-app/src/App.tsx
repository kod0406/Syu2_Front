import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Menu from './pages/Menu';
import OwnerDashboard from './pages/Owner';
import SignUp from './pages/Signup';
import OwnerLogin from './pages/Owner_Login';
import Review from './pages/Review';
import ReviewWrite from './pages/Review_write';
import Index from './pages/Index';
import Home from './pages/Home';
import Coupon from './pages/Coupon';
import CustomerCouponPage from './pages/CustomerCouponPage';

function App() {
  console.log('✅ ENV:', process.env.REACT_APP_API_URL);
  return (
    <div className="min-h-screen bg-gray-100">
      <Routes>
        <Route path="/menu/:storeId" element={<Menu />} />
        <Route path="/customer/login" element={<Login />} />
        <Route path="/owner/login" element={<OwnerLogin />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/owner/dashboard/:storeId" element={<OwnerDashboard />} />
        <Route path="/review" element={<Review />} />
        <Route path="/review/write/:statisticsId" element={<ReviewWrite />} />
        <Route path="/index" element={<Index />} />
        <Route path="/" element={<Home />} />
        <Route path="/owner/:storeId/coupon" element={<Coupon />} />
        <Route path="/my-coupons" element={<CustomerCouponPage />} />
      </Routes>
    </div>
  );
}

export default App;
