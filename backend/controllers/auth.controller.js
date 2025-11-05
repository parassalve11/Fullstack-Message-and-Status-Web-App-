import User from "../models/user.model.js";
import otpGenerator from "../utils/otpGenarator.js";
import response from "../utils/responeHandler.js";
import twilioService from "../services/twilioService.js";
import sendOtpToEmail from "../services/emailService.js";
import generateToken from "../lib/generateToken.js";
import { uploadToClouduinary } from "../lib/cloudinary.js";
import Conversation from "../models/conversation.model.js";

export const sendOtp = async (req, res) => {
  const { phoneSuffix, phoneNumber, email } = req.body;
  const otp = otpGenerator();
  const expiry = Date.now() + 5 * 60 * 1000;
  let user;
  try {
    if (email) {
      user = await User.findOne({ email });

      if (!user) {
        user = new User({ email });
      }

      user.emailOtp = otp;
      user.emailOtpExpiry = expiry;

      await sendOtpToEmail(email, otp);
      await user.save();

      return response(res, 200, "Otp  send to your email", { user });
    } else {
      if (!phoneNumber || !phoneSuffix) {
        return response(res, 400, "PhoneNumber and phoneSuffix is required");
      }

      const fullPhoneNumber = `${phoneSuffix}${phoneNumber}`;

      user = await User.findOne({ phoneNumber });
      if (!user) {
        user = new User({ phoneSuffix, phoneNumber });
      }
      await twilioService.sendOtpToPhoneNumber(fullPhoneNumber);
      await user.save();
    }

    return response(res, 200, "Otp is send successfully", user);
  } catch (error) {
    console.log("Error on sendOtp controller", error.message);
    return response(res, 500, "Internal server Error");
  }
};

export const verifyOtp = async (req, res) => {
  const { phoneNumber, phoneSuffix, email, otp } = req.body;

  let user;

  try {
    if (email) {
      user = await User.findOne({ email });

      if (!user) {
        return response(res, 404, "User not found");
      }
      const now = new Date();
      if (
        !user.emailOtp ||
        String(user.emailOtp) !== String(otp) ||
        now > new Date(user.emailOtpExpiry)
      ) {
        return response(res, 400, "Invalid or Expired Otp");
      }

      user.isVerified = true;
      user.emailOtp = null;
      user.emailOtpExpiry = null;

      await user.save();
    } else {
      if (!phoneNumber || !phoneSuffix) {
        return response(
          res,
          400,
          "phoneNumber and phoneSuffix(+91)  both are required"
        );
      }

      const fullPhoneNumber = `${phoneSuffix}${phoneNumber}`;

      user = await User.findOne({ phoneNumber });

      if (!user) {
        return response(res, 400, "User not Found");
      }

      const result = await twilioService.verifyOtp(fullPhoneNumber, otp);

      if (result.status !== "approved") {
        return response(res, 400, "Invalid Otp");
      }

      user.isVerified = true;
      await user.save();
    }

    if (!user || !user._id) {
      console.error("Token generation failed — user missing");
      return response(res, 500, "User verification failed internally");
    }
    const token = generateToken(user?._id);

    res.cookie("auth_token", token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 * 365,
    });

    return response(res, 200, "Otp is Verified successfully", { token, user });
  } catch (error) {
    console.log("Error on verifyOtp controller", error.message);
    return response(res, 500, "Internal server Error");
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user?._id;
    const file = req.file;
    const { username, about, agreed } = req.body;

    const user = await User.findById(userId);
    if (file) {
      const uploadResult = await uploadToClouduinary(file);
      if(!updateProfile) throw new Error("Faild to upload file")

      user.profilePicture = uploadResult?.secure_Url;
    } else if (req.body.profilePicture) {
      user.profilePicture = req.body.profilePicture;
    }

    if (username) user.username = username;
    if (about) user.about = about;
    if (agreed) user.agreed = agreed;

    await user.save();

    return response(res, 200, "User profile Updated", user);
  } catch (error) {
    console.log("Error on updateProfile controller", error.message);
    return response(res, 500, "Internal server Error");
  }
};

export const getAllUser = async (req, res) => {
  try {
    const loggedInUser = req.user._id;

    const users = await User.find({ _id: { $ne: loggedInUser } }).select(
      "username profilePicture isOnline lastSeen about phoneNumber phoneSuffix"
    ).lean();

    const usersWithConversation = await Promise.all(
      users.map(async(user) =>{
        const conversation = await Conversation.findOne({
          participants:{$all:[loggedInUser,user?._id]}
        }).populate({
          path:"lastMessage",
          select:'content createdAt sender receiver'
        }).lean();

        return {
          ...user,
          conversation:conversation || null
        }
      })
    );

    return response(res,200,'users retrived successfully',usersWithConversation);
  } catch (error) {
    console.log("Error on getAllUser controller", error.message);
    return response(res, 500, "Internal server Error");
  }
};

export const checkAuthenticatedUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return response(res, 401, "Unauthorized - user not found");
    }

    return response(res, 200, "user is Authenticated", user);
  } catch (error) {
    console.log("Error on checkAuthenticatedUser controller", error.message);
    return response(res, 500, "Internal server Error");
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie["auth_token"];
    return response(res, 200, " User Logouted");
  } catch (error) {
    console.log("Error on logout controller", error.message);
    return response(res, 500, "Internal server Error");
  }
};
