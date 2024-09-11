import User from "../models/User.js";
import jwt from "jsonwebtoken";
import { generateRandomPassword } from "../helpers/createPassword.js";
import { ctrlWrapper } from "../decorators/index.js";

const telegram = async (req, res) => {
    const { id, first_name, last_name, username, photo_url } = req.body.user;
    const { auth_date } = req.body;

    const email = `${username}@telegram.com`;

    const date = new Date(auth_date * 1000);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const formattedDate = `${day}.${month}.${year}`;
  
    const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: "24h" });
  
    let user = await User.findOne({ username });

    if (!user) {
      const password = generateRandomPassword();

      user = new User({
        email,
        password,
        username,
        avatarURL: photo_url,
        verify: true,
        provider: "telegram",
        token,
        birthday: formattedDate,
      });
  
      await user.save();
      console.log("User saved successfully:", user);
    } else {
      console.log("User already exists:", user);
    }

    res.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatarURL: user.avatarURL,
        birthday: user.birthday,
        provider: user.provider,
        verify: user.verify,
      },
      token,
    });
  };

  export default {
    telegram: ctrlWrapper(telegram),
  };