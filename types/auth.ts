export interface LoginRequest {
  email: string;
  password: string;
  remember: boolean;
}

export interface LoginUser {
  id: string;
  name: string;
  role: string;
}

export interface LoginToken {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export interface LoginSuccessData {
  user: LoginUser;
  token: LoginToken;
}

export interface LoginSuccessResponse {
  data: LoginSuccessData;
}

export interface LoginError {
  code: LoginErrorCode;
  message: string;
}

export interface LoginErrorResponse {
  error: LoginError;
}

export enum LoginErrorCode {
  INVALID_CREDENTIALS = "AUTH_001",
  LOCKED_ACCOUNT = "AUTH_002",
  UNSUPPORTED_PROVIDER = "AUTH_003",
}

export const LOGIN_ERROR_STATUS: Record<LoginErrorCode, number> = {
  [LoginErrorCode.INVALID_CREDENTIALS]: 401,
  [LoginErrorCode.LOCKED_ACCOUNT]: 423,
  [LoginErrorCode.UNSUPPORTED_PROVIDER]: 400,
};

export const LOGIN_ERROR_MESSAGES: Record<LoginErrorCode, string> = {
  [LoginErrorCode.INVALID_CREDENTIALS]: "인증 정보가 일치하지 않습니다",
  [LoginErrorCode.LOCKED_ACCOUNT]:
    "계정이 잠겨있습니다. 고객센터에 문의해주세요",
  [LoginErrorCode.UNSUPPORTED_PROVIDER]: "지원하지 않는 로그인 방식입니다",
};

export interface LoginFormState {
  email: string;
  password: string;
  remember: boolean;
  isLoading: boolean;
  error: string;
}

export interface LoginFormProps {
  onSuccess?: (data: LoginSuccessData) => void;
  onError?: (error: LoginError) => void;
  redirectTo?: string;
  className?: string;
}

export interface UseLoginReturn {
  formState: LoginFormState;
  setFormState: React.Dispatch<React.SetStateAction<LoginFormState>>;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  clearError: () => void;
}

export interface StoredAuthData {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  user: LoginUser;
  remember: boolean;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  user_type?: string;
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type UserType = "artist" | "student" | "teacher";

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  user_type: UserType;
  agree_terms: boolean;
  agree_privacy: boolean;
  agree_marketing?: boolean;
}

export interface RegisterResponse {
  success: true;
  data: {
    message: string;
    user_id: number;
    email: string;
  };
}

export interface RegisterErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

export enum RegisterErrorCodes {
  VALIDATION_ERROR = "VALIDATION_ERROR",
  EMAIL_ALREADY_EXISTS = "EMAIL_ALREADY_EXISTS",
  WEAK_PASSWORD = "WEAK_PASSWORD",
  TERMS_NOT_AGREED = "TERMS_NOT_AGREED",
  INTERNAL_ERROR = "INTERNAL_ERROR",
}

export const REGISTER_ERROR_MESSAGES: Record<RegisterErrorCodes, string> = {
  [RegisterErrorCodes.VALIDATION_ERROR]: "입력 정보를 확인해주세요",
  [RegisterErrorCodes.EMAIL_ALREADY_EXISTS]: "이미 사용 중인 이메일입니다",
  [RegisterErrorCodes.WEAK_PASSWORD]: "비밀번호 정책을 확인해주세요",
  [RegisterErrorCodes.TERMS_NOT_AGREED]: "필수 약관에 동의해주세요",
  [RegisterErrorCodes.INTERNAL_ERROR]:
    "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요",
};

export interface CheckEmailResponse {
  success: true;
  data: {
    available: boolean;
    message: string;
  };
}

export interface SignupFormProps {
  onSuccess?: (data: RegisterResponse["data"]) => void;
  onError?: (error: RegisterErrorResponse["error"]) => void;
  redirectTo?: string;
  className?: string;
}

export interface SignupFormState {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  user_type: UserType;
  agree_terms: boolean;
  agree_privacy: boolean;
  agree_marketing: boolean;
  isLoading: boolean;
  emailChecked: boolean;
  emailAvailable: boolean;
}

export interface SignupResponse {
  success: boolean;
  message: string;
  user?: User;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
}

export interface FormState {
  isLoading: boolean;
  error: string;
  success: string;
}

export interface ApiError {
  error: {
    code: string;
    message: string;
  };
}

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, remember: boolean) => Promise<void>;
  logout: () => void;
  signup: (data: RegisterRequest) => Promise<SignupResponse>;
  refreshToken: () => Promise<void>;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
  requiredRole?: string;
}

export interface Session {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}
