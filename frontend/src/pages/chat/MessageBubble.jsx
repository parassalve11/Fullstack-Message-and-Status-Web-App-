import React, { useRef, useState } from "react";

import { format } from "date-fns";
import {
  Check,
  CheckCheck,
  Copy,
  EllipsisVertical,
  Plus,
  SmileIcon,
  Trash2,
  X,
} from "lucide-react";

import useOutsideClick from "../../hooks/useOutsideClick";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";

function MessageBubble({
  message,
  onReact,
  theme,
  currentUser,
  deleteMessage,
}) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showReaction, setShowReaction] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  const messageRef = useRef(null);
  const optionRef = useRef(null);
  const reactionMenuRef = useRef(null);
  const emojiPickerRef = useRef(null);

 
  const quickReactions = ["👍", "❤️", "😂", "🙏", "💯", "🎉"];

  const senderId = message?.sender?._id ?? message?.sender;
  const isUserMessage = String(currentUser?._id) === String(senderId);

  const handleReact = (emoji) => {
    onReact(message?._id, emoji);
    setShowEmojiPicker(false);
    setShowReaction(false);
  };

  useOutsideClick(emojiPickerRef, () => {
    if (showEmojiPicker) setShowEmojiPicker(false);
  });
  useOutsideClick(reactionMenuRef, () => {
    if (showReaction) setShowReaction(false);
  });
  useOutsideClick(optionRef, () => {
    if (showOptions) setShowOptions(false);
  });

  if (!message) return null;

  const bubbleClass = isUserMessage ? "chat-end" : "chat-start";
  const bubbleContentClass = isUserMessage
    ? `chat-bubble md:max-w-[50%] min-w-[130px] ${
        theme === "dark" ? "bg-[#144d38] text-white" : "bg-[#d9fdd3] text-black"
      }`
    : `chat-bubble md:max-w-[50%] min-w-[130px] ${
        theme === "dark" ? "bg-[#144d38] text-white" : "bg-gray-200 text-black"
      }`;

  return (
    <div className={`chat ${bubbleClass}`}>
      <div className={`${bubbleContentClass} relative group`} ref={messageRef}>
        <div className="">
          {message.contentType === "text" && (
            <div className="whitespace-pre-wrap break-words ">
              {message?.content}
            </div>
          )}
          {message.contentType === "image" && (
            <div>
              <img
                src={message?.imageOrVideoUrl ?? ""}
                alt="image/video"
                className="rounded-lg object-contain max-w-xs"
              />
            </div>
          )}

          <div className="self-end flex items-center justify-end opacity-60  gap-1 text-[10px] ml-2 mt-1">
            <span>{format(new Date(message.createdAt), "HH:mm")}</span>
            {isUserMessage && (
              <>
                {message.messageStatus === "send" && (
                  <Check className="size-3" />
                )}
                {message.messageStatus === "delivered" && (
                  <CheckCheck className="size-3" />
                )}
                {message.messageStatus === "read" && (
                  <CheckCheck className="size-3 text-blue-700 font-medium" />
                )}
              </>
            )}
          </div>
        </div>

        <div className="absolute top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setShowOptions((prev) => !prev)}
            className={`p-1 rounded-full ${
              theme === "dark" ? "text-white" : "text-gray-800"
            }`}
          >
            <EllipsisVertical className="size-4 " />
          </button>
        </div>
        <div
          className={`absolute 
    ${isUserMessage ? "-left-10" : "-right-10"}
    top-1/2 -translate-y-1/2 
    opacity-0 group-hover:opacity-100
    transform  duration-300 ease-out flex-col gap-2
    ${
      isUserMessage ? "group-hover:-translate-x-2" : "group-hover:translate-x-2"
    }
  `}
        >
          <button
            onClick={() => setShowReaction(!showReaction)}
            className={`p-2 rounded-full ${
              theme === "dark" ? "bg-[#2c2233] " : "bg-white hover:bg-gray-100"
            }`}
          >
            <SmileIcon
              className={`size-5 ${
                theme === "dark" ? "text-gray-300" : "text-gray-600"
              }`}
            />
          </button>
        </div>

        {showReaction && (
          <div
            ref={reactionMenuRef}
            className={`absolute -top-8 max-w-xl ${
              isUserMessage ? "left-0" : " left-36"
            } transform -translate-x-1/2 flex items-center bg-[#202c33]/90 px-2 py-1.5 shadow-lg rounded-full gap-1 z-50 `}
          >
            {quickReactions.map((emoji, index) => (
              <button
                key={index}
                onClick={() => handleReact(emoji)}
                className="hover:scale-125 transition-transform p-1 "
              >
                {emoji}
              </button>
            ))}
            <div className="w-[1px] h-5 bg-gray-600 mx-1" />
            <button
              className="hover:bg-[#ffffff1a] rounded-full p-1"
              onClick={() => setShowEmojiPicker(true)}
            >
              <Plus className="size-4 text-gray-400 " />
            </button>
          </div>
        )}
        {showEmojiPicker && (
          <div ref={emojiPickerRef} className="absolute left-0 mb-6 z-50">
            <div className="relative">
              <Picker
                data={data}
                onEmojiSelect={(emojiObject) => handleReact(emojiObject.native)}
                theme={theme}
              />
              <button
                onClick={() => setShowEmojiPicker(false)}
                className="absolute right-2 top-2 text-gray-500 hover:text-gray-700 "
              >
                <X />
              </button>
            </div>
          </div>
        )}

        {message.reactions && message.reactions.length > 0 && (
          <div
            className={`absolute -bottom-5 ${
              isUserMessage ? "right-2" : "left-2"
            } ${
              theme === "dark" ? "bg-[#2a3942]" : "bg-gray-200"
            } rounded-full px-2 shadow-md z-20`}
          >
            {message.reactions.map((reaction, index) => (
              <span key={index} className="mr-1">
                {reaction.emoji}
              </span>
            ))}
          </div>
        )}

        {showOptions && (
          <div
            ref={optionRef}
            className={`absolute top-8 right-1 z-20 w-36  rounded-xl shadow-lg  py-2 text-sm ${
              theme === "dark"
                ? "bg-gray-700 hover:bg-gray-600"
                : "bg-gray-400 hover:bg-gray-300"
            }`}
          >
            <button
              className="flex items-center w-full px-4 py-2 gap-4 rounded-lg"
              onClick={() => {
                if (message.contentType === "text") {
                  navigator.clipboard.writeText(message?.content);
                }
                setShowOptions(false);
              }}
            >
              <Copy className="size-4" />
              <span>Copy</span>
            </button>
            {isUserMessage && (
              <button
                className="flex items-center w-full px-4 py-2 gap-4 rounded-lg text-red-500"
                onClick={() => {
                  deleteMessage(message?._id), setShowOptions(false);
                }}
              >
                <Trash2 className="size-4" />
                <span>Delete</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default MessageBubble;
