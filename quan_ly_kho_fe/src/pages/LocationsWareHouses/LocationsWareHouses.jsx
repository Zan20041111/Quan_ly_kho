import { useState, useEffect } from "react";
import "./LocationsWareHouses.css";

function LocationsWareHouses() {
    const locationsWareHouseList = [
        { id: 1, ma_vi_tri: "A-01", ten_vi_tri: "day A cot 1", kho_id: 1, trang_thai: "Trống" },
        { id: 2, ma_vi_tri: "B-01", ten_vi_tri: "day B cot 1", kho_id: 2, trang_thai: "Đang sử dụng" },
        { id: 3, ma_vi_tri: "C-01", ten_vi_tri: "day C cot 1", kho_id: 3, trang_thai: "Trống" },
        { id: 4, ma_vi_tri: "D-01", ten_vi_tri: "day D cot 1", kho_id: 1, trang_thai: "Trống" },
    ];

    const [searchText, setSearchText] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [filteredList, setFilteredList] = useState(locationsWareHouseList);

    useEffect(() => {
        let filtered = locationsWareHouseList.filter((item) =>
            item.ma_vi_tri.toLowerCase().includes(searchText.toLowerCase()) ||
            item.ten_vi_tri.toLowerCase().includes(searchText.toLowerCase())
        );

        if (statusFilter) {
            filtered = filtered.filter(item => item.trang_thai === statusFilter);
        }

        setFilteredList(filtered);
    }, [searchText, statusFilter]);

    return (
        <div className="container">
            <h1 className="title">Vị trí kho</h1>
            <div className="filters">
                <input
                    type="text"
                    className="search-input"
                    placeholder="Nhập để tìm kiếm"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                />

                <select
                    className="status-select"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}>
                    <option value="">Tất cả trạng thái</option>
                    <option value="Trống">Trống</option>
                    <option value="Đang sử dụng">Đang sử dụng</option>
                </select>
            </div>


            <table className="table-container">
                <thead>
                    <tr>
                        <th>Mã vị trí</th>
                        <th>Tên vị trí</th>
                        <th>Kho id</th>
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
                                <td>{item.trang_thai}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="4" className="no-data">
                                Không tìm thấy kho nào
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            <div className="container-btn">
                <button className="btn btn-add">Thêm</button>
                <button className="btn btn-edit">Sửa</button>
                <button className="btn btn-delete">Xóa</button>
            </div>
        </div>
    );
}

export default LocationsWareHouses;
