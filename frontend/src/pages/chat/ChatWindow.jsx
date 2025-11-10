import React, { useEffect, useMemo, useRef, useState } from "react";
import useThemeStorage from "../../store/useThemeStorage";
import useUserStorage from "../../store/useUserStorage";
import { useChatStorage } from "../../store/useChatStorage";
import { isToday, isYesterday, format } from "date-fns";
import ChatWindowDefaultImage from "../../images/ChatWindowDeafultImage.png";
import {
  ArrowLeft,
  Ellipsis,
  FilePlusCorner,
  ImagePlay,
  Lock,
  Paperclip,
  Send,
  SmilePlus,
  Video,
  X,
} from "lucide-react";
import MessageBubble from "./MessageBubble";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";

const isValidDate = (value) => {
  const date = value instanceof Date ? value : new Date(value);
  return date instanceof Date && !isNaN(date.getTime());
};

function ChatWindow({ selectedContact, setSelectedContact }) {
  const [message, setMesage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showFileMenu, setShowFileMenu] = useState(false);
  const [filePreview, setFilePreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const typingTimeoutRef = useRef();
  const emojiPickerRef = useRef();
  const messageEndRef = useRef();
  const fileInputRef = useRef();

  const { theme } = useThemeStorage();
  const { user } = useUserStorage();

  const {
    conversations,
    currentConversation,
    messages,
    loading,
    onlineUsers,
    fetchConversations,
    fetchMessages,
    sendMessage,
    receiveMessage,
    deleteMessage,
    addReaction,
    startTyping,
    stopTyping,
    isTypingUser,
    isUserOnline,
    getUserLastSeen,
    cleanUp,
  } = useChatStorage();

  // user status like typing ,online , lastseen

  const online = isUserOnline(selectedContact?._id);
  const typing = isTypingUser(selectedContact?._id);
  const lastSeen = getUserLastSeen(selectedContact?._id);

  // console.log("lastSeen",lastSeen);
  // console.log("online",online);

  //fetch messages everytime when selectedContact or conversations arry is updated

  useEffect(() => {
    if (selectedContact?._id && conversations?.data?.length > 0) {
      const conversation = conversations.data.find((conv) =>
        conv.participants.some((p) => p?._id === selectedContact._id)
      );

      if (conversation?._id) {
        fetchMessages(conversation?._id);
      }
    }
  }, [selectedContact, conversations, fetchMessages ]);

  // feteh conversations regularly
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // auto scroll down when message appear

  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: "auto" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // set startTyping and stoptyping State

  useEffect(() => {
    if (message && selectedContact) {
      startTyping(selectedContact?._id);

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        stopTyping(selectedContact?._id);
      }, 2000);
    }

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  });

  //handle file chnage

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      setSelectedFile(file);
      setShowFileMenu(false);

      if (file.type.startsWith("image/")) {
        setFilePreview(URL.createObjectURL(file));
      }
    }
  };

  //handle sendMessage

  const handleSendMessage = async () => {
    if (!selectedContact._id) return;
    setFilePreview(null);

    try {
      const formData = new FormData();
      formData.append("senderId", user?._id);
      formData.append("receiverId", selectedContact?._id);

      //status

      const status = online ? "deliverd" : "send";
      formData.append("messageStatus", status);

      //if there is file then include it form data

      if (selectedFile) {
        formData.append("media", selectedFile, selectedFile.name);
      }

      // if there is input content
      if (message.trim()) {
        formData.append("content", message.trim());
      }

      // if both are absence then return
      if (!message.trim() && !selectedFile) return;

      //call send message sate
      await sendMessage(formData);

      //in last remove state
      setMesage("");
      setFilePreview(null);
      setSelectedFile(null);
      setShowFileMenu(false);
    } catch (error) {
      console.error(error);
    }
  };

  // render date according to user status

  const renderDateSeprator = (date) => {
    if (!isValidDate(date)) return null;

    let dateString;
    if (isToday(date)) {
      dateString = "Today";
    } else if (isYesterday(date)) {
      dateString = "Yesterday";
    } else {
      dateString = format(date, "EEEE, MMMM d");
    }

    return (
      <div className="flex justify-center my-4">
        <span
          className={`px-4 py-2 rounded-full text-sm ${
            theme === "dark"
              ? "bg-gray-700 text-gray-300"
              : "bg-gray-300 text-gray-700"
          }`}
        >
          {dateString}
        </span>
      </div>
    );
  };

