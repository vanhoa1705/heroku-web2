const jwt = require("jsonwebtoken");
require("dotenv").config();
const { successResponse } = require("../middlewares/success-response.mdw");

module.exports = function (req, res, next) {
  const accessToken = req.headers["x-access-token"];
  if (accessToken) {
    try {
      const decoded = jwt.verify(accessToken, process.env.SECRET_KEY);
      req.accessTokenPayload = decoded;
      next();
    } catch (err) {
      console.log(err);
      return successResponse(res, "Invalid access token!", null, 401, false);
    }
  } else {
    return successResponse(res, "Access token not found!", null, 401, false);
  }
};
