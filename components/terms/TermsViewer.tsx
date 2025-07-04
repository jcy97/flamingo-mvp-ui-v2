"use client";
import React from "react";

interface TermsViewerProps {
  content: string;
  type: "terms" | "privacy";
}

const TermsViewer: React.FC<TermsViewerProps> = ({ content, type }) => {
  const formatContent = (text: string) => {
    return text.split("\n").map((line, index) => {
      if (line.trim() === "") {
        return <br key={index} />;
      }

      if (line.startsWith("제") && line.includes("조")) {
        return (
          <h3 key={index} className="font-bold text-primary mt-4 mb-2">
            {line.trim()}
          </h3>
        );
      }

      if (line.trim().startsWith("플라밍고")) {
        return (
          <h2 key={index} className="font-bold text-neutral-0 mb-4">
            {line.trim()}
          </h2>
        );
      }

      if (line.trim().startsWith("[시행일")) {
        return (
          <div
            key={index}
            className="text-neutral-400 mt-6 pt-4 border-t border-neutral-600"
          >
            {line.trim()}
          </div>
        );
      }

      return (
        <p key={index} className="text-neutral-200 leading-relaxed mb-2">
          {line}
        </p>
      );
    });
  };

  return (
    <div className="max-w-none">
      <div className="prose prose-sm max-w-none">{formatContent(content)}</div>

      <div className="mt-6 p-4 bg-neutral-800 rounded-flamingo-sm">
        <p className="text-neutral-300">
          {type === "terms"
            ? "서비스 이용약관에 동의하시면 위 내용을 모두 확인하신 것으로 간주됩니다."
            : "개인정보 처리방침에 동의하시면 위 내용을 모두 확인하신 것으로 간주됩니다."}
        </p>
      </div>
    </div>
  );
};

export default TermsViewer;
