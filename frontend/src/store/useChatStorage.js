import { create } from "zustand";
import { getSocket } from "../services/chat.service";
import { axiosInstance } from "../lib/axiosInstance";
export const useChatStorage = create((set, get) => ({
  conversations: [],
  currentConversation: null,
  messages: [],
  loading: false,
  error: null,
  onlineUsers: new Map(),
  typingUsers: new Map(),

  //socket event listener steup

  initializeSocketListners: () => {
    const socket = getSocket();
    if (!socket) return;

    //remove exisiting listners and prevent dublicate handlers

    socket.off("recevie_message");
    socket.off("user_typing");
    socket.off("user_status");
    socket.off("send_message");
    socket.off("message_error");
    socket.off("mesage_delected");

    //listen for incoming messages

    socket.on("receive_message", (message) => {});

    //confrom message delivery

    socket.on("send_message", (message) => {
      set((state) => ({
        messages: state.messages.map((msg) =>
          msg._id === message._id ? { ...msg } : msg
        ),
      }));
    });

    //update message status

    socket.on("message_status_update", ({ messageId, messageStatus }) => {
      set((state) => ({
        messages: state.messages.map((msg) =>
          msg._id === messageId ? { ...msg, messageStatus } : msg
        ),
      }));
    });

    //handle reactions on messages

    socket.on("reaction_update", ({ messageId, reactions }) => {
      set((state) => ({
        messages: state.messages.map((msg) =>
          msg._id === messageId ? { ...msg, reactions } : msg
        ),
      }));
    });

    //handle remove message from local storage

    socket.on("mesage_delected", ({ deletetMessageId }) => {
      set((state) => ({
        messages: state.messages.filter((msg) => msg._id !== deletetMessageId),
      }));
    });

    //handle any message sending error

    socket.on("message_error", (error) => {
      console.error("message error", error);
    });

    //listner for typing users

    socket.on("user_typing", ({ userId, conversationId, isTyping }) => {
      set((state) => {
        const newTypingUsers = new Map(state.typingUsers);

        if (!newTypingUsers.has(conversationId)) {
          newTypingUsers.set(conversationId, new Set());
        }

        const typingSet = newTypingUsers.get(conversationId);

        if (isTyping) {
          typingSet.add(userId);
        } else {
          typingSet.delete(userId);
        }

        return { typingUsers: newTypingUsers };
      });
    });

    //track user's online or offline

    socket.on("user_status", ({ userId, isOnline, lastSeen }) => {
      set((state) => {
        const newOnlineUsers = new Map(state.onlineUsers);
        newOnlineUsers.set(userId, { isOnline, lastSeen });
        return { onlineUsers: newOnlineUsers };
      });
    });

    //emit status check for all users in conversation list

    const { conversations } = get();
    if (conversations?.data?.length > 0) {
      conversations?.data?.forEach((conv) => {
        const otherUser = conv.participants.find(
          (p) => p._id !== get().currentUser._id
        );

        if (otherUser._id) {
          socket.emit("get_user_status", otherUser._id, () => {
            set((state) => {
              const newOnlineUsers = new Map(state.onlineUsers);

              newOnlineUsers.set(state.userId, {
                isOnline: state.isOnline,
                lastSeen: state.lastSeen,
              });

              return { onlineUsers: newOnlineUsers };
            });
          });
        }
      });
    }
  },

  setCurrentUser: (user) => set({ currentUser: user }),

  //fetch conversations in conversations state

  fetchConversations: async () => {
    set({ loading: true, error: false });
    try {
      const { data } = await axiosInstance.get("/message/conversations");

      set({ conversations: data, loading: false });

      get().initializeSocketListners();

      return data;
    } catch (error) {
      set({
        error: error?.response?.data?.message || error.message,
        loading: false,
      });
      return null;
    }
  },

  //fetch messages in state

  fetchMessages: async (conversationId) => {
    if (!conversationId) return;

    set({ loading: true, error: null });

    try {
      const { data } = await axiosInstance.get(
        `/message/conversation/${conversationId}/messages`
      );

      const messageArray = data.dada || data || [];

      set({
        messages: messageArray,
        currentConversation: conversationId,
        loading: false,
      });

      //mark unread messages as read

      const { markMessageAsRead } = get();
      markMessageAsRead();

      return messageArray;
    } catch (error) {
      console.log("error while fetch messages", error);

      set({
        error: error?.response?.data?.message || error.message,
        loading: false,
      });
      return [];
    }
  },

  //send message in real-time
  sendMessage: async (formData) => {
    const senderId = formData.get("senderId");
    const receiverId = formData.get("receiverId");
    const media = formData.get("media");
    const content = formData.get("content");
    const messageStatus = formData.get("messageStatus");

    // const socket = getSocket();

    const { conversations } = get();
    let conversationId = null;
    if (conversations?.data.length > 0) {
      const conversation = conversations?.data?.find(
        (conv) =>
          conv.participants.some((p) => p._id === senderId) &&
          conv.participants.some((p) => p._id === receiverId)
      );
      if (conversation?._id) {
        conversationId = conversation?._id;
        set({ currentConversation: conversationId });
      }
    }

    //send tempory message before before actual message

    const prev = Array.isArray(get().messages)
      ? get().messages
      : Array.isArray(get().messages?.data)
      ? get().messages.data
      : [];

    const temp_id = `id-${Date.now()}`;

    const optimisticMessage = {
      _id: temp_id,
      sender: { _id: senderId },
      receiver: { _id: receiverId },
      conversation: conversationId,
      imageOrVideoUrl:
        media && typeof media !== "string" ? URL.createObjectURL(media) : null,
      content: content,
      contentType: media
        ? media.type.startsWith("image")
          ? "image"
          : "video"
        : "text",
      createdAt: new Date().toISOString(),
      messageStatus,
    };

    set({
      messages: [...prev, optimisticMessage],
    });

    try {
      const { data } = await axiosInstance.post(
        "/message/send-message",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      const messageData = data.data || data;

      //repalce optimistics message with real-one
      set((state) => ({
        messages: state.messages.map((msg) =>
          msg._id === temp_id ? messageData : msg
        ),
      }));

      return messageData;
    } catch (error) {
      console.error("Error sending message", error);
      set((state) => ({
        messages: state.messages.map((msg) =>
          msg._id === temp_id ? { ...msg, messageStatus: "failed" } : msg
        ),
        error: error?.response?.data?.message || error.message,
      }));
    }
  },

  //receive message in real-time
  receiveMessage: (message) => {
    if (!message) return;

    const { currentConversation, currentUser, messages } = get();

    const messageExisits = messages.some((msg) => msg._id === message._id);

    if (messageExisits) return;

    if (message.conversation === currentConversation) {
      set((state) => ({
        messages: [...state.messages, message],
      }));

      //automatically mark as read

      if (message.receiver._id === currentUser._id) {
        get().markMessageAsRead();
      }
    }

    //update conversation preview and unread count
    set((state) => {
      const updateConversations = state?.conversations?.data?.map((conv) => {
        if (conv._id === message.conversation) {
          return {
            ...conv,
            lastSeen: message,
            unreadCount:
              message.receiver._id === currentUser._id
                ? (conv.unreadCount || 0) + 1
                : conv.unreadCount || 0,
          };
        }
      });
      return {
        conversations: {
          ...state.conversations,
          data: updateConversations,
        },
      };
    });
  },

  //mark message as read

  markMessageAsRead: async () => {
    const { messages, currentUser } = get();
    if (!messages?.length || !currentUser) return;

    const unreadIds = messages.filter(
      (msg) =>
        msg.messageStatus !== "read" && msg?.receiver?._id === currentUser?._id
    );

    if (unreadIds.length === 0) return 0;

    try {
      await axiosInstance.put("/message/messages/read", {
        messageIds: unreadIds,
      });
      set((state) => ({
        messages: state.messages.map((msg) =>
          unreadIds.includes(msg._id) ? { ...msg, messageStatus: "read" } : msg
        ),
      }));
      const socket = getSocket();
      if (socket) {
        socket.emit("message_read", {
          messageIds: unreadIds,
          senderId: messages[0]?.sender?._id,
        });
      }
    } catch (error) {
      set({
        error: error?.response?.data?.message || error.message,
        loading: false,
      });
      return null;
    }
  },

  //delete message in real time

  deleteMessage: async (messageId) => {
    try {
      await axiosInstance.delete(`/message/messages/${messageId}`);
      set((state) => ({
        messages: state.messages?.filter((msg) => msg._id !== messageId),
      }));

      return true;
    } catch (error) {
      set({
        error: error?.response?.data?.message || error.message,
        loading: false,
      });
      return false;
    }
  },

  //add or change the reaction

  addReaction: (messageId, emoji) => {
    const socket = getSocket();
    const { currentUser } = get();

    if (socket && currentUser) {
      socket.emit("add_reaction", {
        messageId,
        emoji,
        userId: currentUser?._id,
      });
    }
  },

  // start typing status

  startTyping: (receiverId) => {
    const socket = getSocket();
    const { currentConversation } = get();

    if (socket && currentConversation && receiverId) {
      socket.emit("typing_start", {
        conversationId: currentConversation,
        receiverId,
      });
    }
  },

  // stop typing status

  stopTyping: (receiverId) => {
    const socket = getSocket();
    const { currentConversation } = get();

    if (socket && currentConversation && receiverId) {
      socket.emit("typing_stop", {
        conversationId: currentConversation,
        receiverId,
      });
    }
  },

  // typing status

  isTypingUser: (userId) => {
    const { typingUsers, currentConversation } = get();

    if (
      !currentConversation ||
      !typingUsers.has(currentConversation) ||
      !userId
    ) {
      return false;
    }
    return typingUsers.get(currentConversation).has(userId);
  },

  // is user online status

  isUserOnline: (userId) => {
    if (!userId) return null;
    const { onlineUsers } = get();

    return onlineUsers.get(userId)?.isOnline || false;
  },

  // get lastSeen of user

  getUserLastSeen: (userId) => {
    if (!userId) return null;
    const { onlineUsers } = get();

    return onlineUsers.get(userId)?.lastSeen || null;
  },

  //clean up function

  cleanUp: () => {
    set({
      conversations: [],
      currentConversation: null,
      messages: [],
      onlineUsers: new Map(),
      typingUsers: new Map(),
    });
  },
}));
