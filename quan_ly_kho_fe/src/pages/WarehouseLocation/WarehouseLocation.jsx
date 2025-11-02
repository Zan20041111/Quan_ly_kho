import { useState, useEffect } from "react";
import { warehouseLocationAPI, warehouseAPI } from "../../utils/fetchFromAPI.js";
import "../WarehouseLocation/WarehouseLocation.css";

function WarehouseLocation() {
    const [warehouseLocationList, setWarehousesLocationList] = useState([]);
    const [warehouses, setWarehouses] = useState([]);
    const [selectedWarehouseId, setSelectedWarehouseId] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [filteredList, setFilteredList] = useState([]);
    const [editingItem, setEditingItem] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        ma_vi_tri: "",
        ten_vi_tri: "",
        kho_id: "",
        trang_thai: 0
    });

    // Fetch danh sách vị trí kho từ backend
    const fetchWarehouseLocations = async () => {
        try {
            const data = await warehouseLocationAPI.getAll();
            setWarehousesLocationList(data);
            setFilteredList(data);
        } catch (error) {
            console.error("Lỗi khi lấy dữ liệu vị trí kho:", error);
            alert("Lỗi khi tải dữ liệu vị trí kho!");
        }
    };

    // Fetch danh sách kho
    const fetchWarehouses = async () => {
        try {
            const data = await warehouseAPI.getAll();
            setWarehouses(data);
        } catch (error) {
            console.error("Lỗi khi lấy danh sách kho:", error);
        }
    };

    // Load dữ liệu khi component mount
    useEffect(() => {
        fetchWarehouseLocations();
        fetchWarehouses();
    }, []);

    // Lấy vị trí kho theo ID kho
    const fetchLocationByWarehouse = async (warehouseId, statusFilterValue = null) => {
        // Sử dụng statusFilterValue nếu được truyền vào, nếu không thì dùng statusFilter từ state
        const filterValue = statusFilterValue !== null ? statusFilterValue : statusFilter;
        
        if (!warehouseId) {
            // Nếu không chọn kho, hiển thị tất cả
            if (filterValue) {
                // Nếu đang filter theo trạng thái, giữ filter đó
                const mockEvent = { target: { value: filterValue } };
                await handleStatusFilterChange(mockEvent);
            } else {
                fetchWarehouseLocations();
            }
            return;
        }
        try {
            const response = await warehouseLocationAPI.getByID(warehouseId);
            if (response.data && Array.isArray(response.data)) {
                // Nếu có filter trạng thái, lọc thêm trong danh sách vị trí của kho
                if (filterValue) {
                    const filtered = response.data.filter(item => 
                        item.trang_thai.toString() === filterValue
                    );
                    setFilteredList(filtered);
                } else {
                    setFilteredList(response.data);
                }
            } else {
                setFilteredList([]);
            }
        } catch (error) {
            if (error.response?.status === 404) {
                setFilteredList([]);
                alert(error.response.data.message);
            } else {
                console.error("Lỗi khi lấy vị trí kho theo ID:", error);
                alert("Lỗi khi tải dữ liệu vị trí kho!");
            }
        }
    };

    // Xử lý khi chọn kho
    const handleWarehouseChange = async (e) => {
        const warehouseId = e.target.value;
        setSelectedWarehouseId(warehouseId);
        await fetchLocationByWarehouse(warehouseId);
    };

    // Tìm kiếm vị trí kho theo trạng thái
    const handleStatusFilterChange = async (e) => {
        const selectedStatus = e.target.value;
        setStatusFilter(selectedStatus);
        
        if (!selectedStatus || selectedStatus === '') {
            // Nếu chọn "Tất cả trạng thái"
            if (selectedWarehouseId) {
                // Nếu đang chọn kho, lấy lại danh sách vị trí của kho đó (không filter)
                await fetchLocationByWarehouse(selectedWarehouseId, '');
            } else {
                // Hiển thị tất cả
                fetchWarehouseLocations();
            }
        } else {
            // Nếu có chọn kho, lọc trong danh sách vị trí của kho đó
            if (selectedWarehouseId) {
                // Truyền selectedStatus trực tiếp vào hàm để đảm bảo dùng đúng giá trị
                await fetchLocationByWarehouse(selectedWarehouseId, selectedStatus);
            } else {
                // Gọi API tìm kiếm với giá trị trạng thái
                try {
                    const response = await warehouseLocationAPI.search(selectedStatus);
                    if (response.data && Array.isArray(response.data)) {
                        setFilteredList(response.data);
                    } else {
                        setFilteredList([]);
                    }
                } catch (error) {
                    if (error.response?.status === 404) {
                        setFilteredList([]);
                        alert(error.response.data.message);
                    } else if (error.response?.status === 400) {
                        alert(error.response.data.message);
                    } else {
                        console.error("Lỗi khi tìm kiếm:", error);
                        alert("Lỗi khi tìm kiếm vị trí kho!");
                    }
                }
            }
        }
    };

    // Hàm chuyển đổi số thành text trạng thái
    const getStatusText = (status) => {
        switch(status) {
            case 0: return "Trống";
            case 1: return "Đang sử dụng";
            default: return "Không xác định";
        }
    };

    // Hàm lấy class CSS cho trạng thái
    const getStatusClass = (status) => {
        switch(status) {
            case 0: return "status-empty";
            case 1: return "status-in-use";
            default: return "status-unknown";
        }
    };

    const handleAddNew = () => {
        setEditingItem(null);
        setFormData({
            ma_vi_tri: "",
            ten_vi_tri: "",
            kho_id: "",
            trang_thai: 0
        });
        setShowForm(true);
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        setFormData({
            ma_vi_tri: item.ma_vi_tri,
            ten_vi_tri: item.ten_vi_tri,
            kho_id: item.kho_id.toString(),
            trang_thai: item.trang_thai
        });
        setShowForm(true);
    };

    const handleDelete = async (id, tenViTri, trangThai) => {
        if (window.confirm(`Bạn có chắc chắn muốn xóa vị trí "${tenViTri}" không?`)) {
            try {
                await warehouseLocationAPI.delete(id);
                alert("Xóa vị trí kho thành công!");
                // Sau khi xóa, reload lại dữ liệu theo context hiện tại
                if (selectedWarehouseId) {
                    await fetchLocationByWarehouse(selectedWarehouseId);
                } else if (statusFilter) {
                    const mockEvent = { target: { value: statusFilter } };
                    await handleStatusFilterChange(mockEvent);
                } else {
                    fetchWarehouseLocations();
                }
            } catch (error) {
                if (error.response && error.response.status === 400) {
                    alert(error.response.data.message);
                } else {
                    console.error("Lỗi khi xóa vị trí kho:", error);
                    alert("Lỗi khi xóa vị trí kho!");
                }
            }
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        
        setFormData(prev => ({
            ...prev,
            [name]: name === 'trang_thai' ? parseInt(value) : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validation
        if (!formData.ma_vi_tri.trim()) {
            alert("Mã vị trí không được để trống!");
            return;
        }

        if (!formData.ten_vi_tri.trim()) {
            alert("Tên vị trí không được để trống!");
            return;
        }

        if (!formData.kho_id.trim()) {
            alert("Kho ID không được để trống!");
            return;
        }

        // Chuyển kho_id thành number trước khi gửi API
        const submitData = {
            ...formData,
            kho_id: parseInt(formData.kho_id) || 0
        };
        
        try {
            if (editingItem) {
                await warehouseLocationAPI.update(editingItem.id, submitData);
                alert("Cập nhật vị trí kho thành công!");
            } else {
                await warehouseLocationAPI.create(submitData);
                alert("Thêm vị trí kho thành công!");
            }
            
            setShowForm(false);
            // Sau khi thêm/sửa, reload lại dữ liệu theo context hiện tại
            if (selectedWarehouseId) {
                await fetchLocationByWarehouse(selectedWarehouseId);
            } else if (statusFilter) {
                const mockEvent = { target: { value: statusFilter } };
                await handleStatusFilterChange(mockEvent);
            } else {
                fetchWarehouseLocations();
            }
        } catch (error) {
            console.error("Lỗi khi lưu vị trí kho:", error);
            alert("Lỗi khi lưu vị trí kho!");
        }
    };

    // Đóng form
    const handleCloseForm = () => {
        setShowForm(false);
        setEditingItem(null);
    };

    return (
        <div className="container">
            <h1 className="title">Vị trí kho</h1>

            {/* Bộ lọc và tìm kiếm */}
            <div className="filters">
                {/* Chọn kho để xem vị trí */}
                <div className="filter-group">
                    <label>Chọn kho:</label>
                    <select
                        className="warehouse-select"
                        value={selectedWarehouseId}
                        onChange={handleWarehouseChange}
                    >
                        <option value="">Tất cả kho</option>
                        {warehouses.map((warehouse) => (
                            <option key={warehouse.id} value={warehouse.id}>
                                {warehouse.ten_kho} ({warehouse.ma_kho})
                            </option>
                        ))}
                    </select>
                </div>

                {/* Tìm kiếm theo trạng thái */}
                <div className="filter-group">
                    <label>Lọc theo trạng thái:</label>
                    <select
                        className="status-select"
                        value={statusFilter}
                        onChange={handleStatusFilterChange}
                    >
                        <option value="">Tất cả trạng thái</option>
                        <option value="0">Trống</option>
                        <option value="1">Đang sử dụng</option>
                    </select>
                </div>

                {/* Nút thêm mới */}
                <div className="action-group">
                    <button className="btn-add" onClick={handleAddNew}>
                        + Thêm vị trí kho
                    </button>
                </div>
            </div>

            {/* Hiển thị thông tin filter */}
            {(selectedWarehouseId || statusFilter) && (
                <div className="view-info">
                    <strong>Đang xem: </strong>
                    {selectedWarehouseId && (
                        <>Kho: {warehouses.find(w => w.id === parseInt(selectedWarehouseId))?.ten_kho || selectedWarehouseId}</>
                    )}
                    {selectedWarehouseId && statusFilter && " | "}
                    {statusFilter && (
                        <>Trạng thái: {statusFilter === "0" ? "Trống" : "Đang sử dụng"}</>
                    )}
                    {" "}({filteredList.length} kết quả)
                </div>
            )}

            {/* Bảng danh sách vị trí kho */}
            <table className="table-container">
                <thead>
                    <tr>
                        <th>Mã vị trí</th>
                        <th>Tên vị trí</th>
                        <th>Kho ID</th>
                        <th>Trạng thái</th>
                        <th>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredList.length > 0 ? (
                        filteredList.map((item) => (
                            <tr key={item.id}>
                                <td>{item.ma_vi_tri}</td>
                                <td>{item.ten_vi_tri}</td>
                                <td>{item.kho_id}</td>
                                <td>
                                    <span className={`status ${getStatusClass(item.trang_thai)}`}>
                                        {getStatusText(item.trang_thai)}
                                    </span>
                                </td>
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
                                            onClick={() => handleDelete(item.id, item.ten_vi_tri, item.trang_thai)}
                                            disabled={item.trang_thai !== 0}
                                            title={item.trang_thai !== 0 ? "Chỉ có thể xóa khi trạng thái là Trống" : ""}
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
                                Không tìm thấy vị trí kho nào
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
                            <h2>{editingItem ? "Sửa vị trí kho" : "Thêm vị trí kho mới"}</h2>
                            <button className="close-btn" onClick={handleCloseForm}>×</button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="form-container">
                            <div className="form-group">
                                <label>Mã vị trí:</label>
                                <input
                                    type="text"
                                    name="ma_vi_tri"
                                    value={formData.ma_vi_tri}
                                    onChange={handleInputChange}
                                    required
                                    disabled={editingItem}
                                />
                            </div>
                            
                            <div className="form-group">
                                <label>Tên vị trí:</label>
                                <input
                                    type="text"
                                    name="ten_vi_tri"
                                    value={formData.ten_vi_tri}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            
                            <div className="form-group">
                                <label>Kho:</label>
                                <select
                                    name="kho_id"
                                    value={formData.kho_id}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="">-- Chọn kho --</option>
                                    {warehouses.map((warehouse) => (
                                        <option key={warehouse.id} value={warehouse.id}>
                                            {warehouse.ten_kho} ({warehouse.ma_kho})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            <div className="form-group">
                                <label>Trạng thái:</label>
                                <select
                                    name="trang_thai"
                                    value={formData.trang_thai}
                                    onChange={handleInputChange}
                                >
                                    <option value={0}>Trống</option>
                                    <option value={1}>Đang sử dụng</option>
                                </select>
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

export default WarehouseLocation;