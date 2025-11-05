
import express, { Router } from 'express'
import { checkAuthenticatedUser, getAllUser, logout, sendOtp, updateProfile, verifyOtp } from '../controllers/auth.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { multerMiddleware } from '../lib/cloudinary.js';

const router = Router();


router.post('/send-otp',sendOtp);
router.post('/verify-otp',verifyOtp);
router.post('/logout',logout)

router.put('/update-profile',authenticateToken,multerMiddleware,updateProfile)


router.get('/check-auth',authenticateToken,checkAuthenticatedUser)

router.get('/users',authenticateToken,getAllUser)


export default router;