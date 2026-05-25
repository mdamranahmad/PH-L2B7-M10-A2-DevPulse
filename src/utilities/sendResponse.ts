import type { Response } from "express";

// // a generic type for response having data
// type TSuccessResponse<T> = {
//   success: true;
//   statusCode: number;
//   message: string;
//   data: T;
//   error?: never;
// };

// // a type for response having error
// type TErrorResponse = {
//   success: false;
//   statusCode: number;
//   message: string;
//   data?: never;
//   error: unknown;
// };

// // a generic type containing all properties for TSuccessResponse and TErrorResponse
// type TResponse<T> = TSuccessResponse<T> | TErrorResponse;

type SendResponse<T> = {
  message: unknown;
  data?: T;
  error?: boolean;
  stack?: unknown;
};

// a function to send data or error when initiated
export const sendResponse = <T>(
  res: Response,
  statusCode: number,
  payload: SendResponse<T>,
): void => {
  res.status(statusCode).json({
    success: payload.error ? false : true,
    message: payload.message,
    data: payload.error ? undefined : payload.data,
    stack: payload.stack,
  });
};
