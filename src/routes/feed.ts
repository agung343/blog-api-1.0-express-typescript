import { Router, Request } from "express";
import {body} from "express-validator"

import multer, {FileFilterCallback} from "multer";
type DestinationCallback = (error: Error | null, destination: string) => void
type FileNameCallback = (error: Error | null, fileName: string) => void

import * as feedController from "../controller/feed"

const fileStorage = multer.diskStorage({
    destination: (req: Request, file: Express.Multer.File, cb: DestinationCallback): void => {
        cb(null, "images")
    },
    filename: (req: Request, file: Express.Multer.File, cb:FileNameCallback): void => {
        cb(null, new Date().toISOString() + "-" + file.originalname)
    }
})

const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback): void => {
    if (file.mimetype === "image/png" || file.mimetype === "image/jpg" || file.mimetype === "image/jpeg") {
        cb(null, true)
    } else {
        cb(null, false)
    }
}

const upload = multer({storage: fileStorage, fileFilter: fileFilter})

const router = Router()

router.get("/posts", feedController.getPosts)

router.get("/posts/:postId", feedController.getSinglePost)

router.post(
    "/post", 
    upload.single("image"),
    [
        body("title").trim().isLength({min: 5}),
        body("content").trim().isLength({min: 5})
    ], 
    feedController.createNewPost
)

router.put(
    "/post/:postId",
    [
        body("title").trim().isLength({min: 5}),
        body("content").trim().isLength({min: 5})
    ], 
    feedController.updateSinglePost
)

router.delete("/post/:postId")

export default router;