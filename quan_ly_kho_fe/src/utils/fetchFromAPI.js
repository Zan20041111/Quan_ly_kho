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
export const customerAPI = {
  // Lấy tất cả khách hàng
  getAll: () =>
    axiosInstance.get(`/customer/get_all_customer`).then(res => res.data),

  // Tìm kiếm khách hàng theo keyword (tên hoặc sdt)
  search: (keyword) =>
    axiosInstance.get(`/customer/search_customer`, {
      params: { keyword }
    }).then(res => res.data),

  // Tạo khách hàng mới
  create: (customerData) =>
    axiosInstance.post(`/customer/create_customer`, customerData).then(res => res.data),

  // Cập nhật khách hàng theo ID
  update: (id, customerData) =>
    axiosInstance.put(`/customer/update_customer/${id}`, customerData).then(res => res.data),

  // Xóa khách hàng theo ID
  delete: (id) =>
    axiosInstance.delete(`/customer/delete_customer/${id}`).then(res => res.data)
};
export const productAPI = {
  // Lấy tất cả sản phẩm
  getAll: () =>
    axiosInstance.get(`/product/get_all_products`).then(res => res.data),

  // Tìm kiếm sản phẩm theo tên
  search: (keyword) =>
    axiosInstance.get(`/product/search_product`, {
      params: { keyword }
    }).then(res => res.data),

  // Tạo sản phẩm mới
  create: (productData) =>
    axiosInstance.post(`/product/create_product`, productData).then(res => res.data),

  // Cập nhật sản phẩm theo ID
  update: (id, productData) =>
    axiosInstance.put(`/product/update_product/${id}`, productData).then(res => res.data),

  // Xóa sản phẩm theo ID
  delete: (id) =>
    axiosInstance.delete(`/product/delete_product/${id}`).then(res => res.data)
};
export const goodsReceiptAPI = {
  // Lấy tất cả phiếu nhập
  getAll: () =>
    axiosInstance.get(`/goods-receipt/get_all_goodsreceipt`).then(res => res.data),

  // Tạo phiếu nhập tự động (PN001, PN002...)
  create: (data) =>
    axiosInstance.post(`/goods-receipt/create_goodsreceipt`, data).then(res => res.data),

  // Thêm nhiều sản phẩm vào phiếu
  addProducts: (data) =>
    axiosInstance.post(`/goods-receipt/add_many_product`, data).then(res => res.data),

  // Lấy chi tiết phiếu nhập theo ID
  getDetail: (id) =>
    axiosInstance.get(`/goods-receipt/get_detail_goodsreceipt_byid/${id}`).then(res => res.data),

  // Tìm kiếm phiếu nhập theo mã, kho, ngày
  search: (keyword) =>
    axiosInstance.get(`/goods-receipt/search_goodsreceipt`, { params: { keyword } }).then(res => res.data)
};
export const goodsIssueAPI = {
  // Lấy tất cả phiếu xuất
  getAll: () =>
    axiosInstance.get(`/goods-issue/get_all_goodsissue`).then(res => res.data),

  // Tạo phiếu xuất tự động (PX001, PX002...)
  create: (data) =>
    axiosInstance.post(`/goods-issue/create_goodsissue`, data).then(res => res.data),

  // Thêm 1 sản phẩm vào phiếu (exportProduct)
  addProduct: (data) =>
    axiosInstance.post(`/goods-issue/export_product`, data).then(res => res.data),

  // Lấy chi tiết phiếu xuất theo ID
  getDetail: (id) =>
    axiosInstance.get(`/goods-issue/get_detail_goodsissue_byid/${id}`).then(res => res.data),

  // Tìm kiếm phiếu xuất theo mã, kho, ngày
  search: (keyword) =>
    axiosInstance.get(`/goods-issue/search_goodsissue`, { params: { keyword } }).then(res => res.data),
};
export default axiosInstance;
