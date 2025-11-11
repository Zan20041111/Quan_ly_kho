import initModels from "../models/init-models.js";
import sequelize from "../config/connect.js";
import { Op } from "sequelize";
const models = initModels(sequelize);

const getAllWarehousesLocation = async(req, res) =>{
    try {
        const data = await models.vi_tri_kho.findAll();
        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json({message: error.message});
    }
}
const getWarehouseLocationByID = async (req, res) => {
    try {
        const { id } = req.params;
        const warehouse = await models.kho.findByPk(id);
        if (!warehouse) {
            return res.status(404).json({ message: "Không tìm thấy kho với ID này!" });
        }
        // Lấy danh sách vị trí thuộc kho đó
        const warehouseLocation = await models.vi_tri_kho.findAll({
            where: { kho_id: id }
        });
        if (warehouseLocation.length === 0) {
            return res.status(200).json({message: `Kho '${warehouse.ten_kho}' hiện chưa có vị trí nào.`,data: []});
        }
        return res.status(200).json({
            message: `Danh sách vị trí thuộc kho '${warehouse.ten_kho}'`,data: warehouseLocation});
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const searchWarehouseLocation = async (req, res) => {
    try {
        const { keyword } = req.query;

        if (!keyword || keyword.trim() === '') {
            return res.status(400).json({ message: "Vui lòng nhập từ khóa tìm kiếm!" });
        }

        const warehouseLocation = await models.vi_tri_kho.findAll({
            where: {trang_thai: { [Op.like]: `%${keyword}%` }}
        });
        if (warehouseLocation.length === 0) {
            return res.status(404).json({
                message: `Không tìm thấy trạng thái có chứa "${keyword}". Vui lòng nhập đúng trạng thái!`
            });
        }

        return res.status(200).json({ message: "Tìm kiếm trạng thái thành công", data: warehouseLocation });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}
const createWarehouseLocation = async(req, res) => {
    try {
        const{ma_vi_tri, ten_vi_tri, kho_id, trang_thai} = req.body;
        if(!ma_vi_tri || !ten_vi_tri || !kho_id)
            return res.status(400).json({message: "Không được để trống, vui lòng nhập đầy đủ thông tin!"})
        const duplicateLocationCode = await models.vi_tri_kho.findOne({
            where: { ma_vi_tri: ma_vi_tri }
        });
        if(duplicateLocationCode) {
            return res.status(409).json({message: "Mã vị trí đã tồn tại trong hệ thống!"});
        }
        const warehouseLocation = await models.vi_tri_kho.create(
            {
                ma_vi_tri,
                ten_vi_tri,
                kho_id,
                trang_thai
            }
        );
        return res.status(201).json({message: "Tạo vị trị kho mới thành công", data: warehouseLocation});
    } catch (error) {
        return res.status(500).json({message: error.message});
    }
}

const updateWarehouseLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const { ma_vi_tri, ten_vi_tri, kho_id, trang_thai } = req.body;

    // Kiểm tra xem vị trí kho có tồn tại không
    const checkID = await models.vi_tri_kho.findByPk(id);
    
    if (!checkID) {
      return res.status(404).json({ message: "Vị trí kho này không tồn tại!" });
    }
    
    // Thực hiện cập nhật
    const warehouseLocation = await models.vi_tri_kho.update(
      { ma_vi_tri, ten_vi_tri, kho_id, trang_thai },
      { where: { id } }
    );
    return res.status(200).json({message: "Cập nhật thành công", data: warehouseLocation});
  } catch (error) {
    return res.status(500).json({ message: error.message})}
};


const deleteWarehouseLocation = async(req, res) => {
    try {
        const {id} = req.params;
        const warehouseLocation = await models.vi_tri_kho.findByPk(id)
        if(!warehouseLocation)
            return res.status(404).json({message: "Vị trí kho không tồn tại!"})
        if(warehouseLocation.trang_thai !== 0)
            return res.status(400).json({message: "Không thể xóa vị trí kho đang được sử dụng, chỉ có thể xóa khi vị trí này trống"});
        await warehouseLocation.destroy();
        return res.status(200).json({message: "Xóa vị trị kho thành công", data: warehouseLocation})
    } catch (error) {
        return res.status(500).json({message: error.message});     
    }
}

export {
    getAllWarehousesLocation,
    getWarehouseLocationByID,
    searchWarehouseLocation,
    createWarehouseLocation,
    updateWarehouseLocation,
    deleteWarehouseLocation
}
