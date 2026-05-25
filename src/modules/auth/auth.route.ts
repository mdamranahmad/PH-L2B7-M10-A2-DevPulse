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

// for user signup
router.post("/signup", authController.authSignup);

// for user login
router.post("/login", authController.authLogin);

export const authRouter = router;
