export default function CustomerLogin() {
    const handleSocialLogin = (provider) => {
      let redirectUrl = '';
      switch (provider) {
        case 'kakao':
          redirectUrl = `http://localhost:8080/api/oauth2/kakao/login`;
          break;
        case 'naver':
          redirectUrl = `http://localhost:8080/api/oauth2/naver/login`;
          break;
        default:
          break;
      }
      window.location.href = redirectUrl;
    };
  
    return (
      <div className="flex items-center justify-center min-h-screen bg-blue-100">
        <div className="w-full max-w-sm space-y-4">
          {/* Kakao */}
          <button
            onClick={() => handleSocialLogin('kakao')}
            className="w-full flex items-center justify-center bg-yellow-400 text-black py-3 rounded shadow"
          >
            Kakao로 시작하기
          </button>
  
          {/* Naver */}
          <button
            onClick={() => handleSocialLogin('naver')}
            className="w-full flex items-center justify-center bg-green-500 text-white py-3 rounded shadow"
          >
            Naver로 시작하기
          </button>
        </div>
      </div>
    );
  }
  