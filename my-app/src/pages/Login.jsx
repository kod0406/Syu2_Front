export default function CustomerLogin() {
    const handleSocialLogin = (provider) => {
      let redirectUrl = '';
      switch (provider) {
        case 'kakao':
          redirectUrl = `https://kauth.kakao.com/oauth/authorize?client_id=YOUR_KAKAO_CLIENT_ID&redirect_uri=YOUR_REDIRECT_URI&response_type=code`;
          break;
        case 'naver':
            redirectUrl = `https://nid.naver.com/oauth2.0/authorize?client_id=YOUR_NAVER_CLIENT_ID&redirect_uri=http://localhost:3000/oauth/callback&response_type=code&state=SOME_RANDOM_STATE`;
          break;
        default:
          break;
      }
      window.location.href = redirectUrl;
    };
  
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
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
  