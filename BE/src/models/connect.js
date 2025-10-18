import { Sequelize } from 'sequelize';
import dbConfig from '../config/db.js';

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.user,
  dbConfig.pass,
  {
    host: dbConfig.host,
    dialect: dbConfig.dialect,
    port: dbConfig.port,
    logging: false,
    define: {
      freezeTableName: true
    }
  }
);

export default sequelize;


