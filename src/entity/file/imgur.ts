import { ImgurClient } from "imgur";

// wimeno products album data:
// {
//     "id": "0KSDJfz",
//     "deletehash": "CsUS7eswPoW4BUa"
// }

// wimeno users data:
// {
//     "id": "S85in0J",
//     "deletehash": "allapP8SBnPH1fJ"
// }

const imgurClient = new ImgurClient({
  clientId: process.env.IMGUR_CLIENT_ID,
  clientSecret: process.env.IMGUR_CLIENT_SECRET,
  refreshToken: process.env.IMGUR_REFRESH_TOKEN,
});

export default imgurClient;
