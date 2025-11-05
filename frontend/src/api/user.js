
import { axiosInstance } from "../lib/axiosInstance";

export const sendOtp = async (phoneNumber, phoneSuffix, email) => {
  try {
    const resposne = await axiosInstance.post("/auth/send-otp", {
      phoneNumber,
      phoneSuffix,
      email
    });

    return resposne.data;
  } catch (error) {
    return error.response ? error.response.data : error.message;
  }
};

export const verifyOtp = async (phoneNumber, phoneSuffix, otp, email) => {
  try {
    const resposne = await axiosInstance.post("/auth/verify-otp", {
      phoneNumber,
      phoneSuffix,
      otp,
      email,
    });

    return resposne.data;
  } catch (error) {
    return error.response ? error.response.data : error.message;
  }
};

export const updateUserProfile = async (updatedData) => {
  try {
    const resposne = await axiosInstance.put(
      "/auth/update-profile",
      updatedData
    );

    return resposne.data;
  } catch (error) {
    return error.response ? error.response.data : error.message;
  }
};

export const checkUserAuth = async () => {
  try {
    const response = await axiosInstance.get("/auth/check-auth");
    if (response.data.status === "success") {
      return { isAuthenticated: true, user: response.data.data };
    }
    if (response.data.status === "error") {
      return { isAuthenticated: false };
    }
  } catch (error) {
    return error.response ? error.response.data : error.message;
  }
};

export const logoutUser = async () => {
  try {
    const resposne = await axiosInstance.post("/auth/logout");

    return resposne.data;
  } catch (error) {
    return error.response ? error.response.data : error.message;
  }
};


export const getAllUsers = async () => {
  try {
    const resposne = await axiosInstance.get("/auth/users");

    return resposne.data;
  } catch (error) {
    return error.response ? error.response.data : error.message;
  }
};