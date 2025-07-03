import LoginForm from "@/components/auth/LoginForm";
import { Metadata } from "next";
import Image from "next/image";
import React from "react";

export const metadata: Metadata = {
  title: "로그인 - Flamingo",
  description: "플라밍고 로그인 페이지",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-neutral-900 flex items-center justify-center">
      <div className="bg-neutral-700 rounded-flamingo w-[500px] h-[550px] flex flex-col items-center relative shadow-flamingo">
        <div className="flex items-center mt-[24px] mb-[32px]">
          <Image src="/logo.png" alt="Flamingo Logo" width={240} height={121} />
        </div>

        <LoginForm />
      </div>
    </div>
  );
}
