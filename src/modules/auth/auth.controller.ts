import type { Request, Response } from "express";
import { authServices } from "./auth.service";
import { sendResponse } from "../../utilities/sendResponse";
import { tokenGeneration } from "../../utilities/token";

// a function to signup user into database
const authSignup = async (req: Request, res: Response) => {
  const user = await authServices.signUpUser(req.body);
  sendResponse(res, 200, {
    message: `Registration successfull for ${user.name}.`,
    data: user,
  });
};

// a function to login user into database
const authLogin = async (req: Request, res: Response) => {
  // fetch user data from database
  const user = await authServices.loginUser(req.body);

  // return error for invalid user email or password
  if (!user) {
    sendResponse(res, 401, {
      message: "Invalid Credentials",
      error: true,
    });
    return;
  }

  // token generation for user data
  const { accessToken, refershToken } = tokenGeneration(user);

  // storage of access token in browser cookies
  res.cookie("accessToken", accessToken, {
    sameSite: "lax",
    httpOnly: true,
    secure: false,
  });

  const sendUser = { token: accessToken, user };

  sendResponse(res, 200, {
    message: "Login Successful",
    data: sendUser,
  });
};

export const authController = {
  authSignup,
  authLogin,
};
