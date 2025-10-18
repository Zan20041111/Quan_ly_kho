import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import warehouseManagementRoutes from './src/routes/warehouseManagement.router.js';
dotenv.config();

const app = express();
const port = process.env.PORT;

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(warehouseManagementRoutes);
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});