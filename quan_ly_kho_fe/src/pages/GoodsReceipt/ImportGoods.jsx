// src/components/ImportGoods.jsx
import { useState, useEffect, useCallback } from "react";
import { goodsReceiptAPI, warehouseAPI, customerAPI, productAPI, warehouseLocationAPI } from "../../utils/fetchFromAPI.js";
import "./ImportGoods.css";

const formatCurrency = (value) => (value ? `${Number(value).toLocaleString("vi-VN")} đ` : "-");
const formatDate = (date) => {
  if (!date) return "";
  try {
    // Nếu đã là string dạng YYYY-MM-DD thì trả về luôn
    if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}/.test(date)) {
      return date.split('T')[0];
    }
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return "";
    }
    // Format thành YYYY-MM-DD
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error("Error formatting date:", error, date);
    return "";
  }
};

function ImportGoods() {
  const [receipts, setReceipts] = useState([]);
  const [filteredReceipts, setFilteredReceipts] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(false);
  const [warehouses, setWarehouses] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [allLocations, setAllLocations] = useState([]); // Tất cả vị trí
  const [showForm, setShowForm] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    kho_id: "",
    khach_hang_id: "",
    ghi_chu: "",
    ngay_nhap: formatDate(new Date()),
    details: [] // { san_pham_id, so_luong, vi_tri_id }
  });

  // Fetch data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [whRes, custRes, prodRes, locRes, receiptRes] = await Promise.all([
        warehouseAPI.getAll(),
        customerAPI.getAll(),
        productAPI.getAll(),
        warehouseLocationAPI.getAll(),
        goodsReceiptAPI.getAll()
      ]);
      // Backend getAllWarehouses và getAllWarehousesLocation trả về mảng trực tiếp
      setWarehouses(Array.isArray(whRes) ? whRes : (whRes?.data || []));
      setCustomers(custRes.data || []);
      setProducts(prodRes.data || []);
      // Backend getAllWarehousesLocation trả về mảng trực tiếp, không có wrapper {data: ...}
      const allLocs = Array.isArray(locRes) ? locRes : (locRes?.data || []);
      setAllLocations(allLocs.filter(l => l.trang_thai === 0));
      setReceipts(receiptRes.data || []);
      setFilteredReceipts(receiptRes.data || []);
    } catch (error) {
      alert("Lỗi khi tải dữ liệu!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Tìm kiếm server-side
  const performSearch = useCallback(async (keyword) => {
    if (!keyword.trim()) {
      setFilteredReceipts(receipts);
      return;
    }
    setLoading(true);
    try {
      const res = await goodsReceiptAPI.search(keyword);
      setFilteredReceipts(res.data || []);
    } catch (error) {
      alert(error.response?.data?.message || "Lỗi tìm kiếm!");
      setFilteredReceipts([]);
    } finally {
      setLoading(false);
    }
  }, [receipts]);

  useEffect(() => {
    const timer = setTimeout(() => performSearch(searchText), 500);
    return () => clearTimeout(timer);
  }, [searchText, performSearch]);

  // Form handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newFormData = { ...prev, [name]: value };
      // Nếu thay đổi kho, reset các vị trí đã chọn vì có thể không còn hợp lệ
      if (name === "kho_id") {
        newFormData.details = prev.details.map(d => ({
          ...d,
          vi_tri_id: "" // Reset vị trí khi đổi kho
        }));
      }
      return newFormData;
    });
  };

  // Lọc vị trí theo kho đã chọn
  const filteredLocations = formData.kho_id 
    ? allLocations.filter(l => l.kho_id === Number(formData.kho_id) || l.kho_id === formData.kho_id)
    : [];

  // Reset form về trạng thái ban đầu
  const resetForm = () => {
    setFormData({
      kho_id: "",
      khach_hang_id: "",
      ghi_chu: "",
      ngay_nhap: formatDate(new Date()),
      details: []
    });
  };

  const addProductRow = () => {
    setFormData(prev => ({
      ...prev,
      details: [...prev.details, { san_pham_id: "", so_luong: "", vi_tri_id: "" }]
    }));
  };

  const updateDetail = (index, field, value) => {
    setFormData(prev => {
      const newDetails = [...prev.details];
      newDetails[index][field] = value;
      return { ...prev, details: newDetails };
    });
  };

  const removeDetail = (index) => {
    setFormData(prev => ({
      ...prev,
      details: prev.details.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.kho_id || !formData.khach_hang_id) {
      alert("Vui lòng chọn kho và khách hàng!");
      return;
    }
    if (formData.details.length === 0) {
      alert("Vui lòng thêm ít nhất 1 sản phẩm!");
      return;
    }
    if (formData.details.some(d => !d.san_pham_id || !d.so_luong || !d.vi_tri_id)) {
      alert("Vui lòng nhập đầy đủ thông tin sản phẩm!");
      return;
    }

    try {
      // Bước 1: Tạo phiếu
      const receiptRes = await goodsReceiptAPI.create({
        kho_id: formData.kho_id,
        khach_hang_id: formData.khach_hang_id,
        ghi_chu: formData.ghi_chu || null,
        ngay_nhap: formData.ngay_nhap
      });

      const phieu_nhap_id = receiptRes.data.id;

      // Bước 2: Thêm sản phẩm
      const productsPayload = formData.details.map(d => ({
        san_pham_id: d.san_pham_id,
        so_luong: d.so_luong,
        vi_tri_id: d.vi_tri_id
      }));

      await goodsReceiptAPI.addProducts({
        phieu_nhap_id,
        products: productsPayload
      });

      alert("Nhập kho thành công!");
      resetForm();
      setShowForm(false);
      fetchData();
    } catch (error) {
      const msg = error.response?.data?.message || "Lỗi khi nhập kho!";
      alert(msg);
    }
  };

  const viewDetail = async (id) => {
    try {
      const res = await goodsReceiptAPI.getDetail(id);
      setSelectedReceipt(res.data);
    } catch (error) {
      alert("Lỗi khi xem chi tiết!");
    }
  };

  const closeDetail = () => setSelectedReceipt(null);

  return (
    <div className="container">
      <h1 className="title">Nhập kho</h1>

      <div className="filters">
        <input
          type="text"
          className="search-input"
          placeholder="Tìm theo mã phiếu, kho, ngày..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          disabled={loading}
        />
        <button className="btn-add" onClick={() => {
          resetForm();
          setShowForm(true);
        }} disabled={loading}>
          + Tạo phiếu nhập
        </button>
      </div>

      {/* Danh sách phiếu */}
      {loading ? (
        <p style={{ textAlign: "center", padding: "40px" }}>Đang tải...</p>
      ) : (
        <table className="table-container">
          <thead>
            <tr>
              <th>Mã phiếu</th>
              <th>Ngày nhập</th>
              <th>Kho</th>
              <th>Khách hàng</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredReceipts.length > 0 ? (
              filteredReceipts.map(r => (
                <tr key={r.id}>
                  <td>{r.ma_phieu}</td>
                  <td>{formatDate(r.ngay_nhap)}</td>
                  <td>{r.kho?.ten_kho || "-"}</td>
                  <td>{r.khach_hang?.ten_kh || "-"}</td>
                  <td>
                    <button className="btn-view" onClick={() => viewDetail(r.id)}>
                      Chi tiết
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="5" className="no-data">Không có phiếu nhập</td></tr>
            )}
          </tbody>
        </table>
      )}

      {/* Form tạo phiếu */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content wide">
            <div className="modal-header">
              <h2>Tạo phiếu nhập kho</h2>
              <button className="close-btn" onClick={() => {
                resetForm();
                setShowForm(false);
              }}>×</button>
            </div>

            <form onSubmit={handleSubmit} className="form-container">
              <div className="form-row">
                <div className="form-group">
                  <label>Kho nhập *</label>
                  <select name="kho_id" value={formData.kho_id} onChange={handleInputChange} required>
                    <option value="">-- Chọn kho --</option>
                    {warehouses.map(w => (
                      <option key={w.id} value={w.id}>{w.ten_kho}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Khách hàng *</label>
                  <select name="khach_hang_id" value={formData.khach_hang_id} onChange={handleInputChange} required>
                    <option value="">-- Chọn khách hàng --</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.ten_kh}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Ngày nhập</label>
                  <input type="date" name="ngay_nhap" value={formData.ngay_nhap} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label>Ghi chú</label>
                  <input type="text" name="ghi_chu" value={formData.ghi_chu} onChange={handleInputChange} />
                </div>
              </div>

              <div className="detail-section">
                <h3>Chi tiết sản phẩm</h3>
                <button type="button" className="btn-add-small" onClick={addProductRow}>
                  + Thêm sản phẩm
                </button>

                <table className="detail-table">
                  <thead>
                    <tr>
                      <th>STT</th>
                      <th>Sản phẩm</th>
                      <th>Đơn vị</th>
                      <th>Số lượng</th>
                      <th>Vị trí lưu kho</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.details.map((d, i) => {
                      // Convert sang number để so sánh đúng (vì select value là string)
                      const selectedProduct = products.find(p => p.id === Number(d.san_pham_id) || p.id === d.san_pham_id);
                      return (
                        <tr key={i}>
                          <td>{i + 1}</td>
                          <td>
                            <select
                              value={d.san_pham_id}
                              onChange={(e) => updateDetail(i, "san_pham_id", e.target.value)}
                              required
                            >
                              <option value="">-- Chọn sản phẩm --</option>
                              {products.map(p => (
                                <option key={p.id} value={p.id}>{p.ten_sp}</option>
                              ))}
                            </select>
                          </td>
                          <td>{selectedProduct?.don_vi_tinh || "-"}</td>
                          <td>
                            <input
                              type="number"
                              min="1"
                              value={d.so_luong}
                              onChange={(e) => updateDetail(i, "so_luong", e.target.value)}
                              required
                            />
                          </td>
                          <td>
                            <select
                              value={d.vi_tri_id}
                              onChange={(e) => updateDetail(i, "vi_tri_id", e.target.value)}
                              required
                              disabled={!formData.kho_id}
                            >
                              <option value="">
                                {formData.kho_id ? "-- Chọn vị trí --" : "-- Chọn kho trước --"}
                              </option>
                              {filteredLocations
                                .filter(l => !formData.details.some((dd, j) => j !== i && dd.vi_tri_id === l.id))
                                .map(l => (
                                  <option key={l.id} value={l.id}>{l.ma_vi_tri}</option>
                                ))}
                            </select>
                          </td>
                          <td>
                            <button type="button" className="btn-delete-small" onClick={() => removeDetail(i)}>
                              Xóa
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="form-actions">
                <button type="button" onClick={() => {
                  resetForm();
                  setShowForm(false);
                }} className="btn-cancel">
                  Hủy
                </button>
                <button type="submit" className="btn-submit">
                  Lưu phiếu nhập
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Chi tiết phiếu */}
      {selectedReceipt && (
        <div className="modal-overlay">
          <div className="modal-content wide">
            <div className="modal-header">
              <h2>Chi tiết phiếu nhập: {selectedReceipt.ma_phieu}</h2>
              <button className="close-btn" onClick={closeDetail}>×</button>
            </div>
            <div className="detail-info">
              <p><strong>Ngày nhập:</strong> {formatDate(selectedReceipt.ngay_nhap)}</p>
              <p><strong>Kho:</strong> {selectedReceipt.kho?.ten_kho}</p>
              <p><strong>Khách hàng:</strong> {selectedReceipt.khach_hang?.ten_kh}</p>
              <p><strong>Ghi chú:</strong> {selectedReceipt.ghi_chu || "-"}</p>
            </div>
            <h3 className="detail-section-title">Sản phẩm nhập</h3>
            <table className="detail-table">
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Sản phẩm</th>
                  <th>Đơn vị</th>
                  <th>Số lượng</th>
                  <th>Vị trí</th>
                </tr>
              </thead>
              <tbody>
                {selectedReceipt.chi_tiet_nhaps?.map((d, i) => (
                  <tr key={i}>
                    <td>{i + 1}</td>
                    <td>{d.san_pham?.ten_sp || "-"}</td>
                    <td>{d.san_pham?.don_vi_tinh || "-"}</td>
                    <td>{d.so_luong || 0}</td>
                    <td>{d.vi_tri?.ma_vi_tri || d.vi_tri?.ten_vi_tri || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default ImportGoods;