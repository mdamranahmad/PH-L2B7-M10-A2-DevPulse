import type { Request, Response } from "express";
import { issuesService } from "./issues.service";
import { tokenDecode } from "../../utilities/token";
import { sendResponse } from "../../utilities/sendResponse";
import type { TTokenUser } from "../auth/auth.interface";

// an async function to create a new issue into the database
const createIssue = async (req: Request, res: Response) => {
  // return error message if the request does not have proper authorization
  if (!req.headers.authorization) {
    sendResponse(res, 401, {
      message: "Missing Token!",
      error: true,
    });
  }

  // a variable to decode the token to get requester information from request headers
  const decodedToken = tokenDecode(req.headers.authorization as string);

  // a variable to fetch the id of the user accordingly from database
  const userId = await issuesService.returnUserFromDB(
    decodedToken as TTokenUser,
  );

  // creation of issue into the database against the issuer id (userId)
  const issue = await issuesService.createIssueInDB(req.body, userId);

  // a response for successful issue creation
  sendResponse(res, 201, {
    message: "Issue Created Successfully.",
    data: issue,
  });
};

//an async function to get all issues from database
const getIssues = async (req: Request, res: Response) => {
  // return error message if the request does not have proper authorization
  if (!req.headers.authorization) {
    sendResponse(res, 401, {
      message: "Missing Token!",
      error: true,
    });
  }

  // a variable to decode the token to get requester information from request headers
  const decodedToken = tokenDecode(req.headers.authorization as string);

  const allIssuesFromDB = await issuesService.returnIssuesFromDB(
    decodedToken as TTokenUser,
  );

  console.log("request url: ", req.url);

  const sortIssues = () => {
    if (req.url === "/" || req.url === "/?sort=newest") {
      const sortByTime = [...(allIssuesFromDB ?? [])].sort((a, b) => {
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      });
      return sortByTime;
    }

    if (req.url === "/?sort=type") {
      const sortByType = [...(allIssuesFromDB ?? [])].sort((a, b) => {
        return a.type.localeCompare(b.type);
      });

      return sortByType;
    }

    if (req.url === "/?sort=status") {
      const statusPriority: { [key: string]: number } = {
        open: 1,
        in_progress: 2,
        resolved: 3,
      };

      const sortByStatus = [...(allIssuesFromDB ?? [])].sort((a, b) => {
        return (
          (statusPriority[a.status] ?? 99) - (statusPriority[b.status] ?? 99)
        );
      });
      return sortByStatus;
    }

    return null;
  };

  const sortedIssues = sortIssues();
  if (sortedIssues !== null) {
    sendResponse(res, 200, {
      message: "Issues retrived successfully",
      data: sortedIssues,
    });
  } else {
    sendResponse(res, 404, {
      message: "Invalid request",
      error: true,
    });
  }
};

export const issuesController = {
  createIssue,
  getIssues,
};
