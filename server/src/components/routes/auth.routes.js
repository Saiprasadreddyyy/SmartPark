import express from "express";
import {authMiddleware} from "../middleware/auth.middleware.js";
import { signupSchema, loginSchema } from "../controllers/auth.validation.js";
import { signupController, loginController, logoutController, profileController , refreshTokenController} from "../controllers/auth.controller.js";
import { validate } from "../middleware/validation.middleware.js";
import { authLimiter } from "../middleware/ratelimit.middleware.js";

const Authrouter = express.Router();

Authrouter.post("/signup", authLimiter,validate(signupSchema),signupController);

Authrouter.post("/login", authLimiter, validate(loginSchema),loginController);

Authrouter.post("/logout", authMiddleware, logoutController);

Authrouter.get("/profile", authMiddleware, profileController);

Authrouter.post("/refresh",authLimiter, refreshTokenController);

export default Authrouter;