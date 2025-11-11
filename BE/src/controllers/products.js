import initModels from "../models/init-models.js";
import sequelize from "../config/connect.js";
import { Op} from "sequelize";
const models = initModels(sequelize);
const getAllProducts = async(req, res) =>{
    try {
        const product = await models.san_pham.findAll();
        return res.status(200).json({message:"Lấy danh sách sản phẩm thành công", data:product});
    } catch (error) {
        return res.status(500).json({message: error.message});
    }
}
const searchProduct = async (req, res) => {
    try {
        const { keyword } = req.query;
        if (!keyword || keyword.trim() === '') {
            return res.status(400).json({ message: "Vui lòng nhập từ khóa tìm kiếm!" });
        }
        const product = await models.san_pham.findAll({
            where: { ten_sp: { [Op.like]: `%${keyword}%` } }
        });
        if (product.length === 0) {
            return res.status(404).json({
                message: `Không tìm thấy tên sản phẩm có chứa "${keyword}". Vui lòng nhập đúng tên sản phẩm cần tìm!`
            });
        }
        return res.status(200).json({ message: "Tìm kiếm sản phẩm thành công", data: product });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

const createProduct = async (req, res) => {
    try {
        const { ma_sp, ten_sp, don_vi_tinh, gia, mo_ta } = req.body;
        if (!ma_sp || !ten_sp || !don_vi_tinh)
            return res.status(400).json({message:"Không được để trống thông tin của mã sản phẩm, tên sản phẩm và đơn vị tính. Vui lòng nhập đầy đủ!"});
        const duplicateProductCode = await models.san_pham.findOne({
            where: { ma_sp: ma_sp }
        });
        if (duplicateProductCode)
            return res.status(400).json({ message: "Mã sản phẩm này đã tồn tại" });
        const duplicateProductNameAndUnit = await models.san_pham.findOne({
            where: {
                ten_sp: ten_sp,
                don_vi_tinh: don_vi_tinh
            }
        });
        if (duplicateProductNameAndUnit)
            return res.status(400).json({message: "Tên sản phẩm và đơn vị tính này đã tồn tại. Nếu bạn muốn thêm sản phẩm với đơn vị khác, vui lòng chọn đơn vị khác!"});
        const product = await models.san_pham.create({
            ma_sp,
            ten_sp,
            don_vi_tinh,
            gia,
            mo_ta
        });
        return res.status(201).json({message: "Tạo thành công sản phẩm mới",data: product});
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const updateProduct = async(req, res) =>{
    try {
        const {id} = req.params;
        const { ma_sp, ten_sp, don_vi_tinh, gia, mo_ta } = req.body;
        const checkID = await models.san_pham.findByPk(id)
        if(!checkID)
            return res.status(404).json({message: "Sản phẩm này không tồn tại"})
        const duplicateProductCode = await models.san_pham.findOne({
            where: { ma_sp: ma_sp }
        });
        if (duplicateProductCode)
            return res.status(400).json({ message: "Mã sản phẩm này đã tồn tại" });
        const duplicateProductNameAndUnit = await models.san_pham.findOne({
            where: {
                ten_sp: ten_sp,
                don_vi_tinh: don_vi_tinh
            }
        });
        if (duplicateProductNameAndUnit)
            return res.status(400).json({message: "Tên sản phẩm và đơn vị tính này đã tồn tại. Nếu bạn muốn thêm sản phẩm với đơn vị khác, vui lòng chọn đơn vị khác!"});
        const product = await models.san_pham.update(
            {ma_sp, ten_sp, don_vi_tinh, gia, mo_ta},
            {where: {id}}
        );
        return res.status(200).json({message:"Cập nhật sản phẩm thành công", data: product});
    } catch (error) {
        return res.status(500).json({message: error.message});
    }
}
const deleteProduct = async(req, res) =>{
    try {
        const{id} = req.params;
        const product = await models.san_pham.findByPk(id)
        if(!product)
            return res.status(404).json({message: "Sản phẩm không tồn tại"});
        const checkProduct = await models.chi_tiet_nhap.findOne({
            where: {san_pham_id: id}
        });
        if(checkProduct)
            return res.status(400).json({message:"Không thể xóa sản phẩm này vì đang có trong kho"});
        await product.destroy();
        return res.status(200).json({message:"Xóa sản phẩm thành công"})
    } catch (error) {
        return res.status(500).json({message: error.message});
    }
}
export{
    getAllProducts,
    searchProduct,
    createProduct,
    updateProduct,
    deleteProduct,
}