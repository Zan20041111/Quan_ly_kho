import initModels from "../models/init-models.js";
import sequelize from "../models/connect.js";
const models = initModels(sequelize);

const getAllWarehousesLocation = async(req, res) =>{
    try {
        const data = await models.vi_tri_kho.findAll();
        return res.status(200).json(data);
    } catch (error) {
        console.log("Lỗi khi lấy danh sách vị trí kho:", error);
        return res.status(500).json({message:"Lỗi server khi lấy danh sách vị trí kho"});
    }
}

const createWarehouseLocation = async(req, res) => {
    try {
        const{ma_vi_tri, ten_vi_tri, kho_id, trang_thai} = req.body;
        if(!ma_vi_tri || !ten_vi_tri || !kho_id)
            return res.status(404).json({message: "Không được để trống, vui lòng nhập đầy đủ thông tin!"})
        const duplicateLocationCode = await models.vi_tri_kho.findOne({
            where: { ma_vi_tri: ma_vi_tri }
        });
        if(duplicateLocationCode) {
            return res.status(409).json({message: "Mã vị trí đã tồn tại trong hệ thống!"});
        }
        const warehouse = await models.vi_tri_kho.create(
            {
                ma_vi_tri,
                ten_vi_tri,
                kho_id,
                trang_thai
            }
        );
        return res.status(201).json({message: "Tạo vị trị kho mới thành công", data: warehouse});
    } catch (error) {
        console.log("Lỗi khi tạo vị trí kho mới: ",error);
        return req.status(500).json({message: "Lỗi server khi tạo vị trí kho mới"});
    }
}

const updateWarehouseLocation = async(req, res) => {
    try {
        const {id} = req.params;
        const {ma_vi_tri, ten_vi_tri, kho_id, trang_thai} = req.body;

        const warehouseLocation = await models.vi_tri_kho.findByPk(id);
        if(!warehouseLocation)
            return res.status(404).json({message: "Vị trí kho này không tồn tại!", data: warehouseLocation})
        warehouseLocation.ma_vi_tri = ma_vi_tri || warehouseLocation.ma_vi_tri;
        warehouseLocation.ten_vi_tri = ten_vi_tri || warehouseLocation.ten_vi_tri;
        warehouseLocation.kho_id = kho_id || warehouseLocation.kho_id;
        // cập nhật trạng thái mới
        if (trang_thai !== undefined) {
            warehouseLocation.trang_thai = trang_thai;
        }
        await warehouseLocation.save();
        return res.status(200).json({message: "Cập nhật thành công", data: warehouseLocation});
    } catch (error) {
        console.log("Lỗi khi cập nhật vị trí kho:", error);
        return res.status(500).json({message: "Lỗi server khi cập nhật kho"});
    }
}

const deleteWarehouseLocation = async(req, res) => {
    try {
        const {id} = req.params;
        const warehouseLocation = await models.vi_tri_kho.findByPk(id)
        if(!warehouseLocation)
            return res.status(404).json({message: "Vị trí không tồn tại!"})
        if(warehouseLocation.trang_thai !== 0)
            return res.status(400).json({message: "Không thể xóa vị trí kho đang được sử dụng, chỉ có thể xóa khi vị trí này trống"});
        await warehouseLocation.destroy();
        return res.status(200).json({message: "Xóa vị trị kho thành công", data: warehouseLocation})
    } catch (error) {
        console.log("Lỗi khi xóa vị trí kho: ", error);
        return res.status(500).json({message: "Lỗi server khi xóa vị trí kho"});     
    }
}

export {
    getAllWarehousesLocation,
    createWarehouseLocation,
    updateWarehouseLocation,
    deleteWarehouseLocation
}