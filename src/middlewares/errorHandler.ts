import type { Request, Response, NextFunction } from "express";

const errorHandler = async (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.log(err)
  return res.status(500).json({
    error: "Internal Server Error",
  });
};

export default errorHandler;
