import { useState, useEffect, useCallback } from "react";
import {
  goodsIssueAPI,
  warehouseAPI,
  customerAPI,
  productAPI,
  warehouseLocationAPI,
  reportsAPI
} from "../../utils/fetchFromAPI.js";
import "./ExportIssue.css";

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

function ExportIssue() {
  const [issues, setIssues] = useState([]);
  const [filteredIssues, setFilteredIssues] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(false);
  const [warehouses, setWarehouses] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [allLocations, setAllLocations] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [inventoryData, setInventoryData] = useState({}); // Lưu danh sách vị trí có hàng: { "san_pham_id-kho_id": [{ id, ma_vi_tri, so_luong_ton }] }

  // Form state
  const [formData, setFormData] = useState({
    kho_id: "",
    khach_hang_id: "",
    ghi_chu: "",
    ngay_xuat: formatDate(new Date()),
    details: [] // { san_pham_id, so_luong, vi_tri_id }
  });

  // Fetch data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [whRes, custRes, prodRes, locRes, issueRes] = await Promise.all([
        warehouseAPI.getAll(),
        customerAPI.getAll(),
        productAPI.getAll(),
        warehouseLocationAPI.getAll(),
        goodsIssueAPI.getAll()
      ]);
      setWarehouses(Array.isArray(whRes) ? whRes : (whRes?.data || []));
      setCustomers(custRes.data || []);
      setProducts(prodRes.data || []);
      const allLocs = Array.isArray(locRes) ? locRes : (locRes?.data || []);
      setAllLocations(allLocs);
      setIssues(issueRes.data || []);
      setFilteredIssues(issueRes.data || []);
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
      setFilteredIssues(issues);
      return;
    }
    setLoading(true);
    try {
      const res = await goodsIssueAPI.search(keyword);
      setFilteredIssues(res.data || []);
    } catch (error) {
      alert(error.response?.data?.message || "Lỗi tìm kiếm!");
      setFilteredIssues([]);
    } finally {
      setLoading(false);
    }
  }, [issues]);

  useEffect(() => {
    const timer = setTimeout(() => performSearch(searchText), 500);
    return () => clearTimeout(timer);
  }, [searchText, performSearch]);

  // Lấy danh sách vị trí có tồn kho cho sản phẩm đã chọn
  const loadAvailableLocations = async (san_pham_id, kho_id) => {
    if (!san_pham_id || !kho_id) {
      return [];
    }

    const cacheKey = `${san_pham_id}-${kho_id}`;
    
    // Kiểm tra cache
    if (inventoryData[cacheKey]) {
      return inventoryData[cacheKey];
    }

    try {
      // Gọi API để lấy chi tiết tồn kho theo vị trí
      const params = { kho_id: kho_id };
      const res = await reportsAPI.getInventoryDetailByProduct(san_pham_id, params);
      const chiTiet = res.data?.chi_tiet || [];
      
      // Lọc chỉ lấy các vị trí có tồn kho > 0
      const availableLocations = chiTiet
        .filter(item => item.so_luong_ton > 0)
        .map(item => ({
          id: item.vi_tri_id,
          ma_vi_tri: item.ma_vi_tri,
          ten_vi_tri: item.ten_vi_tri,
          kho_id: item.kho_id,
          so_luong_ton: item.so_luong_ton
        }));

      // Lưu vào cache
      setInventoryData(prev => ({
        ...prev,
        [cacheKey]: availableLocations
      }));

      return availableLocations;
    } catch (error) {
      console.error("Lỗi khi tải vị trí có hàng:", error);
      return [];
    }
  };

  // Lấy danh sách vị trí có hàng từ cache
  const getAvailableLocations = (san_pham_id, kho_id) => {
    if (!san_pham_id || !kho_id) return [];
    
    const cacheKey = `${san_pham_id}-${kho_id}`;
    return inventoryData[cacheKey] || [];
  };

  // Form handlers
  const handleInputChange = async (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newFormData = { ...prev, [name]: value };
      if (name === "kho_id") {
        newFormData.details = prev.details.map(d => ({
          ...d,
          vi_tri_id: "" // Reset vị trí khi đổi kho
        }));
        // Xóa cache khi đổi kho
        setInventoryData({});
        
        // Load lại danh sách vị trí có hàng cho các sản phẩm đã chọn
        if (value) {
          prev.details.forEach(d => {
            if (d.san_pham_id) {
              loadAvailableLocations(d.san_pham_id, value);
            }
          });
        }
      }
      return newFormData;
    });
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      kho_id: "",
      khach_hang_id: "",
      ghi_chu: "",
      ngay_xuat: formatDate(new Date()),
      details: []
    });
    setInventoryData({});
  };

  const addProductRow = () => {
    setFormData(prev => ({
      ...prev,
      details: [...prev.details, { san_pham_id: "", so_luong: "", vi_tri_id: "" }]
    }));
  };

  const updateDetail = async (index, field, value) => {
    setFormData(prev => {
      const newDetails = [...prev.details];
      newDetails[index][field] = value;
      
      // Nếu thay đổi sản phẩm, reset vị trí và load lại danh sách vị trí có hàng
      if (field === "san_pham_id") {
        newDetails[index].vi_tri_id = "";
        
        // Load danh sách vị trí có hàng cho sản phẩm mới
        if (value && prev.kho_id) {
          loadAvailableLocations(value, prev.kho_id);
        }
      }
      
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
      // Bước 1: Tạo phiếu xuất
      const issueRes = await goodsIssueAPI.create({
        kho_id: formData.kho_id,
        khach_hang_id: formData.khach_hang_id,
        ghi_chu: formData.ghi_chu || null,
        ngay_xuat: formData.ngay_xuat
      });

      const phieu_xuat_id = issueRes.data.id;

      // Bước 2: Thêm từng sản phẩm vào phiếu (API addProduct thêm từng sản phẩm)
      for (const d of formData.details) {
        await goodsIssueAPI.addProduct({
          phieu_xuat_id,
          san_pham_id: d.san_pham_id,
          so_luong: d.so_luong,
          vi_tri_id: d.vi_tri_id
        });
      }

      alert("Xuất kho thành công!");
      resetForm();
      setShowForm(false);
      fetchData();
    } catch (error) {
      const msg = error.response?.data?.message || "Lỗi khi xuất kho!";
      alert(msg);
    }
  };

  const viewDetail = async (id) => {
    try {
      const res = await goodsIssueAPI.getDetail(id);
      setSelectedIssue(res.data);
    } catch (error) {
      alert("Lỗi khi xem chi tiết!");
    }
  };

  const closeDetail = () => setSelectedIssue(null);

  return (
    <div className="container">
      <h1 className="title">Xuất kho</h1>

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
          + Tạo phiếu xuất
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
              <th>Ngày xuất</th>
              <th>Kho</th>
              <th>Khách hàng</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredIssues.length > 0 ? (
              filteredIssues.map(i => (
                <tr key={i.id}>
                  <td>{i.ma_phieu}</td>
                  <td>{formatDate(i.ngay_xuat)}</td>
                  <td>{i.kho?.ten_kho || "-"}</td>
                  <td>{i.khach_hang?.ten_kh || "-"}</td>
                  <td>
                    <button className="btn-view" onClick={() => viewDetail(i.id)}>
                      Chi tiết
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="5" className="no-data">Không có phiếu xuất</td></tr>
            )}
          </tbody>
        </table>
      )}

      {/* Form tạo phiếu */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content wide">
            <div className="modal-header">
              <h2>Tạo phiếu xuất kho</h2>
              <button className="close-btn" onClick={() => {
                resetForm();
                setShowForm(false);
              }}>×</button>
            </div>

            <form onSubmit={handleSubmit} className="form-container">
              <div className="form-row">
                <div className="form-group">
                  <label>Kho xuất *</label>
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
                  <label>Ngày xuất</label>
                  <input type="date" name="ngay_xuat" value={formData.ngay_xuat} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label>Ghi chú</label>
                  <input type="text" name="ghi_chu" value={formData.ghi_chu} onChange={handleInputChange} />
                </div>
              </div>

              <div className="detail-section">
                <h3>Chi tiết sản phẩm xuất</h3>
                <button type="button" className="btn-add-small" onClick={addProductRow}>
                  + Thêm sản phẩm
                </button>

                <table className="detail-table">
                  <thead>
                    <tr>
                      <th>STT</th>
                      <th>Sản phẩm</th>
                      <th>Đơn vị</th>
                      <th>Số lượng xuất</th>
                      <th>Vị trí lấy hàng</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.details.map((d, i) => {
                      const selectedProduct = products.find(p => p.id === Number(d.san_pham_id) || p.id === d.san_pham_id);
                      const availableLocations = getAvailableLocations(d.san_pham_id, formData.kho_id);
                      
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
                              disabled={!formData.kho_id || !d.san_pham_id}
                            >
                              <option value="">
                                {!formData.kho_id ? "-- Chọn kho trước --" : 
                                 !d.san_pham_id ? "-- Chọn sản phẩm trước --" :
                                 availableLocations.length === 0 ? "-- Không có vị trí có hàng --" :
                                 "-- Chọn vị trí --"}
                              </option>
                              {availableLocations
                                .filter(l => !formData.details.some((dd, j) => j !== i && dd.vi_tri_id === l.id && dd.san_pham_id === d.san_pham_id))
                                .map(l => (
                                  <option key={l.id} value={l.id}>
                                    {l.ma_vi_tri} {l.so_luong_ton !== undefined ? `(tồn: ${l.so_luong_ton})` : ""}
                                  </option>
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
                  Lưu phiếu xuất
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Chi tiết phiếu */}
      {selectedIssue && (
        <div className="modal-overlay">
          <div className="modal-content wide">
            <div className="modal-header">
              <h2>Chi tiết phiếu xuất: {selectedIssue.ma_phieu}</h2>
              <button className="close-btn" onClick={closeDetail}>×</button>
            </div>
            <div className="detail-info">
              <p><strong>Ngày xuất:</strong> {formatDate(selectedIssue.ngay_xuat)}</p>
              <p><strong>Kho:</strong> {selectedIssue.kho?.ten_kho}</p>
              <p><strong>Khách hàng:</strong> {selectedIssue.khach_hang?.ten_kh}</p>
              <p><strong>Ghi chú:</strong> {selectedIssue.ghi_chu || "-"}</p>
            </div>
            <h3 className="detail-section-title">Sản phẩm xuất</h3>
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
                {selectedIssue.chi_tiet_xuats?.map((d, i) => (
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

export default ExportIssue;

