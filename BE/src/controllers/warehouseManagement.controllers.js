import initModels from "../models/init-models.js";
import sequelize from "../models/connect.js";
const models = initModels(sequelize);

const getAllWarehouses = async(req,res) =>{
    try {
        const data = await models.kho.findAll();
        return res.status(200).json(data);
    } catch (error) {
        console.log("Lỗi khi lấy danh sách kho:",error);
        return res.status(500).json({message:"Lỗi server"});
    }
}

const createWarehouse = async(req,res) => {
    try {
        const {ma_kho, ten_kho, dia_chi, ghi_chu} = req.body; // lâý dữ liệu từ  req body (client gửi JSON lên)
        if(!ma_kho || !ten_kho || !dia_chi || ghi_chu) // Kiểm tra xem người dùng có điền thiếu thông tin không
            return res.status(400).json({message:"Vui lòng nhập đầy đủ thông tin mới có thể tạo kho mới!"}); // trả về lỗi bad request nếu thiếu trường nào trong if yêu cầu
        const newWarehouse = await models.kho.create({ // Tạo
            ma_kho,
            ten_kho,
            dia_chi,
            ghi_chu
        });
        return res.status(201).json({message:"Tạo kho mới thành công.", data:newWarehouse})
    } catch (error) {
        console.log(error);
        return res.status(500).json({message:"Lỗi server khi thêm kho mới"});
    }
}
export {
    getAllWarehouses,
    createWarehouse
}