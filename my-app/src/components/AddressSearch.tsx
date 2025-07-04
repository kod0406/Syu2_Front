import React, { useState, useEffect, useRef } from "react";

interface AddressSearchProps {
  onAddressSelect: (
    address: string,
    x: number,
    y: number,
    placeName?: string
  ) => void;
  placeholder?: string;
  disabled?: boolean;
  defaultValue?: string;
  className?: string;
  name?: string;
}

declare global {
  interface Window {
    kakao: any;
  }
}

const AddressSearch: React.FC<AddressSearchProps> = ({
  onAddressSelect,
  placeholder = "주소를 입력해주세요",
  disabled = false,
  defaultValue = "",
  className = "",
  name = "",
}) => {
  const [keyword, setKeyword] = useState(defaultValue);
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selected, setSelected] = useState(false);
  const [addressChecked, setAddressChecked] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 10; // 최대 확인 횟수

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Kakao SDK 존재 여부 확인 함수
  const checkKakaoSDKAvailable = () => {
    return (
      window.kakao &&
      window.kakao.maps &&
      window.kakao.maps.services &&
      window.kakao.maps.services.Places &&
      window.kakao.maps.services.Status
    );
  };

  useEffect(() => {
    // 이미 SDK가 로드되어 있는지 확인
    if (checkKakaoSDKAvailable()) {
      console.log("AddressSearch: Kakao Maps SDK 즉시 사용 가능");
      setSdkLoaded(true);
      return;
    }

    // SDK가 로드될 때까지 기다리는 간격 설정 (처음엔 500ms, 나중엔 더 길게)
    const waitInterval = Math.min(500 + retryCount * 500, 3000);

    console.log(
      `AddressSearch: SDK 확인 중... (${
        retryCount + 1
      }/${maxRetries}, 간격: ${waitInterval}ms)`
    );

    // 카카오맵 SDK 로드 여부를 주기적으로 확인
    const checkTimer = setTimeout(() => {
      if (checkKakaoSDKAvailable()) {
        console.log("AddressSearch: Kakao Maps SDK 사용 가능");
        setSdkLoaded(true);
      } else if (retryCount < maxRetries) {
        setRetryCount((prev) => prev + 1);
      } else {
        console.error(
          "AddressSearch: Kakao Maps SDK 로드 실패 - 최대 시도 횟수 초과"
        );
      }
    }, waitInterval);

    return () => {
      clearTimeout(checkTimer);
    };
  }, [retryCount]);

  const searchAddress = (query: string) => {
    if (!query.trim() || disabled) return;

    if (!sdkLoaded) {
      console.warn("AddressSearch: 카카오맵 SDK가 아직 로드되지 않았습니다.");
      if (retryCount < maxRetries) {
        setRetryCount((prev) => prev + 1); // 다시 시도
      }
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const ps = new window.kakao.maps.services.Places();
      ps.keywordSearch(query, (data: any, status: any, pagination: any) => {
        if (status === window.kakao.maps.services.Status.OK) {
          setResults(data);
        } else if (status === window.kakao.maps.services.Status.ZERO_RESULT) {
          setResults([]);
          console.log("AddressSearch: 검색 결과가 없습니다.");
        } else {
          setResults([]);
          console.error("AddressSearch: 카카오 주소 검색 오류:", status);
        }
        setIsLoading(false);
      });
    } catch (error) {
      console.error("AddressSearch: 카카오맵 API 호출 중 오류:", error);
      setIsLoading(false);
      setResults([]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (selected) return; // 선택된 후에는 입력 비활성화
    const value = e.target.value;
    setKeyword(value);
    console.log("[AddressSearch] 입력값:", value); // 디버그: 입력값 출력
    if (value.trim().length > 1) {
      setShowResults(true);
      searchAddress(value);
    } else {
      setResults([]);
      setShowResults(false);
    }
  };

  const handleSelectAddress = (item: any) => {
    const address = item.road_address_name || item.address_name;
    const x = parseFloat(item.x);
    const y = parseFloat(item.y);
    const placeName = item.place_name || "";
    setSelected(true);
    setAddressChecked(true);
    setKeyword(address); // 선택 시 입력창에 주소 표시
    console.log("[AddressSearch] 선택된 주소:", {
      address,
      x,
      y,
      placeName,
      item,
    }); // 디버그: 선택된 주소 정보 출력
    onAddressSelect(address, x, y, placeName);
    setShowResults(false);
  };

  const handleInputFocus = () => {
    if (selected) {
      setSelected(false);
      setAddressChecked(false);
    }
  };

  const handleClear = () => {
    setKeyword("");
    setSelected(false);
    setAddressChecked(false);
    setResults([]);
    setShowResults(false);
    onAddressSelect("", 0, 0); // 주소 초기화 콜백
  };

  useEffect(() => {
    if (defaultValue) {
      setSelected(true);
    }
  }, [defaultValue]);

  return (
    <div ref={searchRef} className="relative w-full">
      <input
        type="text"
        name={name}
        value={keyword}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        placeholder={selected ? "주소가 선택되었습니다" : placeholder}
        disabled={disabled || !sdkLoaded}
        className={`${className} ${
          !sdkLoaded ? "cursor-not-allowed bg-gray-100" : ""
        } ${selected ? "border-green-500 ring-2 ring-green-400" : ""}`}
        style={{
          paddingRight: selected || keyword ? "2.5rem" : undefined,
        }}
      />
      {/* 체크 아이콘 */}
      {addressChecked && (
        <div className="absolute right-9 top-1/2 transform -translate-y-1/2 text-green-500 pointer-events-none">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
      )}
      {/* X(클리어) 버튼 */}
      {keyword && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-400 focus:outline-none bg-white rounded-full w-6 h-6 flex items-center justify-center border border-gray-200 shadow-sm transition"
          tabIndex={-1}
          aria-label="입력 지우기"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
      {!sdkLoaded && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <svg
            className="animate-spin h-4 w-4 text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </div>
      )}
      {isLoading && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <svg
            className="animate-spin h-4 w-4 text-gray-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </div>
      )}
      {showResults && results.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
          <ul>
            {results.map((item, index) => (
              <li
                key={item.id || index}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 text-left"
                onClick={() => handleSelectAddress(item)}
              >
                <div className="text-[13px] font-medium text-[#383838]">
                  {item.place_name}
                </div>
                <div className="text-[11px] text-gray-500">
                  {item.road_address_name ? (
                    <>
                      <span className="text-blue-600">[도로명]</span>{" "}
                      {item.road_address_name}
                      <br />
                      <span className="text-gray-600">[지번]</span>{" "}
                      {item.address_name}
                    </>
                  ) : (
                    <span>{item.address_name}</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
      {showResults &&
        keyword.trim().length > 1 &&
        !isLoading &&
        results.length === 0 && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
            <div className="px-4 py-3 text-center text-gray-600 text-[12px]">
              검색 결과가 없습니다.
            </div>
          </div>
        )}
    </div>
  );
};

export default AddressSearch;
