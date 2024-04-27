import express from "express";

import userUnregController from "../../controllers/user-ureg-controller.js";





const userRouter = express.Router();

userRouter.post("/singup", userUnregController.signup);

userRouter.get("/current", userUnregController.current);



export default userRouter;
