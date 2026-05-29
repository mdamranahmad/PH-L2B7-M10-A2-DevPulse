import type { Request, Response } from "express";
import { issuesService } from "./issues.service";
import { tokenDecode } from "../../utilities/token";
import { sendResponse } from "../../utilities/sendResponse";
import type { TTokenUser } from "../auth/auth.interface";
import type { JwtPayload } from "jsonwebtoken";

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

  // fetch all issues from database
  const allIssuesFromDB = await issuesService.returnIssuesFromDB(
    decodedToken as TTokenUser,
  );

  // sort returned issues from database as per time, type and status
  const sortIssues = () => {
    // default sort by time
    if (req.url === "/" || req.url === "/?sort=newest") {
      const sortByTime = [...(allIssuesFromDB ?? [])].sort((a, b) => {
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      });
      return sortByTime;
    }

    // sort by type
    if (req.url === "/?sort=type") {
      const sortByType = [...(allIssuesFromDB ?? [])].sort((a, b) => {
        return a.type.localeCompare(b.type);
      });
      return sortByType;
    }

    // sort by status
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

    // return null for otherwise
    return null;
  };

  // return sorted issues
  const sortedIssues = sortIssues();

  // response message for succesfull fetch operation of sorted issues
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

// an async function to get individual issue from database
const getIssuebyId = async (req: Request, res: Response) => {
  // fetch request issue id from url
  const reqId = req.params.id as string;
  // return error message if the request does not have proper authorization
  if (!req.headers.authorization) {
    sendResponse(res, 401, {
      message: "Missing Token!",
      error: true,
    });
  }

  // a variable to decode the token to get requester information from request headers
  const decodedToken = tokenDecode(req.headers.authorization as string);

  // fetch full details of the requested issue from database
  const indIssueFromDB = await issuesService.returnIssueFromDB(
    decodedToken as TTokenUser,
    reqId,
  );

  // response message for succesfull fetch operation of individual issue
  if (indIssueFromDB !== null) {
    sendResponse(res, 200, {
      message: "Issues retrived successfully",
      data: indIssueFromDB,
    });
  } else {
    sendResponse(res, 404, {
      message: "Invalid request",
      error: true,
    });
  }
};

// an async function to update an issue in database
const updateIssue = async (req: Request, res: Response) => {
  // fetch request issue id from url
  const reqId = req.params.id as string;
  // return error message if the request does not have proper authorization
  if (!req.headers.authorization) {
    sendResponse(res, 401, {
      message: "Missing Token!",
      error: true,
    });
  }
  // a variable to decode the token to get requester information from request headers
  const decodedToken = tokenDecode(req.headers.authorization as string);

  const { id, role } = decodedToken as JwtPayload;

  // fetch full details of the requested issue from database
  const indIssueFromDB = await issuesService.returnIssueFromDB(
    decodedToken as TTokenUser,
    reqId,
  );

  // response message for succesfull fetch operation of individual issue
  if (!indIssueFromDB || indIssueFromDB.length === 0) {
    return sendResponse(res, 404, {
      message: "Invalid request",
      error: true,
    });
  }

  const { reporter } = indIssueFromDB[0] as any;

  let updatedIssue;
  // update issue in the database if requester has proper authority
  if (role === "maintainer") {
    updatedIssue = await issuesService.maintainerUpdateIssueInDB(
      req.body,
      reqId,
      decodedToken as TTokenUser,
    );
  }

  // update issue field in the database if requester is the owner of the issue
  if (role === "contributor" && id === reporter.id) {
    if (req.body.status) {
      return sendResponse(res, 403, {
        message: "Forbidden",
        error: true,
      });
    }
    updatedIssue = await issuesService.contributorUpdateIssueInDB(
      req.body,
      reqId,
      decodedToken as TTokenUser,
    );
  }

  // return error message if requester is not owner of the issue
  if (role === "contributor" && id !== reporter.id) {
    return sendResponse(res, 403, {
      message: "Forbidden",
      error: true,
    });
  }
  // return updated issue
  sendResponse(res, 200, {
    message: "Issue updated successfully.",
    data: updatedIssue,
  });
};

// an async function to delete an issue from database
const deleteIssue = async (req: Request, res: Response) => {
  // fetch request issue id from url
  const reqId = req.params.id as string;
  // return error message if the request does not have proper authorization
  if (!req.headers.authorization) {
    sendResponse(res, 401, {
      message: "Missing Token!",
      error: true,
    });
  }
  // a variable to decode the token to get requester information from request headers
  const decodedToken = tokenDecode(req.headers.authorization as string);

  const { id, role } = decodedToken as JwtPayload;

  // fetch full details of the requested issue from database
  const indIssueFromDB = await issuesService.returnIssueFromDB(
    decodedToken as TTokenUser,
    reqId,
  );

  // response message for succesfull fetch operation of individual issue
  if (!indIssueFromDB || indIssueFromDB.length === 0) {
    return sendResponse(res, 404, {
      message: "Invalid request",
      error: true,
    });
  }

  const { reporter } = indIssueFromDB[0] as any;

  // update issue in the database if requester has proper authority
  if (role === "maintainer") {
    const deletedIssue = await issuesService.deleteIssueFromDB(
      reqId,
      decodedToken as TTokenUser,
    );
    // return deleted issue
    return sendResponse(res, 200, {
      message: "Issue deleted successfully.",
      data: deletedIssue,
    });
  } else {
    return sendResponse(res, 403, {
      message: "Forbidden",
      error: true,
    });
  }
};

export const issuesController = {
  createIssue,
  getIssues,
  getIssuebyId,
  updateIssue,
  deleteIssue,
};
