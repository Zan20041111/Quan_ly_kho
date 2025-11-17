import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;
import { toISOStringUTC7 } from '../utils/dateUtils.js';
export default class phieu_xuat extends Model {
  toJSON() {
    const values = { ...this.get() };
    if (values.ngay_xuat) {
      try {
        const formattedDate = toISOStringUTC7(values.ngay_xuat);
        // Nếu format thành công, dùng formatted date
        if (formattedDate) {
          values.ngay_xuat = formattedDate;
        } else {
          // Nếu format thất bại, convert Date object thành ISO string đơn giản
          // để frontend có thể parse được
          if (values.ngay_xuat instanceof Date && !isNaN(values.ngay_xuat.getTime())) {
            values.ngay_xuat = values.ngay_xuat.toISOString();
          }
          // Nếu đã là string, giữ nguyên
        }
      } catch (error) {
        // Nếu có lỗi, giữ nguyên giá trị gốc hoặc convert an toàn
        if (values.ngay_xuat instanceof Date && !isNaN(values.ngay_xuat.getTime())) {
          values.ngay_xuat = values.ngay_xuat.toISOString();
        }
      }
    }
    return values;
  }
  static init(sequelize, DataTypes) {
  return super.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    ma_phieu: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    ngay_xuat: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
    },
    kho_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'kho',
        key: 'id'
      }
    },
    khach_hang_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'khach_hang',
        key: 'id'
      }
    },
    ghi_chu: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'phieu_xuat',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "kho_id",
        using: "BTREE",
        fields: [
          { name: "kho_id" },
        ]
      },
      {
        name: "khach_hang_id",
        using: "BTREE",
        fields: [
          { name: "khach_hang_id" },
        ]
      },
    ]
  });
  }
}
