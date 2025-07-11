import SignupForm from "@/components/Auth/SignupForm";
import { Metadata } from "next";
import Image from "next/image";
import React from "react";

export const metadata: Metadata = {
  title: "회원가입 - Flamingo",
  description: "플라밍고 회원가입 페이지",
};

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-neutral-900 flex items-center justify-center py-4">
      <div className="bg-neutral-700 rounded-flamingo w-[480px] min-h-[670px] flex flex-col items-center relative shadow-flamingo">
        <div className="flex items-center mt-[20px] mb-[16px]">
          <Image src="/logo.png" alt="Flamingo Logo" width={200} height={100} />
        </div>

        <SignupForm />
      </div>
    </div>
  );
}
