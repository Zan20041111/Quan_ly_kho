import { useState, useEffect } from "react";
import { warehouseAPI } from "../../utils/fetchFromAPI.js";
import "./WareHouse.css";

function WareHouse() {
  const [warehouses, setWarehouses] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [filteredList, setFilteredList] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    ma_kho: "",
    ten_kho: "",
    dia_chi: "",
    ghi_chu: ""
  });

  // Fetch danh sách kho từ backend
  const fetchWarehouses = async () => {
    try {
      const data = await warehouseAPI.getAll();
      setWarehouses(data);
      setFilteredList(data);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu kho:", error);
      alert("Lỗi khi tải dữ liệu kho!");
    }
  };

  // Load danh sách kho khi component mount
  useEffect(() => {
    fetchWarehouses();
  }, []);

  // Lọc danh sách khi searchText thay đổi
  useEffect(() => {
    const filtered = warehouses.filter(
      (item) =>
        item.ten_kho.toLowerCase().includes(searchText.toLowerCase()) ||
        item.ma_kho.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredList(filtered);
  }, [searchText, warehouses]);

  // Xử lý thay đổi form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Thêm kho mới
  const handleAddNew = () => {
    setEditingItem(null);
    setFormData({
      ma_kho: "",
      ten_kho: "",
      dia_chi: "",
      ghi_chu: ""
    });
    setShowForm(true);
  };

  // Sửa kho
  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      ma_kho: item.ma_kho,
      ten_kho: item.ten_kho,
      dia_chi: item.dia_chi,
      ghi_chu: item.ghi_chu
    });
    setShowForm(true);
  };

  // Xóa kho
  const handleDelete = async (id, tenKho) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa kho "${tenKho}" không?`)) {
      try {
        await warehouseAPI.delete(id);
        alert("Xóa kho thành công!");
        fetchWarehouses();
      } catch (error) {
        console.error("Lỗi khi xóa kho:", error);
        alert("Lỗi khi xóa kho!");
      }
    }
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingItem) {
        // Cập nhật
        await warehouseAPI.update(editingItem.id, formData);
        alert("Cập nhật kho thành công!");
      } else {
        // Thêm mới
        await warehouseAPI.create(formData);
        alert("Thêm kho thành công!");
      }
      
      setShowForm(false);
      fetchWarehouses();
    } catch (error) {
      console.error("Lỗi khi lưu kho:", error);
      alert("Lỗi khi lưu kho!");
    }
  };

  // Đóng form
  const handleCloseForm = () => {
    setShowForm(false);
    setEditingItem(null);
  };

  return (
    <div className="container">
      <h1 className="title">Quản lý kho</h1>

      {/* Bộ lọc và tìm kiếm */}
      <div className="filters">
        <input
          type="text"
          className="search-input"
          placeholder="Nhập mã hoặc tên kho để tìm kiếm"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />

        {/* Nút thêm mới */}
        <button className="btn-add" onClick={handleAddNew}>
          + Thêm kho mới
        </button>
      </div>

      {/* Bảng danh sách kho */}
      <table className="table-container">
        <thead>
          <tr>
            <th>Mã kho</th>
            <th>Tên kho</th>
            <th>Địa chỉ</th>
            <th>Ghi chú</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {filteredList.length > 0 ? (
            filteredList.map((item) => (
              <tr key={item.id}>
                <td>{item.ma_kho}</td>
                <td>{item.ten_kho}</td>
                <td>{item.dia_chi}</td>
                <td>{item.ghi_chu}</td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="btn-edit"
                      onClick={() => handleEdit(item)}
                    >
                      Sửa
                    </button>
                    <button 
                      className="btn-delete"
                      onClick={() => handleDelete(item.id, item.ten_kho)}
                    >
                      Xóa
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="no-data">
                Không tìm thấy kho nào
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Form thêm/sửa */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingItem ? "Sửa thông tin kho" : "Thêm kho mới"}</h2>
              <button className="close-btn" onClick={handleCloseForm}>×</button>
            </div>
            
            <form onSubmit={handleSubmit} className="form-container">
              <div className="form-group">
                <label>Mã kho:</label>
                <input
                  type="text"
                  name="ma_kho"
                  value={formData.ma_kho}
                  onChange={handleInputChange}
                  required
                    disabled={editingItem}
                />
              </div>
              
              <div className="form-group">
                <label>Tên kho:</label>
                <input
                  type="text"
                  name="ten_kho"
                  value={formData.ten_kho}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Địa chỉ:</label>
                <input
                  type="text"
                  name="dia_chi"
                  value={formData.dia_chi}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Ghi chú:</label>
                <textarea
                  name="ghi_chu"
                  value={formData.ghi_chu}
                  onChange={handleInputChange}
                  rows="3"
                  className="form-textarea"
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

export default WareHouse;