import React, { useState, useEffect } from 'react';
import { Col, Row, Card, Form, Table, InputGroup } from 'react-bootstrap';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const CampaignDashboard = ({ reportType }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCampaign, setSelectedCampaign] = useState('all');
  const [campaigns, setCampaigns] = useState([]);
  const [dateRange, setDateRange] = useState({
    start: '2024-09-01',
    end: '2024-12-01'
  });
  const [aggregatedData, setAggregatedData] = useState([]);
  const [tableData, setTableData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:5655/api/CampaignDailyReports');
        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }
        const jsonData = await response.json();
        
        // Xử lý dữ liệu
        const processedData = jsonData.map(item => ({
          ...item,
          date: new Date(item.date).toISOString().split('T')[0],
        }));

        // Lấy danh sách chiến dịch duy nhất
        const uniqueCampaigns = [...new Set(processedData.map(item => item.campaignName))];
        setCampaigns(['Tất cả', ...uniqueCampaigns]);
        
        setData(processedData);
        
        // Tạo dữ liệu tổng hợp cho biểu đồ
        const aggregatedByDate = processAndAggregate(processedData);
        setAggregatedData(aggregatedByDate);
        
        // Tạo dữ liệu cho bảng
        const campaignSummary = generateTableData(processedData);
        setTableData(campaignSummary);
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Không thể tải dữ liệu từ API. Vui lòng thử lại sau.");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Xử lý và tổng hợp dữ liệu theo ngày
  const processAndAggregate = (rawData) => {
    // Giữ nguyên như code gốc...
    const dailyData = {};
    
    rawData.forEach(item => {
      const dateKey = item.date;
      if (!dailyData[dateKey]) {
        dailyData[dateKey] = {
          date: dateKey,
          Impressions: 0,
          Clicks: 0,
          Spend: 0,
          Sales: 0
        };
      }
      
      dailyData[dateKey].Impressions += item.impressions || 0;
      dailyData[dateKey].Clicks += item.clicks || 0;
      dailyData[dateKey].Spend += item.spend || 0;
      dailyData[dateKey].Sales += item.sales1d || 0;
    });
    
    // Chuyển thành mảng và sắp xếp theo ngày
    return Object.values(dailyData).sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  // Tạo dữ liệu tổng hợp cho bảng
  const generateTableData = (rawData) => {
    // Giữ nguyên như code gốc...
    const campaignData = {};
    
    rawData.forEach(item => {
      const campaignName = item.campaignName;
      if (!campaignData[campaignName]) {
        campaignData[campaignName] = {
          name: campaignName,
          status: item.campaignStatus,
          date: "12/1/2024", // Sử dụng ngày mặc định cho bảng
          budget: "$5.00", // Mặc định
          impressions: 0,
          clicks: 0,
          ctr: 0,
          spend: 0,
          cpc: 0
        };
      }
      
      // Cộng dồn dữ liệu
      campaignData[campaignName].impressions += item.impressions || 0;
      campaignData[campaignName].clicks += item.clicks || 0;
      campaignData[campaignName].spend += item.spend || 0;
      
      // Điều chỉnh ngân sách dựa trên campaignId
      if (item.campaignId === 123459) {
        campaignData[campaignName].budget = "$3.00";
      }
    });
    
    // Tính toán CTR và CPC
    Object.values(campaignData).forEach(campaign => {
      campaign.ctr = campaign.impressions > 0 ? ((campaign.clicks / campaign.impressions) * 100).toFixed(2) : "0.00";
      campaign.cpc = campaign.clicks > 0 ? (campaign.spend / campaign.clicks).toFixed(2) : "0.00";
      campaign.impressions = campaign.impressions.toLocaleString();
      campaign.clicks = campaign.clicks.toLocaleString();
      campaign.spend = "$" + campaign.spend.toFixed(2);
    });
    
    return Object.values(campaignData);
  };

  // Lọc dữ liệu theo chiến dịch đã chọn
  const getFilteredChartData = () => {
    // Giữ nguyên như code gốc...
    if (selectedCampaign === 'Tất cả' || selectedCampaign === 'all') {
      return aggregatedData.filter(item => {
        const itemDate = new Date(item.date);
        const startDate = new Date(dateRange.start);
        const endDate = new Date(dateRange.end);
        return itemDate >= startDate && itemDate <= endDate;
      });
    } else {
      // Nếu chọn một chiến dịch cụ thể, lọc dữ liệu thô và tổng hợp lại
      const filteredData = data
        .filter(item => item.campaignName === selectedCampaign)
        .filter(item => {
          const itemDate = new Date(item.date);
          const startDate = new Date(dateRange.start);
          const endDate = new Date(dateRange.end);
          return itemDate >= startDate && itemDate <= endDate;
        });
      
      return processAndAggregate(filteredData);
    }
  };

  const chartData = getFilteredChartData();

  // Hiển thị tiêu đề dựa theo loại báo cáo
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

  if (loading) return <div className="text-center p-5">Đang tải dữ liệu...</div>;
  if (error) return <div className="text-center p-5 text-danger">{error}</div>;

  return (
    <div className="p-4">
      <h2 className="mb-4">{getReportTitle()}</h2>
      
      {/* Filters */}
      <Row className="mb-4 align-items-center">
        <Col md={4}>
          <Form.Select 
            variant="dark"
            className="bg-dark text-white"
            value={selectedCampaign}
            onChange={(e) => setSelectedCampaign(e.target.value)}
          >
            {campaigns.map(campaign => (
              <option key={campaign} value={campaign}>
                {campaign === 'Tất cả' ? 'All Campaigns' : campaign}
              </option>
            ))}
          </Form.Select>
        </Col>
        
        <Col md={8} className="d-flex justify-content-end">
          <div className="d-flex align-items-center">
            <span className="me-2">Date range:</span>
            <Form.Control 
              type="date" 
              className="bg-dark text-white me-2"
              value={dateRange.start}
              onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
            />
            <span className="mx-2">-</span>
            <Form.Control 
              type="date" 
              className="bg-dark text-white"
              value={dateRange.end}
              onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
            />
          </div>
        </Col>
      </Row>
      
      {/* Chart */}
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
          <ResponsiveContainer width="100%" height={400}>
            <LineChart
              data={chartData}
              margin={{
                top: 20,
                right: 20,
                left: 20,
                bottom: 20,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis 
                dataKey="date" 
                stroke="#ddd"
                tickFormatter={(date) => {
                  const d = new Date(date);
                  return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear().toString().slice(2)}`;
                }}
              />
              <YAxis yAxisId="left" stroke="#ddd" />
              <YAxis yAxisId="right" orientation="right" stroke="#ddd" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#333', border: 'none' }}
                labelStyle={{ color: '#fff' }}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="Impressions"
                name="Impressions"
                stroke="#28a745"
                dot={false}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="Spend"
                name="Spend"
                stroke="#ffc107"
                dot={false}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="Sales"
                name="Sales"
                stroke="#17a2b8"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card.Body>
      </Card>
      
      {/* Search Bar and Table */}
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
          Date range: {dateRange.start} - {dateRange.end}
        </Col>
      </Row>
      
      {/* Table */}
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
              <td className="text-end">{campaign.ctr}</td>
              <td className="text-end">{campaign.spend}</td>
              <td className="text-end">${campaign.cpc}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default CampaignDashboard;