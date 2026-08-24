import { Router } from "express"
import { AdminModel, CourseModel } from "../Database/Schema.js"
import bcrypt from "bcrypt"
import z from "zod"
import jwt from "jsonwebtoken"
import { adminMiddleware } from "../middleware/adminAuth.js"
import 'dotenv/config';


const AdminRouter = Router()

AdminRouter.post("/signup", async function(req, res) {
    try {

        const requireBody = z.object({
            email: z.string().min(6).max(50).email(),
            FirstName: z.string().min(3).max(30),
            LastName: z.string().min(3).max(30),
            Password: z.string().min(6).max(14)
        })

        const ParshedWithSuccess = requireBody.safeParse(req.body)

        if (!ParshedWithSuccess.success) {
            return res.status(400).json({
                message: "Incorrect Format",
                error: ParshedWithSuccess.error
            })
        }

        const { email, FirstName, LastName, Password } = ParshedWithSuccess.data

        const existingUser = await AdminModel.findOne({ email })

        if (existingUser) {
            return res.status(409).json({
                message: "User already exists"
            })
        }

        const hashedPassword = await bcrypt.hash(Password, 5)

        await AdminModel.create({
            email: email,
            FirstName: FirstName,
            LastName: LastName,
            Password: hashedPassword
        })

        res.status(201).json({
            message: "Registration successful"
        })

    } catch (err) {
        console.log(err);
        res.status(500).json({
            error: "Failed to Register"
        })

    }

})

AdminRouter.post("/login", async function(req, res) {
    try {
        const requireBody = z.object({
            email: z.string().min(3).max(30).email(),
            Password: z.string().min(6).max(14)
        })

        const ParshedWithSuccess = requireBody.safeParse(req.body)

        if (!ParshedWithSuccess.success) {
            return res.status(400).json({
                message: "Incorrect Format",
                error: ParshedWithSuccess.error
            })
        }

        const { email, Password } = ParshedWithSuccess.data

        const admin = await AdminModel.findOne({ email })

        if (!admin) {
            return res.status(404).json({
                message: "Admin not found"
            })
        }

        const matchPassword = await bcrypt.compare(Password, admin.Password)

        if (!matchPassword) {
            return res.status(401).json({
                message: "This Password is wrong"
            })
        }

        const jwtSecret = process.env.ADMIN_SECRET;

        if (!jwtSecret) {
            return res.status(500).json({
                message: "JWT secret is not configured"
            });
        }

        const token = jwt.sign({ id: admin._id }, jwtSecret, { expiresIn: "7d" })

        res.status(200).json({
            message: "Login Successfully",
            token: token
        })




    } catch (err) {
        console.log(err)
        res.status(500).json({
            error: "Failed to login"
        })
    }
})

AdminRouter.post("/course", adminMiddleware, async function(req, res) {
    try {
        const AdminId = req.adminId;
        const { title, description, price, imageUrl } = req.body

        const createCourse = await CourseModel.create({
            title: title,
            description: description,
            price: price,
            imageUrl: imageUrl,
            creatorId: AdminId
        })


        return res.status(201).json({
            message: "Course created successfully",
            courseId: createCourse._id
        })



    } catch (err) {
        console.log(err);
        res.status(500).json({
            error: "Failed to create course"
        })

    }

})

AdminRouter.put("/course", adminMiddleware, async function(req, res) {
    try {
        const AdminId = req.adminId

        const { title, description, price, imageUrl, courseId } = req.body

        const UpdateCourse = await CourseModel.updateOne({
            _id: courseId,
            creatorId: AdminId
        }, {
            title: title,
            description: description,
            price: price,
            imageUrl: imageUrl,


        })

        if (UpdateCourse.matchedCount === 0) {
            return res.status(404).json({
                message: "Course not found or you are not the owner",

            })
        }

        res.status(200).json({
            message: "Course updated successfully",
            courseId: courseId
        })

    } catch (err) {
        console.log(err);
        res.status(500).json({
            error: "Failed to update course"
        })

    }

})

AdminRouter.delete("/course", adminMiddleware, async function(req, res) {
    try {

        const AdminId = req.adminId
        const { courseId } = req.body

        const deleteCourse = await CourseModel.deleteOne({
            _id: courseId,
            creatorId: AdminId
        })

        if (deleteCourse.deletedCount === 0) {
            return res.status(404).json({
                message: "Course not found or not owned by you"
            })
        }

        res.status(200).json({
            message: "Course deleted successfully"
        })

    } catch (err) {
        console.log(err);
        res.status(500).json({
            error: "Failed to delete course"
        })


    }
})

AdminRouter.get("/course/bulk", adminMiddleware, async function(req, res) {
    try {

        const AdminId = req.adminId

        const getCourse = await CourseModel.find({
            creatorId: AdminId

        })

        res.status(200).json({
            getCourse: getCourse
        })


    } catch (err) {
        console.log(err);
        res.status(500).json({
            error: "Failed to fetch courses"
        })


    }
})

export { AdminRouter }