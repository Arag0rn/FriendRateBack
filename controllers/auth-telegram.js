import User from "../models/User.js";
import jwt from "jsonwebtoken";
import { generateRandomPassword } from "../helpers/createPassword.js";
import { ctrlWrapper } from "../decorators/index.js";

const telegram = async (req, res) => {
    try {
      const { id, first_name, last_name, username, photo_url } = req.body.user;
      const { auth_date, hash } = req.body;
      const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: "24h" });
  
      const date = new Date(auth_date * 1000);
  
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
  
      const formattedDate = `${day}.${month}.${year}`;

      const password = generateRandomPassword();
  
      let user = await User.findOne({ id });
  
      if (!user) {
        user = new User({
          email: `${username}@telegram.com`,
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
  
      res.status(200).json({ message: "User authenticated successfully", user });
    } catch (error) {
      console.error("Error saving user:", error);
      res.status(500).json({ message: "Server error", error });
    }
  };

  export default {
    telegram: ctrlWrapper(telegram),
}