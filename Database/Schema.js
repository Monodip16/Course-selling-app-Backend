import mongoose from "mongoose";
import { Schema } from "mongoose";
import { ObjectId } from "mongoose";


const User = new Schema({
    email: { type: String, unique: true },
    FirstName: String,
    LastName: String,
    Password: String

})

const Admin = new Schema({
    email: { type: String, unique: true },
    FirstName: String,
    LastName: String,
    Password: String



})

const Course = new Schema({
    title: String,
    description: String,
    price: Number,
    imageUrl: String,
    creatorId: ObjectId
})

const Purchase = new Schema({
    userId: ObjectId,
    courseId: ObjectId

})

const UserModel = mongoose.model("users", User)
const AdminModel = mongoose.model("admin", Admin)
const CourseModel = mongoose.model("courses", Course)
const PurchaseModel = mongoose.model("purchases", Purchase)

export {
    UserModel,
    AdminModel,
    CourseModel,
    PurchaseModel

}