import { Link } from 'react-router-dom';

export default function CustomerLogin() {
    return (
      <div>
      <nav className="p-4 bg-blue-600 text-white flex gap-4">
        <Link to="/customer/login" className="hover:underline">로그인</Link>
        </nav>
        <div className="p-4">
          <h1 className="text-2xl font-bold">고객 메뉴 페이지</h1>
        </div>
      </div>
    );
  }
  