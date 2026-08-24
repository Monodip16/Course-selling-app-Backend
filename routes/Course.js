import express from "express"
import { Router } from "express";
import { userMiddleware } from "../middleware/userAuth.js";
import { CourseModel, PurchaseModel } from "../Database/Schema.js";


const CourseRouter = Router()



CourseRouter.post("/purchase", userMiddleware, async function(req, res) {
    try {
        const userId = req.userId;
        const courseId = req.body.courseId;

        const purchaseCourse = await PurchaseModel.create({
            userId: userId,
            courseId: courseId
        })

        if (purchaseCourse) {
            return res.status(201).json({
                message: "Course purchased successfully",
                purchaseCourse: purchaseCourse
            })
        }


    } catch (err) {
        console.log(err);
        res.status(500).json({
            error: "Failed in purchasing process"
        })


    }
})
CourseRouter.get("/preview", async function(req, res) {
    try {

        const courses = await CourseModel.find({})



        res.json({
            courses
        })

    } catch (err) {
        console.log(err);
        res.status(500).json("Something went wrong")

    }
})

export { CourseRouter }