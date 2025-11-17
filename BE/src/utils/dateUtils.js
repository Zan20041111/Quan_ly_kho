/**
 * Utility functions để xử lý dates với timezone UTC+7 (Asia/Ho_Chi_Minh)
 */

/**
 * Format Date object sang ISO string với timezone +07:00
 * @param {Date|string} date - Date object hoặc date string
 * @returns {string} - ISO string với timezone +07:00 (ví dụ: "2025-11-10T22:08:50.436+07:00")
 */
export const toISOStringUTC7 = (date) => {
  if (!date) return null;
  
  const dateObj = date instanceof Date ? date : new Date(date);
  if (isNaN(dateObj.getTime())) return null;

  // Sử dụng Intl.DateTimeFormat để lấy thời gian theo timezone Asia/Ho_Chi_Minh
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });

  const parts = formatter.formatToParts(dateObj);
  const partsMap = {};
  parts.forEach(part => {
    partsMap[part.type] = part.value;
  });

  // Lấy milliseconds từ Date object gốc
  const milliseconds = String(dateObj.getMilliseconds()).padStart(3, '0');

  // Format: YYYY-MM-DDTHH:mm:ss.sss+07:00
  const year = partsMap.year;
  const month = partsMap.month;
  const day = partsMap.day;
  const hour = partsMap.hour;
  const minute = partsMap.minute;
  const second = partsMap.second;

  return `${year}-${month}-${day}T${hour}:${minute}:${second}.${milliseconds}+07:00`;
};

/**
 * Lấy giờ hiện tại của Việt Nam (UTC+7)
 * @returns {Date} - Date object với giờ hiện tại UTC+7
 */
export const getCurrentTimeUTC7 = () => {
  const now = new Date();
  // Lấy giờ hiện tại theo timezone Asia/Ho_Chi_Minh
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
  
  const parts = formatter.formatToParts(now);
  const partsMap = {};
  parts.forEach(part => {
    partsMap[part.type] = part.value;
  });
  
  // Tạo Date object với giờ hiện tại của Việt Nam
  const year = parseInt(partsMap.year);
  const month = parseInt(partsMap.month) - 1; // Month is 0-indexed
  const day = parseInt(partsMap.day);
  const hours = parseInt(partsMap.hour);
  const minutes = parseInt(partsMap.minute);
  const seconds = parseInt(partsMap.second);
  
  // Tạo Date object với local time (sẽ được lưu đúng vào DB)
  return new Date(year, month, day, hours, minutes, seconds);
};

/**
 * Parse date string (YYYY-MM-DD) thành Date object với timezone UTC+7
 * Nếu chỉ có ngày (YYYY-MM-DD), sẽ lấy giờ hiện tại của Việt Nam và kết hợp với ngày đó
 * @param {string} dateString - Date string (YYYY-MM-DD hoặc YYYY-MM-DDTHH:mm:ss)
 * @returns {Date} - Date object với thời gian đúng timezone UTC+7
 */
export const parseDateUTC7 = (dateString) => {
  if (!dateString) return getCurrentTimeUTC7();
  
  // Nếu chỉ có ngày (YYYY-MM-DD), lấy giờ hiện tại và kết hợp với ngày đó
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    const now = getCurrentTimeUTC7();
    const [year, month, day] = dateString.split('-').map(Number);
    
    // Lấy giờ, phút, giây hiện tại
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    const milliseconds = now.getMilliseconds();
    
    // Tạo Date object với ngày từ input và giờ hiện tại
    // Sử dụng local time constructor để tránh vấn đề timezone
    const date = new Date(year, month - 1, day, hours, minutes, seconds, milliseconds);
    return date;
  }
  
  // Nếu có đầy đủ datetime, parse bình thường
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return getCurrentTimeUTC7();
  return date;
};

/**
 * Format Date object sang string với format tùy chỉnh
 * @param {Date|string} date - Date object hoặc date string
 * @param {string} format - Format string (default: 'YYYY-MM-DD HH:mm:ss')
 * @returns {string} - Formatted date string
 */
export const formatDate = (date, format = 'YYYY-MM-DD HH:mm:ss') => {
  if (!date) return null;
  
  const dateObj = date instanceof Date ? date : new Date(date);
  if (isNaN(dateObj.getTime())) return null;

  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  const hours = String(dateObj.getHours()).padStart(2, '0');
  const minutes = String(dateObj.getMinutes()).padStart(2, '0');
  const seconds = String(dateObj.getSeconds()).padStart(2, '0');

  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
};

