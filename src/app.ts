import express, { type Application, type Request, type Response } from "express";

const app : Application = express();

app.use("/", (req: Request, res: Response) => {
  res.status(200).json({
    message: "Welcome to DevPulse",
  });
});

export default app;
