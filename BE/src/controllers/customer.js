import initModels from "../models/init-models.js";
import sequelize from "../models/connect.js";

const models = initModels(sequelize);

const getAllCustomer = async(req, res) => {
    try {
        const customer = await models.khach_hang.findAll()
        return res.status(200).json({message: "Lấy danh sách khách hàng thành công", data: customer});
    } catch (error) {
        console.log("Lỗi khi lấy danh sách khách hàng: ", error);
        return res.status(500).json({message: "Lỗi server khi lấy danh sách khách hàng"});
    }    
}

const createCustomer = async(req, res) => {
    try {
        const {ma_kh, ten_kh, sdt, dia_chi, email} = req.body;
        if(!ma_kh || !ten_kh || !sdt || !dia_chi)
            return res.status(400).json({message: "Không được để trống, vui lòng nhập đầy đủ thông tin!"});
        const duplicateCustomserCode = await models.khach_hang.findOne({
            where:{ma_kh: ma_kh}
        });
        if(duplicateCustomserCode)
            return res.status(409).json({message: "Mã khách hàng này đã tồn tại"});
        const customer = await models.khach_hang.create({
            ma_kh,
            ten_kh,
            sdt,
            dia_chi,
            email
        });
        return res.status(201).json({message: "Tạo khách hàng mới thành công", data: customer});
    } catch (error) {
        console.log("Lỗi khi tạo khách hàng mới: ", error);
        return res.status(500).json({message: "Lỗi server khi tạo khách hàng"});
    }
}

const updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const { ma_kh, ten_kh, sdt, dia_chi, email } = req.body
    const checkID = await models.khach_hang.findByPk(id);
    if (!checkID) {
      return res.status(400).json({ message: "Khách hàng này không tồn tại!" });
    }
    const customer = await models.khach_hang.update(
      { ma_kh, ten_kh, sdt, dia_chi, email },
      { where: { id } }
    );
    return res.status(200).json({message: "Cập nhật thành công", data: customer});
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi cập nhật khách hàng", error });
  }
};

const deleteCustomer = async (req, res) => {
    try {
        const {id} = req.params;
        const customer = await models.khach_hang.findByPk(id)
        if(!customer)
            return res.status(400).json({message: "Khách hàng này không tồn tại"});
        await customer.destroy();
        return res.status(200).json({message: "Xóa khách hàng thành công"});
    } catch (error) {
        return res.status(500).json({message: error.message});
    }
}

export {
    getAllCustomer,
    createCustomer,
    updateCustomer,
    deleteCustomer
}