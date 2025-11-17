import { useState, useEffect, useCallback } from "react";
import { productAPI } from "../../utils/fetchFromAPI.js";
import "./Products.css";

const formatPrice = (price) => {
  if (!price && price !== 0) return "-";
  return `${Number(price).toLocaleString('vi-VN')} VNĐ`;
};

function Products() {
  const [products, setProducts] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    ma_sp: "",
    ten_sp: "",
    don_vi_tinh: "",
    gia: "",
    mo_ta: ""
  });

  // Fetch tất cả sản phẩm
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await productAPI.getAll();
      const data = response.data || [];
      setProducts(data);
      setFilteredList(data);
    } catch (error) {
      alert("Không thể tải danh sách sản phẩm!");
    } finally {
      setLoading(false);
    }
  };

  // Tìm kiếm server-side (debounce 500ms)
  const performSearch = useCallback(async (keyword) => {
    if (!keyword.trim()) {
      fetchProducts();
      return;
    }
    setLoading(true);
    try {
      const response = await productAPI.search(keyword);
      setFilteredList(response.data || []);
    } catch (error) {
      const msg = error.response?.data?.message || "Lỗi tìm kiếm!";
      alert(msg);
      setFilteredList([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(searchText);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchText, performSearch]);

  // Load lần đầu
  useEffect(() => {
    fetchProducts();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddNew = () => {
    setEditingItem(null);
    setFormData({
      ma_sp: "",
      ten_sp: "",
      don_vi_tinh: "",
      gia: "",
      mo_ta: ""
    });
    setShowForm(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      ma_sp: item.ma_sp,
      ten_sp: item.ten_sp,
      don_vi_tinh: item.don_vi_tinh,
      gia: item.gia || "",
      mo_ta: item.mo_ta || ""
    });
    setShowForm(true);
  };

  const handleDelete = async (id, tenSp) => {
    if (window.confirm(`Xóa sản phẩm "${tenSp}"?`)) {
      try {
        await productAPI.delete(id);
        alert("Xóa sản phẩm thành công!");
        fetchProducts();
      } catch (error) {
        const msg = error.response?.data?.message || "Không thể xóa (sản phẩm đang có trong kho)";
        alert(msg);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.ma_sp || !formData.ten_sp || !formData.don_vi_tinh) {
      alert("Vui lòng nhập đầy đủ: Mã SP, Tên SP, Đơn vị tính!");
      return;
    }

    try {
      if (editingItem) {
        await productAPI.update(editingItem.id, formData);
        alert("Cập nhật sản phẩm thành công!");
      } else {
        await productAPI.create(formData);
        alert("Thêm sản phẩm thành công!");
      }
      setShowForm(false);
      fetchProducts();
    } catch (error) {
      const msg = error.response?.data?.message || "Lỗi khi lưu sản phẩm!";
      alert(msg);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingItem(null);
  };

  return (
    <div className="container">
      <h1 className="title">Quản lý sản phẩm</h1>

      <div className="filters">
        <input
          type="text"
          className="search-input"
          placeholder="Tìm theo tên sản phẩm..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          disabled={loading}
        />
        <button className="btn-add" onClick={handleAddNew} disabled={loading}>
          + Thêm sản phẩm
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "40px" }}>
          <p>Đang tải...</p>
        </div>
      ) : (
        <table className="table-container">
          <thead>
            <tr>
              <th>Mã SP</th>
              <th>Tên sản phẩm</th>
              <th>Đơn vị</th>
              <th>Giá</th>
              <th>Mô tả</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredList.length > 0 ? (
              filteredList.map((item) => (
                <tr key={item.id}>
                  <td>{item.ma_sp}</td>
                  <td>{item.ten_sp}</td>
                  <td>{item.don_vi_tinh}</td>
                  <td>{formatPrice(item.gia)}</td>
                  <td>{item.mo_ta || "-"}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn-edit" onClick={() => handleEdit(item)}>
                        Sửa
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => handleDelete(item.id, item.ten_sp)}
                      >
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="no-data">
                  {searchText ? "Không tìm thấy sản phẩm" : "Chưa có sảnCable sản phẩm"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {/* Modal Form */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingItem ? "Sửa sản phẩm" : "Thêm sản phẩm mới"}</h2>
              <button className="close-btn" onClick={handleCloseForm}>×</button>
            </div>

            <form onSubmit={handleSubmit} className="form-container">
              <div className="form-group">
                <label>Mã sản phẩm *</label>
                <input
                  type="text"
                  name="ma_sp"
                  value={formData.ma_sp}
                  onChange={handleInputChange}
                  required
                  disabled={!!editingItem}
                  placeholder="VD: SP001"
                />
              </div>

              <div className="form-group">
                <label>Tên sản phẩm *</label>
                <input
                  type="text"
                  name="ten_sp"
                  value={formData.ten_sp}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                   <label>Đơn vị tính *</label>
                   <select
                    name="don_vi_tinh"
                    value={formData.don_vi_tinh}
                    onChange={handleInputChange}
                    required
                   >
                    <option value="" disabled>-- Chọn đơn vị --</option> 
                    <option value="cái">Cái</option>
                    <option value="thùng">Thùng</option>
                    <option value="kg">Kg</option>
                   </select>                  
             </div>

              <div className="form-group">
                <label>Giá (VNĐ)</label>
                <input
                  type="number"
                  name="gia"
                  value={formData.gia}
                  onChange={handleInputChange}
                  min="0"
                  step="1000"
                />
              </div>

              <div className="form-group">
                <label>Mô tả</label>
                <textarea
                  name="mo_ta"
                  value={formData.mo_ta}
                  onChange={handleInputChange}
                  rows="3"
                  className="form-textarea"
                  placeholder="Ghi chú về sản phẩm..."
                />
              </div>

              <div className="form-actions">
                <button type="button" onClick={handleCloseForm} className="btn-cancel">
                  Hủy
                </button>
                <button type="submit" className="btn-submit">
                  {editingItem ? "Cập nhật" : "Thêm mới"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Products;