import React, { useState } from "react";
import useUserStorage from "../../store/useUserStorage";
import useLayoutStorage from "../../store/useLayoutStorage";
import useThemeStorage from "../../store/useThemeStorage";
import { Plus, Search } from "lucide-react";
import { motion as Motion } from "framer-motion";
import formatTimestamp from "../../utils/formateDate";

function ChatList({ contacts }) {
  const { user } = useUserStorage();

  const selectedContact = useLayoutStorage((state) => state.selectedContact);
  const setSelectedContact = useLayoutStorage(
    (state) => state.setSelectedContact
  );

  const { theme } = useThemeStorage();

  const [searchTerms, setSearchTerms] = useState("");

  const filtersContacts = contacts?.filter((contact) =>
    contact?.username?.toLowerCase().includes(searchTerms.toLowerCase())
  );
  console.log("filters contacts", filtersContacts);
  console.log("contacts", contacts);

  return (
    <div
      className={`w-full border-r h-screen ${
        theme === "dark"
          ? "bg-[rgb(17,27,23)] border-gray-600"
          : "bg-white border-gray-300"
      }`}
    >
      <div
        className={`p-2 flex justify-between ${
          theme === "dark" ? "text-white" : "text-gray-800"
        }`}
      >
        <h2 className="text-xl font-semibold">Chats</h2>
        <button className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors">
          <Plus />
        </button>
      </div>
      <div className="p-2">
        <div className="relative">
          <Search
            className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
              theme === "dark" ? "text-gray-400" : "text-gray-800"
            }`}
          />
          <input
            type="search"
            placeholder="Search Users..."
            value={searchTerms}
            onChange={(e) => setSearchTerms(e.target.value)}
            className={`w-full pl-10 pr-4 py-2 border rounded-lg foucs:outline-none focus:ring-2 focus:ring-green-500
            ${
              theme === "dark"
                ? "bg-gray-800 text-white border-gray-700"
                : "bg-gray-100 text-black border-gray-300"
            }`}
          />
        </div>
      </div>
      <div className="overflow-y-auto h-[calc(100vh-120px)]">
        {filtersContacts.map((contact) => (
          <Motion.div
            key={contact?._id}
            onClick={() => setSelectedContact(contact)}
            className={`p-3 flex items-center cursor-pointer ${
              theme === "dark"
                ? selectedContact?._id == contact._id
                  ? "bg-gray-700"
                  : "hover:bg-gray-800"
                : selectedContact?._id === contact._id
                ? "bg-gray-200"
                : "hover:bg-gray-100"
            }`}
          >
            <img
              alt={contact?.username}
              src={contact?.profilePicture}
              className="size-12 rounded-full border object-cover"
            />
            <div className="flex-1 ml-3">
              <div className="flex items-baseline justify-between">
                <h2
                  className={`font-semibold ${
                    theme === "dark" ? "text-white" : "text-gray-800"
                  }`}
                >
                  {contact?.username}
                </h2>
                {contact?.conversation && (
                  <span
                    className={`text-xs ${
                      theme === "dark" ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    {formatTimestamp(
                      contact?.conversation?.lastMessage?.createdAt
                    )}
                  </span>
                )}
              </div>
              <div className="flex items-baseline justify-between">
                <p
                  className={`text-xs ${
                    theme === "dark" ? "text-gray-400" : "text-gray-500"
                  } truncate`}
                >
                  {contact?.conversation?.lastMessage?.content}
                </p>
                {contact?.conversation &&
                  contact?.conversation?.unreadCount > 0 &&
                  contact?.conversation?.lastMessage?.receiver ===
                    user?._id && (
                    <p
                      className={`text-sm font-semibold size-6 flex items-center justify-center bg-yellow-500 ${
                        theme === "dark" ? "text-gray-800" : "text-gray-500"
                      }`}
                    >
                      {contact?.conversation?.unreadCount}
                    </p>
                  )}
              </div>
            </div>
          </Motion.div>
        ))}
      </div>
    </div>
  );
}

export default ChatList;
