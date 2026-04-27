import { JwtPayload } from "../handlers/middlewares/auth-middleware.js"

declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload
        }
    }
}
