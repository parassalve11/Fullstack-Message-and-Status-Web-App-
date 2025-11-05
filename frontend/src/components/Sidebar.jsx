import React, { useEffect, useState } from "react";
import useUserStorage from "../store/useUserStorage";
import useThemeStorage from "../store/useThemeStorage";
import { Link, useLocation } from "react-router-dom";
import useLayoutStorage from "../store/useLayoutStorage";
import { CircleFadingPlus, MessageCircle, Settings, Settings2, UserCircle } from "lucide-react";
import { motion as Motion } from "framer-motion";

function Sidebar() {
  const { user } = useUserStorage();
  const { activeTab, setActiveTab } = useLayoutStorage();

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const { theme } = useThemeStorage();

  const location = useLocation();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(setIsMobile(window.innerWidth < 768));
    };

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);



  
  useEffect(() => {
    if (location.pathname === "/") {
      setActiveTab("chats");
    } else if (location.pathname === "/status") {
      setActiveTab("status");
    } else if (location.pathname === "/user-profile") {
      setActiveTab("profile");
    } else if (location.pathname === "/settings") {
      setActiveTab("setting");
    }
  }, [location, setActiveTab]);

  const SidebarContent = (
    <>
      <Link
      to={'/'}
        className={`${isMobile ? " " : "mb-8"} ${
          activeTab === "chats" && "bg-gray-300 rounded-full shadow-sm p-2 "
        } focus:outline-none`}
      >
        <MessageCircle
          className={`size-6 ${
            activeTab === "chats"
              ? theme === "dark"
                ? "text-gray-800"
                : ""
              : theme === "dark"
              ? "text-gray-300"
              : "text-gray-800"
          }`}
        />
      </Link>
      <Link
      to={'/status'}
        className={`${isMobile ? " " : "mb-8"} ${
          activeTab === "status" && "bg-gray-300 rounded-full shadow-sm p-2 "
        } focus:outline-none`}
      >
        <CircleFadingPlus 
          className={`size-6 ${
            activeTab === "status"
              ? theme === "dark"
                ? "text-gray-800"
                : ""
              : theme === "dark"
              ? "text-gray-300"
              : "text-gray-800"
          }`}
        />
      </Link>
      {!isMobile && <div  className="flex-grow"/>}
       <Link
      to={'/user-profile'}
        className={`${isMobile ? " " : "mb-8"} ${
          activeTab === "profile" && "bg-gray-300 rounded-full shadow-sm p-2 "
        } focus:outline-none`}
      >
       {user?.profilePicture ?(
        <img 
        src={user?.profilePicture}
        alt={user?.username}
        className="size-8 rounded-full object-cover"
        />
       ):(
         <UserCircle 
          className={`size-6 ${
            activeTab === "profile"
              ? theme === "dark"
                ? "text-gray-800"
                : ""
              : theme === "dark"
              ? "text-gray-300"
              : "text-gray-800"
          }`}
        />
       ) }
      </Link>

       <Link
      to={'/settings'}
        className={`${isMobile ? " " : "mb-8"} ${
          activeTab === "setting" && "bg-gray-300 rounded-full shadow-sm p-2 "
        } focus:outline-none`}
      >
        <Settings 
          className={`size-6 ${
            activeTab === "setting"
              ? theme === "dark"
                ? "text-gray-800"
                : ""
              : theme === "dark"
              ? "text-gray-300"
              : "text-gray-800"
          }`}
        />
      </Link>
    </>
  );
  return (
    <Motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={`${
        isMobile
          ? "fixed right-0 bottom-0 left-0 h-16 flex-row justify-around"
          : "w-16 h-screen border-r-2 flex-col justify-between"
      } ${
        theme === "dark"
          ? "bg-gray-800 border-gray-600"
          : "bg-[rgb(239,242,254)] border-gray-300"
      } bg-opacity-90 flex items-center py-4  shadow-lg`}
    >
      {SidebarContent}
    </Motion.div>
  );
}

export default Sidebar;
