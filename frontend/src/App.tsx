import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// --- Giả lập các component cần thiết cho ví dụ này ---
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import BookAppointment from './pages/BookAppointment';
import AdminDashboard from './pages/AdminDashboard';
import Contact from './pages/Contact';

// --- Cấu hình API giả lập và hàm ping ---
// Thay thế dòng này bằng URL API thực của bạn trong file .env
const API_BASE_URL = 'http://localhost:4000';

/**
 * @description Hàm giả lập `fetch` để kiểm tra kết nối API.
 * Trong ứng dụng thực, bạn sẽ sử dụng `axios` hoặc `fetch` để gửi yêu cầu HTTP.
 * @returns {Promise<Response>}
 */
const mockPingServer = async () => {
  // Mặc dù chúng ta đang giả lập, nhưng việc sử dụng `fetch` vẫn là cách đúng
  // để kiểm tra kết nối thực tế trong trình duyệt.
  const url = `${API_BASE_URL}/ping`;
  return fetch(url);
};

// --- Component chính của ứng dụng ---
const App = () => {
  const [isApiConnected, setIsApiConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Trong ví dụ này, chúng ta sẽ bỏ qua logic kiểm tra API để đơn giản hóa.
    // Nếu bạn muốn hiển thị màn hình loading trong lúc chờ kết nối, bạn có thể thêm lại logic ở đây.
    setIsLoading(false);
  }, []);

  // Nếu bạn muốn hiển thị màn hình loading, bạn có thể thêm điều kiện ở đây.
  // if (isLoading) {
  //   return <div>Đang tải ứng dụng...</div>;
  // }

  // Cấu trúc Router mới, hiển thị trang Login đầu tiên.
  return (
    <div className="bg-gray-100 min-h-screen font-sans">
      <Router>
        <Routes>
          {/* Định nghĩa các route công khai trước */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/contact" element={<Contact />} />

          {/* Các route yêu cầu đăng nhập sẽ được thêm sau */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/book-appointment" element={<BookAppointment />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />

          {/* Chuyển hướng mặc định từ '/' đến '/login' */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Thêm một trang Not Found nếu cần */}
          <Route path="*" element={<div className="text-center p-8">404 - Trang không tồn tại</div>} />
        </Routes>
      </Router>
    </div>
  );
};

export default App;
