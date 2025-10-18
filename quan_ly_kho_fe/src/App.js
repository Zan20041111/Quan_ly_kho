import React, { useEffect, useState } from "react";
import Sidebar from "./components/SideBar/SideBar.jsx";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import WareHouse from "./pages/WareHouse/WareHouse.jsx";
import LocationsWareHouses from "./pages/LocationsWareHouses/LocationsWareHouses.jsx";
import Customers from "./pages/Customers/Customers.jsx";
function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Giữ sidebar luôn mở trên desktop (>= 769px) và đóng mặc định trên mobile.
  // Chạy khi component mount và lắng nghe thay đổi kích thước cửa sổ.
  useEffect(() => {
    const syncByWidth = () => {
      if (window.innerWidth >= 769) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };
    syncByWidth();
    window.addEventListener("resize", syncByWidth);
    return () => window.removeEventListener("resize", syncByWidth);
  }, []);

  return (
    <BrowserRouter>
      <div style={{ display: "flex" }}>
        {/* Sidebar nhận trạng thái hiển thị; trên mobile sẽ trượt vào/ra */}
        <Sidebar isOpen={sidebarOpen} />
        <main style={{ flex: 1, background: "#f3f4f6", padding: "20px" }}>
          {/* Nút hamburger chỉ hiện trên mobile (ẩn bằng CSS khi >= 769px) */}
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            className="mobile-menu-btn"
            style={{
              alignItems: "center",
              gap: 8,
              background: "#1e40af",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              padding: "10px 12px",
              marginBottom: 12,
              cursor: "pointer",
            }}
          >
            ☰ Menu
          </button>

          {/* Định nghĩa các tuyến (routes) cơ bản */}
          <Routes>
            <Route path="/" element={<Home/>} />
            <Route path="/warehouses" element={<WareHouse/>} />
            <Route path="/locations" element={<LocationsWareHouses/>} />
            <Route path="/customers" element={<Customers/>} />
            <Route path="/products" element={<div>Sản phẩm</div>} />
            <Route path="/imports" element={<div>Nhập kho</div>} />
            <Route path="/exports" element={<div>Xuất kho</div>} />
            <Route path="/reports" element={<div>Báo cáo tồn kho</div>} />
            <Route path="/settings" element={<div>Cài đặt</div>} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
