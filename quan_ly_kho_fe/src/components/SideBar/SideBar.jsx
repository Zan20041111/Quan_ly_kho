import React, { useState } from "react";
import { Home, Boxes, MapPin, Users, Package, Upload, Download, BarChart3, Settings } from "lucide-react";
import "./SideBar.css";
import { NavLink, useNavigate } from "react-router-dom";

// SideBar hỗ trợ hiển thị responsive thông qua prop `isOpen`
const SideBar = ({ isOpen = true, onClose }) => {
  const [active, setActive] = useState(0);

  const menuItems = [
    { icon: <Home size={20} />, label: "Trang chủ", path: "/" },
    { icon: <Boxes size={20} />, label: "Quản lý kho", path: "/warehouses" },
    { icon: <MapPin size={20} />, label: "Vị trí kho", path: "/locations" },
    { icon: <Users size={20} />, label: "Khách hàng", path: "/customers" },
    { icon: <Package size={20} />, label: "Sản phẩm", path: "/products" },
    { icon: <Upload size={20} />, label: "Nhập kho", path: "/imports" },
    { icon: <Download size={20} />, label: "Xuất kho", path: "/exports" },
    { icon: <BarChart3 size={20} />, label: "Báo cáo tồn kho", path: "/reports" },
    { icon: <Settings size={20} />, label: "Cài đặt", path: "/settings" }, 
];

  return (
    // Thêm class `open` khi isOpen=true để CSS áp dụng hiệu ứng trượt vào trên mobile
    <div className={`sidebar ${isOpen ? "open" : ""}`}>
      <div className="sidebar-header">
        🏭 KhoSmart
      </div>

      <nav className="sidebar-menu">
        {menuItems.map((item, index) => (
          <NavLink
            key={index}
            to={item.path}
            className={({ isActive }) => `menu-item ${isActive ? "active" : ""}`}
            onClick={() => setActive(index)}
          >
            <div className="menu-icon">{item.icon}</div>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
        

      <div className="sidebar-footer">© 2025 KhoSmart</div>
    </div>
  );
};

export default SideBar;
