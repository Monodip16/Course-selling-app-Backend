import express from "express"
import { Router } from "express"
import { UserModel } from "../Database/Schema.js"
import bcrypt from "bcrypt"
import { z } from "zod"
import jwt from "jsonwebtoken"
import { userMiddleware } from "../middleware/userAuth.js"


const UserRouter = Router()

UserRouter.post("/signup", async function(req, res) {
    try {
        const requireBody = z.object({
            email: z.string().min(3).max(30).email(),
            FirstName: z.string().min(3).max(30),
            LastName: z.string().min(0).max(20),
            Password: z.string().min(6).max(14)
        })

        const ParshedWithSuccess = requireBody.safeParse(req.body);
        if (!ParshedWithSuccess.success) {
            return res.status(400).json({
                message: "Incorrect Format",
                error: ParshedWithSuccess.error
            })
        }
        const { email, FirstName, LastName, Password } = ParshedWithSuccess.data
        const existingUser = await UserModel.findOne({ email })

        if (existingUser) {
            return res.status(409).json({
                message: "Email already registered"
            })
        }
        const hashedPassword = await bcrypt.hash(Password, 10)

        await UserModel.create({
            email: email,
            FirstName: FirstName,
            LastName: LastName,
            Password: hashedPassword
        })

        res.status(201).json({
            message: "Registered Successfully"
        })




    } catch (err) {
        console.error(err)
        res.status(500).json({
            error: "Failed to registered"
        })
    }
})

UserRouter.post("/login", async function(req, res) {
    try {

        const requireBody = z.object({
            email: z.string().min(3).max(30).email(),
            Password: z.string().min(6).max(14)

        })

        const ParshedWithSuccess = requireBody.safeParse(req.body);
        if (!ParshedWithSuccess.success) {
            return res.status(400).json({
                message: "Incorrect Format",
                error: ParshedWithSuccess.error
            })
        }

        const { email, Password } = ParshedWithSuccess.data

        const user = await UserModel.findOne({ email })

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            })
        }

        const decryptPassword = await bcrypt.compare(Password, user.Password)

        if (!decryptPassword) {
            return res.status(401).json({
                message: "This is wrong password"
            })
        }
        const token = jwt.sign({ id: user._id }, process.env.USER_SECRET, { expiresIn: "7d" })

        return res.status(200).json({
            token: token,
            message: "Login Successfully"
        })


    } catch (err) {
        console.error(err)
        res.status(500).json({
            error: "Login failed"
        })
    }
})

UserRouter.get("/purchases", userMiddleware, async function(req, res) {
    try {

        const userId = req.userId;

        const getPurchases = await UserModel.findById(userId).populate("purchases").select("purchases");

        if (!getPurchases) {
            return res.status(404).json({
                message: "Course not found or This course is Not belongs to you"
            })
        }

        res.status(200).json({
            purchases: getPurchases.purchases,
            message: "This is your course"
        })


    } catch (err) {
        console.log(err);
        res.status(500).json({
            error: "Problem occured in fetching the course"
        })

    }
})


export { UserRouter }