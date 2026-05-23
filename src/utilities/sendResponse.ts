import type { Response } from "express";

// a generic type for response having data
type TSuccessResponse<T> = {
  success: true;
  statusCode: number;
  message: string;
  data: T;
  error?: never;
};

// a type for response having error
type TErrorResponse = {
  success: false;
  statusCode: number;
  message: string;
  data?: never;
  error: unknown;
};

// a generic type containing all properties for TSuccessResponse and TErrorResponse
type TResponse<T> = TSuccessResponse<T> | TErrorResponse;

// a function to send data or error when initiated
export const sendResponse = <T>(res: Response, data: TResponse<T>) => {
  res.status(data.statusCode).json({
    success: data.success,
    message: data.message,
    ...(data.success ? { data: data.data } : { error: data.error }),
  });
};
