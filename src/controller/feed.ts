import { Request, Response, NextFunction } from "express";
import fs from "fs"
import { unlink } from "fs/promises";
import path from "path"
import {validationResult} from "express-validator"

import { Post } from "../models/Post";
import { CustomError } from "../exceptions/custom-error.";

interface Post {
    title: string;
    content: string;
    imageUrl: string;
}

export async function getPosts(req: Request, res: Response, next:NextFunction) {
    // pagination if API needed, either backend or frontend pagination is do the same.
    const currentPage: number = parseInt(req.query.page as string) || 1
    const perPage: number = 2;
    var totalItems;

    try {
        const count = await Post.find().countDocuments()
        totalItems = count

        const posts = await Post.find().skip((currentPage -1) * perPage).limit(perPage)
        res.status(200).json({message: "Posts fetched", posts: posts, totalItems: totalItems})
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
    const image = req.file
    const errors = validationResult(req)

    if (!image) {
        return next(new CustomError("No images Provided", 422))
    }

    if (!errors.isEmpty()) {
        await unlink(image?.path)
        const error = new CustomError("Unable process, invalid form input", 422)
        return next(error)
    }


    try {
        const {title, content} = req.body as Post;
        const imageUrl = req.file?.path

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

export async function updateSinglePost(req:Request, res: Response, next: NextFunction) {
    const postId = req.params.postId

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        const error = new CustomError("Unable process, invalid form input", 422)
        return next(error)
    }

    let {title, content, imageUrl } = req.body as Post
    if (req.file) {
        imageUrl = req.file.path
    }

    if (!imageUrl) {
        return next(new CustomError("No file picked", 422))
    }
    try{
        const post = await Post.findById(postId)
        if (!post) {
            const error = new CustomError("Could not find a post", 404)
            return next(error)
        }

        if (imageUrl !== post.imageUrl) {
            clearImage(post.imageUrl)
        }
        //update post property
        post.title = title;
        post.content = content;
        post.imageUrl = imageUrl
        
        const updatePost = await post.save()
        
        res.status(200).json({message:"Post updated", post: updatePost})
    } catch (error) {
        if (!(error instanceof CustomError)) {
            const customError = new CustomError("An Internal server error occured", 500)
            return next(customError)
        }
        next(error)
    }
}

export async function deletePost(req: Request, res:Response, next: NextFunction) {
    const postId = req.params.postId

    try{
        const post = await Post.findById(postId)
        if (!post) {
            const error = new CustomError("Could not find a post", 404)
            return next(error)
        }
        clearImage(post?.imageUrl)

        const result = await Post.findByIdAndDelete(postId)
        if(!result) {
            return next(new CustomError("Could not delete post", 500))
        }
        console.log(result)
        res.status(200).json({message: "Deleted Post"})
    } catch(error) {
        if (!(error instanceof CustomError)) {
            const customError = new CustomError("An Internal server error occured", 500)
            return next(customError)
        }
        next(error)
    }
}

function clearImage(filePath: string) {
    filePath = path.join(__dirname, "..", filePath)
    fs.unlink(filePath, err => console.log(err))
}