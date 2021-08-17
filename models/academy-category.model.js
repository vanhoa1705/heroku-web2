const db = require("../utils/db");

const TABLE_NAME = "academy_category";
const PRIMARY_KEY = "academy_category_id";
const NOT_DELETE = 0;
const LIMIT = process.env.LIMIT;
const SORT_TYPE = "ASC";

module.exports = {
  // get all by filter
  async all(page = 1, limit = LIMIT, sort = SORT_TYPE) {
    const listCategory = await db(TABLE_NAME)
      .join("user", `${TABLE_NAME}.created_by`, "=", "user.user_id")
      .where(`${TABLE_NAME}.is_delete`, NOT_DELETE)
      .select(`${TABLE_NAME}.*`, "user.name as creator_name")
      .orderBy(`${TABLE_NAME}.${PRIMARY_KEY}`, sort)
      .limit(limit)
      .offset((page - 1) * limit);

    return listCategory;
  },
  // get one
  async single(id) {
    const item = await db(TABLE_NAME)
      .join("user", `${TABLE_NAME}.created_by`, "=", "user.user_id")
      .where(`${TABLE_NAME}.is_delete`, NOT_DELETE)
      .where(PRIMARY_KEY, id)
      .select(`${TABLE_NAME}.*`, "user.name as creator_name");

    if (item.length === 0) {
      return null;
    }
    return item[0];
  },
  // add
  add(category) {
    return db(TABLE_NAME).insert(category);
  },
  // edit
  edit(id, category) {
    return db(TABLE_NAME).where(PRIMARY_KEY, id).update(category);
  },
  // delete
  delete(id) {
    return db(TABLE_NAME).where(PRIMARY_KEY, id).update({ is_delete: 1 });
  },

  //get all
  async getAll() {
    const listCategory = await db(TABLE_NAME).where("academy_parent_id", null);
    for (i in listCategory) {
      listCategory[i].child = await db(TABLE_NAME).where(
        "academy_parent_id",
        listCategory[i].academy_category_id
      );
    }

    return listCategory;
  },

  async getCateChild() {
    const listCategory = await db(TABLE_NAME).whereNotNull("academy_parent_id");

    return listCategory;
  },

  async getTop4Category() {
    return db("academy_register_like as r")
      .join("academy as a", "a.academy_id", "=", "r.academy_id")
      .join(
        "academy_category as c",
        "a.academy_category_id",
        "=",
        "c.academy_category_id"
      )
      .where("r.is_register", 1)
      .count("r.academy_id as register")
      .groupBy("c.academy_category_id")
      .orderBy("register", "desc")
      .select("c.*")
      .limit(4);
  },

  //get academy by categoryID
  async getAcademyByCategoryId(
    categoryId,
    page = 1,
    limit = process.env.LIMIT
  ) {
    const result = await db("academy")
      .where("academy_category_id", categoryId)
      .limit(limit)
      .offset((page - 1) * limit);
    if (result.length <= 0) {
      return null;
    }
    return result;
  },
};
