import axios from 'axios';
import queryString from 'query-string';

// export const facebookAuth = async (req, res) => {
//   try {
//     const redirectUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${process.env.FACEBOOK_APP_ID}&redirect_uri=${process.env.FACEBOOK_REDIRECT_URI}&scope=email`;
//     res.redirect(redirectUrl);
//   } catch (error) {
//     console.error('Facebook authentication error:', error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// };


export const facebookAuth = async (req, res) => {
   
    const stringifiedParms = queryString.stringify({
        client_id: process.env.FACEBOOK_APP_ID,
        redirect_uri: process.env.FACEBOOK_REDIRECT_URI,
        scope: [
            email
           
          ].join(" "),
          response_type: "token",
         
        });
        return res.redirect(
            `https://www.facebook.com/v19.0/dialog/oauth?${stringifiedParms}`
        )
    
}

export const facebookRedirect = async (req, res) => {
  try {
    const { code } = req.query;

    // Обмін коду авторизації на токен доступу Facebook
    const response = await axios.get('https://graph.facebook.com/v19.0/oauth/access_token', {
      params: {
        client_id: process.env.FACEBOOK_APP_ID,
        client_secret: process.env.FACEBOOK_APP_SECRET,
        redirect_uri: process.env.FACEBOOK_REDIRECT_URI,
        code,
      },
    });

    const { access_token } = response.data;

    const userDataResponse = await axios.get('https://graph.facebook.com/me', {
      params: {
        fields: 'id,email,name',
        access_token,
      },
    });

    const userData = userDataResponse.data;

    // Обробка результатів, наприклад, створення або оновлення запису користувача в базі даних
    // та генерація JWT токена

    res.json(userData);
  } catch (error) {
    console.error('Facebook authentication redirect error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};