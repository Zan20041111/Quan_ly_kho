import _sequelize from "sequelize";
const DataTypes = _sequelize.DataTypes;
import _chi_tiet_nhap from  "./chi_tiet_nhap.js";
import _chi_tiet_xuat from  "./chi_tiet_xuat.js";
import _khach_hang from  "./khach_hang.js";
import _kho from  "./kho.js";
import _phieu_nhap from  "./phieu_nhap.js";
import _phieu_xuat from  "./phieu_xuat.js";
import _san_pham from  "./san_pham.js";
import _vi_tri_kho from  "./vi_tri_kho.js";

export default function initModels(sequelize) {
  const chi_tiet_nhap = _chi_tiet_nhap.init(sequelize, DataTypes);
  const chi_tiet_xuat = _chi_tiet_xuat.init(sequelize, DataTypes);
  const khach_hang = _khach_hang.init(sequelize, DataTypes);
  const kho = _kho.init(sequelize, DataTypes);
  const phieu_nhap = _phieu_nhap.init(sequelize, DataTypes);
  const phieu_xuat = _phieu_xuat.init(sequelize, DataTypes);
  const san_pham = _san_pham.init(sequelize, DataTypes);
  const vi_tri_kho = _vi_tri_kho.init(sequelize, DataTypes);

  phieu_nhap.belongsTo(khach_hang, { as: "khach_hang", foreignKey: "khach_hang_id"});
  khach_hang.hasMany(phieu_nhap, { as: "phieu_nhaps", foreignKey: "khach_hang_id"});
  phieu_xuat.belongsTo(khach_hang, { as: "khach_hang", foreignKey: "khach_hang_id"});
  khach_hang.hasMany(phieu_xuat, { as: "phieu_xuats", foreignKey: "khach_hang_id"});
  phieu_nhap.belongsTo(kho, { as: "kho", foreignKey: "kho_id"});
  kho.hasMany(phieu_nhap, { as: "phieu_nhaps", foreignKey: "kho_id"});
  phieu_xuat.belongsTo(kho, { as: "kho", foreignKey: "kho_id"});
  kho.hasMany(phieu_xuat, { as: "phieu_xuats", foreignKey: "kho_id"});
  vi_tri_kho.belongsTo(kho, { as: "kho", foreignKey: "kho_id"});
  kho.hasMany(vi_tri_kho, { as: "vi_tri_khos", foreignKey: "kho_id"});
  chi_tiet_nhap.belongsTo(phieu_nhap, { as: "phieu_nhap", foreignKey: "phieu_nhap_id"});
  phieu_nhap.hasMany(chi_tiet_nhap, { as: "chi_tiet_nhaps", foreignKey: "phieu_nhap_id"});
  chi_tiet_xuat.belongsTo(phieu_xuat, { as: "phieu_xuat", foreignKey: "phieu_xuat_id"});
  phieu_xuat.hasMany(chi_tiet_xuat, { as: "chi_tiet_xuats", foreignKey: "phieu_xuat_id"});
  chi_tiet_nhap.belongsTo(san_pham, { as: "san_pham", foreignKey: "san_pham_id"});
  san_pham.hasMany(chi_tiet_nhap, { as: "chi_tiet_nhaps", foreignKey: "san_pham_id"});
  chi_tiet_xuat.belongsTo(san_pham, { as: "san_pham", foreignKey: "san_pham_id"});
  san_pham.hasMany(chi_tiet_xuat, { as: "chi_tiet_xuats", foreignKey: "san_pham_id"});
  chi_tiet_nhap.belongsTo(vi_tri_kho, { as: "vi_tri", foreignKey: "vi_tri_id"});
  vi_tri_kho.hasMany(chi_tiet_nhap, { as: "chi_tiet_nhaps", foreignKey: "vi_tri_id"});
  chi_tiet_xuat.belongsTo(vi_tri_kho, { as: "vi_tri", foreignKey: "vi_tri_id"});
  vi_tri_kho.hasMany(chi_tiet_xuat, { as: "chi_tiet_xuats", foreignKey: "vi_tri_id"});

  return {
    chi_tiet_nhap,
    chi_tiet_xuat,
    khach_hang,
    kho,
    phieu_nhap,
    phieu_xuat,
    san_pham,
    vi_tri_kho,
  };
}
