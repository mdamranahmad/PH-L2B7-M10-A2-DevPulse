import type { Request, Response } from "express";
import { issuesService } from "./issues.service";
import { tokenDecode } from "../../utilities/token";
import { sendResponse } from "../../utilities/sendResponse";
import type { TTokenUser } from "../auth/auth.interface";

const createIssue = async (req: Request, res: Response) => {
  if (!req.headers.authorization) {
    sendResponse(res, 401, {
      message: "Missing Token!",
      error: true,
    });
  }
  console.log("createIssue: ", req.headers.authorization);

  const decodedToken = tokenDecode(req.headers.authorization as string);

  console.log("createIssue-decodedToken: ", decodedToken);

  const userId = await issuesService.returnUserFromDB(
    decodedToken as TTokenUser,
  );

  console.log("createIssue-user", userId);

  const issue = await issuesService.createIssueInDB(req.body, userId);
  sendResponse(res, 201, {
    message: "Issue Created Successfully.",
    data: issue,
  });
};

export const issuesController = {
  createIssue,
};
