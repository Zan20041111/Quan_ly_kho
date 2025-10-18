import { useState, useEffect } from "react";
import "./WareHouse.css";

function WareHouse() {
  const warehouselist = [
    { id: 1, ma_kho: "KH0001", ten_kho: "kho da nang", dia_chi: "123 tran van on", ghi_chu: "khong co gi" },
    { id: 2, ma_kho: "KH0002", ten_kho: "kho đà lat", dia_chi: "123 tran van on", ghi_chu: "dang chua milo" },
    { id: 3, ma_kho: "KH0003", ten_kho: "kho viet tri", dia_chi: "123 tran van on", ghi_chu: "chua rau cu" },
    { id: 4, ma_kho: "KH0004", ten_kho: "kho thai nguyen", dia_chi: "123 tran van on", ghi_chu: "chua sua" },
  ];

  const [searchText, setSearchText] = useState("");
  const [filteredList, setFilteredList] = useState(warehouselist);

  //Dùng useEffect lọc danh sách tự động khi searchText thay đổi
  useEffect(() => {
    const filtered = warehouselist.filter(
      (item) =>
        item.ten_kho.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredList(filtered);
  }, [searchText]); // chạy mỗi khi searchText thay đổi

  return (
    <div className="warehouse-container">
      <h1 className="warehouse-title">Nhà kho</h1>

      <div className="warehouse-search">
        <input
          type="text"
          placeholder="Nhập để tìm kiếm..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>

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
              <tr key={item.id}>
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

      <div className="warehouse-buttons">
        <button className="btn btn-add">Thêm</button>
        <button className="btn btn-edit">Sửa</button>
        <button className="btn btn-delete">Xóa</button>
      </div>
    </div>
  );
}

export default WareHouse;
