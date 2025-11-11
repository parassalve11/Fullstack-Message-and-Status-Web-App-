import React from "react";
import { format } from "date-fns";
import { Check, CheckCheck } from "lucide-react";

/* --------------------------------------------------------------- */
/*  Chat – decides left / right alignment                           */
/* --------------------------------------------------------------- */
const Chat = ({ children, align }) => (
  <div
    className={`flex ${
      align === "start" ? "justify-start" : "justify-end"
    } px-3`}
  >
    {/* 40 % max-width → forces wrap when content is longer */}
    <div className="max-w-[40%] md:max-w-[40%]">{children}</div>
  </div>
);

/* --------------------------------------------------------------- */
/*  ChatBubble – speech-bubble with tail, timestamp, status icons   */
/* --------------------------------------------------------------- */
const ChatBubble = ({ children, align, theme, messageData }) => {
  const isStart = align === "start";
  const isDark = theme === "dark";

  const bg = isStart
    ? isDark
      ? "bg-[#2b2b2b] text-white"
      : "bg-gray-100 text-gray-900"
    : isDark
    ? "bg-[#144d38] text-white"
    : "bg-emerald-600 text-white";

  const tail = isStart
    ? isDark
      ? "before:border-r-[#2b2b2b]"
      : "before:border-r-gray-100"
    : isDark
    ? "before:border-l-[#144d38]"
    : "before:border-l-emerald-600";

  return (
    <div
      className={`
        relative flex flex-col px-4 py-3 rounded-2xl text-xs md:text-sm shadow-md
        ${bg} ${isStart ? "rounded-tl-sm" : "rounded-tr-sm"}
        /* ---- tail (border trick) ---- */
        before:content-[''] before:absolute before:w-0 before:h-0
        before:border-8 before:border-solid before:border-transparent
        ${
          isStart
            ? "before:left-0 before:top-4 before:-ml-2"
            : "before:right-0 before:top-4 before:-mr-2"
        }
        ${tail}
      `}
    >
      {/* Message content – wraps automatically */}
      <div className="">
        <div className="whitespace-pre-wrap break-words">{children}</div>

        {/* Timestamp + status */}
        <div
          className=" mt-1
      text-[10px]
      opacity-60
      inline-flex
      items-center
      gap-1
      whitespace-nowrap
      shrink-0
      float-right"
        >
          <span>{format(new Date(messageData?.createdAt), "HH:mm")}</span>
          {messageData.messageStatus === "send" && (
            <Check className="w-4 h-3" />
          )}
          {messageData.messageStatus === "delivered" && (
            <CheckCheck className="w-4 h-3" />
          )}
          {messageData.messageStatus === "read" && (
            <CheckCheck className="w-4 h-3 text-blue-700 font-semibold" />
          )}
        </div>
      </div>
    </div>
  );
};

/* --------------------------------------------------------------- */
/*  Exported component – used by MessageBubble                     */
/* --------------------------------------------------------------- */
export const ChatMessage = ({ message, align, theme, type, messageData }) => (
  <Chat align={align}>
    <ChatBubble align={align} theme={theme} messageData={messageData}>
      {type === "image" && (
        <img
          src={message?.imageOrVideoUrl}
          alt="chat-img"
          className="rounded-xl max-w-full h-auto"
        />
      )}
      {type === "video" && (
        <video
          src={message?.imageOrVideoUrl}
          controls
          className="rounded-xl max-w-full h-auto"
        />
      )}
      {(!type || type === "text") && message}
    </ChatBubble>
  </Chat>
);
