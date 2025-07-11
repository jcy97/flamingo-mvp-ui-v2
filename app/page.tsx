import Link from "next/link";

export default function Home() {
  const routes = [
    {
      path: "/login",
      title: "로그인 페이지",
      description: "사용자 로그인 화면",
    },
    {
      path: "/signup",
      title: "회원가입 페이지",
      description: "사용자 회원가입 화면",
    },
    {
      path: "/workspace",
      title: "워크스페이스",
      description: "협업 드로잉 보드 메인 화면",
    },
  ];

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Flamingo 프론트엔드 화면 목록
        </h1>
        <p className="text-gray-600 mb-8">
          개발 중인 화면들을 확인할 수 있습니다.
        </p>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {routes.map((route) => (
            <Link
              key={route.path}
              href={route.path}
              className="block p-6 bg-white border border-gray-200 rounded-lg shadow hover:shadow-md transition-shadow hover:border-blue-300"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {route.title}
              </h3>
              <p className="text-gray-600 text-sm mb-3">{route.description}</p>
              <div className="text-blue-600 text-sm font-medium">
                {route.path} →
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
