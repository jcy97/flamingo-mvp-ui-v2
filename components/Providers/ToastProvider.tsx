"use client";
import { Toaster } from "react-hot-toast";

export default function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: "var(--neutral-700)",
          color: "var(--neutral-0)",
          border: "1px solid var(--neutral-500)",
          borderRadius: "var(--radius-flamingo-sm)",
          fontSize: "var(--text-body-3)",
          fontFamily: "var(--font-family-sans)",
        },
        success: {
          style: {
            background: "var(--success-bg)",
            color: "var(--success-text)",
            border: "1px solid var(--success-icon)",
          },
          iconTheme: {
            primary: "var(--success-icon)",
            secondary: "var(--success-bg)",
          },
        },
        error: {
          style: {
            background: "var(--error-bg)",
            color: "var(--error-text)",
            border: "1px solid var(--error-icon)",
          },
          iconTheme: {
            primary: "var(--error-icon)",
            secondary: "var(--error-bg)",
          },
        },
      }}
    />
  );
}
