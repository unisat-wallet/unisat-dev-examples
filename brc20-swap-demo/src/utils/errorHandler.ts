/**
 * Centralized error handling utilities
 */

/**
 * Application error types
 */
export enum ErrorType {
  WALLET_NOT_FOUND = "WALLET_NOT_FOUND",
  WALLET_NOT_CONNECTED = "WALLET_NOT_CONNECTED",
  UNSUPPORTED_ADDRESS = "UNSUPPORTED_ADDRESS",
  TRANSACTION_FAILED = "TRANSACTION_FAILED",
  NETWORK_ERROR = "NETWORK_ERROR",
  INVALID_AMOUNT = "INVALID_AMOUNT",
  INSUFFICIENT_BALANCE = "INSUFFICIENT_BALANCE",
  USER_REJECTED = "USER_REJECTED",
  UNKNOWN_ERROR = "UNKNOWN_ERROR",
}

/**
 * Application error class with type and user-friendly messages
 */
export class AppError extends Error {
  public readonly type: ErrorType;
  public readonly userMessage: string;
  public readonly originalError?: Error;

  constructor(type: ErrorType, userMessage: string, originalError?: Error) {
    super(userMessage);
    this.type = type;
    this.userMessage = userMessage;
    this.originalError = originalError;
    this.name = "AppError";
  }
}

/**
 * Error messages mapping
 */
const ERROR_MESSAGES: Record<ErrorType, string> = {
  [ErrorType.WALLET_NOT_FOUND]:
    "Wallet not found. Please install UniSat wallet.",
  [ErrorType.WALLET_NOT_CONNECTED]:
    "Wallet not connected. Please connect your wallet first.",
  [ErrorType.UNSUPPORTED_ADDRESS]:
    "Unsupported address type. Only Native Segwit (P2WPKH) and Taproot (P2TR) addresses are supported.",
  [ErrorType.TRANSACTION_FAILED]: "Transaction failed. Please try again.",
  [ErrorType.NETWORK_ERROR]:
    "Network error. Please check your connection and try again.",
  [ErrorType.INVALID_AMOUNT]: "Invalid amount. Please enter a valid number.",
  [ErrorType.INSUFFICIENT_BALANCE]:
    "Insufficient balance. Please check your wallet balance.",
  [ErrorType.USER_REJECTED]: "Transaction rejected by user.",
  [ErrorType.UNKNOWN_ERROR]: "An unexpected error occurred. Please try again.",
};

/**
 * Create an application error with predefined messages
 */
export function createAppError(
  type: ErrorType,
  originalError?: Error
): AppError {
  return new AppError(type, ERROR_MESSAGES[type], originalError);
}

/**
 * Handle unknown errors and convert them to AppError
 */
export function handleUnknownError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof Error) {
    // Check for specific error patterns
    if (error.message.includes("User rejected")) {
      return createAppError(ErrorType.USER_REJECTED, error);
    }

    if (
      error.message.includes("Network Error") ||
      error.message.includes("fetch")
    ) {
      return createAppError(ErrorType.NETWORK_ERROR, error);
    }

    if (error.message.includes("Insufficient")) {
      return createAppError(ErrorType.INSUFFICIENT_BALANCE, error);
    }

    return createAppError(ErrorType.UNKNOWN_ERROR, error);
  }

  return createAppError(ErrorType.UNKNOWN_ERROR);
}

/**
 * Log error for debugging purposes
 */
export function logError(error: AppError | Error, context?: string): void {
  const prefix = context ? `[${context}]` : "";

  if (error instanceof AppError) {
    console.error(`${prefix} AppError [${error.type}]:`, {
      userMessage: error.userMessage,
      originalError: error.originalError,
    });
  } else {
    console.error(`${prefix} Error:`, error);
  }
}
