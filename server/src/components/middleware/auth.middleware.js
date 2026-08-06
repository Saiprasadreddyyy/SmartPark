import jwt from "jsonwebtoken";
import UserModel from "../models/user.model.js";

export async function authMiddleware(req, res, next) {
  try {

    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Authorization header missing"
      });
    }

    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Invalid authorization format"
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_ACCESS_SECRET
    );

   const user = await UserModel.findById(decoded.id)
      .select("-password -refreshToken");


if (!user || user.isDeleted || !user.isActive) {

      return res.status(401).json({
        success:false,
        message:"Account unavailable"
      });

}

    req.user = user;

    next();

  } catch (err) {

    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Access Token Expired"
      });
    }

    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid Access Token"
      });
    }

    return res.status(500).json({
      success: false,
      message: err.message
    });

  }
}