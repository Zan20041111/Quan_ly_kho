import { useState, useEffect, useCallback } from "react";
import { reportsAPI, warehouseAPI } from "../../utils/fetchFromAPI.js";
import "./InventoryReport.css";

const formatNumber = (value) => {
  if (value === null || value === undefined) return "0";
  return Number(value).toLocaleString("vi-VN");
};

function InventoryReport() {
  const [inventoryData, setInventoryData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [warehouses, setWarehouses] = useState([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState("");
  const [searchText, setSearchText] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [detailData, setDetailData] = useState(null);

  // Fetch warehouses
  useEffect(() => {
    const fetchWarehouses = async () => {
      try {
        const res = await warehouseAPI.getAll();
        setWarehouses(Array.isArray(res) ? res : (res?.data || []));
      } catch (error) {
        console.error("Lỗi khi tải danh sách kho:", error);
      }
    };
    fetchWarehouses();
  }, []);

  // Fetch inventory data
  const fetchInventoryData = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedWarehouse) {
        params.kho_id = selectedWarehouse;
      }
      if (searchText.trim()) {
        params.keyword = searchText.trim();
      }

      const res = await reportsAPI.getInventoryByProduct(params);
      const data = res.data || [];
      setInventoryData(data);
      setFilteredData(data);
    } catch (error) {
      alert(error.response?.data?.message || "Lỗi khi tải báo cáo tồn kho!");
      setInventoryData([]);
      setFilteredData([]);
    } finally {
      setLoading(false);
    }
  }, [selectedWarehouse, searchText]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchInventoryData();
    }, 500);
    return () => clearTimeout(timer);
  }, [fetchInventoryData]);

  // View detail for a product
  const viewDetail = async (product) => {
    try {
      setLoading(true);
      const params = {};
      if (selectedWarehouse) {
        params.kho_id = selectedWarehouse;
      }
      const res = await reportsAPI.getInventoryDetailByProduct(product.id, params);
      setDetailData(res.data);
      setSelectedProduct(product);
    } catch (error) {
      alert(error.response?.data?.message || "Lỗi khi tải chi tiết tồn kho!");
    } finally {
      setLoading(false);
    }
  };

  const closeDetail = () => {
    setSelectedProduct(null);
    setDetailData(null);
  };

  return (
    <div className="container">
      <h1 className="title">Báo cáo Tồn kho</h1>

      <div className="filters">
        <div className="filter-group">
          <label>Lọc theo kho:</label>
          <select
            value={selectedWarehouse}
            onChange={(e) => setSelectedWarehouse(e.target.value)}
            className="filter-select"
          >
            <option value="">Tất cả kho</option>
            {warehouses.map(w => (
              <option key={w.id} value={w.id}>{w.ten_kho}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Tìm kiếm:</label>
          <input
            type="text"
            className="search-input"
            placeholder="Tìm theo mã SP hoặc tên sản phẩm..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            disabled={loading}
          />
        </div>
      </div>

      {/* Bảng báo cáo */}
      {loading ? (
        <p style={{ textAlign: "center", padding: "40px" }}>Đang tải...</p>
      ) : (
        <table className="table-container">
          <thead>
            <tr>
              <th>STT</th>
              <th>Mã SP</th>
              <th>Tên sản phẩm</th>
              <th>Đơn vị</th>
              <th>Tổng số lượng tồn</th>
              <th>Số vị trí lưu</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length > 0 ? (
              filteredData.map((item, index) => (
                <tr key={item.id}>
                  <td>{index + 1}</td>
                  <td>{item.ma_sp}</td>
                  <td>{item.ten_sp}</td>
                  <td>{item.don_vi_tinh}</td>
                  <td className="number-cell">{formatNumber(item.tong_ton)}</td>
                  <td className="number-cell">{item.so_vi_tri}</td>
                  <td>
                    <button
                      className="btn-view"
                      onClick={() => viewDetail(item)}
                      disabled={item.tong_ton === 0}
                    >
                      Chi tiết
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="no-data">
                  Không có dữ liệu tồn kho
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {/* Modal chi tiết tồn kho theo vị trí */}
      {selectedProduct && detailData && (
        <div className="modal-overlay">
          <div className="modal-content wide">
            <div className="modal-header">
              <h2>
                Chi tiết tồn kho: {detailData.san_pham?.ma_sp} - {detailData.san_pham?.ten_sp}
              </h2>
              <button className="close-btn" onClick={closeDetail}>×</button>
            </div>

            <div className="detail-info">
              <p><strong>Mã SP:</strong> {detailData.san_pham?.ma_sp}</p>
              <p><strong>Tên sản phẩm:</strong> {detailData.san_pham?.ten_sp}</p>
              <p><strong>Đơn vị:</strong> {detailData.san_pham?.don_vi_tinh}</p>
              {selectedWarehouse && (
                <p><strong>Kho:</strong> {warehouses.find(w => w.id === Number(selectedWarehouse))?.ten_kho}</p>
              )}
            </div>

            <h3 className="detail-section-title">Chi tiết tồn kho theo vị trí</h3>
            {detailData.chi_tiet && detailData.chi_tiet.length > 0 ? (
              <table className="detail-table">
                <thead>
                  <tr>
                    <th>STT</th>
                    <th>Mã vị trí</th>
                    <th>Tên vị trí</th>
                    <th>Kho</th>
                    <th>Số lượng tồn</th>
                  </tr>
                </thead>
                <tbody>
                  {detailData.chi_tiet.map((item, index) => (
                    <tr key={item.vi_tri_id}>
                      <td>{index + 1}</td>
                      <td>{item.ma_vi_tri}</td>
                      <td>{item.ten_vi_tri || "-"}</td>
                      <td>{item.kho?.ten_kho || "-"}</td>
                      <td className="number-cell">{formatNumber(item.so_luong_ton)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p style={{ padding: "20px", textAlign: "center", color: "#6c757d" }}>
                Không có tồn kho tại vị trí nào
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default InventoryReport;

