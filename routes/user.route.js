const express = require("express");
const userModel = require("../models/user.model");
const academyModel = require("../models/academy.model");
const router = express.Router();
const jwt = require("jsonwebtoken");
const randomstring = require("randomstring");
const bcrypt = require("bcryptjs");

const auth = require("../middlewares/auth.mdw");

const { successResponse } = require("../middlewares/success-response.mdw");

require("dotenv").config();

router.get("/", async function (req, res) {
  const list = await userModel.all();
  res.json(list);
});

router.get("/profile", auth, async function (req, res) {
  const list = await userModel.singleByUserName(
    req.accessTokenPayload.username
  );
  res.json(list);
});

const userSchema = require("../schema/user.json");
router.post(
  "/register",
  require("../middlewares/validate.mdw")(userSchema.register),
  async function (req, res) {
    const user = req.body;

    let existUsername = await userModel.singleByUserName(user.username);
    if (existUsername) {
      return successResponse(res, "Username đã tồn tại", null, 409, false);
    }

    let existEmail = await userModel.getByEmail(user.email);
    if (existEmail) {
      return successResponse(res, "Email đã tồn tại", null, 409, false);
    }

    let existPhone = await userModel.getByPhone(user.phone_number);
    if (existPhone) {
      return successResponse(res, "Số điện thoại đã tồn tại", null, 409, false);
    }

    user.password = bcrypt.hashSync(user.password, 10);
    user.code = randomstring.generate(20);

    const ids = await userModel.add(user);
    await userModel.sendConfirmMail(user.username);

    user.user_id = ids[0];

    return successResponse(res, "Success");
  }
);

router.get("/resend-confirm-email", auth, async function (req, res) {
  await userModel.sendConfirmMail(req.accessTokenPayload.username);
  return successResponse(res, "Gửi thành công!");
});

router.put(
  "/update-profile",
  auth,
  require("../middlewares/validate.mdw")(userSchema.updateProfile),
  async function (req, res) {
    const user = req.body;

    let existEmail = await userModel.getByEmailUpdate(
      req.accessTokenPayload.username,
      user.email
    );
    if (existEmail) {
      return successResponse(res, "Email đã tồn tại", null, 409, false);
    }

    await userModel.updateProfile(
      req.accessTokenPayload.username,
      user.name,
      user.email
    );

    return successResponse(res, "Cập nhật thành công");
  }
);

router.post("/avatar", auth, async function (req, res) {
  let avatar = req.body.avatar;
  await userModel.changeAvatar(req.accessTokenPayload.username, avatar);

  return successResponse(res, "Cập nhật thành công");
});

router.put(
  "/change-password",
  auth,
  require("../middlewares/validate.mdw")(userSchema.changPassword),
  async function (req, res) {
    const user = req.body;

    let existUser = await userModel.singleByUserName(
      req.accessTokenPayload.username
    );

    if (!bcrypt.compareSync(user.oldPassword, existUser.password)) {
      return successResponse(res, "Mật khẩu không chính xác", null, 400, false);
    }

    if (user.newPassword != user.rePassword) {
      return successResponse(res, "Mật khẩu không khớp", null, 400, false);
    }

    await userModel.changePassword(
      req.accessTokenPayload.username,
      bcrypt.hashSync(user.newPassword, 10)
    );

    return successResponse(res, "Cập nhật thành công");
  }
);

router.get("/my-academy", auth, async function (req, res) {
  let list = await academyModel.getAcademyByUserId(
    req.accessTokenPayload.userId
  );
  return successResponse(res, "Success", list);
});

router.get("/watch-list", auth, async function (req, res) {
  let list = await academyModel.getWatchList(req.accessTokenPayload.userId);
  return successResponse(res, "Success", list);
});

router.post("/watch-list/:id", auth, async function (req, res) {
  let id = req.params.id;
  let result = await academyModel.addToWatchList(
    req.accessTokenPayload.userId,
    id
  );
  if (result === "exist") {
    return successResponse(
      res,
      "This course is already on the watch list",
      null,
      400,
      false
    );
  }
  if (result === "notFound") {
    return successResponse(res, "Invalid category", null, 400, false);
  }
  if (result) {
    return successResponse(res, "Success");
  }
  return successResponse(res, "Academy ID invalid", null, 400, false);
});

router.delete("/watch-list/:id", auth, async function (req, res) {
  let id = req.params.id;
  if (!id) {
    return successResponse(res, "Academy ID invalid", null, 400, false);
  }
  let result = await academyModel.deleteWatchList(
    req.accessTokenPayload.userId,
    id
  );
  if (result && result != 0) {
    return successResponse(res, "Success");
  }
  return successResponse(res, "Academy ID invalid", null, 400, false);
});

router.post(
  "/rate",
  auth,
  require("../middlewares/validate.mdw")(userSchema.rate),
  async function (req, res) {
    let rate = req.body;

    let result = await academyModel.rateAcademy(
      req.accessTokenPayload.userId,
      rate
    );
    if (result) {
      return successResponse(res, "Success");
    }
    return successResponse(res, "Cannot rate this academy", null, 400, false);
  }
);

router.post(
  "/register-academy",
  auth,
  require("../middlewares/validate.mdw")(userSchema.registerAcademy),
  async function (req, res) {
    let listAcademy = req.body;

    let result = await userModel.registerAcademy(
      req.accessTokenPayload.username,
      listAcademy.listAcademy
    );

    if (result === true) {
      return successResponse(res, "Success");
    } else if (result && result.indexOf("registered_") === 0) {
      return successResponse(
        res,
        `You have registered "${result.slice("registered_".length)}" before`,
        null,
        400,
        false
      );
    } else if (result === "do not have enough money") {
      return successResponse(
        res,
        "You do not have enough money",
        null,
        400,
        false
      );
    }
  }
);

module.exports = router;
