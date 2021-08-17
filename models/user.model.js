const db = require("../utils/db");
const templateEmail = require("../utils/templateEmail");
const nodemailer = require("nodemailer");

const TABLE_NAME = "user";
const PRIMARY_KEY = "user_id";
const ADMIN = "admin";
const STUDENT = "student";
const TEACHER = "teacher";
const NOT_DELETE = 0;
const LIMIT = process.env.LIMIT;
const SORT_TYPE = "ASC";

module.exports = {
  async all() {
    return await db("user");
  },

  add(user) {
    return db("user").insert(user);
  },

  async getByEmail(email) {
    const users = await db("user").where("email", email);
    if (users.length === 0) {
      return null;
    }

    return users[0];
  },

  async getByEmailUpdate(username, email) {
    const users = await db("user")
      .where("email", email)
      .where("username", "!=", username);
    if (users.length === 0) {
      return null;
    }

    return users[0];
  },

  async getByPhone(phone) {
    const users = await db("user").where("phone_number", phone);
    if (users.length === 0) {
      return null;
    }

    return users[0];
  },

  async singleByUserName(username) {
    const users = await db("user")
      .where("username", username)
      .where("is_delete", 0);
    if (users.length === 0) {
      return null;
    }

    return users[0];
  },

  async singleByUserId(userId) {
    const users = await db("user")
      .where("user_id", userId)
      .where("is_delete", 0);
    if (users.length === 0) {
      return null;
    }

    return users[0];
  },

  patchRFToken(id, rfToken) {
    return db("user").where("user_id", id).update("refresh_token", rfToken);
  },

  async isValidRFToken(id, rfToken) {
    const list = await db("user")
      .where("user_id", id)
      .andWhere("refresh_token", rfToken)
      .first();

    if (list) {
      return true;
    }

    return false;
  },

  async verifyEmail(userId, code) {
    return db("user")
      .where("user_id", userId)
      .where("code", code)
      .update("is_verify", 1);
  },

  async updateProfile(username, name, email) {
    return db("user")
      .where("username", username)
      .update("name", name)
      .update("email", email);
  },

  async changePassword(username, password) {
    return db("user").where("username", username).update("password", password);
  },

  async changeAvatar(username, avatar) {
    return db("user").where("username", username).update("avatar", avatar);
  },

  async registerAcademy(username, listAcademy) {
    let user = await this.singleByUserName(username);

    for (let i = 0; i < listAcademy.length; i++) {
      let academy = await db("academy")
        .where("academy_id", listAcademy[i].academy_id)
        .where("is_delete", 0)
        .first();
      if (!academy) {
        return academy;
      }

      let isRegisterAcademy = await db("academy_register_like")
        .where("student_id", user.user_id)
        .where("academy_id", listAcademy[i].academy_id)
        .where("is_register", 1)
        .first();

      if (isRegisterAcademy) {
        return "registered_" + academy.academy_name;
      }
    }

    var t = await db.transaction();
    try {
      for (let i = 0; i < listAcademy.length; i++) {
        await db("academy_register_like").insert({
          student_id: user.user_id,
          academy_id: listAcademy[i].academy_id,
          is_register: 1,
        });

        await db("academy")
          .where("academy_id", listAcademy[i].academy_id)
          .update({ register: db.raw("?? + 1", ["register"]) });
      }

      return true;
    } catch (error) {
      console.log(error);
      t.rollback();
    }
  },

  async sendConfirmMail(username) {
    let user = await this.singleByUserName(username);

    var smtpTransport = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
    });
    var mailOptions = {
      from: process.env.EMAIL,
      to: user.email,
      subject: "Confirm email",
      html: templateEmail(
        `http://localhost:3000/verify/${user.user_id}/${user.code}`
      ),
    };
    smtpTransport.sendMail(mailOptions, function (error, response) {
      if (error) {
        console.log(error);
      } else {
        res.redirect("/");
      }
    });
  },

  // ================================== TEACHER ====================================
  // lấy tất cả giáo viên, học viên
  async getAllUser(page = 1, limit = LIMIT, sort = SORT_TYPE, role = TEACHER) {
    const listTeacher = await db(TABLE_NAME)
      .where("role", role)
      .where("is_delete", NOT_DELETE)
      .select(['user_id', 'avatar', 'name', 'username', 'email', 'phone_number', 'birthday', 'gender', 'money', 'is_delete', 'created_at'])
      .orderBy(`${PRIMARY_KEY}`, sort)
      .limit(limit)
      .offset((page - 1) * limit);

    if (listTeacher.length <= 0) {
      return null;
    }
    return listTeacher;
  },

  // chi tiết giáo viên
  async getDetailUser(id) {
    const item = await db(TABLE_NAME)
      .where(PRIMARY_KEY, id)
      .where("is_delete", NOT_DELETE);

    if (item.length === 0) {
      return null;
    }
    return item[0];
  },

  // thêm giáo viên
  addTeacher(user) {
    return db(TABLE_NAME).insert(user);
  },

  // chỉnh sửa giáo viên
  async editTeacherById(id, data) {
    return db(TABLE_NAME).where(PRIMARY_KEY, id).update(data);
  },

  // chỉnh sửa giáo viên
  async changePasswordUser(id, data) {
    return db(TABLE_NAME).where(PRIMARY_KEY, id).update({ password: data });
  },

  // xoá giáo viên, học viên
  deleteUser(id) {
    return db(TABLE_NAME).where(PRIMARY_KEY, id).update({ is_delete: 1 });
  },
  // ================================ END TEACHER ==================================
};
