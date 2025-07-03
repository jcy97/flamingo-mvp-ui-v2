"use client";
import {
  RegisterRequest,
  RegisterResponse,
  RegisterErrorResponse,
  RegisterErrorCodes,
  REGISTER_ERROR_MESSAGES,
  CheckEmailResponse,
  SignupFormProps,
  SignupFormState,
} from "@/types/auth";
import {
  validateEmailWithMessage,
  validatePasswordWithMessage,
  validateNameWithMessage,
  validatePasswordConfirm,
} from "@/utils/validation";
import { showToast } from "@/utils/toast";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { ChangeEvent, FormEvent, useState } from "react";

const SignupForm: React.FC<SignupFormProps> = ({
  onSuccess,
  onError,
  redirectTo = "/login",
  className = "",
}) => {
  const router = useRouter();

  const [formData, setFormData] = useState<SignupFormState>({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    agree_terms: false,
    agree_privacy: false,
    agree_marketing: false,
    isLoading: false,
    emailChecked: false,
    emailAvailable: false,
  });

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ): void => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const { checked } = e.target as HTMLInputElement;
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        ...(name === "email" && { emailChecked: false, emailAvailable: false }),
      }));
    }
  };

  const checkEmailAvailability = async (): Promise<void> => {
    const emailValidation = validateEmailWithMessage(formData.email);
    if (!emailValidation.isValid) {
      showToast.error(emailValidation.message || "이메일을 확인해주세요.");
      return;
    }

    try {
      const response = await fetch(
        `/api/v1/auth/check-email?email=${encodeURIComponent(formData.email)}`
      );

      if (response.ok) {
        const data: CheckEmailResponse = await response.json();

        setFormData((prev) => ({
          ...prev,
          emailChecked: true,
          emailAvailable: data.data.available,
        }));

        if (data.data.available) {
          showToast.success("사용 가능한 이메일입니다!");
        } else {
          showToast.error("이미 사용 중인 이메일입니다.");
        }
      } else {
        showToast.error("이메일 확인 중 오류가 발생했습니다.");
      }
    } catch (error) {
      console.error("이메일 확인 오류:", error);
      showToast.error("이메일 확인 중 오류가 발생했습니다.");
    }
  };

  const getErrorMessage = (errorResponse: RegisterErrorResponse): string => {
    const { code, message } = errorResponse.error;

    if (message) {
      return message;
    }

    return (
      REGISTER_ERROR_MESSAGES[code as RegisterErrorCodes] ||
      "회원가입 중 오류가 발생했습니다."
    );
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setFormData((prev) => ({ ...prev, isLoading: true }));

    try {
      const emailValidation = validateEmailWithMessage(formData.email);
      if (!emailValidation.isValid) {
        showToast.error(emailValidation.message || "이메일을 확인해주세요.");
        return;
      }

      const passwordValidation = validatePasswordWithMessage(formData.password);
      if (!passwordValidation.isValid) {
        showToast.error(
          passwordValidation.message || "비밀번호를 확인해주세요."
        );
        return;
      }

      if (
        !validatePasswordConfirm(formData.password, formData.confirmPassword)
      ) {
        showToast.error("비밀번호가 일치하지 않습니다.");
        return;
      }

      const nameValidation = validateNameWithMessage(formData.name);
      if (!nameValidation.isValid) {
        showToast.error(nameValidation.message || "이름을 확인해주세요.");
        return;
      }

      if (!formData.agree_terms || !formData.agree_privacy) {
        showToast.error("필수 약관에 동의해주세요.");
        return;
      }

      if (!formData.emailChecked || !formData.emailAvailable) {
        showToast.error("이메일 중복 확인을 해주세요.");
        return;
      }

      const registerData: RegisterRequest = {
        email: formData.email,
        password: formData.password,
        name: formData.name,
        agree_terms: formData.agree_terms,
        agree_privacy: formData.agree_privacy,
        agree_marketing: formData.agree_marketing,
      };

      const response = await fetch("/api/v1/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(registerData),
      });

      if (response.ok) {
        const data: RegisterResponse = await response.json();

        showToast.success("회원가입이 완료되었습니다! 이메일을 확인해주세요.");

        if (onSuccess) {
          onSuccess(data.data);
        }

        router.push(redirectTo);
      } else {
        const errorData: RegisterErrorResponse = await response.json();
        const errorMessage = getErrorMessage(errorData);

        showToast.error(errorMessage);

        if (onError) {
          onError(errorData.error);
        }
      }
    } catch (err) {
      console.error("회원가입 오류:", err);

      const errorMessage =
        err instanceof Error
          ? err.message
          : "서버 연결에 실패했습니다. 잠시 후 다시 시도해주세요.";

      showToast.error(errorMessage);

      if (onError) {
        onError({
          code: "INTERNAL_ERROR" as RegisterErrorCodes,
          message: errorMessage,
        });
      }
    } finally {
      setFormData((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const isFormValid =
    formData.email &&
    formData.password &&
    formData.confirmPassword &&
    formData.name &&
    formData.agree_terms &&
    formData.agree_privacy &&
    formData.emailChecked &&
    formData.emailAvailable;

  return (
    <div className={`w-[380px] ${className}`}>
      <form onSubmit={handleSubmit} className="space-y-[12px]">
        <div className="mb-[10px]">
          <label
            htmlFor="email"
            className="block text-neutral-300 font-medium mb-2 text-sm"
          >
            이메일 *
          </label>
          <div className="flex gap-2">
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="이메일을 입력하세요"
              className="flex-1 h-[35px] px-3 bg-transparent border border-neutral-500 rounded-flamingo-xs text-neutral-0 placeholder-neutral-500 focus:outline-none focus:border-primary transition-colors text-sm"
              required
              disabled={formData.isLoading}
            />
            <button
              type="button"
              onClick={checkEmailAvailability}
              disabled={formData.isLoading || !formData.email}
              className="px-2 py-1 bg-secondary text-neutral-0 rounded-flamingo-xs hover:bg-secondary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs"
            >
              중복확인
            </button>
          </div>
          {formData.emailChecked && (
            <p
              className={`text-xs mt-1 ${
                formData.emailAvailable ? "text-success" : "text-error"
              }`}
            >
              {formData.emailAvailable
                ? "사용 가능한 이메일입니다"
                : "이미 사용 중인 이메일입니다"}
            </p>
          )}
        </div>

        <div className="mb-[10px]">
          <label
            htmlFor="password"
            className="block text-neutral-300 font-medium mb-2 text-sm"
          >
            비밀번호 *
          </label>
          <input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="비밀번호를 입력하세요"
            className="w-full h-[35px] px-3 bg-transparent border border-neutral-500 rounded-flamingo-xs text-neutral-0 placeholder-neutral-500 focus:outline-none focus:border-primary transition-colors text-sm"
            required
            disabled={formData.isLoading}
          />
          <p className="text-neutral-400 text-xs mt-1">
            8자 이상, 영문+숫자+특수문자 포함
          </p>
        </div>

        <div className="mb-[10px]">
          <label
            htmlFor="confirmPassword"
            className="block text-neutral-300 font-medium mb-2 text-sm"
          >
            비밀번호 확인 *
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            placeholder="비밀번호를 다시 입력하세요"
            className="w-full h-[35px] px-3 bg-transparent border border-neutral-500 rounded-flamingo-xs text-neutral-0 placeholder-neutral-500 focus:outline-none focus:border-primary transition-colors text-sm"
            required
            disabled={formData.isLoading}
          />
        </div>

        <div className="mb-[10px]">
          <label
            htmlFor="name"
            className="block text-neutral-300 font-medium mb-2 text-sm"
          >
            이름 *
          </label>
          <input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="이름을 입력하세요"
            className="w-full h-[35px] px-3 bg-transparent border border-neutral-500 rounded-flamingo-xs text-neutral-0 placeholder-neutral-500 focus:outline-none focus:border-primary transition-colors text-sm"
            required
            disabled={formData.isLoading}
          />
        </div>

        <div className="mb-[16px] space-y-2">
          <div className="flex items-center">
            <input
              id="agree_terms"
              name="agree_terms"
              type="checkbox"
              checked={formData.agree_terms}
              onChange={handleInputChange}
              disabled={formData.isLoading}
              className="w-4 h-4 text-primary bg-transparent border border-neutral-500 rounded focus:ring-primary focus:ring-1 focus:ring-opacity-50"
            />
            <label
              htmlFor="agree_terms"
              className="ml-2 text-neutral-300 cursor-pointer text-sm"
            >
              서비스 이용약관 동의 (필수)
            </label>
          </div>

          <div className="flex items-center">
            <input
              id="agree_privacy"
              name="agree_privacy"
              type="checkbox"
              checked={formData.agree_privacy}
              onChange={handleInputChange}
              disabled={formData.isLoading}
              className="w-4 h-4 text-primary bg-transparent border border-neutral-500 rounded focus:ring-primary focus:ring-1 focus:ring-opacity-50"
            />
            <label
              htmlFor="agree_privacy"
              className="ml-2 text-neutral-300 cursor-pointer text-sm"
            >
              개인정보 처리방침 동의 (필수)
            </label>
          </div>

          <div className="flex items-center">
            <input
              id="agree_marketing"
              name="agree_marketing"
              type="checkbox"
              checked={formData.agree_marketing}
              onChange={handleInputChange}
              disabled={formData.isLoading}
              className="w-4 h-4 text-primary bg-transparent border border-neutral-500 rounded focus:ring-primary focus:ring-1 focus:ring-opacity-50"
            />
            <label
              htmlFor="agree_marketing"
              className="ml-2 text-neutral-300 cursor-pointer text-sm"
            >
              마케팅 정보 수신 동의 (선택)
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={formData.isLoading || !isFormValid}
          className="w-full h-[45px] bg-primary text-neutral-0 font-bold rounded-flamingo-sm hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed animate-fade-in"
        >
          {formData.isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-neutral-0 border-t-transparent rounded-full animate-spin"></div>
              회원가입 중...
            </span>
          ) : (
            "회원가입"
          )}
        </button>
      </form>

      <div className="absolute bottom-[20px] left-1/2 transform -translate-x-1/2">
        <Link href="/login" className="text-neutral-300 text-sm">
          이미 계정이 있으신가요?
          <span className="text-primary"> 로그인</span>
        </Link>
      </div>
    </div>
  );
};

export default SignupForm;
