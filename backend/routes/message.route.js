import { Router } from "express";
import { authenticateToken } from '../middleware/auth.middleware.js';
import { multerMiddleware } from "../lib/cloudinary.js";
import { deleteMessage, getConversation, getMessages, markAsRead, sendMessage } from "../controllers/message.controller.js";



const router = Router();


router.post('/send-message',authenticateToken,multerMiddleware,sendMessage);
router.get('/conversations',authenticateToken,getConversation)
router.get('/conversation/:conversationId/messages',authenticateToken,getMessages);
router.put('/messages/read',authenticateToken,markAsRead);

router.delete('/messages/:messageId',authenticateToken,deleteMessage);



export default router