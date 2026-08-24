import jwt, { decode } from "jsonwebtoken"
import 'dotenv/config';



function userMiddleware(req, res, next) {
    try {

        const token = req.headers.token
        const decodetoken = jwt.verify(token, process.env.USER_SECRET)

        if (decodetoken) {
            req.userId = decodetoken.id
            next()
        } else {
            res.status(401).json({
                message: "You are not signed in"
            })
        }

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "Authentication not successful"
        })

    }
}

export { userMiddleware }