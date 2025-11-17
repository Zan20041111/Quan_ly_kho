import initModels from "../models/init-models.js";
import sequelize from "../config/connect.js";
import { Op, Sequelize } from "sequelize";

const models = initModels(sequelize);

const getInventoryByProduct = async (req, res) => {
    try {
        const { kho_id, keyword } = req.query;
        let whereCondition = {};
        if (keyword && keyword.trim()) {
            whereCondition = {
                [Op.or]: [
                    { ma_sp: { [Op.like]: `%${keyword.trim()}%` } },
                    { ten_sp: { [Op.like]: `%${keyword.trim()}%` } }
                ]
            };
        }
        const products = await models.san_pham.findAll({
            where: whereCondition,
            attributes: ['id', 'ma_sp', 'ten_sp', 'don_vi_tinh']
        });
        // Lấy danh sách vị trí thuộc kho (nếu có lọc theo kho)
        let locationIds = null;
        if (kho_id) {
            const locations = await models.vi_tri_kho.findAll({
                where: { kho_id: parseInt(kho_id) },
                attributes: ['id']
            });
            locationIds = locations.map(l => l.id);
            if (locationIds.length === 0) {
                return res.status(200).json({
                    message: "Lấy báo cáo tồn kho theo sản phẩm thành công",
                    data: []
                });
            }
        }
        // Tính tồn kho cho từng sản phẩm
        const inventoryData = await Promise.all(
            products.map(async (product) => {
                // Điều kiện lọc chi tiết nhập/xuất
                const whereCondition = {
                    san_pham_id: product.id,
                    ...(locationIds ? { vi_tri_id: { [Op.in]: locationIds } } : {})
                };
                // Lấy tất cả chi tiết nhập của sản phẩm
                const nhapDetails = await models.chi_tiet_nhap.findAll({
                    where: whereCondition,
                    attributes: ['vi_tri_id', 'so_luong']
                });

                // Lấy tất cả chi tiết xuất của sản phẩm
                const xuatDetails = await models.chi_tiet_xuat.findAll({
                    where: whereCondition,
                    attributes: ['vi_tri_id', 'so_luong']
                });

                // Tính tồn kho theo từng vị trí
                const inventoryByLocation = {};
                
                // Tính tổng nhập theo vị trí
                nhapDetails.forEach(detail => {
                    const viTriId = detail.vi_tri_id;
                    if (!inventoryByLocation[viTriId]) {
                        inventoryByLocation[viTriId] = { nhap: 0, xuat: 0 };
                    }
                    inventoryByLocation[viTriId].nhap += detail.so_luong || 0;
                });

                // Tính tổng xuất theo vị trí
                xuatDetails.forEach(detail => {
                    const viTriId = detail.vi_tri_id;
                    if (!inventoryByLocation[viTriId]) {
                        inventoryByLocation[viTriId] = { nhap: 0, xuat: 0 };
                    }
                    inventoryByLocation[viTriId].xuat += detail.so_luong || 0;
                });

                // Tính tổng tồn kho và số vị trí
                let tongTon = 0;
                let soViTri = 0;

                Object.keys(inventoryByLocation).forEach(viTriId => {
                    const tonKho = inventoryByLocation[viTriId].nhap - inventoryByLocation[viTriId].xuat;
                    if (tonKho > 0) {
                        tongTon += tonKho;
                        soViTri++;
                    }
                });

                return {
                    id: product.id,
                    ma_sp: product.ma_sp,
                    ten_sp: product.ten_sp,
                    don_vi_tinh: product.don_vi_tinh,
                    tong_ton: tongTon,
                    so_vi_tri: soViTri
                };
            })
        );

        // Lọc bỏ sản phẩm không có tồn kho (nếu cần)
        const filteredData = inventoryData.filter(item => item.tong_ton > 0 || item.so_vi_tri > 0);

        return res.status(200).json({
            message: "Lấy báo cáo tồn kho theo sản phẩm thành công",
            data: filteredData
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const getInventoryDetailByProduct = async (req, res) => {
    try {
        const { product_id } = req.params;
        const { kho_id } = req.query;

        if (!product_id) {
            return res.status(400).json({ message: "Thiếu ID sản phẩm!" });
        }

        // Kiểm tra sản phẩm tồn tại
        const product = await models.san_pham.findByPk(product_id);
        if (!product) {
            return res.status(404).json({ message: "Không tìm thấy sản phẩm!" });
        }

        // Lấy danh sách vị trí thuộc kho (nếu có lọc theo kho)
        let locationIds = null;
        if (kho_id) {
            const locations = await models.vi_tri_kho.findAll({
                where: { kho_id: parseInt(kho_id) },
                attributes: ['id']
            });
            locationIds = locations.map(l => l.id);
            if (locationIds.length === 0) {
                return res.status(200).json({
                    message: "Lấy chi tiết tồn kho theo vị trí thành công",
                    data: {
                        san_pham: {
                            id: product.id,
                            ma_sp: product.ma_sp,
                            ten_sp: product.ten_sp,
                            don_vi_tinh: product.don_vi_tinh
                        },
                        chi_tiet: []
                    }
                });
            }
        }

        // Điều kiện lọc chi tiết nhập/xuất
        const whereCondition = {
            san_pham_id: product_id,
            ...(locationIds ? { vi_tri_id: { [Op.in]: locationIds } } : {})
        };

        // Lấy tất cả chi tiết nhập của sản phẩm
        const nhapDetails = await models.chi_tiet_nhap.findAll({
            where: whereCondition,
            attributes: ['vi_tri_id', 'so_luong'],
            include: [
                {
                    model: models.vi_tri_kho,
                    as: 'vi_tri',
                    attributes: ['id', 'ma_vi_tri', 'ten_vi_tri', 'kho_id'],
                    include: [
                        {
                            model: models.kho,
                            as: 'kho',
                            attributes: ['id', 'ten_kho']
                        }
                    ]
                }
            ]
        });

        // Lấy tất cả chi tiết xuất của sản phẩm
        const xuatDetails = await models.chi_tiet_xuat.findAll({
            where: whereCondition,
            attributes: ['vi_tri_id', 'so_luong'],
            include: [
                {
                    model: models.vi_tri_kho,
                    as: 'vi_tri',
                    attributes: ['id', 'ma_vi_tri', 'ten_vi_tri', 'kho_id'],
                    include: [
                        {
                            model: models.kho,
                            as: 'kho',
                            attributes: ['id', 'ten_kho']
                        }
                    ]
                }
            ]
        });

        // Tính tồn kho theo từng vị trí
        const inventoryByLocation = {};

        // Tính tổng nhập theo vị trí
        nhapDetails.forEach(detail => {
            if (detail.vi_tri) {
                const viTriId = detail.vi_tri_id;
                if (!inventoryByLocation[viTriId]) {
                    inventoryByLocation[viTriId] = {
                        vi_tri_id: viTriId,
                        ma_vi_tri: detail.vi_tri.ma_vi_tri,
                        ten_vi_tri: detail.vi_tri.ten_vi_tri,
                        kho_id: detail.vi_tri.kho_id,
                        kho: detail.vi_tri.kho,
                        nhap: 0,
                        xuat: 0
                    };
                }
                inventoryByLocation[viTriId].nhap += detail.so_luong || 0;
            }
        });

        // Tính tổng xuất theo vị trí
        xuatDetails.forEach(detail => {
            if (detail.vi_tri) {
                const viTriId = detail.vi_tri_id;
                if (!inventoryByLocation[viTriId]) {
                    inventoryByLocation[viTriId] = {
                        vi_tri_id: viTriId,
                        ma_vi_tri: detail.vi_tri.ma_vi_tri,
                        ten_vi_tri: detail.vi_tri.ten_vi_tri,
                        kho_id: detail.vi_tri.kho_id,
                        kho: detail.vi_tri.kho,
                        nhap: 0,
                        xuat: 0
                    };
                }
                inventoryByLocation[viTriId].xuat += detail.so_luong || 0;
            }
        });

        // Tính tồn kho và lọc chỉ lấy vị trí có tồn kho > 0
        const detailData = Object.values(inventoryByLocation)
            .map(location => {
                const so_luong_ton = location.nhap - location.xuat;
                return {
                    vi_tri_id: location.vi_tri_id,
                    ma_vi_tri: location.ma_vi_tri,
                    ten_vi_tri: location.ten_vi_tri,
                    kho_id: location.kho_id,
                    kho: location.kho,
                    so_luong_ton: so_luong_ton
                };
            })
            .filter(location => location.so_luong_ton > 0)
            .sort((a, b) => a.ma_vi_tri.localeCompare(b.ma_vi_tri));

        return res.status(200).json({
            message: "Lấy chi tiết tồn kho theo vị trí thành công",
            data: {
                san_pham: {
                    id: product.id,
                    ma_sp: product.ma_sp,
                    ten_sp: product.ten_sp,
                    don_vi_tinh: product.don_vi_tinh
                },
                chi_tiet: detailData
            }
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const getInventoryByWarehouse = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ message: "Thiếu ID kho!" });
        }

        // Kiểm tra kho tồn tại
        const warehouse = await models.kho.findByPk(id);
        if (!warehouse) {
            return res.status(404).json({ message: "Không tìm thấy kho!" });
        }

        // Lấy tất cả vị trí thuộc kho này
        const locations = await models.vi_tri_kho.findAll({
            where: { kho_id: id },
            attributes: ['id', 'ma_vi_tri', 'ten_vi_tri']
        });

        const locationIds = locations.map(l => l.id);

        // Lấy tất cả sản phẩm
        const products = await models.san_pham.findAll({
            attributes: ['id', 'ma_sp', 'ten_sp', 'don_vi_tinh']
        });

        // Tính tồn kho cho từng sản phẩm trong kho này
        const inventoryData = await Promise.all(
            products.map(async (product) => {
                // Tính tổng nhập tại các vị trí trong kho
                const totalNhap = await models.chi_tiet_nhap.sum('so_luong', {
                    where: {
                        san_pham_id: product.id,
                        vi_tri_id: { [Op.in]: locationIds }
                    }
                }) || 0;

                // Tính tổng xuất tại các vị trí trong kho
                const totalXuat = await models.chi_tiet_xuat.sum('so_luong', {
                    where: {
                        san_pham_id: product.id,
                        vi_tri_id: { [Op.in]: locationIds }
                    }
                }) || 0;

                const tongTon = totalNhap - totalXuat;

                // Đếm số vị trí có tồn kho > 0
                let soViTri = 0;
                for (const locId of locationIds) {
                    const nhap = await models.chi_tiet_nhap.sum('so_luong', {
                        where: {
                            san_pham_id: product.id,
                            vi_tri_id: locId
                        }
                    }) || 0;
                    const xuat = await models.chi_tiet_xuat.sum('so_luong', {
                        where: {
                            san_pham_id: product.id,
                            vi_tri_id: locId
                        }
                    }) || 0;
                    if (nhap - xuat > 0) {
                        soViTri++;
                    }
                }

                return {
                    id: product.id,
                    ma_sp: product.ma_sp,
                    ten_sp: product.ten_sp,
                    don_vi_tinh: product.don_vi_tinh,
                    tong_ton: tongTon,
                    so_vi_tri: soViTri
                };
            })
        );

        // Lọc bỏ sản phẩm không có tồn kho
        const filteredData = inventoryData.filter(item => item.tong_ton > 0);

        return res.status(200).json({
            message: "Lấy báo cáo tồn kho theo kho thành công",
            data: {
                kho: {
                    id: warehouse.id,
                    ten_kho: warehouse.ten_kho
                },
                inventory: filteredData
            }
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export {
    getInventoryByProduct,
    getInventoryDetailByProduct,
    getInventoryByWarehouse
};

