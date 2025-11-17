import initModels from "../models/init-models.js";
import sequelize from "../config/connect.js";
import { Op} from "sequelize";
import { parseDateUTC7 } from "../utils/dateUtils.js";

const models = initModels(sequelize);



const getAllGoodsIssue = async(req, res) =>{
    try {
        const goodsIssue = await models.phieu_xuat.findAll({
            include:[
                {model: models.kho, as: "kho", attributes: ["id","ten_kho"]},
                {model: models.khach_hang, as: "khach_hang", attributes:["id","ten_kh"]}
        ],
        order:[['id', 'DESC']]
        });
        return res.status(200).json({message: "Lấy danh sách phiếu xuất thành công", data: goodsIssue});
    } catch (error) {
        return res.status(500).json({message: error.message});
    }
}

const createAutoGoodsIssue = async (req, res) => {
    try {
        const { kho_id, khach_hang_id, ghi_chu, ngay_xuat } = req.body;

        const lastIssue = await models.phieu_xuat.findOne({
            where: {
                ma_phieu: { [Op.like]: 'PX%' }
            },
            order: [['ma_phieu', 'DESC']],
            attributes: ['ma_phieu']
        });
        let nextNumber = 1;
        if (lastIssue) {
            const numberPart = parseInt(lastIssue.ma_phieu.replace('PX', ''), 10);
            nextNumber = numberPart + 1;
        }
        const ma_phieu = `PX${String(nextNumber).padStart(3, '0')}`;
        const ngayXuatValue = ngay_xuat ? parseDateUTC7(ngay_xuat) : new Date();
        const newIssue = await models.phieu_xuat.create({
            ma_phieu,
            kho_id,
            khach_hang_id,
            ghi_chu: ghi_chu || null,
            ngay_xuat: ngayXuatValue
        });
        return res.status(201).json({message: "Tạo phiếu xuất thành công", data: newIssue});
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
const calculateInventory = async (san_pham_id, vi_tri_id) => {
    try {
        const totalNhap = await models.chi_tiet_nhap.sum('so_luong', {
            where: {
                san_pham_id: san_pham_id,
                vi_tri_id: vi_tri_id
            }
        }) || 0;

        const totalXuat = await models.chi_tiet_xuat.sum('so_luong', {
            where: {
                san_pham_id: san_pham_id,
                vi_tri_id: vi_tri_id
            }
        }) || 0;
        return totalNhap - totalXuat;
    } catch (error) {
        throw new Error(`Lỗi khi tính tồn kho: ${error.message}`);
    }
};

const calculateRemainingQuantity = (tonKho, soLuongXuat) => {
    return tonKho - soLuongXuat;
};
const exportProduct = async (req, res) => {
    try {
        const { phieu_xuat_id, san_pham_id, so_luong, vi_tri_id } = req.body;
        if (!phieu_xuat_id || !san_pham_id || !so_luong || !vi_tri_id) {
            return res.status(400).json({ message: "Dữ liệu không hợp lệ. Vui lòng nhập đầy đủ thông tin!" });
        }
        const soLuongNum = parseInt(so_luong, 10);
        if (isNaN(soLuongNum) || soLuongNum <= 0) {
            return res.status(400).json({ message: "Số lượng xuất phải là số nguyên dương lớn hơn 0" });
        }
        const issue = await models.phieu_xuat.findByPk(phieu_xuat_id);
        if (!issue) return res.status(404).json({ message: "Không tìm thấy phiếu xuất" });
        const product = await models.san_pham.findByPk(san_pham_id);
        const location = await models.vi_tri_kho.findByPk(vi_tri_id);
        if (!product || !location) {
            return res.status(400).json({
                message: `Sản phẩm hoặc vị trí không tồn tại (san_pham_id: ${san_pham_id}, vi_tri_id: ${vi_tri_id})`
            });
        }
        if (location.kho_id !== issue.kho_id) {
            return res.status(400).json({
                message: `Vị trí ${vi_tri_id} không thuộc cùng kho với phiếu xuất`
            });
        }
        const tonKho = await calculateInventory(san_pham_id, vi_tri_id);
        if (tonKho <= 0) {
            return res.status(400).json({ message: `Vị trí ${vi_tri_id} không có sản phẩm này trong kho`});
        }
        if (soLuongNum > tonKho) {
            return res.status(400).json({message: `Số lượng xuất (${soLuongNum}) vượt quá số lượng tồn kho tại vị trí ${vi_tri_id} (${tonKho})`});
        }
        const newDetail = await models.chi_tiet_xuat.create({
            phieu_xuat_id, 
            san_pham_id, 
            so_luong: soLuongNum, 
            vi_tri_id
        });

        // Tính số lượng còn lại sau khi xuất
        const soLuongConLai = calculateRemainingQuantity(tonKho, soLuongNum);
        if (soLuongConLai === 0) {
            await models.vi_tri_kho.update(
                { trang_thai: 0 }, 
                { where: { id: vi_tri_id } }
            );
        }
        return res.status(201).json({message: `Đã thêm sản phẩm cần xuất vào phiếu xuất thành công.`, data: newDetail});
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const getDetailGoodsIssueByID = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: "Thiếu ID phiếu xuất!" });
        }
        const goodsReceipt = await models.phieu_xuat.findByPk(id, {
            include: [
                {
                    model: models.chi_tiet_xuat,
                    as: "chi_tiet_xuats",
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
            return res.status(404).json({ message: "Không tìm thấy phiếu xuất với ID này!" });
        }
        return res.status(200).json({message: "Lấy chi tiết phiếu xuất thành công", data: goodsReceipt});
    } catch (error) {return res.status(500).json({ message: error.message });}
};

const searchGoodsIssue = async (req, res) => {
    try {
        const { keyword } = req.query;
        if (!keyword || keyword.trim() === '') {
            return res.status(400).json({   message: "Vui lòng nhập từ khóa tìm kiếm!" });
        }
        const kw = keyword.trim();
        let searchCondition = {};
        if (/^PX/i.test(kw)) {
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
            const date = new Date(`${year}-${month}-${day}`);
            if (!isNaN(date.getTime())) {
                const startOfDay = new Date(year, month - 1, day, 0, 0, 0, 0);
                const endOfDay = new Date(year, month - 1, day, 23, 59, 59, 999);
                searchCondition = { ngay_xuat: { [Op.between]: [startOfDay, endOfDay] } };
            }
        } 
        else {
            return res.status(400).json({ 
                message: "Từ khóa không hợp lệ, vui lòng nhập mã phiếu, ID kho hoặc ngày, tháng, năm hợp lệ!" 
            });
        }
        const goodsIssue = await models.phieu_xuat.findAll({ 
            where: searchCondition,
            include: [
                { model: models.kho, as: "kho", attributes: ["id", "ten_kho"] },
                { model: models.khach_hang, as: "khach_hang", attributes: ["id", "ten_kh"] }
            ],
            order: [['id', 'DESC']]
        });
        if (goodsIssue.length === 0) {
            return res.status(404).json({message: `Không tìm thấy phiếu xuất có chứa "${keyword}".`});
        }
        return res.status(200).json({message: "Tìm kiếm phiếu xuất thành công", data: goodsIssue});
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};




export { 
    getAllGoodsIssue,
    createAutoGoodsIssue,
    exportProduct,
    getDetailGoodsIssueByID,
    searchGoodsIssue
};