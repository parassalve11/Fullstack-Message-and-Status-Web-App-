import { useState } from "react";
import useUserStorage from "../../store/useUserStorage";
import { logoutUser } from "../../api/user";
import { toast } from "react-toastify";
import useThemeStorage from "../../store/useThemeStorage";
import Layout from "../../components/Layout";
import {
  HelpingHand,
  ListChecks,
  LogOut,
  Moon,
  Search,
  Sun,
  User,
} from "lucide-react";
import { Link } from "react-router-dom";

function SettingPage() {
  const [isThemeDialogIsOpen, setThemeDialogIsOpen] = useState(false);

  const { user, clearUser } = useUserStorage();
  const { theme } = useThemeStorage();

  const toggleThemeDialog = () => {
    setThemeDialogIsOpen(!isThemeDialogIsOpen);
  };

  const handleLogOut = async () => {
    try {
      await logoutUser();
      clearUser();
      toast.success("User logout successfully");
    } catch (error) {
      console.error("Faild to Logout", error);
    }
  };

  return (
    <Layout
      isThemeDialogOpen={isThemeDialogIsOpen}
      toggleThemeDialog={toggleThemeDialog}
    >
      <div
        className={`flex h-screen ${
          theme === "dark"
            ? "bg-[rgb(17,23,33)] text-white"
            : "bg-white text-black"
        }`}
      >
        <div
          className={`w-[400px] border-r ${
            theme === "dark" ? "border-gray-600" : "border-gray-200"
          }`}
        >
          <div className="p-4">
            <h2 className="text-xl font-semibold ">Settings</h2>
            <div className="relative ">
              <Search className="absolute left-3 top-6 text-gray-400 font-semibold " />
              <input
                placeholder="Search settings..."
                className={`w-full ${
                  theme === "dark"
                    ? "bg-[#202c33] text-white"
                    : "bg-gray-100 text-black"
                } border-none pl-10 mt-4 placeholder-gray-400 rounded p-2`}
              />
            </div>

            <div
              className={`flex items-center gap-3 p-3 ${
                theme === "dark" ? "bg-[#202c33]" : "bg-gray-100"
              } rounded-lg cursor-pointer mb-4`}
            >
              <img
                src={user?.profilePicture}
                alt={user?.username}
                className="size-14 object-cover rounded-full border-red-500"
              />
              <div className="">
                <h2 className="font-semibold text-xl">{user?.username}</h2>
                <p className="text-sm text-gray-400">{user?.about}</p>
              </div>
            </div>
            {/* Menu Itmes */}
            <div className="h-[calc(100vh-280px)] overflow-y-auto">
              <div className="space-y-1">
                {[
                  { icon: User, label: "Account", herf: "/user-profile" },
                  { icon: HelpingHand, label: "Feadbacks and Help", herf: "" },
                  { icon: ListChecks, label: "Chats", herf: "/" },
                ].map((item) => (
                  <Link
                    herf={item.herf}
                    className={`w-full  flex  items-center gap-3  p-2 rounded ${
                      theme === "dark"
                        ? "text-white hover:bg-[#202c33]"
                        : "text-black hover:bg-gray-100"
                    }`}
                  >
                    <item.icon className="size-5" />
                    <div
                      className={`border-b ${
                        theme === "dark" ? "border-gray-700" : "border-gray-200"
                      } w-full p-3`}
                    >
                      {item.label}
                    </div>
                  </Link>
                ))}

                {/* theme trigger */}

                <button
                  onClick={toggleThemeDialog}
                  className={`w-full flex items-center gap-3 rounded-e-2xl ${
                    theme === "dark"
                      ? "text-white hover: bg-[#202c33]"
                      : "text-black hover:bg-gray-100"
                  }`}
                >
                  {theme === "dark" ? (
                    <Moon className="size-5" />
                  ) : (
                    <Sun className="size-5" />
                  )}

                  <div
                    className={` flex flex-col text-start border-b ${
                      theme === "dark" ? "border-gray-700" : " border-gray-200"
                    } w-full p-3`}
                  >
                    Theme
                    <span className="ml-auto text-sm text-gray-400">
                      {theme.charAt(0).toUpperCase() + theme.slice(1)}
                    </span>
                  </div>
                </button>
              </div>
              <button
              onClick={handleLogOut}
                className={`flex items-center justify-center gap-3 w-full px-5 py-2 rounded-2xl bg-red-500 mt-10 md:mt-32 text-white font-semibold `}
              >
                <LogOut className="size-7" /> Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default SettingPage;
