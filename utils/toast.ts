import toast from "react-hot-toast";

export const showToast = {
  success: (message: string) => {
    toast.success(message, {
      duration: 3000,
    });
  },

  error: (message: string) => {
    toast.error(message, {
      duration: 5000,
    });
  },

  warning: (message: string) => {
    toast(message, {
      icon: "⚠️",
      duration: 4000,
      style: {
        background: "var(--warning-bg)",
        color: "var(--warning-text)",
        border: "1px solid var(--warning-icon)",
      },
    });
  },

  info: (message: string) => {
    toast(message, {
      icon: "ℹ️",
      duration: 4000,
      style: {
        background: "var(--secondary-100)",
        color: "var(--secondary-900)",
        border: "1px solid var(--secondary-500)",
      },
    });
  },

  loading: (message: string) => {
    return toast.loading(message, {
      style: {
        background: "var(--neutral-700)",
        color: "var(--neutral-200)",
        border: "1px solid var(--neutral-500)",
      },
    });
  },

  dismiss: (toastId?: string) => {
    if (toastId) {
      toast.dismiss(toastId);
    } else {
      toast.dismiss();
    }
  },

  promise: <T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string;
      error: string;
    }
  ) => {
    return toast.promise(promise, messages, {
      style: {
        background: "var(--neutral-700)",
        color: "var(--neutral-0)",
        border: "1px solid var(--neutral-500)",
      },
      success: {
        style: {
          background: "var(--success-bg)",
          color: "var(--success-text)",
          border: "1px solid var(--success-icon)",
        },
      },
      error: {
        style: {
          background: "var(--error-bg)",
          color: "var(--error-text)",
          border: "1px solid var(--error-icon)",
        },
      },
    });
  },
};
