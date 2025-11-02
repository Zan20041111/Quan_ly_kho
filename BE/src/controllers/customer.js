import initModels from "../models/init-models.js";
import sequelize from "../models/connect.js";
import { Op } from "sequelize";

const models = initModels(sequelize);

const getAllCustomer = async (req, res) => {
    try {
        const customer = await models.khach_hang.findAll()
        return res.status(200).json({ message: "Lấy danh sách khách hàng thành công", data: customer });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

const searchCustomer = async (req, res) => {
    try {
        const { keyword } = req.query;

        if (!keyword || keyword.trim() === '') {
            return res.status(400).json({ message: "Vui lòng nhập từ khóa tìm kiếm!" });
        }

        const customers = await models.khach_hang.findAll({
            where: {
                [Op.or]: [
                    { ten_kh: { [Op.like]: `%${keyword}%` } },
                    { sdt: { [Op.like]: `%${keyword}%` } },
                ]
            }
        });
        if (customers.length === 0) {
            return res.status(404).json({
                message: `Không tìm thấy tên khách hàng hoặc số điện thoại có chứa "${keyword}". Vui lòng nhập đúng tên khách hàng hoặc số điện thoại!`
            });
        }

        return res.status(200).json({ message: "Tìm kiếm khách hàng thành công", data: customers });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

const createCustomer = async (req, res) => {
    try {
        const { ma_kh, ten_kh, sdt, dia_chi, email } = req.body;
        if (!ma_kh || !ten_kh || !sdt || !dia_chi)
            return res.status(400).json({ message: "Không được để trống, vui lòng nhập đầy đủ thông tin!" });
        const duplicateCustomserCode = await models.khach_hang.findOne({
            where: { ma_kh: ma_kh }
        });
        if (duplicateCustomserCode)
            return res.status(409).json({ message: "Mã khách hàng này đã tồn tại" });
        const customer = await models.khach_hang.create({
            ma_kh,
            ten_kh,
            sdt,
            dia_chi,
            email
        });
        return res.status(201).json({ message: "Tạo khách hàng mới thành công", data: customer });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

const updateCustomer = async (req, res) => {
    try {
        const { id } = req.params;
        const { ma_kh, ten_kh, sdt, dia_chi, email } = req.body
        const checkID = await models.khach_hang.findByPk(id);
        if (!checkID) {
            return res.status(404).json({ message: "Khách hàng này không tồn tại!" });
        }
        const customer = await models.khach_hang.update(
            { ma_kh, ten_kh, sdt, dia_chi, email },
            { where: { id } }
        );
        return res.status(200).json({ message: "Cập nhật thành công", data: customer });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const deleteCustomer = async (req, res) => {
    try {
        const { id } = req.params;
        const customer = await models.khach_hang.findByPk(id)
        if (!customer)
            return res.status(404).json({ message: "Khách hàng này không tồn tại" });
        await customer.destroy();
        return res.status(200).json({ message: "Xóa khách hàng thành công" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

export {
    getAllCustomer,
    searchCustomer,
    createCustomer,
    updateCustomer,
    deleteCustomer
}