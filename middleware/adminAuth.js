import jwt from "jsonwebtoken";
import "dotenv/config";

function adminMiddleware(req, res, next) {
    try {
        const token = req.headers.token;

        if (!token) {
            return res.status(401).json({
                message: "You are not signed in"
            });
        }

        const decodedtoken = jwt.verify(token, process.env.ADMIN_SECRET)


        req.adminId = decodedtoken.id;
        next();
    } catch (err) {
        return res.status(401).json({
            message: "Invalid or expired token"
        });
    }
}

export { adminMiddleware };