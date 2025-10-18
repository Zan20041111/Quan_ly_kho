import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class khach_hang extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    ma_kh: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    ten_kh: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    sdt: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    dia_chi: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'khach_hang',
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
