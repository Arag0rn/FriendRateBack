import jwt from "jsonwebtoken";
import {HttpError} from "../helpers/index.js";
import User from "../models/User.js";
import dotenv from "dotenv";
import { ctrlWrapper } from "../decorators/index.js";
dotenv.config();

const {JWT_SECRET} = process.env;

const authenticate = async(req, res, next)=>{
    const {authorization} = req.headers;
    console.log(authorization);
        if(!authorization){
            throw HttpError(401, "Authorization header not found");
        }
    const [bearer, token] = authorization.split(" ");
    if (bearer !== "Bearer"){
       return next(HttpError(401))
    }
    try {
        const {email} = jwt.verify(token, JWT_SECRET);
        const user = await User.findOne({ email });
        console.log(user);
        if(!user) {
            throw HttpError(401, "user not found");
        }
        req.user = user;
        next();
    } catch (error) {
        throw HttpError(401, error.message);
    }
}

export default ctrlWrapper(authenticate);