import axios from "axios";
import queryString from "query-string";
import User from "../models/User.js";
import { generateRandomPassword } from "../helpers/createPassword.js";

export const googleAuth = async (req, res) => {
  const stringifiedParms = queryString.stringify({
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
  return res.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${stringifiedParms}`
  );
};

export const googleRedirect = async (req, res) => {
  const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
  const urlObj = new URL(fullUrl);
  const urlParms = queryString.parse(urlObj.search);
  const code = urlParms.code;
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

  const userData = await axios({
    url: "https://www.googleapis.com/oauth2/v3/userinfo",
    method: "GET",
    headers: {
      Authorization: `Bearer ${tokenData.data.access_token}`,
    },
  });
  try {
    const { email, username, avatarURL } = userData.data;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.redirect(
        `${process.env.FRONTEND_BASE_URL}/main?token=${existingUser.token}`
      );
    } else {
      const password = generateRandomPassword();

      const newUser = await User.create({
        email,
        username,
        avatarURL,
        password,
        verify: true,
        provider: "google",
        token: tokenData.data.access_token,
      });

      const savedUser = await newUser.save();
      console.log("User saved successfully:", savedUser);

      return res.redirect(
        `${process.env.FRONTEND_BASE_URL}/information?token=${savedUser.token}`
      );
    }
  } catch (error) {
    console.error("Error saving user:", error);

    return res.status(500).send("Internal Server Error");
  }
};
