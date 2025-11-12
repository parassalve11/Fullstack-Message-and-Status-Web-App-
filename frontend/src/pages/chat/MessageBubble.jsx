import React, { useEffect, useRef, useState } from "react";
import { ChatMessage } from "../../components/ui/ChatBubble"; // <-- same file
import useUserStorage from "../../store/useUserStorage";
import { format } from "date-fns";
import { Check, CheckCheck, EllipsisVertical, SmileIcon } from "lucide-react";
import {motion as Motion} from 'framer-motion'

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

  const { user } = useUserStorage();
  const quickReactions = [
    "👍",
    "❤️",
    "😂",
    "🔥",
    "😮",
    "😢",
    "👏",
    "🙏",
    "💯",
    "🎉",
  ];

  const senderId = message?.sender?._id ?? message?.sender;
  const isUserMessage = String(currentUser?._id) === String(senderId);

  //  if(!isUserMessage) return

  console.log("isUserMessage", isUserMessage);
  console.log("message.sender._id", message?.sender?._id);
  console.log("currentUser", currentUser._id);

  console.log("type of currentUser_id", typeof currentUser._id);
  console.log("type of sender", typeof message?.sender?._id);

  const handleReact = (emoji) => {
    onReact(message?._id, emoji);
    setShowEmojiPicker(false);
    setShowReaction(false);
  };

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
  className={`absolute flex flex-col gap-2
    ${isUserMessage ? "-left-5" : "-right-5"}
    top-1/2 -translate-y-1/2 
    opacity-0 group-hover:opacity-100
    transform transition-all duration-300 ease-out
    ${isUserMessage ? "group-hover:-translate-x-2" : "group-hover:translate-x-2"}
  `}
>
  <button>
    <SmileIcon
      className={`size-5 ${
        theme === "dark" ? "text-gray-300" : "text-gray-600"
      }`}
    />
  </button>
</div>

      </div>
    </div>
  );
}

export default MessageBubble;
