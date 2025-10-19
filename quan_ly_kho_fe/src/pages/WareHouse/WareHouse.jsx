import { useState, useEffect } from "react";
import { warehouseAPI } from "../../utils/fetchFromAPI.js";
import "./WareHouse.css";

function WareHouse() {
  const [warehouses, setWarehouses] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [filteredList, setFilteredList] = useState([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
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

  // Reset form
  const resetForm = () => {
    setFormData({
      ma_kho: "",
      ten_kho: "",
      dia_chi: "",
      ghi_chu: ""
    });
    setSelectedWarehouse(null);
    setIsEditing(false);
  };

  // Thêm kho mới
  const handleAdd = async () => {
    try {
      await warehouseAPI.create(formData);
      alert("Thêm kho thành công!");
      resetForm();
      fetchWarehouses();
    } catch (error) {
      console.error("Lỗi khi thêm kho:", error);
      alert("Lỗi khi thêm kho!");
    }
  };

  // Sửa kho
  const handleEdit = async () => {
    if (!selectedWarehouse) {
      alert("Vui lòng chọn kho để sửa!");
      return;
    }

    try {
      await warehouseAPI.update(selectedWarehouse.id, formData);
      alert("Cập nhật kho thành công!");
      resetForm();
      fetchWarehouses();
    } catch (error) {
      console.error("Lỗi khi cập nhật kho:", error);
      alert("Lỗi khi cập nhật kho!");
    }
  };

  // Xóa kho
  const handleDelete = async () => {
    if (!selectedWarehouse) {
      alert("Vui lòng chọn kho để xóa!");
      return;
    }

    if (!window.confirm(`Bạn có chắc muốn xóa kho "${selectedWarehouse.ten_kho}"?`)) {
      return;
    }

    try {
      await warehouseAPI.delete(selectedWarehouse.id);
      alert("Xóa kho thành công!");
      resetForm();
      fetchWarehouses();
    } catch (error) {
      console.error("Lỗi khi xóa kho:", error);
      alert("Lỗi khi xóa kho!");
    }
  };

  // Chọn kho từ bảng
  const handleSelectWarehouse = (warehouse) => {
    setSelectedWarehouse(warehouse);
    setFormData({
      ma_kho: warehouse.ma_kho,
      ten_kho: warehouse.ten_kho,
      dia_chi: warehouse.dia_chi,
      ghi_chu: warehouse.ghi_chu
    });
    setIsEditing(true);
  };

  return (
    <div className="warehouse-container">
      <h1 className="warehouse-title">Nhà kho</h1>

      {/* Form thêm/sửa kho */}
      <div className="warehouse-form">
        <h3>{isEditing ? "Sửa thông tin kho" : "Thêm kho mới"}</h3>
        <form onSubmit={(e) => e.preventDefault()}> {/* Ngăn submit mặc định */}
          <div className="form-row">
            <div className="form-group">
              <label>Mã kho:</label>
              <input
                type="text"
                name="ma_kho"
                value={formData.ma_kho}
                onChange={handleInputChange}
                required
                disabled={isEditing}
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
          </div>
          <div className="form-group">
            <label>Ghi chú:</label>
            <textarea
              name="ghi_chu"
              value={formData.ghi_chu}
              onChange={handleInputChange}
              rows="3"
            />
          </div>
          {/* Hiển thị thông tin kho được chọn */}
          {selectedWarehouse && (
            <div className="selected-info">
              <p>Đang chọn: <strong>{selectedWarehouse.ten_kho}</strong> ({selectedWarehouse.ma_kho})</p>
            </div>
          )}
          {/* Nút thêm xóa sửa*/}
          <div className="warehouse-buttons">
            <button className="btn btn-add" onClick={handleAdd}>
              Thêm
            </button>
            <button
              className="btn btn-edit"
              onClick={handleEdit}
              disabled={!selectedWarehouse}
            >
              Sửa
            </button>
            <button
              className="btn btn-delete"
              onClick={handleDelete}
              disabled={!selectedWarehouse}
            >
              Xóa
            </button>
          </div>
        </form>
      </div>

      {/* Tìm kiếm */}
      <div className="warehouse-search">
        <input
          type="text"
          placeholder="Nhập để tìm kiếm..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>

      {/* Bảng danh sách kho */}
      <table className="warehouse-table">
        <thead>
          <tr>
            <th>Mã kho</th>
            <th>Tên kho</th>
            <th>Địa chỉ</th>
            <th>Ghi chú</th>
          </tr>
        </thead>
        <tbody>
          {filteredList.length > 0 ? (
            filteredList.map((item) => (
              <tr 
                key={item.id} 
                className={selectedWarehouse?.id === item.id ? "selected" : ""}
                onClick={() => handleSelectWarehouse(item)}
                style={{cursor: 'pointer'}}
              >
                <td>{item.ma_kho}</td>
                <td>{item.ten_kho}</td>
                <td>{item.dia_chi}</td>
                <td>{item.ghi_chu}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="no-result">
                Không tìm thấy kho nào
              </td>
            </tr>
          )}
        </tbody>
      </table>

     
    </div>
  );
}

export default WareHouse;