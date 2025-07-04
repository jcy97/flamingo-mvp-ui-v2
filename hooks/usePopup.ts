import { useState, useCallback } from "react";

interface PopupState {
  isOpen: boolean;
  title: string;
  content: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  showCloseButton?: boolean;
  onClose?: () => void;
}

interface PopupOptions {
  title: string;
  content: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  showCloseButton?: boolean;
  onClose?: () => void;
}

export const usePopup = () => {
  const [popup, setPopup] = useState<PopupState>({
    isOpen: false,
    title: "",
    content: null,
    size: "md",
    showCloseButton: true,
  });

  const openPopup = useCallback((options: PopupOptions) => {
    setPopup({
      isOpen: true,
      title: options.title,
      content: options.content,
      size: options.size || "md",
      showCloseButton: options.showCloseButton ?? true,
      onClose: options.onClose,
    });
  }, []);

  const closePopup = useCallback(() => {
    if (popup.onClose) {
      popup.onClose();
    }
    setPopup((prev) => ({
      ...prev,
      isOpen: false,
    }));
  }, [popup.onClose]);

  return {
    popup,
    openPopup,
    closePopup,
  };
};
