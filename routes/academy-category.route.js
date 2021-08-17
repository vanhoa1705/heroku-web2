const express = require("express");
const categoryModel = require("../models/academy-category.model");
const academyModel = require("../models/academy.model");
const schema = require("../schema/academy-category.json");
const router = express.Router();

const { successResponse } = require("../middlewares/success-response.mdw");

router.get("/", async function (req, res) {
  const list = await categoryModel.getAll();
  successResponse(res, "Success", list);
});

router.get("/top4category", async function (req, res) {
  const list = await categoryModel.getTop4Category();
  return successResponse(res, "Success", list);
});

module.exports = router;
