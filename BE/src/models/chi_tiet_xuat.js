import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class chi_tiet_xuat extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    phieu_xuat_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'phieu_xuat',
        key: 'id'
      }
    },
    san_pham_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'san_pham',
        key: 'id'
      }
    },
    so_luong: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
    vi_tri_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'vi_tri_kho',
        key: 'id'
      }
    }
  }, {
    sequelize,
    tableName: 'chi_tiet_xuat',
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
        name: "phieu_xuat_id",
        using: "BTREE",
        fields: [
          { name: "phieu_xuat_id" },
        ]
      },
      {
        name: "san_pham_id",
        using: "BTREE",
        fields: [
          { name: "san_pham_id" },
        ]
      },
      {
        name: "vi_tri_id",
        using: "BTREE",
        fields: [
          { name: "vi_tri_id" },
        ]
      },
    ]
  });
  }
}
