const webpush = require("web-push");
const dotenv = require('dotenv');
dotenv.config();

webpush.setVapidDetails("mailto:varadchoudhari007@gmail.com",process.env.PUBLIC_VAPID_KEY,process.env.PRIVATE_VAPID_KEY)

module.exports = webpush