import express from 'express';
import { activateUser, checkrandomstring, forgotpassword, loginUser, registerUser, resetpassword } from '../Controllers/userController.js';
import { verifyToken } from '../MiddleWare/verifyToken.js';
const router = express.Router();

router.post('/signup',registerUser);
router.post('/activate-user/:str',activateUser);
router.post('/signin',loginUser);
router.post('/forgot-password',forgotpassword);
router.get('/check-str/:str',checkrandomstring);
router.post('/reset-password',resetpassword);
export default router;