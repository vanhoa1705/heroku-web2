const db = require("../utils/db");

const TABLE_NAME = "academy";
const PRIMARY_KEY = "academy_id";
const NOT_DELETE = 0;
const LIMIT = process.env.LIMIT;
const SORT_TYPE = "ASC";

module.exports = {
  // get all by filter
  async all(page = 1, limit = LIMIT, sort = SORT_TYPE) {
    const listAcademy = await db(TABLE_NAME)
      .join(
        "academy_category as ac",
        `${TABLE_NAME}.academy_category_id`,
        "=",
        "ac.academy_category_id"
      )
      .join("user", `${TABLE_NAME}.teacher_id`, "=", "user.user_id")
      .where(`${TABLE_NAME}.is_delete`, NOT_DELETE)
      .select(
        `${TABLE_NAME}.*`,
        "user.name as teacher_name",
        "ac.academy_category_name"
      )
      .orderBy(`${TABLE_NAME}.${PRIMARY_KEY}`, sort)
      .limit(limit)
      .offset((page - 1) * limit);

    return listAcademy;
  },

  // get one
  async single(id) {
    const item = await db(TABLE_NAME).where(PRIMARY_KEY, id).first();

    if (!item) {
      return false;
    }

    item.teacher = await db("user")
      .select(["user_id", "name", "avatar", "description"])
      .where("user_id", item.teacher_id)
      .first();
    if (item.length === 0) {
      return null;
    }
    return item;
  },

  //get outline
  async getOutline(academy_id) {
    const list = await db("academy_outline").where("academy_id", academy_id);

    return list;
  },

  // get all by category id
  async getAllByCategoryId(categoryId) {
    const result = await db(TABLE_NAME).where(
      "academy_category_id",
      categoryId
    );

    return result;
  },

  // delete
  delete(id) {
    return db(TABLE_NAME).where(PRIMARY_KEY, id).update({ is_delete: 1 });
  },

  async top4Highlight() {
    const now = new Date();
    const temp = new Date();
    temp.setDate(temp.getDate() - 7);

    let result = await db("academy_register_like as r")
      .join(TABLE_NAME + " as a", "a.academy_id", "=", "r.academy_id")
      .select("a.*")
      .where("a.created_at", "<", now)
      .where("a.created_at", ">", temp)
      .where("r.is_register", 1)
      .count("r.academy_id as register")
      .groupBy("a.academy_id")
      .orderBy("register", "desc")
      .limit(4);

    for (let i = 0; i < result.length; i++) {
      result[i].teacher = await db("user")
        .select(["user_id", "name", "avatar", "description"])
        .where("user_id", result[i].teacher_id)
        .first();
    }
    return result;
  },

  async top10View() {
    let result = await db(TABLE_NAME).orderBy("view", "desc").limit(10);

    for (let i = 0; i < result.length; i++) {
      result[i].teacher = await db("user")
        .select(["user_id", "name", "avatar", "description"])
        .where("user_id", result[i].teacher_id)
        .first();
    }
    return result;
  },

  async top10Latest() {
    let result = await db(TABLE_NAME).orderBy("created_at", "desc").limit(10);

    for (let i = 0; i < result.length; i++) {
      result[i].teacher = await db("user")
        .select(["user_id", "name", "avatar", "description"])
        .where("user_id", result[i].teacher_id)
        .first();
    }
    return result;
  },

  async search(
    keyword,
    category,
    rate,
    price,
    page = 1,
    limit = process.env.LIMIT
  ) {
    let rawQuery = `SELECT * FROM academy as a where MATCH(academy_name) AGAINST('${keyword}' IN NATURAL LANGUAGE MODE) > 0`;

    let totalQuery = await db.raw(rawQuery);
    totalQuery = totalQuery[0].length;

    let result = {};
    result.pages =
      Math.floor(totalQuery / limit) + (totalQuery % limit > 0 ? 1 : 0);

    if (page > result.pages) {
      page = result.pages === 0 ? page : result.pages;
    }
    result.page = parseInt(page);

    if (category) {
      let temp = await db("academy_category")
        .where("academy_category_id", category)
        .first();
      if (!temp) {
        return [];
      }

      if (!temp.academy_parent_id) {
        let child = await db("academy_category")
          .select("academy_category_id")
          .where("academy_parent_id", temp.academy_category_id);

        let childList = child.map((data) => data.academy_category_id);
        rawQuery += ` and academy_category_id in (${childList})`;
      } else {
        rawQuery += ` and academy_category_id = ${category}`;
      }
    }

    if (rate && (rate == "desc" || rate == "asc")) {
      rawQuery += ` ORDER BY a.rate ${rate} LIMIT ${limit} OFFSET ${
        (page - 1) * limit
      } `;
      let temp = await db.raw(rawQuery);
      for (let i = 0; i < temp[0].length; i++) {
        temp[0][i].teacher = await db("user")
          .select(["user_id", "name", "avatar", "description"])
          .where("user_id", temp[0][i].teacher_id)
          .first();
      }
      result.listAcademy = temp[0];
      return result;
    }

    if (price && (price == "desc" || price == "asc")) {
      rawQuery += ` ORDER BY a.price ${price} LIMIT ${limit} OFFSET ${
        (page - 1) * limit
      } `;
      let temp = await db.raw(rawQuery);
      for (let i = 0; i < temp[0].length; i++) {
        temp[0][i].teacher = await db("user")
          .select(["user_id", "name", "avatar", "description"])
          .where("user_id", temp[0][i].teacher_id)
          .first();
      }
      result.listAcademy = temp[0];
      return result;
    }

    rawQuery += ` ORDER BY a.rate desc LIMIT ${limit} OFFSET ${
      (page - 1) * limit
    } `;

    let temp = await db.raw(rawQuery);
    for (let i = 0; i < temp[0].length; i++) {
      temp[0][i].teacher = await db("user")
        .select(["user_id", "name", "avatar", "description"])
        .where("user_id", temp[0][i].teacher_id)
        .first();
    }
    result.listAcademy = temp[0];
    return result;
  },

  async getAll(category, rate, price, page = 1, limit = process.env.LIMIT) {
    let query = db(TABLE_NAME);

    if (category) {
      let temp = await db("academy_category")
        .where("academy_category_id", category)
        .first();
      if (!temp) {
        return [];
      }
      if (!temp.academy_parent_id) {
        query.whereIn("academy_category_id", function () {
          this.select("academy_category_id")
            .from("academy_category")
            .where("academy_parent_id", temp.academy_category_id);
        });
      } else {
        query.where("academy_category_id", category);
      }
    }
    let result = {};
    if (rate && (rate == "desc" || rate == "asc")) {
      result.pages = await query.orderBy("rate", rate);
      result.pages =
        Math.floor(result.pages.length / limit) +
        (result.pages.length % limit > 0 ? 1 : 0);

      if (page > result.pages) {
        page = result.pages === 0 ? 1 : result.pages;
      }
      result.page = parseInt(page);

      result.listAcademy = await query
        .orderBy("rate", rate)
        .limit(limit)
        .offset((page - 1) * limit);

      for (let i = 0; i < result.listAcademy.length; i++) {
        result.listAcademy[i].teacher = await db("user")
          .select(["user_id", "name", "avatar", "description"])
          .where("user_id", result.listAcademy[i].teacher_id)
          .first();
      }
      return result;
    }

    if (price && (price == "desc" || price == "asc")) {
      result.pages = await query.orderBy("price", price);
      result.pages =
        Math.floor(result.pages.length / limit) +
        (result.pages.length % limit > 0 ? 1 : 0);

      if (page > result.pages) {
        page = result.pages === 0 ? 1 : result.pages;
      }
      result.page = parseInt(page);

      result.listAcademy = await query
        .orderBy("price", price)
        .limit(limit)
        .offset((page - 1) * limit);

      for (let i = 0; i < result.listAcademy.length; i++) {
        result.listAcademy[i].teacher = await db("user")
          .select(["user_id", "name", "avatar", "description"])
          .where("user_id", result.listAcademy[i].teacher_id)
          .first();
      }
      return result;
    }

    result.pages = await query.orderBy("price", price);
    result.pages =
      Math.floor(result.pages.length / limit) +
      (result.pages.length % limit > 0 ? 1 : 0);

    if (page > result.pages) {
      page = result.pages === 0 ? 1 : result.pages;
    }
    result.page = parseInt(page);

    result.listAcademy = await query
      .orderBy("rate", "desc")
      .limit(limit)
      .offset((page - 1) * limit);

    for (let i = 0; i < result.listAcademy.length; i++) {
      result.listAcademy[i].teacher = await db("user")
        .select(["user_id", "name", "avatar", "description"])
        .where("user_id", result.listAcademy[i].teacher_id)
        .first();
    }
    return result;
  },

  async getWatchList(userId) {
    let result = await db("academy_register_like as r")
      .where("r.student_id", userId)
      .where("is_like", 1)
      .join(TABLE_NAME + " as a", "a.academy_id", "=", "r.academy_id")
      .select("a.*");

    for (let i = 0; i < result.length; i++) {
      result[i].teacher = await db("user")
        .select(["user_id", "name", "avatar", "description"])
        .where("user_id", result[i].teacher_id)
        .first();
    }
    return result;
  },

  async getAcademyByUserId(userId) {
    let result = await db("academy_register_like as r")
      .where("r.student_id", userId)
      .where("is_register", 1)
      .join(TABLE_NAME + " as a", "a.academy_id", "=", "r.academy_id")
      .select("a.*");

    for (let i = 0; i < result.length; i++) {
      result[i].teacher = await db("user")
        .select(["user_id", "name", "avatar", "description"])
        .where("user_id", result[i].teacher_id)
        .first();
    }
    return result;
  },

  async addToWatchList(userId, academyId) {
    let result = await this.single(academyId);

    if (!result) {
      return "notFound";
    }

    let existWatchList = await db("academy_register_like")
      .where("student_id", userId)
      .where("academy_id", academyId)
      .where("is_like", 1)
      .first();

    if (existWatchList) {
      return "exist";
    }

    if (result) {
      return db("academy_register_like").insert({
        student_id: userId,
        academy_id: academyId,
        is_like: 1,
      });
    }
    return null;
  },

  async deleteWatchList(userId, academyId) {
    let result = await this.single(academyId);
    if (result) {
      return db("academy_register_like")
        .where({
          student_id: userId,
          academy_id: academyId,
          is_like: 1,
        })
        .delete();
    }
    return null;
  },

  async addView(academy_id) {
    let academy = await db("academy")
      .where("academy_id", academy_id)
      .where("is_delete", 0)
      .first();
    if (!academy) {
      return academy;
    }

    await db("academy")
      .where("academy_id", academy_id)
      .update({ view: academy.view + 1 });
    return true;
  },

  async rateAcademy(userId, rate) {
    let existAcademy = await this.single(rate.academy_id);
    if (!existAcademy) {
      return false;
    }

    let isRateAcademy = await db("academy_rate")
      .where("student_id", userId)
      .where("academy_id", rate.academy_id);

    if (isRateAcademy.length !== 0) {
      return false;
    }

    var t = await db.transaction();
    try {
      let isRegisterAcademy = await db("academy_register_like")
        .where("student_id", userId)
        .where("academy_id", rate.academy_id)
        .where("is_register", 1);

      if (isRegisterAcademy.length == 0) {
        return false;
      }

      await db("academy_rate").insert({
        student_id: userId,
        academy_id: rate.academy_id,
        point: rate.point,
        comment: rate.comment,
      });

      let academyRate = await db("academy_rate").where(
        "academy_id",
        rate.academy_id
      );
      var point = 0;
      for (let i = 0; i < academyRate.length; i++) {
        point += academyRate[i].point;
      }

      point = point / academyRate.length;

      await db("academy")
        .where("academy_id", rate.academy_id)
        .update("rate", point);

      t.commit();
      return true;
    } catch (error) {
      console.log(error);
      t.rollback();
    }
  },

  async getRateAcademy(academy_id) {
    const listRate = await db("academy_rate").where("academy_id", academy_id);

    for (let i = 0; i < listRate.length; i++) {
      listRate[i].student = await db("user")
        .select(["user_id", "username", "name", "avatar"])
        .where("user_id", listRate[i].student_id)
        .where("is_delete", 0)
        .first();
    }
    return listRate;
  },

  async related(academy_id) {
    let existAcademy = await this.single(academy_id);
    if (!existAcademy) {
      return [];
    }

    let result = await db("academy as a")
      .select("a.*")
      .where("a.academy_id", "!=", existAcademy.academy_id)
      .where("a.academy_category_id", existAcademy.academy_category_id)
      .orderBy("a.register", "desc")
      .limit(5);
    for (let i = 0; i < result.length; i++) {
      result[i].teacher = await db("user")
        .select(["user_id", "name", "avatar", "description"])
        .where("user_id", result[i].teacher_id)
        .first();
    }
    return result;
  },

  //get academy by categoryID
  async getAcademyByCategoryId(
    categoryId,
    page = 1,
    limit = process.env.LIMIT
  ) {
    let existCategory = await db("academy_category")
      .where("academy_category_id", categoryId)
      .first();
    if (!existCategory) {
      return null;
    }

    let result;
    if (existCategory.academy_parent_id !== null) {
      result = await db("academy")
        .where("academy_category_id", categoryId)
        .limit(limit)
        .offset((page - 1) * limit);
    } else {
      result = await db("academy")
        .whereIn("academy_category_id", function () {
          this.select("academy_category_id")
            .from("academy_category")
            .where("academy_parent_id", existCategory.academy_category_id);
        })
        .limit(limit)
        .offset((page - 1) * limit);
    }

    for (let i = 0; i < result.length; i++) {
      result[i].teacher = await db("user")
        .select(["user_id", "name", "avatar", "description"])
        .where("user_id", result[i].teacher_id)
        .first();
    }
    return result;
  },

  // ======================================== ADMIN: by NNM =====================================
  add(academy) {
    return db(TABLE_NAME).insert(academy);
  },

  // edit
  async edit(id, academy) {
    return db(TABLE_NAME).where(PRIMARY_KEY, id).update(academy);
  },

  // danh sách khoá học của giáo viên
  async getAcademyByTeacherId(teacher_id) {
    return await db(TABLE_NAME).where(`${TABLE_NAME}.teacher_id`, teacher_id);
  },

  // chi tiết khoá học
  async getDetailAcademy(id) {
    return db(TABLE_NAME)
      .join(
        "academy_category as ac",
        `${TABLE_NAME}.academy_category_id`,
        "=",
        "ac.academy_category_id"
      )
      .where(`${TABLE_NAME}.is_delete`, NOT_DELETE)
      .select(`${TABLE_NAME}.*`, "ac.academy_category_name")
      .where(`${TABLE_NAME}.${PRIMARY_KEY}`, id);
  },
};
