import { Request, Response, NextFunction } from "express";
import {validationResult} from "express-validator"

import { Post } from "../models/Post";
import { CustomError } from "../exceptions/custom-error.";

interface Post {
    title: string;
    content: string;
    imageUrl: string;
}

export async function getPosts(req: Request, res: Response, next:NextFunction) {
    try {
        const posts = await Post.find()
        res.status(200).json({message: "Fetch all posts", posts: posts})
    } catch (error) {
        if (!(error instanceof CustomError)) {
            const customError = new CustomError("An Internal server error occured", 500)
            return next(customError)
        }
        next(error)
    }
}

export async function createNewPost(req: Request, res: Response, next:NextFunction) {
    //validators
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        const error = new CustomError("Unable process, invalid form input", 422)
        return next(error)
    }

    try {
        const {title, content, imageUrl} = req.body as Post

        const post = new Post({
            title: title, 
            content: content,
            imageUrl: imageUrl,
            creator: {name: "Agung"},
            createdAt: new Date()
        })
        await post.save()
        res.status(201).json({message: "New Post succesfully created", post})
    } catch (error) {
        // handling error
        if (!(error instanceof CustomError)) {
            const customError = new CustomError("An Internal server error occured", 500)
            return next(customError)
        }
        next(error)
    }
}

export async function getSinglePost(req: Request, res: Response, next: NextFunction) {
    const postId = req.params.postId
    try {
        const post = await Post.findById(postId)
        if (!post) {
            const error = new CustomError("Could not find a post", 404)
            return next(error)
            // throw new CustomError("Could not find a post", 404)
        }
        res.status(200).json({message: "Post fetched", post: post})
    } catch (error) {
        if (!(error instanceof CustomError)) {
            const customError = new CustomError("An Internal server error occured", 500)
            return next(customError)
        }
        next(error)
    }
}