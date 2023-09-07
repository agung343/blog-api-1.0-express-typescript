import { Router } from "express";
import { body } from "express-validator";

import { User } from "../models/User";
import { isAuth } from "../middleware/isAuth";
import * as authController from "../controller/auth"

const router = Router()

router.put(
    "/signup", 
    [
        body("email").isEmail().withMessage("Please enter valid email address").custom(async(value, {req}) => {
            return User.findOne({email: value}).then(userDoc => {
                if (userDoc) {
                    return Promise.reject("Email address is already existed")
                }
            })
        }).normalizeEmail(),
        body("password").trim().isLength({min: 5}),
        body("name").trim().not().isEmpty()
    ],  
    authController.signup
)

router.post("/login", authController.login)

export default router