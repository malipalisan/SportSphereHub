import express from 'express'
import { AuthController } from '../controllers/auth.controller'
import upload from '../uploads/uploads';


const authRouter = express.Router()

authRouter.post(
    "/register",
    upload.single("avatar"),
    (req, res) => new AuthController().register(req, res)
)

authRouter.post(
    "/login",
    (req, res) => new AuthController().login(req, res)
)

authRouter.post(
    "/adminLogin",
    (req, res) => new AuthController().login(req, res)
)

authRouter.post(
    "/forgot-password",
    (req, res) => new AuthController().requestPasswordReset(req, res)
)

authRouter.post(
    "/reset-password",
    (req, res) => new AuthController().resetPassword(req, res)
)

export default authRouter;
