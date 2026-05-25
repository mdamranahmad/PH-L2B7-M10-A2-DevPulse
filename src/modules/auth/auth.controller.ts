import type { Request, Response } from "express";
import { authServices } from "./auth.service";
import { sendResponse } from "../../utilities/sendResponse";

// a function to signup user into database
const authSignup = async (req: Request, res: Response) => {
  const user = await authServices.signUpUser(req.body);
  sendResponse(res, 200, {
    message: `Registration successfull for ${user.name}.`,
    data: user,
  });
};

export const authController = {
  authSignup,
};
