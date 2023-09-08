import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken";

import { User } from "../models/User";
import { CustomError } from "../exceptions/custom-error.";
import { CustomRequest } from "../middleware/isAuth";

type UserForm = {
    name?: string;
    email: string;
    password: string;
}

export async function signup(req: Request, res: Response, next: NextFunction) {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return next(new CustomError("Signup field is invalid", 422, errors.array()))
    }

    const {name, email, password} = req.body as UserForm
    try {
        const hashPassword = await bcrypt.hash(password, 12)

        const newUser = new User({
            name: name,
            email: email,
            password: hashPassword
        })
        await newUser.save()
        res.json(201).json({message: "creted new user"})
    } catch (error) {
        if (!(error instanceof CustomError)) {
            const customError = new CustomError("An Internal server error occured", 500)
            return next(customError)
        }
        next(error)
    }
}

export async function login(req: Request, res: Response, next: NextFunction) {
    const {email, password} = req.body as UserForm

    try {
        const user = await User.findOne(
            {email: email}
        )
    
        if (!user) {
            return next(new CustomError("A User with this email could not be found", 401))
        }
    
        const matchPassword = await bcrypt.compare(password, user.password)
        if (!matchPassword) {
            return next(new CustomError("Password wrong", 401))
        }

        const token = jwt.sign({
            email: user.email,
            userId: user._id.toString()
        }, "supersecretblog", {
            expiresIn: "1h"
        })
        res.status(200).json({token: token, userId: user._id.toString()})
    } catch (error) {
        if (!(error instanceof CustomError)) {
            const customError = new CustomError("An Internal server error occured", 500)
            return next(customError)
        }
        next(error)
    }
}