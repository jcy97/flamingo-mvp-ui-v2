// 로그인 요청 타입
export interface LoginRequest {
  email: string;
  password: string;
  remember: boolean;
}

// 사용자 정보 타입
export interface LoginUser {
  id: string;
  name: string;
  role: string;
}

// 토큰 정보 타입
export interface LoginToken {
  access_token: string;
  refresh_token: string;
  expires_in: number;
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
  code: LoginErrorCode;
  message: string;
}

// 로그인 실패 응답 타입
export interface LoginErrorResponse {
  error: LoginError;
}

// 로그인 에러 코드 열거형
export enum LoginErrorCode {
  INVALID_CREDENTIALS = "AUTH_001",
  LOCKED_ACCOUNT = "AUTH_002",
  UNSUPPORTED_PROVIDER = "AUTH_003",
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
  expiresAt: string;
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
export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  agree_terms: boolean;
  agree_privacy: boolean;
  agree_marketing?: boolean;
}

// 회원가입 성공 응답 타입
export interface RegisterResponse {
  success: true;
  data: {
    message: string;
    user_id: number;
    email: string;
  };
}

// 회원가입 에러 응답 타입
export interface RegisterErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

// 회원가입 에러 코드 열거형
export enum RegisterErrorCodes {
  VALIDATION_ERROR = "VALIDATION_ERROR",
  EMAIL_ALREADY_EXISTS = "EMAIL_ALREADY_EXISTS",
  WEAK_PASSWORD = "WEAK_PASSWORD",
  TERMS_NOT_AGREED = "TERMS_NOT_AGREED",
  INTERNAL_ERROR = "INTERNAL_ERROR",
}

// 회원가입 에러 메시지 매핑
export const REGISTER_ERROR_MESSAGES: Record<RegisterErrorCodes, string> = {
  [RegisterErrorCodes.VALIDATION_ERROR]: "입력 정보를 확인해주세요",
  [RegisterErrorCodes.EMAIL_ALREADY_EXISTS]: "이미 사용 중인 이메일입니다",
  [RegisterErrorCodes.WEAK_PASSWORD]: "비밀번호 정책을 확인해주세요",
  [RegisterErrorCodes.TERMS_NOT_AGREED]: "필수 약관에 동의해주세요",
  [RegisterErrorCodes.INTERNAL_ERROR]:
    "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요",
};

// 이메일 중복 확인 응답 타입
export interface CheckEmailResponse {
  success: true;
  data: {
    available: boolean;
    message: string;
  };
}

// 회원가입 폼 컴포넌트 Props
export interface SignupFormProps {
  onSuccess?: (data: RegisterResponse["data"]) => void;
  onError?: (error: RegisterErrorResponse["error"]) => void;
  redirectTo?: string;
  className?: string;
}

// 회원가입 폼 상태 타입
export interface SignupFormState {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  agree_terms: boolean;
  agree_privacy: boolean;
  agree_marketing: boolean;
  isLoading: boolean;
  emailChecked: boolean;
  emailAvailable: boolean;
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

// 인증 컨텍스트 타입
export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, remember: boolean) => Promise<void>;
  logout: () => void;
  signup: (data: RegisterRequest) => Promise<SignupResponse>;
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
