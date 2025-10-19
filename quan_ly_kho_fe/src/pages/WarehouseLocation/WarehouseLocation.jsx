import { useState, useEffect } from "react";
import { warehouseLocationAPI } from "../../utils/fetchFromAPI.js";
import "../WarehouseLocation/WarehouseLocation.css";

function WarehouseLocation() {
    const [warehouseLocationList, setWarehousesLocationList] = useState([]);
    const [searchText, setSearchText] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [filteredList, setFilteredList] = useState([]);

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

    // Load dữ liệu khi component mount
    useEffect(() => {
        fetchWarehouseLocations();
    }, []);

    // Lọc danh sách khi searchText hoặc statusFilter thay đổi
    useEffect(() => {
        let filtered = warehouseLocationList.filter((item) =>
            item.ma_vi_tri.toLowerCase().includes(searchText.toLowerCase()) ||
            item.ten_vi_tri.toLowerCase().includes(searchText.toLowerCase())
        );

        if (statusFilter !== "") {
            filtered = filtered.filter(item => item.trang_thai === parseInt(statusFilter));
        }

        setFilteredList(filtered);
    }, [searchText, statusFilter, warehouseLocationList]);

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

    return (
        <div className="container">
            <h1 className="title">Vị trí kho</h1>

            {/* Bộ lọc và tìm kiếm */}
            <div className="filters">
                <input
                    type="text"
                    className="search-input"
                    placeholder="Nhập mã hoặc tên vị trí để tìm kiếm"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                />

                <select
                    className="status-select"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}>
                    <option value="">Tất cả trạng thái</option>
                    <option value="0">Trống</option>
                    <option value="1">Đang sử dụng</option>
                </select>
            </div>

            {/* Bảng danh sách vị trí kho */}
            <table className="table-container">
                <thead>
                    <tr>
                        <th>Mã vị trí</th>
                        <th>Tên vị trí</th>
                        <th>Kho ID</th>
                        <th>Trạng thái</th>
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
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="4" className="no-data">
                                Không tìm thấy vị trí kho nào
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default WarehouseLocation;