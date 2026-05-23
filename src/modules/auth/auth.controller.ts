import type { Request, Response } from "express";
import { authServices } from "./auth.service";

// a function to signup user into database
const authSignup = (req: Request, res: Response) => {

  const user = authServices.signUpUser(req.body);
};

export const authController = {
  authSignup,
};
