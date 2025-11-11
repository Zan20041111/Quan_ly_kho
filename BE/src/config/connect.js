import { Sequelize } from 'sequelize';
import dbConfig from './db.js';

// Thiết lập timezone cho Node.js process (UTC+7)
process.env.TZ = 'Asia/Ho_Chi_Minh';

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.user,
  dbConfig.pass,
  {
    host: dbConfig.host,
    dialect: dbConfig.dialect,
    port: dbConfig.port,
    // Timezone của MySQL server (đã được set trong my.ini)
    // Sequelize sẽ không convert thêm vì MySQL đã trả về đúng timezone +07:00
    timezone: '+07:00',
    logging: false,
    define: {
      freezeTableName: true
    },
    dialectOptions: {
      // Báo cho MySQL2 driver biết MySQL đang dùng timezone +07:00
      // Không cần convert vì MySQL server đã trả về đúng timezone
      timezone: '+07:00',
      // Đảm bảo dates được xử lý đúng
      dateStrings: false
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);


export default sequelize;


