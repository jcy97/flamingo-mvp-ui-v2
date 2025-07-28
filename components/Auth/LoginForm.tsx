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
import { showToast } from "@/utils/toast";
import { authApi } from "@/lib/api/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { ChangeEvent, FormEvent, useState } from "react";

const LoginForm: React.FC<LoginFormProps> = ({
  onSuccess,
  onError,
  redirectTo = "/project/dashboard",
  className = "",
}) => {
  const router = useRouter();

  const [formData, setFormData] = useState<LoginRequest>({
    email: "",
    password: "",
    remember: false,
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const storeAuthData = (
    data: LoginSuccessResponse,
    remember: boolean
  ): void => {
    const authData: StoredAuthData = {
      accessToken: data.token.access_token,
      refreshToken: data.token.refreshToken,
      expiresAt: new Date(
        Date.now() + (data.token.expires_in || 3600) * 1000
      ).toISOString(),
      user: data.user,
      remember,
    };

    if (remember) {
      localStorage.setItem("flamingo-auth", JSON.stringify(authData));
    } else {
      sessionStorage.setItem("flamingo-auth", JSON.stringify(authData));
    }

    localStorage.setItem("flamingo-access-token", data.token.access_token);
  };

  const getErrorMessage = (errorResponse: LoginErrorResponse): string => {
    const { code, message } = errorResponse.error;

    if (message) {
      return message;
    }

    return (
      LOGIN_ERROR_MESSAGES[code as LoginErrorCode] ||
      "로그인 중 오류가 발생했습니다."
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (
      e.key === "Enter" &&
      !isLoading &&
      formData.email &&
      formData.password
    ) {
      handleSubmit();
    }
  };

  const handleSubmit = async (): Promise<void> => {
    if (isLoading) return;

    setIsLoading(true);

    try {
      const emailValidation = validateEmailWithMessage(formData.email);
      if (!emailValidation.isValid) {
        showToast.error(emailValidation.message || "이메일을 확인해주세요.");
        setIsLoading(false);
        return;
      }

      const passwordValidation = validatePasswordWithMessage(formData.password);
      if (!passwordValidation.isValid) {
        showToast.error(
          passwordValidation.message || "비밀번호를 확인해주세요."
        );
        setIsLoading(false);
        return;
      }

      const data = await authApi.login(formData);

      storeAuthData(data, formData.remember);

      showToast.success("로그인이 완료되었습니다!");

      if (onSuccess) {
        onSuccess(data);
      }

      setTimeout(() => {
        router.push(redirectTo);
      }, 1000);
    } catch (err: any) {
      console.error("로그인 오류:", err);

      const errorMessage =
        err.response?.data?.error?.message ||
        err.message ||
        "서버 연결에 실패했습니다. 잠시 후 다시 시도해주세요.";

      showToast.error(errorMessage);

      if (onError && err.response?.data?.error) {
        onError(err.response.data.error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`w-[350px] ${className}`}>
      <form className="space-y-[8px]" onKeyDown={handleKeyDown}>
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

        <button
          type="button"
          onClick={handleSubmit}
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
