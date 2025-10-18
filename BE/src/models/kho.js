import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class kho extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    ma_kho: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    ten_kho: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    dia_chi: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    ghi_chu: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'kho',
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
