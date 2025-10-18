import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class phieu_nhap extends Model {
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
