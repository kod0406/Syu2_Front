export default function CustomerLogin() {
    const handleSocialLogin = (provider) => {
      let redirectUrl = '';
      switch (provider) {
        case 'kakao':
          redirectUrl = `https://kauth.kakao.com/oauth/authorize?client_id=7446b00bc519d478db550fd9a215f34c&redirect_uri=http://localhost:8080/api/oauth2/kakao/login`;
          break;
        case 'naver':
            const randomState = Math.random().toString(36).substring(2, 15);
            redirectUrl = `https://nid.naver.com/oauth2.0/authorize?client_id=EaiAL_Y2T7PHYrYS7sSL&redirect_uri=http://localhost:8080/login/naver&response_type=code&state=${randomState}`;
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
  