import React, { useState } from "react";
import { Copy, Globe, ChevronRight, User } from "lucide-react";

function ShareModal() {
  const [emails, setEmails] = useState("");
  const [shareUrl] = useState(
    "https://flamingodraw.com/workspace/shared/abc123"
  );
  const [accessLevel, setAccessLevel] = useState("edit");

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
  };

  const handleInvite = () => {
    console.log("Inviting emails:", emails);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="이메일을 입력하세요 (쉼표로 구분)"
          value={emails}
          onChange={(e) => setEmails(e.target.value)}
          className="flex-1 bg-neutral-800 border border-neutral-600 rounded px-3 py-2 text-xs text-neutral-100 placeholder-neutral-400 focus:border-primary-500 focus:outline-none"
        />
        <button
          onClick={handleInvite}
          disabled={!emails.trim()}
          className="text-neutral-100 px-4 py-2 bg-secondary-500 cursor-pointer hover:bg-secondary-300 disabled:bg-neutral-700 disabled:text-neutral-500 disabled:cursor-default rounded text-xs font-medium transition-colors"
        >
          초대
        </button>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={handleCopyLink}
          className="flex items-center gap-2 px-3 py-2 bg-neutral-800 hover:bg-neutral-700 rounded text-xs transition-colors text-neutral-300"
        >
          <Copy size={12} />
          링크 복사
        </button>
        <span className="text-xs text-neutral-500 truncate flex-1">
          {shareUrl}
        </span>
      </div>

      <div>
        <h3 className="text-xs font-medium text-neutral-300 mb-3">접근 권한</h3>

        <div className="space-y-2">
          <div className="flex items-center justify-between p-2 hover:bg-neutral-800 rounded cursor-pointer">
            <div className="flex items-center gap-2">
              <Globe size={14} className="text-neutral-400" />
              <span className="text-xs text-neutral-300">누구나</span>
            </div>
            <div className="flex items-center gap-1">
              <select
                value={accessLevel}
                onChange={(e) => setAccessLevel(e.target.value)}
                className="bg-transparent text-xs text-neutral-300 focus:outline-none"
              >
                <option value="view">보기</option>
                <option value="edit">편집</option>
              </select>
              <ChevronRight size={12} className="text-neutral-400" />
            </div>
          </div>

          <div className="flex items-center justify-between p-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                <User size={12} className="text-white" />
              </div>
              <div>
                <span className="text-xs text-neutral-300">CYJEONG (you)</span>
              </div>
            </div>
            <span className="text-xs text-neutral-400">소유자</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShareModal;
