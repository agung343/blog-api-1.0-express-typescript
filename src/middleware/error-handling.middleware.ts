import { Request, Response, NextFunction } from "express";
import { CustomError } from "../exceptions/custom-error.";

export default function errorHandler(
    err: CustomError,
    req: Request,
    res: Response,
    next: NextFunction
) {
    const status = err.statusCode || 500;
    const message = err.message;
    res.status(status).json({message: message})
    next(err)
}