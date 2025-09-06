"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const checkAuthAndRedirect = () => {
      const accessToken = localStorage.getItem("flamingo-access-token");
      const authData =
        localStorage.getItem("flamingo-auth") ||
        sessionStorage.getItem("flamingo-auth");

      if (accessToken && authData) {
        router.push("/project/dashboard");
      } else {
        router.push("/login");
      }
    };

    checkAuthAndRedirect();
  }, [router]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-4 text-gray-600">로딩 중...</p>
      </div>
    </div>
  );
}
