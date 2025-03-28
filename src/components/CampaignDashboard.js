import React, { useState, useEffect } from 'react';
import { Col, Row, Card, Form, Table, InputGroup, Pagination, Alert, Spinner } from 'react-bootstrap';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { API_BASE_URL } from '../config/apiConfig';
import DateRangePicker from './common/DateRangePicker';
import { useDateRange } from '../hooks/useDateRange';
import { 
  DEFAULT_PAGE_SIZE, 
  CHART_COLORS,
  DEFAULT_BUDGET,
  SPECIAL_CAMPAIGN_CONFIG 
} from '../constants';
import { fetchFromApi } from '../services/api';

// Định nghĩa hàm formatDate trong component
const formatDate = (dateString) => {
  if (!dateString) return '';
  
  try {
    const d = new Date(dateString);
    
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
    console.warn("Error formatting date:", dateString, err);
    return '';
  }
};

// Định nghĩa hàm formatChartDate cho biểu đồ
const formatChartDate = (dateString) => {
  if (!dateString) return '';
  
  try {
    const d = new Date(dateString);
    
    // Kiểm tra nếu ngày không hợp lệ
    if (isNaN(d.getTime())) {
      return '';
    }
    
    // Format dd/mm/yy như trong ảnh của bạn
    const day = d.getDate();
    const month = d.getMonth() + 1;
    const year = d.getFullYear().toString().slice(2);
    
    return `${day < 10 ? '0' + day : day}/${month < 10 ? '0' + month : month}/${year}`;
  } catch (err) {
    console.warn("Error formatting chart date:", dateString, err);
    return dateString;
  }
};

