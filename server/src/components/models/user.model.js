import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: 3,
      maxlength: 50,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      required: [true, "Phone number is required"],
      unique: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },

    vehicleNumber: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },

    vehicleType: {
      type: String,
      enum: ["car", "motorbike", "large"],
      required: true,
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    refreshToken: {
      type: String,
      default: null,
      select: false,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
    isActive: {
  type: Boolean,
  default: true,
},
  },
  {
    timestamps: true,
  }
);


userSchema.index({ email: 1 });
userSchema.index({ phone: 1 });
userSchema.index({ vehicleNumber: 1 });

export default mongoose.model("User", userSchema);