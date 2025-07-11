export default function NotFound() {
  return (
    <div className="min-h-screen bg-neutral-900 flex items-center justify-center">
      <div className="bg-neutral-700 rounded-flamingo w-[500px] h-[400px] flex flex-col items-center justify-center shadow-flamingo">
        <h1 className="text-heading-2 text-neutral-0 mb-4">404</h1>
        <h2 className="text-heading-4 text-neutral-300 mb-4">
          페이지를 찾을 수 없습니다
        </h2>
        <p className="text-body-3 text-neutral-400 mb-8 text-center px-8">
          요청하신 페이지가 존재하지 않거나 이동되었습니다.
        </p>
        <a
          href="/"
          className="btn-primary px-6 py-3 rounded-flamingo-sm text-button font-medium transition-colors"
        >
          홈으로 돌아가기
        </a>
      </div>
    </div>
  );
}
