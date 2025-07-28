"use client";

import { authApi } from "@/lib/api/auth";
import { showToast } from "@/utils/toast";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

type VerificationState = "loading" | "success" | "error";

export default function VerifyPageContent() {
  const searchParams = useSearchParams();
  const [state, setState] = useState<VerificationState>("loading");
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setState("error");
      setMessage("인증 토큰이 없습니다.");
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await authApi.verifyEmail(token);
        setState("success");
        setMessage(response.message || "이메일 인증이 완료되었습니다!");
        showToast.success("이메일 인증이 완료되었습니다!");
      } catch (error: any) {
        setState("error");
        const errorMessage =
          error.message || "인증에 실패했습니다. 다시 시도해주세요.";
        setMessage(errorMessage);
        showToast.error(errorMessage);
      }
    };

    verifyEmail();
  }, [searchParams]);

  const renderContent = () => {
    switch (state) {
      case "loading":
        return (
          <div className="flex flex-col items-center">
            <Loader2 className="w-16 h-16 text-primary-500 animate-spin mb-4" />
            <h2 className="text-heading-3 text-neutral-0 mb-2">
              이메일 인증 중...
            </h2>
            <p className="text-body-3 text-neutral-400 text-center">
              잠시만 기다려주세요.
            </p>
          </div>
        );

      case "success":
        return (
          <div className="flex flex-col items-center">
            <CheckCircle className="w-16 h-16 text-success mb-4" />
            <h2 className="text-heading-3 text-neutral-0 mb-2">환영합니다!</h2>
            <p className="text-body-2 text-neutral-300 mb-6 text-center">
              이메일 인증이 성공적으로 완료되었습니다.
              <br />
              이제 플라밍고의 모든 기능을 사용하실 수 있습니다.
            </p>
            <div className="flex flex-col gap-3 w-full">
              <Link
                href="/login"
                className="w-full h-[50px] bg-primary text-neutral-0 font-bold rounded-flamingo-sm hover:bg-primary-700 transition-colors flex items-center justify-center"
              >
                로그인하러 가기
              </Link>
            </div>
          </div>
        );

      case "error":
        return (
          <div className="flex flex-col items-center">
            <XCircle className="w-16 h-16 text-error mb-4" />
            <h2 className="text-heading-3 text-neutral-0 mb-2">인증 실패</h2>
            <p className="text-body-3 text-neutral-400 mb-6 text-center">
              {message}
            </p>
            <div className="flex flex-col gap-3 w-full">
              <Link
                href="/signup"
                className="w-full h-[50px] bg-primary text-neutral-0 font-bold rounded-flamingo-sm hover:bg-primary-700 transition-colors flex items-center justify-center"
              >
                다시 회원가입하기
              </Link>
              <Link
                href="/login"
                className="w-full h-[50px] bg-transparent border border-neutral-500 text-neutral-300 font-medium rounded-flamingo-sm hover:bg-neutral-600 transition-colors flex items-center justify-center"
              >
                로그인 페이지로 이동
              </Link>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-neutral-900 flex items-center justify-center p-4">
      <div className="bg-neutral-700 rounded-flamingo w-[450px] min-h-[400px] flex flex-col items-center relative shadow-flamingo p-8">
        <div className="flex items-center mb-8">
          <Image src="/logo.png" alt="Flamingo Logo" width={200} height={100} />
        </div>

        <div className="w-full max-w-[350px]">{renderContent()}</div>
      </div>
    </div>
  );
}
