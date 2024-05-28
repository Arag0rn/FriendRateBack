import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/User.js";
import gravatar from "gravatar";
import path from "path";
import jimp from "jimp";
import { nanoid } from "nanoid";

import { HttpError, sendEmail } from "../helpers/index.js";

import { ctrlWrapper } from "../decorators/index.js";
import { io } from "../server.js";

const postersPath = path.resolve("public", "avatar");

dotenv.config();

const { JWT_SECRET, BASE_URL } = process.env;

const signup = async (req, res) => {
  const { email, password } = req.body;

  const hashPassword = await bcrypt.hash(password, 10);
  const verificationToken = nanoid();

  const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: "1h" });
  const avatarURL = gravatar.url(email, { s: "200", r: "pg", d: "mm" });

  const user = await User.findOne({ email });
  if (user) {
    throw HttpError(409, "Email in use");
  }

  const newUser = await User.create({
    ...req.body,
    avatarURL,
    password: hashPassword,
    verificationToken,
    token,
    provider: "form",
  });

  const verifyEmail = {
    to: email,
    subject: "Verify email",
    html: `<a target="_blank" href="${BASE_URL}/api/user/verify/${verificationToken}">Click verify email</a>`,
  };
  await sendEmail(verifyEmail);

  res.status(201).json({
    user: {
      username: newUser.username,
      email: newUser.email,
      avatarURL: newUser.avatarURL,
      provider: newUser.provider,

      verify: false,
    },
    token,
  });
};

async function verifyMail(req, res) {
  const { verificationToken } = req.params;
  console.log(verificationToken);
  const user = await User.findOne({ verificationToken });
  if (!user) {
    throw HttpError(401, "Email not found");
  }

  await User.updateOne(
    { verificationToken },
    { verify: true, verificationToken: "" }
  );

  io.emit("user_verified", user);

  res.json({
    message: "Verification successful",
  });
}

const resendVerify = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    throw HttpError(401, "Email not found");
  }
  if (user.verify) {
    throw HttpError(400, "Verification has already been passed");
  }
  const verifyEmail = {
    to: email,
    subject: "Verify email",
    html: `<a target="_blank" href="${BASE_URL}/api/user/verify/${user.verificationToken}">Click verify email</a>`,
  };

  await sendEmail(verifyEmail);

  res.json({
    message: "Verification email sent",
  });
};

const signin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      throw HttpError(401, "Email or password is wrong");
    }

    const passwordCompare = await bcrypt.compare(password, user.password);
    if (!passwordCompare) {
      throw HttpError(401, "Email or password is wrong");
    }

    const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: "24h" });

    res.json({
      user: user,
      token,
    });
  } catch (error) {
    // перевірка на токен
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      const newToken = jwt.sign({ email }, JWT_SECRET, { expiresIn: "24h" });
      await User.findOneAndUpdate({ email }, { token: newToken });

      res.status(401).json({
        message: "Token refreshed",
        newToken,
      });
    } else {
      res.status(401).json({
        message: "Authentication error",
        error: error.message,
      });
    }
  }
};

const deleteUser = async (req, res) => {
  const { _id } = req.user;
  const deletedUser = await User.findByIdAndDelete({ _id });
  if (!deletedUser) {
    throw HttpError(401, `User with ${_id} not found`);
  }

  res
    .status(200)
    .json({ message: `User with ID ${_id} has been deleted successfully` });
};

const current = (req, res, next) => {
  req.user.token = undefined;
  res.status(200).json(req.user);
};

const signout = async (req, res) => {
  const { _id } = req.user;
  await User.findByIdAndUpdate(_id, { token: "" });

  res.json({
    message: "Signout success",
  });
};

const updateProfile = async (req, res, next) => {
  try {
    const { _id } = req.user;
    const { username, password, ...otherFields } = req.body;

    if (username && username !== req.user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        throw new Error(`Username ${username} is already taken`);
      }
    }

    const updateFields = { ...otherFields };
    if (password && password !== req.user.password) {
      updateFields.password = await bcrypt.hash(password, 10);
    }
    if (username && username !== req.user.username) {
      updateFields.username = username;
    }

    const result = await User.findOneAndUpdate(
      { _id },
      updateFields,
      { new: true }
    );

    if (!result) {
      throw new Error(`User with email=${_id} not found`);
    }

    res.json(result);
  } catch (error) {
    next(error);
  }
};

const patchAvatar = async (req, res) => {
  const { _id } = req.user;
  const { path: oldPath, filename } = req.file;
  const newPath = path.join(postersPath, filename);
  const avatar = path.join("avatar", filename);

  const image = await jimp.read(oldPath);
  await image.resize(250, 250);
  await image.writeAsync(newPath);
  await User.findByIdAndUpdate(_id, { avatarURL: avatar });

  res.status(200).json({ avatarURL: avatar });
};

const setRate = async (req, res, next) => {

const { username, rate } = req.body;
const user = await User.findOne({ username });

if (!user) {
  return res.status(404).json({ error: 'User not found' });
}

const updatedUser = await User.findByIdAndUpdate(
  user._id,
  {
    $inc: { rate, ratingCount: 1 }
  },
  { new: true }
);
res.status(200).json(updatedUser);

}

const getAllUsers = async (req, res) => {
  const { users } = req.body;
  const foundUsers = await User.find({ _id: { $in: users } });
  res.status(200).json(foundUsers);
};

const getAllUsersWithoutId = async (req, res) => {
  const { users } = req.body;
  const foundUsers = await User.find();
  res.status(200).json(foundUsers);
};

export default {
  signup: ctrlWrapper(signup),
  signin: ctrlWrapper(signin),
  verifyMail: ctrlWrapper(verifyMail),
  resendVerify: ctrlWrapper(resendVerify),
  current: ctrlWrapper(current),
  signout: ctrlWrapper(signout),
  patchAvatar: ctrlWrapper(patchAvatar),
  updateProfile: ctrlWrapper(updateProfile),
  deleteUser: ctrlWrapper(deleteUser),
  getAllUsers: ctrlWrapper(getAllUsers),
  setRate:ctrlWrapper(setRate),
  getAllUsersWithoutId:ctrlWrapper(getAllUsersWithoutId),
};
