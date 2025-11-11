import React, { useRef, useState } from "react";
import { ChatMessage } from "../../components/ui/ChatBubble"; // <-- same file

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
  "🎉"
];


  const isUserMessage = message?.sender?._id === currentUser?._id;
  const align = isUserMessage ? "end" : "start"; // clean prop

  const handleReact = (emoji) => {
    onReact(message?._id, emoji);
    setShowEmojiPicker(false);
    setShowReaction(false);
  };

  if (!message) return null;

  return (
    <div className="relative w-full  md:max-w-[70vw] ">
      <div className="p-4 mx-auto font-sans" ref={messageRef}>
        <ChatMessage
          align={align}               // start / end
          message={message.content}
          theme={theme}
          type={message?.contentType}
          messageData={message}
        />
      </div>
    </div>
  );
}

export default MessageBubble;