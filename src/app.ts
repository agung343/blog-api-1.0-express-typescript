import express, { request, response } from "express"
import path from "path"
import bodyParser from "body-parser"
import cors from "cors"
import mongoose from "mongoose"

import errorHandler from "./middleware/error-handling.middleware"

import feed from "./routes/feed"

const app = express()

app.use(
    cors(
        {
            credentials: true,
            origin: "*",
            methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
            allowedHeaders: "Content-Type, Authorization"
        }
    )
)

app.use(bodyParser.json())
app.use("/images", express.static(path.join(__dirname, "images")))

app.use("/feed", feed)

// handling error middleware
app.use(errorHandler)

mongoose.connect("mongodb+srv://agungwahydi34:zXGnKVjTDS9KpFrE@monitastore.8yquvad.mongodb.net/post")
.then(result => app.listen(8080, () => console.log("Listening at port 8080")))
.catch(error => console.log(error))

