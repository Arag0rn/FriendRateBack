import express from 'express';

import authController from '../../controllers/auth-controller.js';



import { userSigninSchema, userSignupSchema, userEmailSchema} from '../../schemas/user-schema.js';


import {authenticate, isEmptyBody, upload} from "../../middlewares/index.js";
import validateBody from '../../decorators/validaterBody.js';



const authRouter = express.Router();

authRouter.post("/register", isEmptyBody, validateBody(userSignupSchema), authController.signup);

authRouter.post("/login", isEmptyBody, validateBody(userSigninSchema), authController.signin);

authRouter.get("/current", authenticate, authController.current);

authRouter.patch("/update", authenticate, authController.updateProfile);

authRouter.get("/verify/:verificationToken", authController.verifyMail);

authRouter.post("/verify", isEmptyBody, authController.verifyMail);

authRouter.patch("/avatars", upload.single("avatar"), authenticate,  authController.patchAvatar);

authRouter.get("/logout", authenticate, authController.signout);

authRouter.delete("/delete/:_id", authenticate, authController.deleteUser)

export default authRouter;