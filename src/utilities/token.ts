import jwt from "jsonwebtoken";
import { config } from "../config";
import type { TSignUpUser, TTokenUser } from "../modules/auth/auth.interface";

export const tokenGeneration = (payload: TTokenUser) => {
  const accessToken = jwt.sign(payload, config.secret_key, {
    expiresIn: "1d",
  });

  const refershToken = jwt.sign(payload, config.refresh_secret_key, {
    expiresIn: "10d",
  });

  return { accessToken, refershToken };
};
