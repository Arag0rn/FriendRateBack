import axios from "axios";
import queryString from "query-string";
import User from "../models/User.js";
import { generateRandomPassword } from "../helpers/createPassword.js";

const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID;
const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET;

export const getFacebookLoginUrl = async (req, res) => {
  try {
    const stringifiedParams = queryString.stringify({
      client_id: FACEBOOK_APP_ID,
      redirect_uri: `${process.env.BASE_URL}/api/user/facebook-redirect`,
      scope: ["email", "public_profile"].join(","),
      response_type: "code",
      display: "popup",
      prompt: "consent",
    });
    console.log("Received code:", req.query.code);
    return res.redirect(
      `https://www.facebook.com/v19.0/dialog/oauth?${stringifiedParams}`
    );
  } catch (error) {
    console.error("Error generating Facebook login URL:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getFacebookUserData = async (req, res) => {
  const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
  const urlObj = new URL(fullUrl);
  const urlParms = queryString.parse(urlObj.search);
  const code = urlParms.code;
  const tokenData = await axios({
    url: `https://graph.facebook.com/v19.0/oauth/access_token`,
    method: "post",
    data: {
      client_id: FACEBOOK_APP_ID,
      client_secret: FACEBOOK_APP_SECRET,
      redirect_uri: `${process.env.BASE_URL}/api/user/facebook-redirect`,
      grant_type: "authorization_code",
      code,
    },
  });

  const userData = await axios({
    url: "https://graph.facebook.com/v19.0/me/?fields=email,name",
    method: "GET",
    headers: {
      Authorization: `Bearer ${tokenData.data.access_token}`,
    },
  });
  try {
    const { email, name, avatarURL } = userData.data;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.redirect(
        `${process.env.FRONTEND_BASE_URL}/main?token=${existingUser.token}`
      );
    } else {
      const password = generateRandomPassword();

      const newUser = await User.create({
        email,
        name,
        avatarURL,
        password,
        verify: true,
        provider: "facebook",
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
