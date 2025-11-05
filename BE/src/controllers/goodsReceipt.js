import initModels from "../models/init-models.js";
import sequelize from "../models/connect.js";
import { Op } from "sequelize";

const models = initModels(sequelize);
const getAllGoodsReceipt = async(req, res) =>{
    try {
        const goodsReceipt = await models.phieu_nhap.findAll();
        return res.status(200).json({message: "Lấy danh sách phiếu nhập thành công", data: goodsReceipt});
    } catch (error) {
        return res.status(500).json({message: error.message});
    }
}

const createAutoGoodsReceipt = async(req, res) =>{
    try {
        const { kho_id, khach_hang_id } = req.body;
        
        // Tìm tất cả phiếu nhập có mã bắt đầu bằng "PN"
        const allReceipts = await models.phieu_nhap.findAll({
            where: {
                ma_phieu: {
                    [Op.like]: 'PN%'
                }
            },
            attributes: ['ma_phieu']
        });

        let nextNumber = 1;
        
        if (allReceipts.length > 0) {
            // Lấy số lớn nhất từ tất cả các mã phiếu
            const numbers = allReceipts
                .map(receipt => {
                    const numberPart = receipt.ma_phieu.replace('PN', ''); // Xóa PN ra khỏi chuỗi ví dụ PN007 thì sẽ là "007"
                    return parseInt(numberPart, 10); // chuyển chuỗi "007" thành kiểu int còn lại là số 7
                })
                .filter(num => !isNaN(num));
            
            if (numbers.length > 0) {
                nextNumber = Math.max(...numbers) + 1;
            }
        }

        // Tạo mã phiếu mới với format PN001, PN002, ...
        const ma_phieu = `PN${String(nextNumber).padStart(3, '0')}`;

        const newReceipt = await models.phieu_nhap.create({
            ma_phieu,
            kho_id: kho_id,
            khach_hang_id: khach_hang_id
        });

        return res.status(201).json({message: "Tạo phiếu nhập thành công",data: newReceipt});
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

export { 
    getAllGoodsReceipt,
    createAutoGoodsReceipt,

};