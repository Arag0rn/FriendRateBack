import axios from "axios";
import queryString from "query-string";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { generateRandomPassword } from "../helpers/createPassword.js";

const { JWT_SECRET, BASE_URL } = process.env;

export const googleAuth = async (req, res) => {
  const stringifiedParams = queryString.stringify({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: `${process.env.BASE_URL}/api/user/google-redirect`,
    scope: [
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile",
    ].join(" "),
    response_type: "code",
    access_type: "offline",
    prompt: "consent",
  });
  return res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${stringifiedParams}`);
};

export const googleRedirect = async (req, res) => {
  const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
  const urlObj = new URL(fullUrl);
  const urlParams = queryString.parse(urlObj.search);
  const code = urlParams.code;

  try {
    const tokenData = await axios({
      url: `https://oauth2.googleapis.com/token`,
      method: "post",
      data: {
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: `${process.env.BASE_URL}/api/user/google-redirect`,
        grant_type: "authorization_code",
        code,
      },
    });

    const accessToken = tokenData.data.access_token;
    const refreshToken = tokenData.data.refresh_token;

    const userData = await axios({
      url: "https://www.googleapis.com/oauth2/v3/userinfo",
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const { email, name: username, picture: avatarURL } = userData.data;

    let user = await User.findOne({ email });
    const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: "1h" });

    if (user) {

      user = await User.findByIdAndUpdate(user._id, {
        token: token,
        ...(refreshToken && { refreshToken }),
      }, { new: true });
    } else {
      const password = generateRandomPassword();

      user = new User({
        email,
        username,
        avatarURL,
        password,
        verify: true,
        provider: "google",
        token: token,
        ...(refreshToken && { refreshToken }),
      });

      await user.save();
      console.log("User saved successfully:", user);
    }

     res
       .status(200)
       .redirect(`${process.env.FRONTEND_BASE_URL}/current/${user.token}`);
  } catch (error) {
    console.error("Error during Google authentication:", error);
    return res.status(500).send("Internal Server Error");
  }
};
