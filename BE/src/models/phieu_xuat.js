import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;
import { toISOStringUTC7 } from '../utils/dateUtils.js';
export default class phieu_xuat extends Model {
  toJSON() {
    const values = { ...this.get() };
    if (values.ngay_xuat) {
      values.ngay_xuat = toISOStringUTC7(values.ngay_xuat);
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
