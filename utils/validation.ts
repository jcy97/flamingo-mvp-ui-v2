export const validateEmail = (email: string): boolean => {
  if (!email || typeof email !== "string") {
    return false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

export const validatePassword = (password: string): boolean => {
  if (!password || typeof password !== "string") {
    return false;
  }

  const passwordRegex =
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
  return passwordRegex.test(password);
};

export const validatePasswordConfirm = (
  password: string,
  confirmPassword: string
): boolean => {
  if (!password || !confirmPassword) {
    return false;
  }

  return password === confirmPassword;
};

export const validateName = (name: string): boolean => {
  if (!name || typeof name !== "string") {
    return false;
  }

  const trimmedName = name.trim();

  const nameRegex = /^[가-힣a-zA-Z\s]{2,20}$/;
  return nameRegex.test(trimmedName);
};

export const validatePhoneNumber = (phone: string): boolean => {
  if (!phone || typeof phone !== "string") {
    return false;
  }

  const phoneRegex = /^010-?[0-9]{4}-?[0-9]{4}$/;
  return phoneRegex.test(phone.replace(/\s/g, ""));
};

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

  if (isNaN(date.getTime())) {
    return false;
  }

  if (date > now) {
    return false;
  }

  const maxAge = new Date();
  maxAge.setFullYear(maxAge.getFullYear() - 150);
  if (date < maxAge) {
    return false;
  }

  return true;
};

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

export const validateNickname = (nickname: string): boolean => {
  if (!nickname || typeof nickname !== "string") {
    return false;
  }

  const trimmedNickname = nickname.trim();

  const nicknameRegex = /^[가-힣a-zA-Z0-9_-]{2,12}$/;
  return nicknameRegex.test(trimmedNickname);
};

export const validateBusinessNumber = (businessNumber: string): boolean => {
  if (!businessNumber || typeof businessNumber !== "string") {
    return false;
  }

  const cleaned = businessNumber.replace(/-/g, "");
  const businessRegex = /^\d{10}$/;

  if (!businessRegex.test(cleaned)) {
    return false;
  }

  const weights = [1, 3, 7, 1, 3, 7, 1, 3, 5];
  let sum = 0;

  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleaned[i]) * weights[i];
  }

  sum += Math.floor((parseInt(cleaned[8]) * 5) / 10);
  const checkDigit = (10 - (sum % 10)) % 10;

  return checkDigit === parseInt(cleaned[9]);
};

export interface ValidationResult {
  isValid: boolean;
  message?: string;
}

export const validateEmailWithMessage = (email: string): ValidationResult => {
  if (!email) {
    return { isValid: false, message: "이메일을 입력해주세요." };
  }

  if (!validateEmail(email)) {
    return { isValid: false, message: "올바른 이메일 형식을 입력해주세요." };
  }

  return { isValid: true };
};

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

export const validatePasswordConfirmWithMessage = (
  password: string,
  confirmPassword: string
): ValidationResult => {
  if (!confirmPassword) {
    return { isValid: false, message: "비밀번호 확인을 입력해주세요." };
  }

  if (!validatePasswordConfirm(password, confirmPassword)) {
    return {
      isValid: false,
      message: "비밀번호가 일치하지 않습니다.",
    };
  }

  return { isValid: true };
};

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

export const validateUserTypeWithMessage = (
  userType: string
): ValidationResult => {
  if (!userType) {
    return { isValid: false, message: "사용자 타입을 선택해주세요." };
  }

  const validTypes = ["artist", "student", "teacher"];
  if (!validTypes.includes(userType)) {
    return {
      isValid: false,
      message: "올바른 사용자 타입을 선택해주세요.",
    };
  }

  return { isValid: true };
};

export const validateAgreementWithMessage = (
  agreeTerms: boolean,
  agreePrivacy: boolean
): ValidationResult => {
  if (!agreeTerms || !agreePrivacy) {
    return {
      isValid: false,
      message: "필수 약관에 동의해주세요.",
    };
  }

  return { isValid: true };
};

export const validateRequired = (
  value: string,
  fieldName: string
): ValidationResult => {
  if (!value || !value.trim()) {
    return { isValid: false, message: `${fieldName}을(를) 입력해주세요.` };
  }

  return { isValid: true };
};

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
