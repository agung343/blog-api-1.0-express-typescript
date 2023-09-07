import express, { request, response } from "express"
import path from "path"
import bodyParser from "body-parser"
import cors from "cors"
import mongoose from "mongoose"

import errorHandler from "./middleware/error-handling.middleware"

import feed from "./routes/feed"
import auth from "./routes/auth"

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
app.use("/auth", auth)

// handling error middleware
app.use(errorHandler)

const MONGODB_URI = process.env.MONGODB_URI as string;

mongoose.connect(MONGODB_URI)
.then(result => app.listen(8080, () => console.log("Listening at port 8080")))
.catch(error => console.log(error))

