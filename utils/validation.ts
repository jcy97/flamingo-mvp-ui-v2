/**
 * 공통 검증 유틸리티
 * 로그인, 회원가입, 기타 폼에서 재사용 가능한 검증 로직
 */

// 이메일 유효성 검사
export const validateEmail = (email: string): boolean => {
  if (!email || typeof email !== "string") {
    return false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

// 비밀번호 유효성 검사 (8자 이상, 영문+숫자+특수문자)
export const validatePassword = (password: string): boolean => {
  if (!password || typeof password !== "string") {
    return false;
  }

  // 8자 이상, 영문+숫자+특수문자 포함
  const passwordRegex =
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
  return passwordRegex.test(password);
};

// 비밀번호 확인 (비밀번호 일치 검사)
export const validatePasswordConfirm = (
  password: string,
  confirmPassword: string
): boolean => {
  if (!password || !confirmPassword) {
    return false;
  }

  return password === confirmPassword;
};

// 이름 유효성 검사 (2-20자, 한글/영문만)
export const validateName = (name: string): boolean => {
  if (!name || typeof name !== "string") {
    return false;
  }

  const trimmedName = name.trim();

  // 2-20자, 한글, 영문, 공백만 허용
  const nameRegex = /^[가-힣a-zA-Z\s]{2,20}$/;
  return nameRegex.test(trimmedName);
};

// 휴대폰 번호 유효성 검사 (010-1234-5678 형식)
export const validatePhoneNumber = (phone: string): boolean => {
  if (!phone || typeof phone !== "string") {
    return false;
  }

  // 하이픈 포함/미포함 모두 허용
  const phoneRegex = /^010-?[0-9]{4}-?[0-9]{4}$/;
  return phoneRegex.test(phone.replace(/\s/g, ""));
};

// 생년월일 유효성 검사 (YYYY-MM-DD 형식)
export const validateBirthDate = (birthDate: string): boolean => {
  if (!birthDate || typeof birthDate !== "string") {
    return false;
  }

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(birthDate)) {
    return false;
  }

  const date = new Date(birthDate);
  const now = new Date();

  // 유효한 날짜인지 확인
  if (isNaN(date.getTime())) {
    return false;
  }

  // 미래 날짜가 아닌지 확인
  if (date > now) {
    return false;
  }

  // 너무 과거(150년 전)가 아닌지 확인
  const maxAge = new Date();
  maxAge.setFullYear(maxAge.getFullYear() - 150);
  if (date < maxAge) {
    return false;
  }

  return true;
};

// URL 유효성 검사
export const validateUrl = (url: string): boolean => {
  if (!url || typeof url !== "string") {
    return false;
  }

  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// 닉네임 유효성 검사 (2-12자, 한글/영문/숫자/일부 특수문자)
export const validateNickname = (nickname: string): boolean => {
  if (!nickname || typeof nickname !== "string") {
    return false;
  }

  const trimmedNickname = nickname.trim();

  // 2-12자, 한글, 영문, 숫자, 언더스코어, 하이픈만 허용
  const nicknameRegex = /^[가-힣a-zA-Z0-9_-]{2,12}$/;
  return nicknameRegex.test(trimmedNickname);
};

// 사업자등록번호 유효성 검사 (123-45-67890 형식)
export const validateBusinessNumber = (businessNumber: string): boolean => {
  if (!businessNumber || typeof businessNumber !== "string") {
    return false;
  }

  // 하이픈 제거 후 10자리 숫자인지 확인
  const cleaned = businessNumber.replace(/-/g, "");
  const businessRegex = /^\d{10}$/;

  if (!businessRegex.test(cleaned)) {
    return false;
  }

  // 사업자등록번호 체크섬 검증
  const weights = [1, 3, 7, 1, 3, 7, 1, 3, 5];
  let sum = 0;

  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleaned[i]) * weights[i];
  }

  sum += Math.floor((parseInt(cleaned[8]) * 5) / 10);
  const checkDigit = (10 - (sum % 10)) % 10;

  return checkDigit === parseInt(cleaned[9]);
};

// 검증 결과를 담는 타입
export interface ValidationResult {
  isValid: boolean;
  message?: string;
}

// 종합적인 이메일 검증 (메시지 포함)
export const validateEmailWithMessage = (email: string): ValidationResult => {
  if (!email) {
    return { isValid: false, message: "이메일을 입력해주세요." };
  }

  if (!validateEmail(email)) {
    return { isValid: false, message: "올바른 이메일 형식을 입력해주세요." };
  }

  return { isValid: true };
};

// 종합적인 비밀번호 검증 (메시지 포함)
export const validatePasswordWithMessage = (
  password: string
): ValidationResult => {
  if (!password) {
    return { isValid: false, message: "비밀번호를 입력해주세요." };
  }

  if (password.length < 8) {
    return { isValid: false, message: "비밀번호는 8자 이상이어야 합니다." };
  }

  if (!validatePassword(password)) {
    return {
      isValid: false,
      message: "비밀번호는 영문, 숫자, 특수문자(@$!%*#?&)를 포함해야 합니다.",
    };
  }

  return { isValid: true };
};

// 종합적인 이름 검증 (메시지 포함)
export const validateNameWithMessage = (name: string): ValidationResult => {
  if (!name) {
    return { isValid: false, message: "이름을 입력해주세요." };
  }

  const trimmedName = name.trim();

  if (trimmedName.length < 2) {
    return { isValid: false, message: "이름은 2자 이상이어야 합니다." };
  }

  if (trimmedName.length > 20) {
    return { isValid: false, message: "이름은 20자 이하여야 합니다." };
  }

  if (!validateName(name)) {
    return {
      isValid: false,
      message: "이름은 한글 또는 영문만 입력 가능합니다.",
    };
  }

  return { isValid: true };
};

// 종합적인 휴대폰 번호 검증 (메시지 포함)
export const validatePhoneNumberWithMessage = (
  phone: string
): ValidationResult => {
  if (!phone) {
    return { isValid: false, message: "휴대폰 번호를 입력해주세요." };
  }

  if (!validatePhoneNumber(phone)) {
    return {
      isValid: false,
      message: "올바른 휴대폰 번호 형식을 입력해주세요. (010-1234-5678)",
    };
  }

  return { isValid: true };
};

// 필수 필드 검증 헬퍼
export const validateRequired = (
  value: string,
  fieldName: string
): ValidationResult => {
  if (!value || !value.trim()) {
    return { isValid: false, message: `${fieldName}을(를) 입력해주세요.` };
  }

  return { isValid: true };
};

// 최소/최대 길이 검증 헬퍼
export const validateLength = (
  value: string,
  min: number,
  max: number,
  fieldName: string
): ValidationResult => {
  if (!value) {
    return { isValid: false, message: `${fieldName}을(를) 입력해주세요.` };
  }

  const trimmedValue = value.trim();

  if (trimmedValue.length < min) {
    return {
      isValid: false,
      message: `${fieldName}은(는) ${min}자 이상이어야 합니다.`,
    };
  }

  if (trimmedValue.length > max) {
    return {
      isValid: false,
      message: `${fieldName}은(는) ${max}자 이하여야 합니다.`,
    };
  }

  return { isValid: true };
};
