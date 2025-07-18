"use client";

import { User, Bell, Shield, Palette, Globe } from "lucide-react";
import { useState } from "react";

interface SettingSection {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

const settingSections: SettingSection[] = [
  {
    id: "profile",
    title: "프로필",
    description: "개인 정보 및 계정 설정",
    icon: User,
  },
  {
    id: "notifications",
    title: "알림",
    description: "알림 및 이메일 설정",
    icon: Bell,
  },
  {
    id: "security",
    title: "보안",
    description: "비밀번호 및 보안 설정",
    icon: Shield,
  },
  {
    id: "appearance",
    title: "외관",
    description: "테마 및 디스플레이 설정",
    icon: Palette,
  },
  {
    id: "language",
    title: "언어 및 지역",
    description: "언어, 시간대 및 지역 설정",
    icon: Globe,
  },
];

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState("profile");

  const renderSettingContent = () => {
    switch (activeSection) {
      case "profile":
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                이름
              </label>
              <input
                type="text"
                defaultValue="홍길동"
                className="w-full bg-neutral-700 border border-neutral-600 rounded-lg px-4 py-3 text-neutral-100 focus:outline-none focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                이메일
              </label>
              <input
                type="email"
                defaultValue="hong@example.com"
                className="w-full bg-neutral-700 border border-neutral-600 rounded-lg px-4 py-3 text-neutral-100 focus:outline-none focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                회사
              </label>
              <input
                type="text"
                defaultValue="플라밍고"
                className="w-full bg-neutral-700 border border-neutral-600 rounded-lg px-4 py-3 text-neutral-100 focus:outline-none focus:border-primary-500"
              />
            </div>
          </div>
        );
      case "notifications":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-neutral-100 font-medium">이메일 알림</h4>
                <p className="text-sm text-neutral-400">
                  새로운 프로젝트 및 공유 알림
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  defaultChecked
                />
                <div className="w-11 h-6 bg-neutral-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-neutral-100 font-medium">푸시 알림</h4>
                <p className="text-sm text-neutral-400">
                  브라우저 푸시 알림 받기
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-neutral-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
              </label>
            </div>
          </div>
        );
      case "security":
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                현재 비밀번호
              </label>
              <input
                type="password"
                className="w-full bg-neutral-700 border border-neutral-600 rounded-lg px-4 py-3 text-neutral-100 focus:outline-none focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                새 비밀번호
              </label>
              <input
                type="password"
                className="w-full bg-neutral-700 border border-neutral-600 rounded-lg px-4 py-3 text-neutral-100 focus:outline-none focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                비밀번호 확인
              </label>
              <input
                type="password"
                className="w-full bg-neutral-700 border border-neutral-600 rounded-lg px-4 py-3 text-neutral-100 focus:outline-none focus:border-primary-500"
              />
            </div>
          </div>
        );
      case "appearance":
        return (
          <div className="space-y-6">
            <div>
              <h4 className="text-neutral-100 font-medium mb-4">테마</h4>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="theme"
                    value="dark"
                    defaultChecked
                    className="mr-3"
                  />
                  <span className="text-neutral-300">다크 모드</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="theme"
                    value="light"
                    className="mr-3"
                  />
                  <span className="text-neutral-300">라이트 모드</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="theme"
                    value="auto"
                    className="mr-3"
                  />
                  <span className="text-neutral-300">시스템 설정</span>
                </label>
              </div>
            </div>
          </div>
        );
      case "language":
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                언어
              </label>
              <select className="w-full bg-neutral-700 border border-neutral-600 rounded-lg px-4 py-3 text-neutral-100 focus:outline-none focus:border-primary-500">
                <option value="ko">한국어</option>
                <option value="en">English</option>
                <option value="ja">日本語</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                시간대
              </label>
              <select className="w-full bg-neutral-700 border border-neutral-600 rounded-lg px-4 py-3 text-neutral-100 focus:outline-none focus:border-primary-500">
                <option value="Asia/Seoul">서울 (GMT+9)</option>
                <option value="UTC">UTC (GMT+0)</option>
                <option value="America/New_York">뉴욕 (GMT-5)</option>
              </select>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex-1 min-h-screen bg-neutral-600">
      <div className="ml-[280px] p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-100 mb-2">설정</h1>
          <p className="text-neutral-400">
            계정 및 애플리케이션 설정을 관리하세요
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <nav className="space-y-2">
              {settingSections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeSection === section.id
                        ? "bg-primary-500 text-neutral-0"
                        : "text-neutral-300 hover:bg-neutral-700"
                    }`}
                  >
                    <Icon size={20} />
                    <div>
                      <div className="font-medium">{section.title}</div>
                      <div className="text-xs opacity-70">
                        {section.description}
                      </div>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="lg:col-span-3">
            <div className="bg-neutral-800 rounded-lg p-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-neutral-100 mb-2">
                  {settingSections.find((s) => s.id === activeSection)?.title}
                </h2>
                <p className="text-neutral-400">
                  {
                    settingSections.find((s) => s.id === activeSection)
                      ?.description
                  }
                </p>
              </div>

              {renderSettingContent()}

              <div className="mt-8 pt-6 border-t border-neutral-700">
                <div className="flex justify-end gap-3">
                  <button className="px-4 py-2 text-neutral-400 hover:text-neutral-100 transition-colors">
                    취소
                  </button>
                  <button className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-neutral-0 rounded-lg transition-colors">
                    저장
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
