import mongoose, { Schema } from "mongoose";

const userSchema = new Schema({
  phoneNumber: { type: String, unique: true, sparse: true },
  phoneSuffix: { type: String },
  username: { type: String, trim: true },
  email: {
    type: String,
    unique: true,
    lowercase: true,
    validate: {
      validator: function (v) {
        return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v);
      },
      message: "Please enter a valid email",
    },
  },

  emailOtp: { type: String },
  emailOtpExpiry: { type: Date },
  profilePicture: {
    type: String,
  },
  about: { type: String },
  lastSeen: { type: Date },
  isOnline: { type: Boolean, default: false },
  isVerified: { type: String },
  agreed: { type: Boolean, default: false },
},{timestamps:true});

const User = mongoose.model("User", userSchema);

export default User;
