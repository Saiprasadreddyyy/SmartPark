import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import UserModel from "../models/user.model.js";
import ApiError from "../../utils/ApiError.js";

import {
  generateAccessToken,
  generateRefreshToken,
} from "../../utils/generateTokens.js";


export async function signup(data) {
  const {
    name,
    email,
    phone,
    password,
    vehicleNumber,
    vehicleType,
  } = data;

  const existingUser = await UserModel.findOne({
    $or: [
      { email: email.toLowerCase() },
      { phone },
      { vehicleNumber: vehicleNumber.toUpperCase() },
    ],
  });

  if (existingUser) {
    throw new ApiError(
      400,
      "Email, phone or vehicle already exists"
    );
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await UserModel.create({
    name,
    email: email.toLowerCase(),
    phone,
    password: hashedPassword,
    vehicleNumber: vehicleNumber.toUpperCase(),
    vehicleType,
  });

  const accessToken = generateAccessToken(user);

  const refreshToken = generateRefreshToken(user);

  const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

    user.refreshToken = hashedRefreshToken;

  await user.save();

  return {
    accessToken,
    refreshToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      vehicleNumber: user.vehicleNumber,
      vehicleType: user.vehicleType,
      role: user.role,
    },
  };
}

export async function login(data) {
  const { email, password } = data;

 const user = await UserModel.findOne({
    email: email.toLowerCase(),
    isDeleted: false
}).select("+password +refreshToken");

  if (!user) {
    throw new ApiError(
      400,
      "Invalid email or password"
    );
  }
  if (!user.isActive) {
    throw new ApiError(
      403,
      "Account is disabled"
    );
}

  const matched = await bcrypt.compare(
    password,
    user.password
  );

  if (!matched) {
    throw new ApiError(
      400,
      "Invalid email or password"
    );
  }

  const accessToken = generateAccessToken(user);

  const refreshToken = generateRefreshToken(user);
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

    user.refreshToken = hashedRefreshToken;

  await user.save();

  return {
    accessToken,
    refreshToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      vehicleNumber: user.vehicleNumber,
      vehicleType: user.vehicleType,
      role: user.role,
    },
  };
}

export async function profile(userId) {

  const user = await UserModel.findById(userId)
    .select("-password -refreshToken");

  if (!user) {
    throw new ApiError(
      404,
      "User not found"
    );
  }

  return user;
}

export async function logout(userId) {

  const user = await UserModel.findById(userId);

  if (!user) {
    throw new ApiError(
      404,
      "User not found"
    );
  }

  user.refreshToken = null;

  await user.save();

  return;
}

export async function refreshToken(token) {

  if (!token) {
    throw new ApiError(
      401,
      "Refresh token missing"
    );
  }

  const decoded = jwt.verify(
    token,
    process.env.JWT_REFRESH_SECRET
  );

  const user = await UserModel
    .findById(decoded.id)
    .select("+refreshToken");

  if (!user) {
    throw new ApiError(
      404,
      "User not found"
    );
  }

  const isValidRefreshToken = await bcrypt.compare(
    token,
    user.refreshToken
  );

  if (!isValidRefreshToken) {
    throw new ApiError(
      401,
      "Invalid refresh token"
    );
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  const hashedRefreshToken = await bcrypt.hash(
    refreshToken,
    10
  );

  user.refreshToken = hashedRefreshToken;

  await user.save();

  return {
    accessToken,
    refreshToken
  };
}