const CampaignDashboard = ({ reportType }) => {
  const today = new Date();
  const tenDaysAgo = new Date(today);
  tenDaysAgo.setDate(today.getDate() - 10);

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCampaign, setSelectedCampaign] = useState('all');
  const [campaigns, setCampaigns] = useState([]);
  const [dateRange, setDateRange] = useDateRange(10); // Use 10 days for dashboard
  const [aggregatedData, setAggregatedData] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [pageSize] = useState(DEFAULT_PAGE_SIZE);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [chartConfig, setChartConfig] = useState({
    impressions: { visible: true, scale: 1 },
    spend: { visible: true, scale: 1 },
    sales: { visible: true, scale: 1 }
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log("Fetching campaign data with date range:", dateRange);
        
        // Using the enhanced api service
        const allData = await fetchFromApi('/api/CampaignDailyReports');
        
        // Kiểm tra dữ liệu trả về
        if (!allData || !Array.isArray(allData)) {
          console.error("Invalid API response format:", allData);
          throw new Error(`API response is not valid. Expected array but got ${typeof allData}`);
        }
        
        console.log("API response:", allData.length, "items");
        
        // Xử lý dữ liệu cho chart
        const processedData = allData.map(item => ({
          ...item,
          date: new Date(item.date).toISOString().split('T')[0],
          impressions: Number(item.impressions || 0),
          clicks: Number(item.clicks || 0),
          spend: Number(item.spend || 0),
          sales1d: Number(item.sales1d || 0)
        }));

        // Lọc dữ liệu theo ngày
        const filteredData = processedData.filter(item => {
          try {
            const itemDate = new Date(item.date);
            const startDate = new Date(dateRange.start);
            const endDate = new Date(dateRange.end);
            return itemDate >= startDate && itemDate <= endDate;
          } catch (err) {
            console.warn("Invalid date format for item:", item, err);
            return false;
          }
        });
        console.log("Filtered data by date range:", filteredData.length, "items");
        
        // Thiết lập dữ liệu gốc
        setData(processedData);
        
        // Xác định các chiến dịch duy nhất
        const uniqueCampaigns = [...new Set(filteredData.map(item => 
          item.campaignName || 'Unknown Campaign'))];
        setCampaigns(['All', ...uniqueCampaigns]);
        
        // Tổng hợp dữ liệu cho chart
        let aggregatedByDate = [];
        try {
          aggregatedByDate = processAndAggregateWithNormalization(filteredData);
          setAggregatedData(aggregatedByDate);
          console.log("Aggregated data for chart:", aggregatedByDate.length, "items");
        } catch (err) {
          console.error("Error in aggregation:", err);
          setError(`Error processing chart data: ${err.message}`);
        }
        
        // Tạo dữ liệu cho bảng từ cùng nguồn dữ liệu đã lọc
        if (filteredData.length > 0) {
          let generatedTableData = [];
          try {
            generatedTableData = generateTableData(filteredData);
            console.log("Generated table data before pagination:", generatedTableData.length, "items");
            
            // Thiết lập phân trang dựa trên dữ liệu đã lọc
            const totalItems = generatedTableData.length;
            const calculatedTotalPages = Math.ceil(totalItems / pageSize) || 1;
            setTotalPages(calculatedTotalPages);
            console.log("Total items:", totalItems, "Total pages:", calculatedTotalPages);
            
            // Đảm bảo trang hiện tại hợp lệ
            const validCurrentPage = Math.min(currentPage, Math.max(1, calculatedTotalPages));
            if (validCurrentPage !== currentPage) {
              setCurrentPage(validCurrentPage);
            }
            
            // Phân trang cho bảng
            const startIndex = (validCurrentPage - 1) * pageSize;
            const endIndex = startIndex + pageSize;
            const paginatedTableData = generatedTableData.slice(startIndex, endIndex);
            console.log("Final paginated table data:", paginatedTableData.length, "items");
            setTableData(paginatedTableData);
          } catch (err) {
            console.error("Error generating table data:", err);
            setError(`Error processing table data: ${err.message}`);
            setTableData([]);
            setTotalPages(0);
          }
        } else {
          // Không có dữ liệu
          console.warn("No data available after filtering");
          setTableData([]);
          setTotalPages(0);
        }
        
      } catch (err) {
        console.error("Dashboard Error:", err);
        setError(`Unable to load dashboard data: ${err.message}`);
        // Đảm bảo không có trạng thái dở dang
        setTableData([]);
        setTotalPages(0);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dateRange, currentPage, pageSize]);

  // Hàm xử lý và chuẩn hóa dữ liệu để hiển thị trong cùng một biểu đồ
  const processAndAggregateWithNormalization = (rawData) => {
    if (!rawData || !Array.isArray(rawData)) {
      console.error("Invalid data passed to processAndAggregate:", rawData);
      return [];
    }
    
    console.log("Processing raw data for chart:", rawData.length, "items");
    const dailyData = {};
    
    rawData.forEach(item => {
      if (!item || !item.date) {
        console.warn("Skipping invalid item in aggregation:", item);
        return;
      }
      
      const dateKey = item.date;
      if (!dailyData[dateKey]) {
        dailyData[dateKey] = {
          date: dateKey,
          impressions: 0,
          spend: 0,
          sales: 0,
          // Thêm các trường chuẩn hóa
          impressionsOriginal: 0,
          spendOriginal: 0,
          salesOriginal: 0
        };
      }
      
      // Lưu giá trị gốc
      dailyData[dateKey].impressionsOriginal += Number(item.impressions || 0);
      dailyData[dateKey].spendOriginal += Number(item.spend || 0);
      dailyData[dateKey].salesOriginal += Number(item.sales1d || 0);
      
      // Cũng lưu vào trường hiển thị
      dailyData[dateKey].impressions += Number(item.impressions || 0);
      dailyData[dateKey].spend += Number(item.spend || 0);
      dailyData[dateKey].sales += Number(item.sales1d || 0);
    });

    // Kiểm tra và log nếu không có dữ liệu
    if (Object.keys(dailyData).length === 0) {
      console.warn("No dates found after aggregation");
      return [];
    }

    // Sắp xếp dữ liệu theo ngày
    const sortedData = Object.values(dailyData).sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Không chuẩn hóa dữ liệu vì chúng ta sẽ sử dụng nhiều trục
    console.log("Processed chart data:", sortedData.length, "items");
    
    // Ví dụ về dữ liệu
    if (sortedData.length > 0) {
      console.log("Sample data point:", sortedData[0]);
    }
    
    return sortedData;
  };

  const generateTableData = (rawData) => {
    if (!rawData || !Array.isArray(rawData)) {
      console.error("Invalid data passed to generateTableData:", rawData);
      return [];
    }
    
    console.log("Generating table data from:", rawData.length, "items");
    const campaignData = {};
    
    rawData.forEach(item => {
      if (!item || !item.campaignName) {
        console.warn("Skipping invalid item in table generation:", item);
        return;
      }
      
      const campaignName = item.campaignName;
      if (!campaignData[campaignName]) {
        // Sử dụng hàm formatDate đã được định nghĩa
        let formattedDate = '';
        try {
          formattedDate = formatDate(item.date);
        } catch (err) {
          console.warn("Error formatting date:", item.date, err);
          formattedDate = item.date || 'N/A';
        }
        
        campaignData[campaignName] = {
          name: campaignName,
          status: item.campaignStatus || 'Unknown',
          date: formattedDate,
          budget: `$${DEFAULT_BUDGET}`,
          impressions: 0,
          clicks: 0,
          ctr: 0,
          spend: 0,
          cpc: 0
        };
      }
      
      // Use converted numbers from processedData
      campaignData[campaignName].impressions += Number(item.impressions || 0);
      campaignData[campaignName].clicks += Number(item.clicks || 0);
      campaignData[campaignName].spend += Number(item.spend || 0);
      
      // Check for special campaigns
      if (item.campaignId === SPECIAL_CAMPAIGN_CONFIG.ID) {
        campaignData[campaignName].budget = `$${SPECIAL_CAMPAIGN_CONFIG.BUDGET}`;
      }
    });
    
    // Check if we have any campaigns
    if (Object.keys(campaignData).length === 0) {
      console.warn("No campaigns found after processing");
      return [];
    }
    
    // Format the campaign data for display
    const formattedCampaigns = Object.values(campaignData).map(campaign => {
      try {
        return {
          ...campaign,
          ctr: campaign.impressions > 0 ? ((campaign.clicks / campaign.impressions) * 100).toFixed(2) : "0.00",
          cpc: campaign.clicks > 0 ? (campaign.spend / campaign.clicks).toFixed(2) : "0.00",
          impressions: campaign.impressions.toLocaleString(),
          clicks: campaign.clicks.toLocaleString(),
          spend: "$" + campaign.spend.toFixed(2)
        };
      } catch (err) {
        console.error("Error formatting campaign data:", campaign, err);
        return {
          ...campaign,
          ctr: "0.00",
          cpc: "0.00",
          impressions: "0",
          clicks: "0",
          spend: "$0.00"
        };
      }
    });
    
    console.log("Generated table data:", formattedCampaigns.length, "items");
    return formattedCampaigns;
  };

  const getFilteredChartData = () => {
    if (!data || data.length === 0) {
      return [];
    }
    
    if (selectedCampaign === 'All' || selectedCampaign === 'all') {
      return aggregatedData;
    } else {
      try {
        const filteredData = data
          .filter(item => item.campaignName === selectedCampaign)
          .filter(item => {
            const itemDate = new Date(item.date);
            const startDate = new Date(dateRange.start);
            const endDate = new Date(dateRange.end);
            return itemDate >= startDate && itemDate <= endDate;
          });
        
        return processAndAggregateWithNormalization(filteredData);
      } catch (err) {
        console.error("Error filtering chart data:", err);
        return [];
      }
    }
  };

  const getReportTitle = () => {
    switch(reportType) {
      case 'singleCountry':
        return 'Single Country Report';
      case 'multipleCountry':
        return 'Multiple Country Report';
      default:
        return 'Report';
    }
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const renderPagination = () => {
    let items = [];
    for (let number = 1; number <= totalPages; number++) {
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

    return (
      <Pagination className="justify-content-center mt-3">
        <Pagination.First onClick={() => handlePageChange(1)} disabled={currentPage === 1} />
        <Pagination.Prev onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} />
        {items}
        <Pagination.Next onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} />
        <Pagination.Last onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages} />
      </Pagination>
    );
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

  const chartData = getFilteredChartData();
  const hasChartData = chartData && chartData.length > 0;

  return (
    <div className="p-4">
      <h2 className="mb-4">{getReportTitle()}</h2>
      
      <Row className="mb-4">
        <Col md={3}>
          <Form.Group>
            <Form.Label>Campaign</Form.Label>
            <Form.Select 
              variant="dark"
              className="bg-dark text-white"
              value={selectedCampaign}
              onChange={(e) => setSelectedCampaign(e.target.value)}
            >
              {campaigns.map(campaign => (
                <option key={campaign} value={campaign}>
                  {campaign === 'All' ? 'All Campaigns' : campaign}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        
        <Col md={9}>
          <DateRangePicker 
            dateRange={dateRange} 
            onDateChange={setDateRange}
          />
        </Col>
      </Row>
      
      <Card className="bg-dark text-white border-secondary mb-4">
        <Card.Body>
          <div className="d-flex mb-3">
            <div className="d-flex align-items-center me-4">
              <div className="rounded-circle bg-success" style={{width: '12px', height: '12px'}}></div>
              <span className="ms-2">Impressions</span>
            </div>
            <div className="d-flex align-items-center me-4">
              <div className="rounded-circle bg-warning" style={{width: '12px', height: '12px'}}></div>
              <span className="ms-2">Spend</span>
            </div>
            <div className="d-flex align-items-center">
              <div className="rounded-circle bg-info" style={{width: '12px', height: '12px'}}></div>
              <span className="ms-2">Sales</span>
            </div>
          </div>
          
          {hasChartData ? (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart
                data={chartData}
                margin={{
                  top: 20,
                  right: 50,
                  left: 50,
                  bottom: 20,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis 
                  dataKey="date" 
                  stroke="#ddd"
                  tickFormatter={formatChartDate}
                  tick={{ fill: '#ddd' }}
                />
                {/* Trục Y bên trái cho Impressions */}
                <YAxis 
                  yAxisId="impressions" 
                  orientation="left"
                  stroke="#28a745" // Màu xanh lá
                  domain={['auto', 'auto']}
                  tickFormatter={value => new Intl.NumberFormat().format(value)}
                  tick={{ fill: '#28a745' }}
                  allowDecimals={false}
                />
                
                {/* Trục Y bên phải cho Sales và Spend */}
                <YAxis 
                  yAxisId="sales-spend" 
                  orientation="right" 
                  stroke="#17a2b8" // Màu xanh dương
                  domain={['auto', 'auto']} 
                  tickFormatter={value => new Intl.NumberFormat().format(value)}
                  tick={{ fill: '#17a2b8' }}
                  allowDecimals={false}
                />
                
                <Tooltip 
                  contentStyle={{ backgroundColor: '#333', border: 'none' }}
                  labelStyle={{ color: '#fff' }}
                  formatter={(value, name) => {
                    // Định dạng giá trị với dấu phân cách hàng nghìn
                    return [new Intl.NumberFormat().format(value), name];
                  }}
                  labelFormatter={formatChartDate}
                />
                
                <Legend verticalAlign="bottom" height={36} />
                
                <Line
                  yAxisId="impressions"
                  type="monotone"
                  dataKey="impressions"
                  name="Impressions"
                  stroke="#28a745" // Màu xanh lá
                  strokeWidth={2}
                  dot={{ r: 3, strokeWidth: 2 }}
                  activeDot={{ r: 6 }}
                />
                
                <Line
                  yAxisId="sales-spend"
                  type="monotone"
                  dataKey="spend"
                  name="Spend"
                  stroke="#ffc107" // Màu vàng
                  strokeWidth={2}
                  dot={{ r: 3, strokeWidth: 2 }}
                  activeDot={{ r: 6 }}
                />
                
                <Line
                  yAxisId="sales-spend"
                  type="monotone"
                  dataKey="sales"
                  name="Sales"
                  stroke="#17a2b8" // Màu xanh dương
                  strokeWidth={2}
                  dot={{ r: 3, strokeWidth: 2 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-5">
              <p>No data available for chart visualization</p>
            </div>
          )}
        </Card.Body>
      </Card>
      
      <Row className="mb-3 align-items-center">
        <Col md={4}>
          <InputGroup>
            <Form.Control
              placeholder="Search"
              className="bg-dark text-white border-secondary"
            />
          </InputGroup>
        </Col>
        <Col md={8} className="text-end text-muted">
          Date range: {formatDate(dateRange.start)} - {formatDate(dateRange.end)}
        </Col>
      </Row>
      
      {totalPages > 0 && (
        <div className="mb-3">
          <p>Showing page {currentPage} of {totalPages}</p>
        </div>
      )}
      
      {tableData.length > 0 ? (
        <Table variant="dark" striped bordered hover responsive>
          <thead>
            <tr className="bg-secondary">
              <th>Name</th>
              <th>Status</th>
              <th>Date</th>
              <th>Budget</th>
              <th className="text-end">Impressions</th>
              <th className="text-end">Clicks</th>
              <th className="text-end">CTR</th>
              <th className="text-end">Spend</th>
              <th className="text-end">CPC</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((campaign, index) => (
              <tr key={index}>
                <td>{campaign.name}</td>
                <td>{campaign.status}</td>
                <td>{campaign.date}</td>
                <td>{campaign.budget}</td>
                <td className="text-end">{campaign.impressions}</td>
                <td className="text-end">{campaign.clicks}</td>
                <td className="text-end">{campaign.ctr}%</td>
                <td className="text-end">{campaign.spend}</td>
                <td className="text-end">${campaign.cpc}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <Alert variant="info">No data available for the selected filters</Alert>
      )}

      {totalPages > 1 && renderPagination()}
    </div>
  );
};

export default CampaignDashboard;