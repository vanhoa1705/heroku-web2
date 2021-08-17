const express = require('express');
const categoryModel = require('../../models/academy-category.model');
const academyModel = require('../../models/academy.model');
const schema = require('../../schema/academy-category.json');
const router = express.Router();

const { successResponse } = require('../../middlewares/success-response.mdw');

// lấy tất cả danh mục
router.get('/', async function (req, res) {
    // phân trang (page, limit), sắp xếp
    let page = req.query.page;
    let limit = req.query.limit;
    let sort = req.query.sort;
    const list = await categoryModel.all(page, limit, sort);
    const data = {
        data: list,
        page: page ? page : 1 
    }
    successResponse(res, "Query data success", data);
})

// lấy chi tiết
router.get('/:id', async function (req, res) {
    const id = req.params.id || 0;
    const category = await categoryModel.single(id);
    successResponse(res, "Query data success", category);
})

// thêm danh mục
router.post('/', require('../../middlewares/validate.mdw')(schema.create), async function (req, res) {
    let category = req.body;
    category.created_at = new Date(req.body.created_at);
    const ids = await categoryModel.add(category);
    category.category_id = ids[0];
    successResponse(res, "Create data success", category, 201);
})

// cập nhật danh mục
router.patch('/:id', require('../../middlewares/validate.mdw')(schema.update), async function (req, res) {
    const id = req.params.id
    const category = req.body;
    const result = await categoryModel.edit(id, category);
    if (result) {
        // lấy data
        var item = await categoryModel.single(id);
        successResponse(res, "Update data success", item, 200);
    } else {
        successResponse(res, "Update data fail", result, 400, false);
    }

})

// xoá danh mục: Không được xoá danh mục đã có khoá học
router.delete('/:id', async function (req, res) {
    const id = req.params.id;
    // kiểm trả xem danh mục có khoá học nào không
    const category = await academyModel.getAllByCategoryId(id);
    console.log("list academy", category);
    // xoá 
    if (category === null) {
        successResponse(res, "No category exists", category, 404, false);
    }
    if (category.length <= 0) {
        const result = await categoryModel.delete(id);
        successResponse(res, "Delete data success", result, 200);
    } else {
        successResponse(res, "There is a academy in this category", category, 400, false);
    }
})

module.exports = router;