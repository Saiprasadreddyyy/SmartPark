import bcrypt from "bcrypt";
import UserModel from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { generateAccessToken, generateRefreshToken } from "../../utils/generateTokens.js";

import * as authService from "../services/auth.service.js";

export async function signupController(req, res) {
    try {
        const result = await authService.signup(req.body);

        res.cookie("refreshToken", result.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.status(201).json({
            success: true,
            message: "Account created successfully",
            accessToken: result.accessToken,
            user: result.user
        });

    } catch (err) {

        return res.status(err.statusCode || 500).json({
            success: false,
            message: err.message
        });

    }
}

export async function loginController(req, res) {
    try {
        const result = await authService.login(req.body);

        res.cookie("refreshToken", result.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.status(200).json({
            success: true,
            message: "Login Successful",
            accessToken: result.accessToken,
            user: result.user
        });

    } catch (err) {

        return res.status(err.statusCode || 500).json({
            success: false,
            message: err.message
        });

    }
}

export async function refreshTokenController(req, res) {
    try {

        const result = await authService.refreshTokenService(
            req.cookies.refreshToken
        );

        res.cookie("refreshToken", result.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.status(200).json({
            success: true,
            accessToken: result.accessToken
        });

    } catch (err) {

        return res.status(err.statusCode || 500).json({
            success: false,
            message: err.message
        });

    }
}

export async function profileController(req, res) {
    try {

        const user = await authService.getProfile(req.user.id);

        return res.status(200).json({
            success: true,
            user
        });

    } catch (err) {

        return res.status(err.statusCode || 500).json({
            success: false,
            message: err.message
        });

    }
}

export async function logoutController(req, res) {
    try {

        await authService.logout(req.user.id);
        res.clearCookie("refreshToken");

        return res.status(200).json({
            success: true,
            message: "Logged Out Successfully"
        });

    } catch (err) {

        return res.status(err.statusCode || 500).json({
            success: false,
            message: err.message
        });

    }
}