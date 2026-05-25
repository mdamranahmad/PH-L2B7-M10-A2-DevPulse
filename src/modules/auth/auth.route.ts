import { type Response, Router, type Request } from "express";
import { sendResponse } from "../../utilities/sendResponse";
import { authController } from "./auth.controller";
// import { sendResponse } from "../../utilities/sendResponse";

const router = Router();

router.get("/", (req: Request, res: Response) => {
  sendResponse(res, 200, {
    message: "authorized page to test the link",
    data: null,
  });
});

router.post("/signup", authController.authSignup);

export const authRouter = router;
