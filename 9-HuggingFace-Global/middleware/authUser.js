import jwt from 'jsonwebtoken'

// user authentication middleware
const authUser = async (req, res, next) => {
    const authHeader = req.headers.authorization || req.headers.token;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
    if (!token) {
        // Guest mode support for chat & public AI guidance
        req.body.userId = req.body.userId || 'guest_123';
        return next();
    }
    try {
        const token_decode = jwt.verify(token, process.env.JWT_SECRET)
        req.body.userId = token_decode.id
        next()
    } catch (error) {
        console.log("JWT Verification fallback to guest:", error.message)
        req.body.userId = req.body.userId || 'guest_123';
        next()
    }
}

export default authUser;