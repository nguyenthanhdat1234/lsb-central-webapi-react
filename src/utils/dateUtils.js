/**
 * Định dạng ngày tháng theo d/mm/yyyy
 * @param {string|Date} date - Ngày cần định dạng
 * @returns {string} - Chuỗi đã định dạng
 */
export const formatDate = (date) => {
    if (!date) return '';
    
    try {
      const d = new Date(date);
      
      // Kiểm tra nếu ngày không hợp lệ
      if (isNaN(d.getTime())) {
        return '';
      }
      
      // Lấy ngày, tháng, năm
      const day = d.getDate();
      const month = d.getMonth() + 1; // getMonth() trả về 0-11
      const year = d.getFullYear();
      
      // Định dạng d/mm/yyyy (không thêm 0 phía trước ngày, nhưng thêm 0 phía trước tháng nếu cần)
      return `${day}/${month < 10 ? '0' + month : month}/${year}`;
    } catch (err) {
      console.warn("Error formatting date:", date, err);
      return '';
    }
  };
  
  /**
   * Định dạng ngày tháng cho biểu đồ theo d/mm/yy
   * @param {string|Date} date - Ngày cần định dạng
   * @returns {string} - Chuỗi đã định dạng
   */
  export const formatChartDate = (date) => {
    if (!date) return '';
    
    try {
      const d = new Date(date);
      
      // Kiểm tra nếu ngày không hợp lệ
      if (isNaN(d.getTime())) {
        return '';
      }
      
      // Lấy ngày, tháng, năm
      const day = d.getDate();
      const month = d.getMonth() + 1; // getMonth() trả về 0-11
      const year = d.getFullYear();
      
      // Định dạng d/mm/yy (không thêm 0 phía trước ngày, nhưng thêm 0 phía trước tháng nếu cần)
      return `${day}/${month < 10 ? '0' + month : month}/${year.toString().slice(2)}`;
    } catch (err) {
      console.warn("Error formatting chart date:", date, err);
      return '';
    }
  };
  
  /**
   * Định dạng ngày tháng cho API
   * @param {Date} date - Ngày cần định dạng 
   * @returns {string} - Chuỗi ngày dạng ISO (YYYY-MM-DD)
   */
  export const formatDateForAPI = (date) => {
    if (!date) return '';
    
    try {
      const d = date instanceof Date ? date : new Date(date);
      
      // Kiểm tra nếu ngày không hợp lệ
      if (isNaN(d.getTime())) {
        return '';
      }
      
      // Trả về chuỗi ISO nhưng chỉ lấy phần ngày (không lấy thời gian)
      return d.toISOString().split('T')[0];
    } catch (err) {
      console.warn("Error formatting date for API:", date, err);
      return '';
    }
  };
  
  /**
   * Tạo đối tượng date range với số ngày cụ thể tính từ hôm nay
   * @param {number} days - Số ngày muốn lấy
   * @returns {Object} - Đối tượng chứa ngày bắt đầu và kết thúc
   */
  export const getDateRangeFromToday = (days = 7) => {
    try {
      const end = new Date();
      const start = new Date();
      start.setDate(end.getDate() - days);
      
      return {
        start: formatDateForAPI(start),
        end: formatDateForAPI(end)
      };
    } catch (err) {
      console.warn("Error creating date range:", err);
      return { start: '', end: '' };
    }
  };