//   //grouped messages

//   const groupedMessages = useMemo(() => {
//   const msgs = Array.isArray(messages) ? messages : [];

//   return msgs.reduce((acc, msg) => {
//     if (!msg?.createdAt) return acc;

//     const date = new Date(msg.createdAt);
//     if (!isValidDate(date)) return acc;

//     const key = format(date, "yyyy-MM-dd");
//     if (!acc[key]) acc[key] = [];
//     acc[key].push(msg);

//     return acc;
//   }, {});
// }, [messages]);

// const msgs = Array.isArray(messages) ? messages : [];

// const groupedMessages = msgs.reduce((acc, msg) => {
//   if (!msg.createdAt) return acc;

//   const date = new Date(msg.createdAt);
//   const key = format(date, "yyyy-MM-dd");

//   if (!acc[key]) acc[key] = [];
//   acc[key].push(msg);

//   return acc;
// }, {});




  // console.log("Grouped Mesages", groupedMessages);

  console.log("messages", messages);
  // console.log("conversations", conversations);

  //handle add reaction
  const handleReaction = ({ messageId, emoji }) => {
    addReaction(messageId, emoji);
  };

  // console.log("isTyping",typing);

  //if there is not anu selected contact then show this
  if (!selectedContact) {
    return (
      <div className=" h-screen mx-auto text-center  flex items-center justify-center">
        <p
          className={` absolute top-10 text-xs md:text-sm  flex items-center justify-center gap-2  font-semibold ${
            theme === "dark" ? "text-gray-500" : "text-gray-600"
          }`}
        >
          <Lock className="size-4" />
          Your personal messages are end-to-end encrypted
          <Lock className="size-4" />
        </p>
        <div className="max-w-md">
          <img
            src={ChatWindowDefaultImage}
            alt="chat_window_image"
            className="h-full w-full object-cover overflow-hidden"
          />
          <h2
            className={`text-2xl font-bold ${
              theme === "dark" ? "text-white" : "text-black"
            }`}
          >
            Select the conversation to start chatting
          </h2>
          <p
            className={`text-sm ${
              theme === "dark" ? "text-gray-400" : "text-gray-600"
            }`}
          >
            choose the contact from the list on the left to begin messaging
          </p>
        </div>
      </div>
    );
  }

  // console.log("Selected Contact",selectedContact);
  // console.log("renderDateSeparator" , renderDateSeprator(new Date(Date.now())));

  return (
    <div className="h-screen w-full flex flex-col">
      <div
        className={`flex items-center p-4 ${
          theme === "dark"
            ? "bg-[#303430]"
            : "bg-[rgb(239,242,245)] text-gray-600"
        }`}
      >
        <button
          className="mr-3 focus:outline-none"
          onClick={() => setSelectedContact(null)}
        >
          <ArrowLeft className="size-6" />
        </button>
        <img
          src={selectedContact?.profilePicture}
          alt={selectedContact?.username}
          className="size-10 rounded-full object-cover "
        />

        <div className="ml-3 flex-grow">
          <h2 className="font-semibold ">{selectedContact.username}</h2>

          {typing ? (
            <div>Typing...</div>
          ) : (
            <p>
              <p>
                {online
                  ? "Online"
                  : lastSeen
                  ? `Last seen ${format(new Date(lastSeen), "HH:mm")} `
                  : "Offline"}
              </p>
            </p>
          )}
        </div>
        <div className="flex items-center space-x-5">
          <button>
            <Video className="size-7" />
          </button>
          <button>
            <Ellipsis className="size-7" />
          </button>
        </div>
      </div>

       {/* <div
        className={`flex-1 p-4 overflow-y-auto ${
          theme === "dark" ? "bg-[#191a1a]" : "bg-[rgb(241,236,229)]"
        }`}
      >
        {Object.entries(groupedMessages).map(([date, msgs]) => (
          <React.Fragment key={date}>
            {renderDateSeprator(date)}

            {msgs
              .filter(
                (msg) => msg.conversation === selectedContact?.conversation?._id
              )
              .map((msg) => (
                <MessageBubble
                  key={msg._id || msg.temp_id}
                  message={msg}
                  theme={theme}
                  currentUser={user}
                  onReact={handleReaction}
                  deleteMessage={deleteMessage}
                />
              ))}
          </React.Fragment>
        ))}
        <div ref={messageEndRef} />
      </div>  */}
      <div
  className={`flex-1 p-4 overflow-y-auto ${
    theme === "dark" ? "bg-[#191a1a]" : "bg-[rgb(241,236,229)]"
  }`}
>
 {(Array.isArray(messages) ? messages : messages?.data || [])
  .filter(
    (msg) => msg.conversation === selectedContact?.conversation?._id
  )
  .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
  .map((msg, index, arr) => {
    const currentDate = format(new Date(msg.createdAt), "yyyy-MM-dd");
    const prevDate =
      index > 0
        ? format(new Date(arr[index - 1].createdAt), "yyyy-MM-dd")
        : null;

    const showDate = currentDate !== prevDate;

    return (
      <React.Fragment key={msg._id || msg.temp_id}>
        {showDate && renderDateSeprator(new Date(msg.createdAt))}

        <MessageBubble
          message={msg}
          theme={theme}
          currentUser={user}
          onReact={handleReaction}
          deleteMessage={deleteMessage}
        />
      </React.Fragment>
    );
  })}


  <div ref={messageEndRef} />
</div>

      {filePreview && (
        <div className="relative p-4">
          <img
            src={filePreview}
            className="w-80 object-cover mx-auto rounded-md"
          />
          <button
            className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white font-semibold"
            onClick={() => {
              setSelectedFile(null), setFilePreview(null);
            }}
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      <div
        className={`relative p-3 flex items-center space-x-4 ${
          theme === "dark" ? "bg-[#303430]" : "bg-white"
        }`}
      >
        <button
          className="focus:outline-none"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
        >
          <SmilePlus
            className={`size-6 ${
              theme === "dark" ? "text-gray-400" : "text-gray-600 "
            } `}
          />
        </button>

        {showEmojiPicker && (
          <div ref={emojiPickerRef} className="absolute left-0 bottom-16 z-50">
            <Picker
              data={data}
              onEmojiSelect={(emojiObject) => {
                setMesage((prev) => prev + emojiObject.native);
                setShowEmojiPicker(false);
              }}
              theme={theme}
            />
          </div>
        )}

        <div className="relative">
          <button
            onClick={() => setShowFileMenu(!showFileMenu)}
            className="focus:outline-none"
          >
            <Paperclip
              className={`size-6 mt-2 ${
                theme === "dark" ? "text-gray-400" : "text-gray-700"
              }`}
            />
          </button>

          {showFileMenu && (
            <div
              className={`absolute bottom-full left-0 mb-2 rounded-lg shadow-lg ${
                theme === "dark" ? "bg-gray-700" : "bg-white"
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*,video/*"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current.click()}
                className={`flex items-center px-4 py-2 gap-2 w-full transition-colors  ${
                  theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-100"
                }`}
              >
                <ImagePlay className="size-4" /> image/video
              </button>
              <button
                onClick={() => fileInputRef.current.click()}
                className={`flex items-center px-4 py-2 gap-2 w-full transition-colors  ${
                  theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-100"
                }`}
              >
                <FilePlusCorner className="size-4" /> Documents
              </button>
            </div>
          )}
        </div>
        <input 
        type="text"
        value={message}
        onChange={(e) => setMesage(e.target.value)}
        onKeyPress={(e) =>{
          if(e.key === "Enter"){
            handleSendMessage()
          }
        }}
        placeholder="Type a message ..."
        className={`fle-grow w-full px-4 py-2 pl-5 border rounded-full foucs:outline-none focus:ring-2 focus:ring-green-500
          ${theme === "dark" ? "bg-gray-700 text-white border-gray-300" :"bg-white text-black border-gray-700"}
          `}
        />

        <button className="bg-green-500 hover:bg-green-600 rounded-md border px-1 py-1" onClick={handleSendMessage}>
          <Send className="size-6 text-white" />
        </button>
      </div>
    </div>
  );
}

export default ChatWindow;
