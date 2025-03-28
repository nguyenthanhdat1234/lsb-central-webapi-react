import React, { useState, useEffect } from 'react';
import { Card, Table, Spinner, Alert, Form, Row, Col } from 'react-bootstrap';
import DateRangePicker from './common/DateRangePicker';
import Pagination from 'react-bootstrap/Pagination';
import { fetchFromApi } from '../services/api';
import { API_BASE_URL } from '../config/apiConfig';


const SellerManager = () => {
  const [dateRange, setDateRange] = useState({
    start: (() => {
      const date = new Date();
      date.setDate(date.getDate() - 3);
      return date.toISOString().split('T')[0];
    })(),
    end: new Date().toISOString().split('T')[0]
  });

  const [allCampaignData, setAllCampaignData] = useState([]); // Lưu trữ tất cả dữ liệu
  const [filteredCampaigns, setFilteredCampaigns] = useState([]); // Dữ liệu đã lọc theo ngày
  const [clientData, setClientData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reportData, setReportData] = useState([]);
  const [fullReportData, setFullReportData] = useState([]); // Lưu trữ báo cáo đầy đủ trước khi phân trang
  const [pageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  // Tải dữ liệu ban đầu
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log("Fetching initial data...");
        
        const [campaigns, clients] = await Promise.all([
          fetchFromApi('/api/CampaignDailyReports'),
          fetchFromApi('/api/Clients')
        ]);
        
        console.log("API data fetched - Campaigns:", campaigns.length, "Clients:", clients.length);
        
        setAllCampaignData(campaigns);
        setClientData(clients);
        
        setLoading(false);
      } catch (err) {
        console.error("Seller Report Error:", err);
        setError(`Unable to load report data: ${err.message}. Please check the console for more details.`);
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []); // Chỉ chạy một lần khi component được mount

  // Lọc dữ liệu và phân trang khi dateRange hoặc currentPage thay đổi
  useEffect(() => {
    if (allCampaignData.length === 0 || loading) return;
    
    try {
      console.log("Filtering data by date range:", dateRange);
      
      // Lọc dữ liệu theo khoảng ngày
      const filtered = allCampaignData.filter(campaign => {
        const campaignDate = new Date(campaign.date);
        return campaignDate >= new Date(dateRange.start) && 
               campaignDate <= new Date(dateRange.end);
      });
      
      console.log("Filtered campaigns:", filtered.length);
      setFilteredCampaigns(filtered);
      
      // Xử lý phân trang và tạo báo cáo
      if (filtered.length > 0 && clientData.length > 0) {
        // Tạo báo cáo đầy đủ từ dữ liệu đã lọc
        const fullReport = generateFullReport(filtered, clientData);
        setFullReportData(fullReport); // Lưu báo cáo đầy đủ
        
        // Tính toán tổng số trang
        const total = fullReport.length;
        const pages = Math.ceil(total / pageSize);
        console.log("Total report items:", total, "Total pages:", pages);
        setTotalPages(pages);
        
        // Đảm bảo trang hiện tại hợp lệ
        const validCurrentPage = Math.min(currentPage, Math.max(1, pages || 1));
        if (validCurrentPage !== currentPage) {
          console.log("Adjusting current page from", currentPage, "to", validCurrentPage);
          setCurrentPage(validCurrentPage);
        }
        
        // Phân trang cho báo cáo
        const startIndex = (validCurrentPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedReport = fullReport.slice(startIndex, endIndex);
        console.log("Paginated report:", paginatedReport.length, "items for page", validCurrentPage);
        
        setReportData(paginatedReport);
      } else {
        console.log("No data available for report");
        setReportData([]);
        setFullReportData([]);
        setTotalPages(0);
      }
    } catch (err) {
      console.error("Error processing data:", err);
      setError(`Error processing data: ${err.message}`);
    }
  }, [allCampaignData, clientData, dateRange, currentPage, pageSize]);

  // Hàm tạo báo cáo đầy đủ từ dữ liệu đã lọc
  const generateFullReport = (campaigns, clients) => {
    console.log("Generating full report with", campaigns.length, "campaigns and", clients.length, "clients");
    
    const clientIdToNameMapping = {};
    clients.forEach(client => {
      clientIdToNameMapping[client.clientId] = client.clientName;
    });
    
    const clientMetrics = {};
    
    campaigns.forEach(campaign => {
      const clientId = campaign.clientId;
      if (!clientId) {
        console.warn("Campaign missing clientId:", campaign);
        return;
      }
      
      const clientName = clientIdToNameMapping[clientId] || 'Unknown Client';
      
      if (!clientMetrics[clientId]) {
        clientMetrics[clientId] = {
          accountName: clientName,
          sold: 0,
          sales: 0,
          ads: 0,
          adsToSaleRatio: 0,
          errors: '',
          payNow: '',
          kpi: ''
        };
      }
      
      clientMetrics[clientId].sold += Number(campaign.unitsSoldSameSku30d || 0);
      clientMetrics[clientId].sales += Number(campaign.sales1d || 0);
      clientMetrics[clientId].ads += Number(campaign.spend || 0);
    });
    
    Object.values(clientMetrics).forEach(metrics => {
      metrics.adsToSaleRatio = metrics.sales > 0 ? (metrics.ads / metrics.sales) * 100 : 0;
    });
    
    const reportArray = Object.values(clientMetrics);
    reportArray.sort((a, b) => b.sales - a.sales);
    
    reportArray.forEach((item, index) => {
      item.stt = index + 1;
    });
    
    console.log("Generated full report with", reportArray.length, "items");
    return reportArray;
  };

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center" style={{height: '400px'}}>
      <Spinner animation="border" role="status" variant="primary">
        <span className="visually-hidden">Loading...</span>
      </Spinner>
    </div>
  );
  
  if (error) return (
    <Alert variant="danger" className="m-4">
      {error}
    </Alert>
  );

  // Tính toán các tổng từ toàn bộ báo cáo, không chỉ từ trang hiện tại
  const totalSold = fullReportData.reduce((sum, item) => sum + item.sold, 0);
  const totalSales = fullReportData.reduce((sum, item) => sum + item.sales, 0);
  const totalAds = fullReportData.reduce((sum, item) => sum + item.ads, 0);
  const totalAdsToSaleRatio = totalSales > 0 ? (totalAds / totalSales * 100).toFixed(2) : "0.00";
  const totalPayNow = fullReportData.length > 0 ? fullReportData.reduce((sum, item) => sum + (typeof item.payNow === 'number' ? item.payNow : 0), 0) : 0;

  const handlePageChange = (pageNumber) => {
    console.log("Changing page to:", pageNumber);
    setCurrentPage(pageNumber);
  };

  const handleDateChange = (newDateRange) => {
    console.log("Date range changed:", newDateRange);
    setDateRange(newDateRange);
    // Reset về trang 1 khi thay đổi ngày
    setCurrentPage(1);
  };

  const renderPagination = () => {
    let items = [];
    
    // Giới hạn số lượng nút trang hiển thị
    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
    
    // Điều chỉnh lại startPage nếu endPage đã ở giới hạn
    if (endPage === totalPages) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    
    // Thêm indicator "..." nếu có nhiều trang
    if (startPage > 1) {
      items.push(
        <Pagination.Item key="start" onClick={() => handlePageChange(1)}>1</Pagination.Item>
      );
      if (startPage > 2) {
        items.push(<Pagination.Ellipsis key="ellipsis-start" />);
      }
    }
    
    // Thêm các nút trang
    for (let number = startPage; number <= endPage; number++) {
      items.push(
        <Pagination.Item
          key={number}
          active={number === currentPage}
          onClick={() => handlePageChange(number)}
        >
          {number}
        </Pagination.Item>
      );
    }
    
    // Thêm indicator "..." ở cuối nếu cần
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        items.push(<Pagination.Ellipsis key="ellipsis-end" />);
      }
      items.push(
        <Pagination.Item key="end" onClick={() => handlePageChange(totalPages)}>
          {totalPages}
        </Pagination.Item>
      );
    }

    return (
      <Pagination className="justify-content-center mt-3">
        <Pagination.First onClick={() => handlePageChange(1)} disabled={currentPage === 1} />
        <Pagination.Prev 
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1} 
        />
        {items}
        <Pagination.Next 
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages} 
        />
        <Pagination.Last 
          onClick={() => handlePageChange(totalPages)}
          disabled={currentPage === totalPages} 
        />
      </Pagination>
    );
  };

  return (
    <div className="p-4">
      <h2 className="mb-4">Summary Seller Report</h2>

      <Row className="mb-3">
        <Col md={12}>
          <DateRangePicker 
            dateRange={dateRange}
            onDateChange={handleDateChange}
          />
        </Col>
      </Row>
      
      {totalPages > 0 && (
        <div className="mb-3">
          <p>Showing page {currentPage} of {totalPages} ({fullReportData.length} items total)</p>
        </div>
      )}

      {reportData.length > 0 ? (
        <Card className="shadow-sm">
          <Card.Body className="p-0">
            <div className="table-responsive">
              <Table striped bordered hover className="mb-0">
                <thead className="bg-light">
                  <tr>
                    <th className="text-center">STT</th>
                    <th>ACC</th>
                    <th className="text-end">Sold</th>
                    <th className="text-end">Sales</th>
                    <th className="text-end">Ads</th>
                    <th className="text-end">Ads/Sale</th>
                    <th className="text-center">Error</th>
                    <th className="text-end">Pay Now</th>
                    <th className="text-center">KPI</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.map((item) => (
                    <tr key={item.stt}>
                      <td className="text-center">{item.stt}</td>
                      <td>{item.accountName}</td>
                      <td className="text-end">{item.sold.toLocaleString()}</td>
                      <td className="text-end">${item.sales.toFixed(2)}</td>
                      <td className="text-end">${item.ads.toFixed(2)}</td>
                      <td className="text-end">{item.adsToSaleRatio.toFixed(2)}%</td>
                      <td className="text-center">{item.errors}</td>
                      <td className="text-end">{item.payNow}</td>
                      <td className="text-center">{item.kpi}</td>
                    </tr>
                  ))}
                  <tr className="fw-bold bg-light">
                    <td colSpan="2" className="text-center">SUM</td>
                    <td className="text-end">{totalSold.toLocaleString()}</td>
                    <td className="text-end">${totalSales.toFixed(2)}</td>
                    <td className="text-end">${totalAds.toFixed(2)}</td>
                    <td className="text-end">{totalAdsToSaleRatio}%</td>
                    <td></td>
                    <td className="text-end">{totalPayNow}</td>
                    <td></td>
                  </tr>
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>
      ) : (
        <Alert variant="info">No data available for the selected filters</Alert>
      )}

      {totalPages > 1 && renderPagination()}
    </div>
  );
};

export default SellerManager;