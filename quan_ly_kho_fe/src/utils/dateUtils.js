/**
 * Utility functions để xử lý dates với timezone UTC+7 (Asia/Ho_Chi_Minh)
 */

const TIMEZONE_UTC7 = 'Asia/Ho_Chi_Minh';

/**
 * Chuyển đổi date sang Date object và validate
 */
const parseDate = (date) => {
  if (!date) return null;
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return isNaN(dateObj.getTime()) ? null : dateObj;
};

/**
 * Lấy các phần tử của date theo UTC+7
 */
const getDateParts = (dateObj) => {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: TIMEZONE_UTC7,
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
  
  return partsMap;
};

/**
 * Format date theo UTC+7 với format tùy chỉnh
 * @param {string|Date} date - Date string hoặc Date object
 * @param {string} format - Format: 'dd/MM/yyyy HH:mm:ss' (default)
 * @returns {string} - Date đã format theo UTC+7
 * 
 * @example
 * formatDateUTC7('2025-11-07T17:07:53Z', 'dd/MM/yyyy HH:mm:ss')
 * // → "08/11/2025 00:07:53"
 */
export const formatDateUTC7 = (date, format = 'dd/MM/yyyy HH:mm:ss') => {
  const dateObj = parseDate(date);
  if (!dateObj) return '';
  
  try {
    const parts = getDateParts(dateObj);
    return format
      .replace('dd', parts.day)
      .replace('MM', parts.month)
      .replace('yyyy', parts.year)
      .replace('HH', parts.hour)
      .replace('mm', parts.minute)
      .replace('ss', parts.second);
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};

/**
 * Format date: dd/MM/yyyy
 * @example formatDate('2025-11-07T17:07:53Z') → "08/11/2025"
 */
export const formatDate = (date) => formatDateUTC7(date, 'dd/MM/yyyy');

/**
 * Format date với giờ: dd/MM/yyyy HH:mm
 * @example formatDateTime('2025-11-07T17:07:53Z') → "08/11/2025 00:07"
 */
export const formatDateTime = (date) => formatDateUTC7(date, 'dd/MM/yyyy HH:mm');

/**
 * Format date đầy đủ: dd/MM/yyyy HH:mm:ss
 * @example formatDateTimeFull('2025-11-07T17:07:53Z') → "08/11/2025 00:07:53"
 */
export const formatDateTimeFull = (date) => formatDateUTC7(date, 'dd/MM/yyyy HH:mm:ss');

/**
 * Chuyển đổi date sang ISO string với timezone UTC+7
 * @param {Date|string} date - Date object hoặc string
 * @returns {string} - ISO string với +07:00
 * 
 * @example
 * toISOStringUTC7('2025-11-07T17:07:53Z') → "2025-11-08T00:07:53+07:00"
 */
export const toISOStringUTC7 = (date) => {
  const dateObj = parseDate(date);
  if (!dateObj) return '';
  
  try {
    const parts = getDateParts(dateObj);
    return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}+07:00`;
  } catch (error) {
    console.error('Error converting to ISO string:', error);
    return '';
  }
};

/**
 * Lấy timezone hiện tại của browser
 * @returns {string} - Timezone string (ví dụ: "Asia/Ho_Chi_Minh")
 */
export const getBrowserTimezone = () => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
};
