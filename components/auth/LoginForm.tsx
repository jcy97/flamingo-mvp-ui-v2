"use client";
import {
  LOGIN_ERROR_MESSAGES,
  LoginErrorCode,
  LoginErrorResponse,
  LoginFormProps,
  LoginRequest,
  LoginSuccessResponse,
  StoredAuthData,
} from "@/types/auth";
import {
  validateEmailWithMessage,
  validatePasswordWithMessage,
} from "@/utils/validation";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { ChangeEvent, FormEvent, useState } from "react";

const LoginForm: React.FC<LoginFormProps> = ({
  onSuccess,
  onError,
  redirectTo = "/dashboard",
  className = "",
}) => {
  const router = useRouter();

  //폼 상태 관리
  const [formData, setFormData] = useState<LoginRequest>({
    email: "",
    password: "",
    remember: false,
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  //입력 필드 변경
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (error) {
      setError("");
    }
  };

  // 토큰 저장 함수
  const storeAuthData = (
    data: LoginSuccessResponse["data"],
    remember: boolean
  ): void => {
    const authData: StoredAuthData = {
      accessToken: data.token.access_token,
      refreshToken: data.token.refresh_token,
      expiresAt: new Date(
        Date.now() + data.token.expires_in * 1000
      ).toISOString(),
      user: data.user,
      remember,
    };

    if (remember) {
      // 장기간 보관 - localStorage
      localStorage.setItem("flamingo-auth", JSON.stringify(authData));
    } else {
      // 세션만 보관 - sessionStorage
      sessionStorage.setItem("flamingo-auth", JSON.stringify(authData));
    }

    // 액세스 토큰은 별도로도 저장 (API 요청 시 사용)
    localStorage.setItem("flamingo-access-token", data.token.access_token);
  };

  // 에러 메시지 생성 함수
  const getErrorMessage = (errorResponse: LoginErrorResponse): string => {
    const { code, message } = errorResponse.error;

    // 백엔드에서 제공한 메시지가 있으면 우선 사용
    if (message) {
      return message;
    }

    // 기본 메시지 사용
    return (
      LOGIN_ERROR_MESSAGES[code as LoginErrorCode] ||
      "로그인 중 오류가 발생했습니다."
    );
  };

  // 폼 제출 핸들러
  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // 클라이언트 사이드 유효성 검사
      const emailValidation = validateEmailWithMessage(formData.email);
      if (!emailValidation.isValid) {
        throw new Error(emailValidation.message);
      }

      const passwordValidation = validatePasswordWithMessage(formData.password);
      if (!passwordValidation.isValid) {
        throw new Error(passwordValidation.message);
      }

      // API 요청
      const response = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        // 성공 응답 처리
        const data: LoginSuccessResponse = await response.json();

        // 토큰 저장
        storeAuthData(data.data, formData.remember);

        // 성공 콜백 실행
        if (onSuccess) {
          onSuccess(data.data);
        }

        // 페이지 이동
        router.push(redirectTo);
      } else {
        // 실패 응답 처리
        const errorData: LoginErrorResponse = await response.json();
        const errorMessage = getErrorMessage(errorData);

        setError(errorMessage);

        // 에러 콜백 실행
        if (onError) {
          onError(errorData.error);
        }
      }
    } catch (err) {
      console.error("로그인 오류:", err);

      const errorMessage =
        err instanceof Error
          ? err.message
          : "서버 연결에 실패했습니다. 잠시 후 다시 시도해주세요.";

      setError(errorMessage);

      // 에러 콜백 실행
      if (onError) {
        onError({
          code: "NETWORK_ERROR" as LoginErrorCode,
          message: errorMessage,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`w-[350px] ${className}`}>
      <form onSubmit={handleSubmit} className="space-y-[8px]">
        {error && (
          <div className="mb-4 p-4 bg-error-bg border border-error rounded-md flex items-center gap-3 animate-fade-in">
            <div className="text-error-icon text-lg">⚠️</div>
            <p className="text-error-text text-body-3">{error}</p>
          </div>
        )}

        {/* 이메일 입력 필드 */}
        <div className="mb-[8px]">
          <label
            htmlFor="email"
            className="block text-neutral-300 font-medium mb-2"
          >
            이메일
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="이메일을 입력하세요"
            className="w-full h-[45px] px-3 bg-transparent border border-neutral-500 rounded-flamingo-xs text-neutral-0 placeholder-neutral-500  focus:outline-none focus:border-primary transition-colors"
            required
            disabled={isLoading}
            autoComplete="email"
          />
        </div>
        {/* 비밀번호 입력 필드 */}
        <div className="mb-[16px]">
          <label
            htmlFor="password"
            className="block text-neutral-300 font-medium mb-2"
          >
            비밀번호
          </label>
          <input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="비밀번호를 입력하세요"
            className="w-full h-[45px] px-3 bg-transparent border border-neutral-500 rounded-flamingo-xs text-neutral-0 placeholder-neutral-500 focus:outline-none focus:border-primary transition-colors"
            required
            disabled={isLoading}
            autoComplete="current-password"
          />
        </div>

        {/* 로그인 상태 유지 체크박스 */}
        <div className="mb-[24px] flex items-center">
          <input
            id="remember"
            name="remember"
            type="checkbox"
            checked={formData.remember}
            onChange={handleInputChange}
            disabled={isLoading}
            className="w-4 h-4 text-primary bg-transparent border border-neutral-500 rounded focus:ring-primary focus:ring-2 focus:ring-opacity-50"
          />
          <label
            htmlFor="remember"
            className="ml-2 text-neutral-300  cursor-pointer"
          >
            로그인 상태 유지
          </label>
        </div>

        {/* 로그인 버튼 */}
        <button
          type="submit"
          disabled={isLoading || !formData.email || !formData.password}
          className="w-full h-[55px] bg-primary text-neutral-0 font-bold rounded-flamingo-sm hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed animate-fade-in"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-neutral-0 border-t-transparent rounded-full animate-spin"></div>
              로그인 중...
            </span>
          ) : (
            "로그인"
          )}
        </button>
      </form>

      {/* 회원가입 링크 */}
      <div className="absolute bottom-[50px] left-1/2 transform -translate-x-1/2">
        <Link href="/signup" className="text-neutral-300">
          플라밍고가 처음이신가요?
          <span className="text-primary"> 회원가입</span>
        </Link>
      </div>
    </div>
  );
};

export default LoginForm;
