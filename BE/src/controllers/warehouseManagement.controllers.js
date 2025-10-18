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
         // lâý dữ liệu từ  req body (client gửi JSON lên)
        const {ma_kho, ten_kho, dia_chi, ghi_chu} = req.body;
         // Kiểm tra xem người dùng có điền thiếu thông tin không
        if(!ma_kho || !ten_kho || !dia_chi || ghi_chu)
             // trả về lỗi bad request nếu thiếu trường nào trong if yêu cầu
            return res.status(400).json({message:"Vui lòng nhập đầy đủ thông tin mới có thể tạo kho mới!"});
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
        console.log(error);
        return res.status(500).json({message:"Lỗi server khi thêm kho mới"});
    }
}

const updateWarehouse = async (req, res) => {
    try {
        const { id } = req.params; // ID kho cần sửa
        const { ma_kho, ten_kho, dia_chi, ghi_chu } = req.body; 

        // Tìm kho theo ID
        const wareHouse = await models.kho.findByPk(id);
        if (!wareHouse)
            return res.status(404).json({ message: "Kho không tồn tại!" });
        // Cập nhật thông tin
        wareHouse.ma_kho = ma_kho || wareHouse.ma_kho;
        wareHouse.ten_kho = ten_kho || wareHouse.ten_kho;
        wareHouse.dia_chi = dia_chi || wareHouse.dia_chi;
        wareHouse.ghi_chu = ghi_chu || wareHouse.ghi_chu;

        await wareHouse.save(); // Lưu thay đổi

        return res.status(200).json({ message: "Cập nhật kho thành công.", data: wareHouse });
    } catch (error) {
        console.log("Lỗi khi cập nhật kho:", error);
        return res.status(500).json({ message: "Lỗi server khi cập nhật kho" });
    }
}

const deleteWarehouse = async(req,res) =>{
    try {
        const {id} = req.params; 
        const wareHouse = await models.kho.findByPk(id);
        if(!wareHouse)
            return res.status(404).json({message:"Kho không tồn tại!"});
        await wareHouse.destroy();
        return res.status(200).json({message:"Xóa kho thành công"});
    } catch (error) {
        console.log("Lỗi khi xóa kho", error);
        return res.status(500).json({message:"Lỗi server khi xóa kho"});
    }
}
export {
    getAllWarehouses,
    createWarehouse,
    updateWarehouse,
    deleteWarehouse
}