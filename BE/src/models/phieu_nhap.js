import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;
import { toISOStringUTC7 } from '../utils/dateUtils.js';

export default class phieu_nhap extends Model {
  toJSON() {
    const values = { ...this.get() };
    if (values.ngay_nhap) {
      try {
        // Đảm bảo values.ngay_nhap là Date object hợp lệ
        let dateObj = values.ngay_nhap;
        if (!(dateObj instanceof Date)) {
          dateObj = new Date(dateObj);
        }
        
        // Kiểm tra date hợp lệ
        if (!isNaN(dateObj.getTime())) {
          const formattedDate = toISOStringUTC7(dateObj);
          if (formattedDate) {
            values.ngay_nhap = formattedDate;
          } else {
            // Fallback: dùng toISOString() nếu toISOStringUTC7 thất bại
            values.ngay_nhap = dateObj.toISOString();
          }
        } else {
          // Nếu date không hợp lệ, giữ nguyên giá trị gốc (có thể là string)
          // hoặc set về null
          if (typeof values.ngay_nhap === 'string') {
            // Giữ nguyên string nếu đã là string
          } else {
            values.ngay_nhap = null;
          }
        }
      } catch (error) {
        // Nếu có lỗi, cố gắng convert sang ISO string
        try {
          if (values.ngay_nhap instanceof Date && !isNaN(values.ngay_nhap.getTime())) {
            values.ngay_nhap = values.ngay_nhap.toISOString();
          } else if (typeof values.ngay_nhap === 'string') {
            // Giữ nguyên string
          } else {
            console.error("Error formatting ngay_nhap:", error, values.ngay_nhap);
          }
        } catch (e) {
          console.error("Error in date fallback:", e, values.ngay_nhap);
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
    ngay_nhap: {
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
    tableName: 'phieu_nhap',
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
