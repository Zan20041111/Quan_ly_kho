import initModels from "../models/init-models.js";
import sequelize from "../config/connect.js";
import { Op} from "sequelize";

const models = initModels(sequelize);
const getAllGoodsReceipt = async(req, res) =>{
    try {
        const goodsReceipt = await models.phieu_nhap.findAll();
        return res.status(200).json({message: "Lấy danh sách phiếu nhập thành công", data: goodsReceipt});
    } catch (error) {
        return res.status(500).json({message: error.message});
    }
}

const createAutoGoodsReceipt = async (req, res) => {
    try {
        const { kho_id, khach_hang_id, ghi_chu } = req.body;

        const lastReceipt = await models.phieu_nhap.findOne({
            where: {
                ma_phieu: { [Op.like]: 'PN%' }
            },
            order: [['ma_phieu', 'DESC']], // sắp xếp mã giảm dần
            attributes: ['ma_phieu']
        });
        let nextNumber = 1;
        if (lastReceipt) {
            const numberPart = parseInt(lastReceipt.ma_phieu.replace('PN', ''), 10);
            nextNumber = numberPart + 1;
        }

        const ma_phieu = `PN${String(nextNumber).padStart(3, '0')}`;

        const newReceipt = await models.phieu_nhap.create({
            ma_phieu,
            kho_id,
            khach_hang_id,
            ghi_chu: ghi_chu || null,
            ngay_nhap: new Date()
        });
        return res.status(201).json({message: "Tạo phiếu nhập thành công", data: newReceipt});
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const addMultipleProducts = async (req, res) => {
    try {
        const { phieu_nhap_id, products } = req.body;
        if (!phieu_nhap_id || !Array.isArray(products) || products.length === 0) {
            return res.status(400).json({ message: "Dữ liệu không hợp lệ" });
        }

        const receipt = await models.phieu_nhap.findByPk(phieu_nhap_id);
        if (!receipt) return res.status(404).json({ message: "Không tìm thấy phiếu nhập" });

        const results = [];

        for (const p of products) {
            const { san_pham_id, so_luong, vi_tri_id } = p;

            const product = await models.san_pham.findByPk(san_pham_id);
            const location = await models.vi_tri_kho.findByPk(vi_tri_id);
            if (!product || !location) {
                return res.status(400).json({
                    message: `Sản phẩm hoặc vị trí không tồn tại (san_pham_id: ${san_pham_id}, vi_tri_id: ${vi_tri_id})`
                });
            }
            if (location.kho_id !== receipt.kho_id) {
                return res.status(400).json({
                    message: `Vị trí ${vi_tri_id} không thuộc cùng kho với phiếu nhập`
                });
            }
            if (location.trang_thai !== 0) {
                return res.status(400).json({
                    message: `Vị trí ${vi_tri_id} đang được sử dụng, không thể thêm sản phẩm vào`
                });
            }
            const newDetail = await models.chi_tiet_nhap.create({
                phieu_nhap_id, san_pham_id, so_luong, vi_tri_id
            });
            await models.vi_tri_kho.update({ trang_thai: 1 }, { where: { id: vi_tri_id } });
            results.push(newDetail);
        }
        return res.status(201).json({message: `Đã thêm sản phẩm vào phiếu nhập.`, data: results});
    } catch (error) {
        return res.status(500).json({ message: error.message });
}
};

const getDetailGoodsReceiptByID = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: "Thiếu ID phiếu nhập!" });
        }
        const goodsReceipt = await models.phieu_nhap.findByPk(id, {
            include: [
                {
                    model: models.chi_tiet_nhap,
                    as: "chi_tiet_nhaps",
                    include: [
                        {
                            model: models.san_pham,
                            as: "san_pham",
                        },
                        {
                            model: models.vi_tri_kho,
                            as: "vi_tri",
                        },
                    ],
                },
                {
                    model: models.khach_hang,
                    as: "khach_hang",
                },
                {
                    model: models.kho,
                    as: "kho",
                },
            ],
        });
        if (!goodsReceipt) {
            return res.status(404).json({ message: "Không tìm thấy phiếu nhập với ID này!" });
        }
        return res.status(200).json({message: "Lấy chi tiết phiếu nhập thành công", data: goodsReceipt});
    } catch (error) {return res.status(500).json({ message: error.message });}
};

const searchGoodsReceipt = async (req, res) => {
    try {
        const { keyword } = req.query;
        if (!keyword || keyword.trim() === '') {
            return res.status(400).json({   message: "Vui lòng nhập từ khóa tìm kiếm!" });
        }
        const kw = keyword.trim();
        let searchCondition = {};

        if (/^PN/i.test(kw)) {
            searchCondition = { ma_phieu: { [Op.like]: `%${kw}%` } };
        } 
        else if (/^\d+$/.test(kw)) {
            searchCondition = { kho_id: parseInt(kw) };
        } 
        else if (/^\d{4}-\d{2}-\d{2}$|^\d{2}[\/-]\d{2}[\/-]\d{4}$/.test(kw)) {
            let [day, month, year] = [null, null, null];
            if (kw.includes('/')) {
                [day, month, year] = kw.split('/');
            } else if (kw.includes('-')) {
                const parts = kw.split('-');
                if (parts[0].length === 4) {
                    [year, month, day] = parts; 
                } else {
                    [day, month, year] = parts;
                }
            }
            // Tạo đối tượng Date
            const date = new Date(`${year}-${month}-${day}`);
            if (!isNaN(date)) {
                const startOfDay = new Date(date.setHours(0, 0, 0, 0));
                const endOfDay = new Date(date.setHours(23, 59, 59, 999));
                searchCondition = { ngay_nhap: { [Op.between]: [startOfDay, endOfDay] } };
            }
        } 
        else {
            return res.status(400).json({ 
                message: "Từ khóa không hợp lệ, vui lòng nhập mã phiếu, ID kho hoặc ngày, tháng, năm hợp lệ!" 
            });
        }
        const goodsReceipt = await models.phieu_nhap.findAll({ where: searchCondition });
        if (goodsReceipt.length === 0) {
            return res.status(404).json({message: `Không tìm thấy phiếu nhập có chứa "${keyword}".`});
        }
        return res.status(200).json({message: "Tìm kiếm phiếu nhập thành công", data: goodsReceipt});
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};




export { 
    getAllGoodsReceipt,
    createAutoGoodsReceipt,
    addMultipleProducts,
    getDetailGoodsReceiptByID,
    searchGoodsReceipt
};