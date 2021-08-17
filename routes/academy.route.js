const express = require("express");
const academyModel = require("../models/academy.model");
const router = express.Router();

const auth = require("../middlewares/auth.mdw");

const { successResponse } = require("../middlewares/success-response.mdw");

require("dotenv").config();

router.get("/category/:categoryId", async function (req, res) {
  let page = req.query.page;
  let limit = req.query.limit;
  let categoryId = req.params.categoryId;
  const list = await academyModel.getAcademyByCategoryId(
    categoryId,
    page,
    limit
  );
  return successResponse(res, "Success", list);
});

router.get("/detail/:id", async function (req, res) {
  let id = req.params.id;
  await academyModel.addView(id);
  const list = await academyModel.single(id);
  return successResponse(res, "Success", list);
});

router.get("/outline/:id", async function (req, res) {
  let id = req.params.id;
  const list = await academyModel.getOutline(id);
  return successResponse(res, "Success", list);
});

router.get("/:id/rate", async function (req, res) {
  let id = req.params.id;
  const list = await academyModel.getRateAcademy(id);
  return successResponse(res, "Success", list);
});

router.get("/top4highlight", async function (req, res) {
  const list = await academyModel.top4Highlight();

  if (!list) {
    return null;
  }
  return successResponse(res, "Success", list);
});

router.get("/:id/related", async function (req, res) {
  let id = req.params.id;

  const list = await academyModel.related(id);
  if (!list) {
    return successResponse(res, "Success", []);
  }
  return successResponse(res, "Success", list);
});

router.get("/top10view", async function (req, res) {
  const list = await academyModel.top10View();
  return successResponse(res, "Success", list);
});

router.get("/top10latest", async function (req, res) {
  const list = await academyModel.top10Latest();
  return successResponse(res, "Success", list);
});

router.get("/search", async function (req, res) {
  let keyword = req.query.keyword;
  let category = req.query.category;
  let page = req.query.page;
  let limit = req.query.limit;
  let rate = req.query.rate;
  let price = req.query.price;

  let list;
  if (!keyword) {
    list = await academyModel.getAll(category, rate, price, page, limit);
    return successResponse(res, "Success", list);
  } else {
    list = await academyModel.search(
      keyword,
      category,
      rate,
      price,
      page,
      limit
    );

    return successResponse(res, "Success", list);
  }
});

module.exports = router;
