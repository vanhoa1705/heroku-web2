const db = require("../utils/db");

const TABLE_NAME = "academy_outline";
const PRIMARY_KEY = "academy_outline_id";

module.exports = {
  add(data) {
    return db(TABLE_NAME).insert(data);
  },

  // edit
  edit(id, data) {
    return db(TABLE_NAME).where(PRIMARY_KEY, id).update(data);
  },

  //get
  async getOutlineById(userId, academy_outline_id) {
    let outline = await db(TABLE_NAME)
      .where(PRIMARY_KEY, academy_outline_id)
      .first();

    let existRegister = await db("academy_register_like")
      .where("student_id", userId)
      .where("academy_id", outline.academy_id)
      .where("is_register", 1)
      .first();
    if (!existRegister) {
      console.log("abcd");
      return false;
    }
    console.log(existRegister);

    outline.teacher = await db("academy as a")
      .join("user as u", "a.teacher_id", "=", "u.user_id")
      .select(["u.user_id", "u.name", "u.avatar"])
      .where("a.academy_id", outline.academy_id)
      .first();

    return outline;
  },


  // get all outline of academy
  async getDetailOutlineByAcademyId(academyId) {
    return await db(TABLE_NAME)
    .where('academy_id', academyId);
  }
};
