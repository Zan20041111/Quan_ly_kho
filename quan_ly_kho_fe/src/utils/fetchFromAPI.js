import axios from 'axios';
// Địa chỉ backend server 
export const BASE_URL = 'http://localhost:8080';

// Instance này sẽ được dùng cho tất cả API calls thay vì dùng axios trực tiếp
export const axiosInstance = axios.create({
  baseURL: `${BASE_URL}`
});

// Interceptor request - chạy trước khi gửi request đến server
axiosInstance.interceptors.request.use(
  (config) => {
    // In ra console để debug - biết được API nào đang được gọi
    console.log("API Request:", config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor response - chạy sau khi nhận response từ server
axiosInstance.interceptors.response.use(
  (response) => {
    // Request thành công - trả về response bình thường
    return response;
  },
  (error) => {
    // Request thất bại - in lỗi ra console để debug
    console.error("API Error:", error.response?.status, error.message);
    return Promise.reject(error);
  }
);

// API functions cho Warehouse Management
export const warehouseAPI = {
  // Lấy tất cả kho
  getAll: () => 
    axiosInstance.get(`/warehouse/get_all_warehouses`).then(response => response.data),
  
  // Tạo kho mới
  create: (warehouseData) => 
    axiosInstance.post(`/warehouse/create_warehouse`, warehouseData).then(response => response.data),
  
  // Cập nhật kho
  update: (id, warehouseData) =>
    axiosInstance.put(`/warehouse/update_warehouse/${id}`, warehouseData).then(response => response.data),
  
  // Xóa kho
  delete: (id) =>
    axiosInstance.delete(`/warehouse/delete_warehouse/${id}`).then(response => response.data)
};

export const warehouseLocationAPI = {
  // Lấy tất cả vị trí kho
  getAll: () =>
    axiosInstance.get(`/warehouse-location/get_all_warehouses_location`).then(response => response.data),
  
  // Lấy vị trí kho theo ID kho
  getByID: (warehouseId) =>
    axiosInstance.get(`/warehouse-location/get_warehouse_location_byid/${warehouseId}`).then(response => response.data),
  
  // Tìm kiếm vị trí kho theo trạng thái
  search: (keyword) =>
    axiosInstance.get(`/warehouse-location/search_warehouse_location`, {
      params: { keyword }
    }).then(response => response.data),
  
  // Tạo vị trí kho mới
  create: (warehouseLocationData) =>
    axiosInstance.post(`/warehouse-location/create_warehouse_location`,warehouseLocationData).then(response => response.data),
  
  // Cập nhật vị trí kho mới
  update: (id, warehouseLocationData) =>
    axiosInstance.put(`/warehouse-location/update_warehouse_location/${id}`,warehouseLocationData).then(response => response.data),

  // Xóa vị trí kho mới
  delete: (id) =>
    axiosInstance.delete(`/warehouse-location/delete_warehouse_location/${id}`).then(response => response.data)
};
export default axiosInstance;