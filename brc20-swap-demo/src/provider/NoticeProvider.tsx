"use client";
import { message, notification } from "antd";
import { NotificationInstance } from "antd/es/notification/interface";
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
} from "react";
import { AppError, handleUnknownError, logError } from "../utils/errorHandler";

type NoticeContextType = {
  showNotification: (
    type: "success" | "info" | "warning" | "error",
    message: string,
    description?: string
  ) => void;
  handleError: (error: unknown, context?: string) => void;
  messageSuccess: (msg: string) => void;
  toastSuccess: (msg: string) => void;
};

const NoticeContext = createContext<NoticeContextType | undefined>(undefined);

/**
 * Hook to access notification functions
 */
export const useNotice = () => {
  const context = useContext(NoticeContext);
  if (!context) {
    throw new Error("useNotice must be used within a NoticeProvider");
  }
  return context;
};

interface NoticeProviderProps {
  children: ReactNode;
}

export let notifier: NotificationInstance;

const NoticeProvider: React.FC<NoticeProviderProps> = ({ children }) => {
  const [api, contextHolder] = notification.useNotification();
  const [messageApi, contextHolderMessage] = message.useMessage();

  useEffect(() => {
    notifier = api;
  }, [api]);

  const showNotification = useCallback(
    (
      type: "success" | "info" | "warning" | "error",
      message: string,
      description?: string
    ) => {
      const key = `${type}-${Date.now()}`;

      api[type]({
        message,
        description,
        key,
        duration: 4.5,
        placement: "topRight",
        onClick: () => {
          notification.destroy(key);
        },
      });
    },
    [api]
  );

  const messageSuccess = useCallback(
    (msg: string) => {
      const key = `success-${Date.now()}`;

      api.success({
        message: msg,
        // description: msg,
        key,
        placement: "topRight",
        onClick: () => {
          notification.destroy(key);
        },
      });
    },
    [api]
  );

  const handleError = useCallback(
    (error: unknown, context?: string) => {
      const appError = handleUnknownError(error);
      logError(appError, context);

      const key = `error-${Date.now()}`;
      api.error({
        message: "Error",
        description: appError.userMessage,
        key,
        placement: "topRight",
        onClick: () => {
          notification.destroy(key);
        },
      });
    },
    [api]
  );

  const toastSuccess = useCallback(
    (msg: string) => {
      messageApi.success(msg);
    },
    [messageApi]
  );

  const value = {
    showNotification,
    handleError,
    messageSuccess,
    toastSuccess,
  };

  return (
    <NoticeContext.Provider value={value}>
      {contextHolder}
      {contextHolderMessage}
      {children}
    </NoticeContext.Provider>
  );
};

export default NoticeProvider;
