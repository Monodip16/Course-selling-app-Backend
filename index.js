import express from "express"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import mongoose from "mongoose"
import { UserRouter } from "./routes/User.js"
import { CourseRouter } from "./routes/Course.js"
import { AdminRouter } from "./routes/Admin.js"
import 'dotenv/config';

const app = express()
app.use(express.json())

const PORT = process.env.PORT

app.use("/api/v1/User", UserRouter)
app.use("/api/v1/Course", CourseRouter)
app.use("/api/v1/Admin", AdminRouter)

async function main() {
    try {
        await mongoose.connect(process.env.MONGO_URL)
        console.log("connected to database");

        app.listen(PORT, console.log(`This server is runing on port http://localhost:${PORT}`))

    } catch (err) {
        console.log(err);

    }
}

main()