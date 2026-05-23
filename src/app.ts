import express, {
  type Application,
  type Request,
  type Response,
} from "express";
import { authRouter } from "./modules/auth/auth.route";

const app: Application = express();

app.use(express.json()); // a builtin middleware to capture json sent via request

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    message: "Welcome to DevPulse",
  });
});
app.use("/api/auth", authRouter);

// /api/ahtu / signup;

export default app;
