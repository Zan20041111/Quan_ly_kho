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

        const warehouse = await models.vi_tri_kho.findByPk(id);
        if(!warehouse)
            return res.status(404).json({message: "Vị trí kho này không tồn tại!", data: warehouse})
        warehouse.ma_vi_tri = ma_vi_tri;
        warehouse.ten_vi_tri = ten_vi_tri;
        warehouse.kho_id = kho_id;
        warehouse.trang_thai = trang_thai;
        await warehouse.save();
        return res.status(200).json({message: "Cập nhật thành công", data: warehouse});
    } catch (error) {
        console.log("Lỗi khi cập nhật vị trí kho:", error);
        return res.status(500).json({message: "Lỗi server khi cập nhật kho"});
    }
}

const deleteWarehouseLocation = async(req, res) => {
    try {
        const {id} = req.params;
        const warehouse = await models.vi_tri_kho.findByPk(id)
        if(!warehouse)
            return res.status(404).json({message: "Vị trí không tồn tại!"})
        await warehouse.destroy();
        return res.status(200).json({message: "Xóa vị trị kho thành công", data: warehouse})
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