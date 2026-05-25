import type { NextFunction, Request, Response } from "express";
import { sendResponse } from "./sendResponse";
import { config } from "../config";

export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  sendResponse(res, 500, {
    message: "Something Went Wrong!",
    error: err.message,
    stack: config.node_env === "development" ? err.stack : undefined,
  });
};
