import axios from 'axios';

export const BASE_URL = 'http://localhost:8080';

// Tạo một instance axios
export const axiosInstance = axios.create({
  baseURL: `${BASE_URL}`
});

// Interceptor request (không cần xử lý token)
axiosInstance.interceptors.request.use(
  (config) => {
    // Có thể thêm các xử lý chung khác ở đây nếu cần
    console.log("API Request:", config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor response (không xử lý 401 vì không có token)
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error("API Error:", error.response?.status, error.message);
    return Promise.reject(error);
  }
);

// API functions cho Warehouse Management
export const warehouseAPI = {
  // Lấy tất cả kho
  getAll: () => 
    axiosInstance.get(`/get_all_warehouses`).then(response => response.data),
  
  // Tạo kho mới
  create: (warehouseData) => 
    axiosInstance.post(`/create_warehouse`, warehouseData).then(response => response.data),
  
  // Cập nhật kho
  update: (id, warehouseData) =>
    axiosInstance.put(`/update_warehouse/${id}`, warehouseData).then(response => response.data),
  
  // Xóa kho
  delete: (id) =>
    axiosInstance.delete(`/delete_warehouse/${id}`).then(response => response.data)
};

// Export mặc định cho các API khác nếu cần
export default axiosInstance;