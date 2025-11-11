import initModels from "../models/init-models.js";
import sequelize from "../config/connect.js";
import { Op } from "sequelize";
const models = initModels(sequelize);

const getAllWarehouses = async(req,res) =>{
    try {
        const warehouse = await models.kho.findAll();
        return res.status(200).json(warehouse);
    } catch (error) {
        console.log("Lỗi khi lấy danh sách kho:",error);
        return res.status(500).json({message: error.message});
    }
}

const searchWarehouse = async(req, res) =>{
    try {
        const { keyword } = req.query;
        
        if (!keyword || keyword.trim() === '') {
            return res.status(400).json({message: "Vui lòng nhập từ khóa tìm kiếm!"});
        }

        const warehouse = await models.kho.findAll({
            where: { ten_kho:{[Op.like]: `%${keyword}%`}
            }
        });
        if (warehouse.length === 0) {
            return res.status(404).json({
                message: `Không tìm thấy kho hàng có tên chứa "${keyword}". Vui lòng nhập đúng tên kho!`
            });
        }
        return res.status(200).json({message: "Tìm kiếm kho hàng thành công", data: warehouse});
    } catch (error) {
        return res.status(500).json({message: error.message});
    }
}
const createWarehouse = async(req,res) => {
    try {
         // lâý dữ liệu từ  req body (client gửi JSON lên)
        const {ma_kho, ten_kho, dia_chi, ghi_chu} = req.body;
         // Kiểm tra xem người dùng có điền thiếu thông tin không
        if(!ma_kho || !ten_kho || !dia_chi || ghi_chu)
             // trả về lỗi bad request nếu thiếu trường nào trong if yêu cầu
            return res.status(400).json({message:"Vui lòng nhập đầy đủ thông tin mới có thể tạo kho mới!"});
        const duplicateWarehouseCode = await models.kho.findOne({
            where: {ma_kho: ma_kho}
        });
        if(duplicateWarehouseCode)
            return res.status(409).json({message: "Mã kho này đã tồn tại trong hệ thống"});
        // Tạo bản ghi mới trong bảng kho bằng Sequelize , await là sẽ đợi quá trình tạo xong trước khi tiếp tục
        const newWarehouse = await models.kho.create({
            ma_kho,
            ten_kho,
            dia_chi,
            ghi_chu
        });
         // trả về kết quả thành công và gửi kèm dữ diệu kho vừa tạo
        return res.status(201).json({message:"Tạo kho mới thành công.", data:newWarehouse})
    } catch (error) {
        return res.status(500).json({message: error.message});
    }
}

const updateWarehouse = async (req, res) => {
  try {
    const {id} = req.params;
    const { ma_kho, ten_kho, dia_chi, ghi_chu } = req.body;
    const checkID = await models.kho.findByPk(id);
    if (!checkID) {
      return res.status(404).json({ message: "Kho này không tồn tại!" });
    }
    const warehouse = await models.kho.update( // cập nhật dữ liệu
      { ma_kho, ten_kho, dia_chi, ghi_chu },
      { where: {id} }
    );
    return res.status(200).json({message: "Cập nhật kho thành công.", data: warehouse});
  } catch (error) {
    return res.status(500).json({ message: error.message});
  }
};


const deleteWarehouse = async(req,res) =>{
    try {
        const {id} = req.params; 
        const warehouse = await models.kho.findByPk(id);
        if(!warehouse)
            return res.status(404).json({message:"Kho không tồn tại!"});
        
        const warehouseLocations = await models.vi_tri_kho.findAll({
            where: { kho_id: id }
        });

        if (warehouseLocations.length > 0) {
            return res.status(400).json({ 
                message: "Không thể xóa kho vì còn vị trí kho đang sử dụng. Vui lòng xóa hoặc chuyển các vị trí kho trước." 
            });
        }
        await warehouse.destroy();
        return res.status(200).json({message:"Xóa kho thành công"});
    } catch (error) {
        return res.status(500).json({message: error.message});
    }
}
export {
    getAllWarehouses,
    searchWarehouse,
    createWarehouse,
    updateWarehouse,
    deleteWarehouse
}