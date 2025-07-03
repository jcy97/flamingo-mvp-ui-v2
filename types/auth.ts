// 로그인 요청 타입
export interface LoginRequest {
  email: string; // @ 포함 이메일
  password: string; // 8자 이상 영문+숫자+특수문자
  remember: boolean; // 장기간 로그인 유지 여부
}

// 사용자 정보 타입
export interface LoginUser {
  id: string; // 사용자 ID (예: "user_abc123")
  name: string; // 사용자 이름 (예: "김미미")
  role: string; // 사용자 역할 (예: "creator")
}

// 토큰 정보 타입
export interface LoginToken {
  access_token: string; // JWT 액세스 토큰
  refresh_token: string; // JWT 리프레시 토큰
  expires_in: number; // 토큰 만료 시간 (초 단위)
}

// 로그인 성공 응답 데이터 타입
export interface LoginSuccessData {
  user: LoginUser;
  token: LoginToken;
}

// 로그인 성공 응답 타입
export interface LoginSuccessResponse {
  data: LoginSuccessData;
}

// 로그인 에러 정보 타입
export interface LoginError {
  code: LoginErrorCode; // 에러 코드
  message: string; // 에러 메시지
}

// 로그인 실패 응답 타입
export interface LoginErrorResponse {
  error: LoginError;
}

// 로그인 에러 코드 열거형
export enum LoginErrorCode {
  INVALID_CREDENTIALS = "AUTH_001", // 잘못된 자격 증명
  LOCKED_ACCOUNT = "AUTH_002", // 잠긴 계정
  UNSUPPORTED_PROVIDER = "AUTH_003", // 지원하지 않는 소셜 공급자
}

// 로그인 에러 코드별 HTTP 상태 코드 매핑
export const LOGIN_ERROR_STATUS: Record<LoginErrorCode, number> = {
  [LoginErrorCode.INVALID_CREDENTIALS]: 401,
  [LoginErrorCode.LOCKED_ACCOUNT]: 423,
  [LoginErrorCode.UNSUPPORTED_PROVIDER]: 400,
};

// 로그인 에러 코드별 기본 메시지
export const LOGIN_ERROR_MESSAGES: Record<LoginErrorCode, string> = {
  [LoginErrorCode.INVALID_CREDENTIALS]: "인증 정보가 일치하지 않습니다",
  [LoginErrorCode.LOCKED_ACCOUNT]:
    "계정이 잠겨있습니다. 고객센터에 문의해주세요",
  [LoginErrorCode.UNSUPPORTED_PROVIDER]: "지원하지 않는 로그인 방식입니다",
};

// 로그인 폼 상태 타입
export interface LoginFormState {
  email: string;
  password: string;
  remember: boolean;
  isLoading: boolean;
  error: string;
}

// 로그인 폼 컴포넌트 Props 타입
export interface LoginFormProps {
  onSuccess?: (data: LoginSuccessData) => void;
  onError?: (error: LoginError) => void;
  redirectTo?: string;
  className?: string;
}

// 로그인 훅 반환 타입
export interface UseLoginReturn {
  formState: LoginFormState;
  setFormState: React.Dispatch<React.SetStateAction<LoginFormState>>;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  clearError: () => void;
}

// 로컬 스토리지 토큰 저장 타입
export interface StoredAuthData {
  accessToken: string;
  refreshToken: string;
  expiresAt: string; // ISO 문자열
  user: LoginUser;
  remember: boolean;
}

// 일반 사용자 관련 타입
export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
}

// 회원가입 요청 타입
export interface SignupRequest {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

// 회원가입 응답 타입
export interface SignupResponse {
  success: boolean;
  message: string;
  user?: User;
}

// 인증 상태 타입
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
}

// 일반 폼 상태 타입
export interface FormState {
  isLoading: boolean;
  error: string;
  success: string;
}

// 일반 API 에러 응답 타입
export interface ApiError {
  error: {
    code: string;
    message: string;
  };
}

// 토큰 페이로드 타입 (JWT)
export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

// 회원가입 폼 컴포넌트 Props
export interface SignupFormProps {
  onSuccess?: (data: SignupResponse) => void;
  onError?: (error: string) => void;
  redirectTo?: string;
  className?: string;
}

// 인증 컨텍스트 타입
export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, remember: boolean) => Promise<void>;
  logout: () => void;
  signup: (data: SignupRequest) => Promise<SignupResponse>;
  refreshToken: () => Promise<void>;
  isLoading: boolean;
  isAuthenticated: boolean;
}

// 보호된 라우트 Props
export interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
  requiredRole?: string;
}

// 세션 타입
export interface Session {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}
