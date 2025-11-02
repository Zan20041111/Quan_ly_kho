import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import rootRoutes from './src/routes/root.router.js';
dotenv.config();

const app = express();
const port = process.env.PORT;

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(rootRoutes);  
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});