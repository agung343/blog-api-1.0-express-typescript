import { Request, Response, NextFunction } from "express";
import jwt, { Secret, JwtPayload } from "jsonwebtoken";

import { CustomError } from "../exceptions/custom-error.";

export interface CustomRequest extends Request {
    token: string | JwtPayload
    userId: string
}

export async function isAuth(req: Request, res: Response, next: NextFunction) {
    try {
        const token = req.header("Authorization")?.replace("Bearer ", "") as string

        if (!token) {
            return next(new CustomError("Not Authenticated", 401))
        }

        const decoded = jwt.verify(token, "supersecretblog") as {userId: string}
        (req as CustomRequest).userId = decoded.userId
        if (decoded) {
            return next(new CustomError("Please Authenticated", 401))
        }
        next()
    } catch (error) {
        return next(new CustomError("An Internal Server Error!", 500))
    }
}
