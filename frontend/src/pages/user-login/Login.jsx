import React from "react";
import useLoginStore from "../../store/useLoginStorage";
import { useState } from "react";
import countries from "../../utils/countriles";
import avatars from "../../utils/avatars";
import useUserStorage from "../../store/useUserStorage";
import { motion as Motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  loginValidationSchema,
  otpSchema,
  profileSchema,
} from "../../lib/schemas/LoginSchema";
import useThemeStorage from "../../store/useThemeStorage";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ChevronDown,
  Mail,
  MessagesSquare,
  Plus,
  User,
} from "lucide-react";
import ProgressBar from "../../components/ProgressBar";
import Spinner from "../../utils/Spinner";
import { sendOtp, updateUserProfile, verifyOtp } from "../../api/user";
import { toast } from "react-toastify";

function Login() {
  const { step, setStep, userPhoneData, setUserPhoneData, resetLoginState } =
    useLoginStore();
  const { theme } = useThemeStorage();

  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [selectedContry, setSelectedContry] = useState(countries[0]);
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePictureFile, setProfilePictureFile] = useState(null);
  const [showDialog, setShowDialog] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState(avatars[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { setUser } = useUserStorage();

  const {
    register: loginRegister,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors },
  } = useForm({
    resolver: zodResolver(loginValidationSchema),
  });

  const {
    handleSubmit: handleOtpSubmit,
    formState: { errors: otpErrors },
    setValue: setOtpValue,
  } = useForm({
    resolver: zodResolver(otpSchema),
  });

  const {
    register: profileRegister,
    watch,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
  } = useForm({
    resolver: zodResolver(profileSchema),
  });

  const onLoginSubmit = async () => {
    try {
      setLoading(true);
      if (email) {
        const response = await sendOtp(null, null, email);
        if (response.status === "success") {
          toast.info("Otp send to Your Email");
          setUserPhoneData({ email: email });
          setStep(2);
        }
      }

      if (phoneNumber) {
        const response = await sendOtp(phoneNumber, selectedContry.dialCode);
        if (response.status === "success") {
          toast.info("Otp send your Phone");
          setUserPhoneData({
            phoneNumber: phoneNumber,
            phoneSuffix: selectedContry.dialCode,
          });
          setStep(2);
        }
      }
    } catch (error) {
      console.log(error);
      setError(error.message || "Faild to send Otp");
    } finally {
      setLoading(false);
    }
  };

  console.log(userPhoneData?.email);

  const onOtpSubmit = async () => {
    try {
      setLoading(true);
      if (!userPhoneData) {
        throw new Error("Phone and email data Missing");
      }
      const otpString = otp.join("");
      let response;
      if (userPhoneData.email) {
        response = await verifyOtp(null, null, otpString, userPhoneData.email);
      } else {
        response = await verifyOtp(
          userPhoneData.phoneNumber,
          userPhoneData.phoneSuffix
        );
      }

      if (response.status === "success") {
        toast.success("OTP is verified Successfully");
        const user = response?.data?.user;
        if (user.username && user.profilePicture) {
          setUser(user);
          toast.success("Welcome back Dear");
          navigate("/");
          resetLoginState();
        } else {
          setStep(3);
        }
      }
    } catch (error) {
      setError(error.message || "Faild to Verify Otp");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      setProfilePictureFile(file);
      setProfilePicture(URL.createObjectURL(file));
    }
  };

  const onProfileSubmit = async (data) => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("username", data.username);
      formData.append("agreed", data.agreed);
      if (profilePictureFile) {
        formData.append("media", profilePictureFile);
      } else {
        formData.append("profilePicture", selectedAvatar);
      }

      await updateUserProfile(formData);
      toast.success("Welcome back Dear");
      navigate("/");
      resetLoginState();
    } catch (error) {
      setError(error.message || "Faild to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setOtpValue("otp", newOtp);
    if (value && index > otp.length - 1) {
      document.getElementById(`otp-${index + 1}`).focus();
    }
  };
  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`).focus();
    }
  };

  const handleBack = () => {
    setStep(step - 1);
    setError("");
    setUserPhoneData(null);
    setOtp(["", "", "", "", "", ""]);
  };

  const filterCountries = countries.filter(
    (country) =>
      country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      country.dialCode.includes(searchTerm)
  );

  const navigate = useNavigate();

  return (
    <div
      className={`min-h-screen ${
        theme === "dark"
          ? "bg-gray-900"
          : "bg-gradient-to-br from-green-400 to-blue-500"
      } flex items-center justify-center bg-amber-200 overflow-hidden p-4`}
    >
      <Motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`${
          theme === "dark" ? "bg-gray-800 text-white" : "bg-white"
        } relative z-10 p-6 md:p-8 rounded-2xl shadow-md w-full max-w-md  `}
      >
        <Motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            duration: 0.5,
            type: "spring",
            stiffness: 260,
            damping: 20,
          }}
          className="w-24 h-24 bg-green-500 rounded-full mx-auto mb-6 flex items-center justify-center"
        >
          <MessagesSquare className="size-16 text-white " />
        </Motion.div>
        <h1
          className={`text-3xl font-bold text-center mb-6 ${
            theme === "dark" ? "text-white" : "text-gray-800"
          }`}
        >
          Message App Login
        </h1>

        <ProgressBar theme={theme} step={step} />

        {error && (
          <p className="text-red-500 font-medium text-center">{error}</p>
        )}

        {step === 1 && (
          <form
            className="space-y-4"
            onSubmit={handleLoginSubmit(onLoginSubmit)}
          >
            <p
              className={`text-center ${
                theme === "dark" ? "text-gray-300" : "text-gray-600"
              } mb-4`}
            >
              Enter you Phone Number to recevie Otp
            </p>

            <div className="relative ">
              <div className="flex ">
                <div className="relative w-1/3 ">
                  <button
                    type="button"
                    className={`flex-shrink-0 z-10 no-scrollbar inline-flex items-center py-2.5 px-4 text-sm font-medium text-center
                        ${
                          theme === "dark"
                            ? "text-white bg-gray-600 border-gray-700"
                            : "text-gray-900 bg-gray-100 border-gray-300"
                        } border rounded-s-lg hover:bg-gray-200 focus:ring-4 focus:outline-none focus:ring-gray-100`}
                    onClick={() => setShowDialog(!showDialog)}
                  >
                    <span>
                      {selectedContry.flag} {selectedContry.dialCode}
                    </span>
                    <ChevronDown className="size-5 mx-3 my-0.5" />
                  </button>
                  {showDialog && (
                    <div
                      className={`absolute z-10 w-full mt-4 ${
                        theme === "dark"
                          ? "bg-gray-700 border-gray-600"
                          : "bg-white border-gray-300"
                      } border rounded-md shadow-2xl  max-h-60 overflow-auto`}
                    >
                      <div
                        className={`sticky top-0 p-2 ${
                          theme === "dark" ? "bg-gray-700" : "bg-white"
                        }`}
                      >
                        <input
                          type="text"
                          placeholder="Search contries..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className={`w-full px-2 py-1 broder ${
                            theme === "dark"
                              ? "bg-gray-600 border-gray-500 text-white"
                              : "bg-white border-gray-300"
                          } rounded-md text-sm focus:outline-none focus:right-2 focus:ring-green-500 `}
                        />
                      </div>
                      {filterCountries.map((country) => (
                        <button
                          key={country.alpha2}
                          type="button"
                          className={`flex items-center w-full text-left px-3 py-2 ${
                            theme === "dark"
                              ? "hover:bg-gray-600"
                              : "bg-gray-100"
                          } focus:outline-none`}
                          onClick={() => {
                            setSelectedContry(country), setShowDialog(false);
                          }}
                        >
                          {country.flag} ({country.dialCode}) {country.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <input
                  type="tel"
                  placeholder="Enter Your Phone Number"
                  {...loginRegister("phoneNumber")}
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className={`w-2/3 px-4 py-2 border ${
                    theme === "dark"
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border border-gray-300"
                  } rounded-md border focus:outline-none focus:right-3 focus:ring-green-500 ${
                    loginErrors.phoneNumber && "border-red-500"
                  }`}
                />
              </div>
              {loginErrors.phoneNumber && (
                <p className="text-red-500 font-medium">
                  {loginErrors.phoneNumber.message}
                </p>
              )}
            </div>
            {/* //Divider with OR */}
            <div className="flex items-center my-4">
              <div className="flex-grow h-px bg-gray-300" />
              <span className=" text-gray-500 text-sm font-medium px-2">
                OR
              </span>
              <div className="flex-grow h-px bg-gray-300" />
            </div>

            {/* //Email input box */}
            <div
              className={`flex items-center justify-center py-3 px-2 ${
                theme === "dark"
                  ? "bg-gray-700 border-gray-600"
                  : "bg-white border-gray-300"
              }`}
            >
              <Mail
                className={`mr-2  size-8 text-gray-400 ${
                  theme === "dark" ? "text-gray-400" : "text-gray-500"
                }`}
              />
              <input
                type="email"
                placeholder="Email (optional)"
                {...loginRegister("email")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full bg-transparent focus:outline-none px-3 py-2  ${
                  theme === "dark"
                    ? " text-white border-gray-600"
                    : "text-black border-gray-300"
                } rounded-md border focus:outline-none focus:right-3 focus:ring-green-500 ${
                  loginErrors.email && "border-red-500"
                }`}
              />

              {loginErrors.email && (
                <p className="text-red-500 font-medium">
                  {loginErrors.email.message}
                </p>
              )}
            </div>
            <button
              type="submit"
              className="w-full bg-green-500 text-white py-2  rounded-md hover:bg-green-600 transition"
            >
              {loading ? <Spinner /> : "Send OTP"}
            </button>
          </form>
        )}
        {step === 2 && (
          <form className="space-y-4" onSubmit={handleOtpSubmit(onOtpSubmit)}>
            <div
              className={`text-center mb-4 ${
                theme === "dark" ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Please enter 6-Digit Otp send to your{" "}
              {userPhoneData.phoneNumber ? (
                <p className="font-semibold text-green-500">
                  {userPhoneData.phoneSuffix}
                  {userPhoneData.phoneNumber}
                </p>
              ) : (
                <p className="font-semibold text-green-500">
                  {userPhoneData.email}
                </p>
              )}
            </div>

            <div className="flex justify-between">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  className={`size-12 text-center border ${
                    theme === "dark"
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-b-gray-300"
                  } rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    otpErrors.otp && "border-red-500"
                  }`}
                />
              ))}
            </div>
            {otpErrors.otp && (
              <p className="text-red-500 text-sm font-medium">
                {otpErrors.otp.message}
              </p>
            )}

            <button
              type="submit"
              className="w-full bg-green-500 text-white py-2  rounded-md hover:bg-green-600 transition"
            >
              {loading ? <Spinner /> : "Verify OTP"}
            </button>

            <button
              type="button"
              onClick={handleBack}
              className={`w-full mt-2 ${
                theme === "dark"
                  ? "bg-gray-700 text-gray-300"
                  : "bg-gray-200 text-gray-700"
              } py-2 rounded-md hover:bg-gray-300 transition flex items-center justify-center`}
            >
              <ArrowLeft className="mr-2" />
              Wrong number ? Go back
            </button>
          </form>
        )}

        {step === 3 && (
          <form
            className="space-y-4"
            onSubmit={handleProfileSubmit(onProfileSubmit)}
          >
            <div className="flex flex-col items-center mb-4">
              <div className="relative w-24 h-24 mb-2 border-2 border-gray-300 bg-green-100 rounded-full overflow-hidden group">
                <Motion.img
                  alt="profile"
                  src={profilePicture || selectedAvatar}
                  className="w-full h-full rounded-full object-cover transition-transform duration-300 group-hover:scale-110"
                  initial={{ scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                />
                <label
                  htmlFor="profile-picture"
                  className="absolute bottom-0 right-0  bg-green-500 text-white p-2 rounded-full cursor-pointer
                   hover:bg-green-600 transition-all duration-300 transform hover:scale-110"
                >
                  <Plus className="size-4" />
                </label>

                <input
                  type="file"
                  id="profile-picture"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
              <p
                className={`text-xs ${
                  theme === "dark" ? "text-gray-600" : "text-gray-500"
                }`}
              >
                Choose an avatar
              </p>

              <div className="flex flex-wrap justify-center gap-3 mt-4">
                {avatars.map((avatar, index) => (
                  <Motion.img
                    key={index}
                    src={avatar}
                    alt={`avatar ${index + 1}`}
                    className={`size-12 border-2 rounded-full cursor-pointer transition-all duration-300 hover:scale-110 hover:shadow-lg ${
                      selectedAvatar === avatar
                        ? "border-green-500 ring-2 ring-green-200 bg-green-50 shadow-md scale-110"
                        : "border-gray-300 hover:border-green-400"
                    }`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.15, rotate: 5 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 20,
                      duration: 0.2,
                    }}
                    onClick={() => {
                      setSelectedAvatar(avatar), setProfilePicture(null);
                    }}
                  />
                ))}
              </div>
            </div>
            <div className="relative">
              <User className="absolute left-3 top-1/2  transform -translate-y-1/2" />

              <input
                type="text"
                {...profileRegister("username")}
                placeholder="Username"
                className={`w-full pl-12 pr-3 py-3 border font-medium ${
                  theme === "dark"
                    ? "bg-gray-700 border-gray-600 "
                    : "bg-white border-gray-300 "
                } rounded-md  ${
                  profileErrors.username && "border-red-500 "
                } focus:ring-2 focus:ring-green-500 `}
              />
              {profileErrors.username && (
                <p className="text-red-500 font-semibold text-sm">
                  {profileErrors.username.message}
                </p>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                {...profileRegister("agreed")}
                className={`rounded  size-4 ${
                  theme === "dark" ? "text-gray-700" : "text-gray-400"
                }  focus:ring-green-500 `}
              />
              <label
                htmlFor="terms"
                className={`text-sm  ${
                  theme === "dark" ? "text-gray-300" : "text-gray-700"
                }`}
              >
                I agree to the{" "}
                <a
                  className={`font-semibold ${
                    profileErrors.agreed && "text-red-500"
                  } `}
                >
                  Terms and Conditions
                </a>
              
              </label>
                {profileErrors.agreed && (
                  <p className="text-sm text-red-500 mt-1">
                    {profileErrors.agreed.message}
                  </p>
                )}
            </div>
            <button
              type="submit"
              disabled={watch("agreed") && loading}
              className={`w-full bg-green-500  flex text-white items-center justify-center px-4 py-3 rounded-md transition duration-300 ease-in-out ${
                loading && "opacity-50 cursor-not-allowed"
              }`}
            >
              {loading ? <Spinner /> : "Create Profile"}
            </button>
          </form>
        )}
      </Motion.div>
    </div>
  );
}

export default Login;
