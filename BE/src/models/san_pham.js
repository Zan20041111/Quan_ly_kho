import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class san_pham extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    ma_sp: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    ten_sp: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    don_vi_tinh: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    gia: {
      type: DataTypes.DECIMAL(15,2),
      allowNull: true,
      defaultValue: 0.00
    },
    mo_ta: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'san_pham',
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
    ]
  });
  }
}
