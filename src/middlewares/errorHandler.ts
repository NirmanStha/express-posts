import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { CustomError } from "../helpers/customError";

const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error("Error:", error); // Log for debugging

  // Check if response has already been sent
  if (res.headersSent) {
    return next(error);
  }

  // Handle Zod Validation Errors
  if (error instanceof ZodError) {
    res.status(400).json({
      status: "error",
      message: "Validation failed",
      errors: error.errors, // Return detailed validation errors
    });
    return;
  }

  // Handle Custom Errors (if using a CustomError class)
  if (error instanceof CustomError) {
    res.status(error.statusCode || 500).json({
      status: "error",
      message: error.message,
    });
    return;
  }

  // Handle Generic Errors
  res.status(500).json({
    status: "error",
    message: error.message || "Something went wrong",
  });
};

export default errorHandler;
