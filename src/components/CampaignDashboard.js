import React, { useState, useEffect } from 'react';
import { Col, Row, Card, Form, Table, InputGroup, Pagination, Alert, Spinner } from 'react-bootstrap';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { API_BASE_URL } from '../config/apiConfig';
import DateRangePicker from './common/DateRangePicker';
import { useDateRange } from '../hooks/useDateRange';
import { DEFAULT_PAGE_SIZE, CHART_COLORS, DEFAULT_BUDGET, SPECIAL_CAMPAIGN_CONFIG } from '../constants';
import { fetchFromApi } from '../services/api';

const formatDate = (dateString) => {
  if (!dateString) return '';
  
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '';
    const day = d.getDate();
    const month = d.getMonth() + 1;
    const year = d.getFullYear();
    return `${day}/${month < 10 ? '0' + month : month}/${year}`;
  } catch (err) {
    return '';
  }
};

const formatChartDate = (dateString) => {
  if (!dateString) return '';
  
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '';
    const day = d.getDate();
    const month = d.getMonth() + 1;
    const year = d.getFullYear().toString().slice(2);
    return `${day < 10 ? '0' + day : day}/${month < 10 ? '0' + month : month}/${year}`;
  } catch (err) {
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
  const [dateRange, setDateRange] = useDateRange(10);
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
        
        const allData = await fetchFromApi('/api/CampaignDailyReports');
        
        if (!allData || !Array.isArray(allData)) {
          throw new Error(`API response is not valid. Expected array but got ${typeof allData}`);
        }
        
        const processedData = allData.map(item => ({
          ...item,
          date: new Date(item.date).toISOString().split('T')[0],
          impressions: Number(item.impressions || 0),
          clicks: Number(item.clicks || 0),
          spend: Number(item.spend || 0),
          sales1d: Number(item.sales1d || 0)
        }));

        const filteredData = processedData.filter(item => {
          try {
            const itemDate = new Date(item.date);
            const startDate = new Date(dateRange.start);
            const endDate = new Date(dateRange.end);
            return itemDate >= startDate && itemDate <= endDate;
          } catch (err) {
            return false;
          }
        });
        
        setData(processedData);
        
        const uniqueCampaigns = [...new Set(filteredData.map(item => 
          item.campaignName || 'Unknown Campaign'))];
        setCampaigns(['All', ...uniqueCampaigns]);
        
        let aggregatedByDate = [];
        try {
          aggregatedByDate = processAndAggregateWithNormalization(filteredData);
          setAggregatedData(aggregatedByDate);
        } catch (err) {
          setError(`Error processing chart data: ${err.message}`);
        }
        
        if (filteredData.length > 0) {
          let generatedTableData = [];
          try {
            generatedTableData = generateTableData(filteredData);
            
            const totalItems = generatedTableData.length;
            const calculatedTotalPages = Math.ceil(totalItems / pageSize) || 1;
            setTotalPages(calculatedTotalPages);
            
            const validCurrentPage = Math.min(currentPage, Math.max(1, calculatedTotalPages));
            if (validCurrentPage !== currentPage) {
              setCurrentPage(validCurrentPage);
            }
            
            const startIndex = (validCurrentPage - 1) * pageSize;
            const endIndex = startIndex + pageSize;
            const paginatedTableData = generatedTableData.slice(startIndex, endIndex);
            setTableData(paginatedTableData);
          } catch (err) {
            setError(`Error processing table data: ${err.message}`);
            setTableData([]);
            setTotalPages(0);
          }
        } else {
          setTableData([]);
          setTotalPages(0);
        }
        
      } catch (err) {
        setError(`Unable to load dashboard data: ${err.message}`);
        setTableData([]);
        setTotalPages(0);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dateRange, currentPage, pageSize]);

  const processAndAggregateWithNormalization = (rawData) => {
    if (!rawData || !Array.isArray(rawData)) {
      return [];
    }
    
    const dailyData = {};
    
    rawData.forEach(item => {
      if (!item || !item.date) {
        return;
      }
      
      const dateKey = item.date;
      if (!dailyData[dateKey]) {
        dailyData[dateKey] = {
          date: dateKey,
          impressions: 0,
          spend: 0,
          sales: 0,
          impressionsOriginal: 0,
          spendOriginal: 0,
          salesOriginal: 0
        };
      }
      
      dailyData[dateKey].impressionsOriginal += Number(item.impressions || 0);
      dailyData[dateKey].spendOriginal += Number(item.spend || 0);
      dailyData[dateKey].salesOriginal += Number(item.sales1d || 0);
      
      dailyData[dateKey].impressions += Number(item.impressions || 0);
      dailyData[dateKey].spend += Number(item.spend || 0);
      dailyData[dateKey].sales += Number(item.sales1d || 0);
    });

    if (Object.keys(dailyData).length === 0) {
      return [];
    }

    const sortedData = Object.values(dailyData).sort((a, b) => new Date(a.date) - new Date(b.date));
    
    return sortedData;
  };

  const generateTableData = (rawData) => {
    if (!rawData || !Array.isArray(rawData)) {
      return [];
    }
    
    const campaignData = {};
    
    rawData.forEach(item => {
      if (!item || !item.campaignName) {
        return;
      }
      
      const campaignName = item.campaignName;
      if (!campaignData[campaignName]) {
        let formattedDate = '';
        try {
          formattedDate = formatDate(item.date);
        } catch (err) {
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
      
      campaignData[campaignName].impressions += Number(item.impressions || 0);
      campaignData[campaignName].clicks += Number(item.clicks || 0);
      campaignData[campaignName].spend += Number(item.spend || 0);
      
      if (item.campaignId === SPECIAL_CAMPAIGN_CONFIG.ID) {
        campaignData[campaignName].budget = `$${SPECIAL_CAMPAIGN_CONFIG.BUDGET}`;
      }
    });
    
    if (Object.keys(campaignData).length === 0) {
      return [];
    }
    
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
        return 'Campaign Performance Report';
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
      <Pagination className="justify-content-center mt-4">
        <Pagination.First onClick={() => handlePageChange(1)} disabled={currentPage === 1} />
        <Pagination.Prev onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} />
        {items}
        <Pagination.Next onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} />
        <Pagination.Last onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages} />
      </Pagination>
    );
  };

  const generateCardStats = () => {
    if (!aggregatedData || aggregatedData.length === 0) return [];
    
    const total = aggregatedData.reduce((acc, curr) => {
      return {
        impressions: acc.impressions + curr.impressions,
        spend: acc.spend + curr.spend,
        sales: acc.sales + curr.sales
      };
    }, { impressions: 0, spend: 0, sales: 0 });
    
    return [
      {
        title: 'Total Impressions',
        value: total.impressions.toLocaleString(),
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="text-primary" viewBox="0 0 16 16">
            <path d="M4 11H2v3h2v-3zm5-4H7v7h2V7zm5-5v12h-2V2h2zm-2-1a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1h-2zM6 7a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7zm-5 4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1v-3z"/>
          </svg>
        ),
        color: 'primary'
      },
      {
        title: 'Total Spend',
        value: `$${total.spend.toFixed(2)}`,
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="text-success" viewBox="0 0 16 16">
            <path d="M8 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"/>
            <path d="M0 4a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1V4zm3 0a2 2 0 0 1-2 2v4a2 2 0 0 1 2 2h10a2 2 0 0 1 2-2V6a2 2 0 0 1-2-2H3z"/>
          </svg>
        ),
        color: 'success'
      },
      {
        title: 'Total Sales',
        value: `$${total.sales.toFixed(2)}`,
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="text-info" viewBox="0 0 16 16">
            <path d="M0 2.5A.5.5 0 0 1 .5 2H2a.5.5 0 0 1 .485.379L2.89 4H14.5a.5.5 0 0 1 .485.621l-1.5 6A.5.5 0 0 1 13 11H4a.5.5 0 0 1-.485-.379L1.61 3H.5a.5.5 0 0 1-.5-.5zM3.14 5l1.25 5h8.22l1.25-5H3.14zM5 13a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm7 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2z"/>
          </svg>
        ),
        color: 'info'
      },
      {
        title: 'ROI',
        value: total.spend > 0 ? `${((total.sales / total.spend) * 100).toFixed(2)}%` : '0.00%',
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="text-warning" viewBox="0 0 16 16">
            <path d="M15.985 8.5H8.207l-5.5 5.5a8 8 0 0 0 13.277-5.5zM2 13.292A8 8 0 0 1 7.5.015v7.778l-5.5 5.5zM8.5.015V7.5h7.485A8.001 8.001 0 0 0 8.5.015z"/>
          </svg>
        ),
        color: 'warning'
      }
    ];
  };

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center" style={{height: '80vh'}}>
      <div className="text-center">
        <Spinner animation="border" role="status" variant="primary" style={{ width: '3rem', height: '3rem' }}>
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-3 text-muted">Loading campaign data...</p>
      </div>
    </div>
  );
  
  if (error) return (
    <Alert variant="danger" className="m-4 shadow-sm">
      <div className="d-flex align-items-center">
        <div className="me-3">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>
        <div>
          <h5 className="mb-1">Error Loading Dashboard</h5>
          <p className="mb-0">{error}</p>
        </div>
      </div>
    </Alert>
  );

  const chartData = getFilteredChartData();
  const hasChartData = chartData && chartData.length > 0;
  const stats = generateCardStats();

  return (
    <div className="dashboard-container p-4 bg-light">
      <div className="dashboard-header bg-white rounded shadow-sm p-4 mb-4">
        <div className="d-flex justify-content-between align-items-center flex-wrap">
          <h2 className="mb-0 text-primary">{getReportTitle()}</h2>
          <div className="d-flex align-items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" className="text-muted me-2" viewBox="0 0 16 16">
              <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z"/>
            </svg>
            <span className="text-muted">
              {formatDate(dateRange.start)} - {formatDate(dateRange.end)}
            </span>
          </div>
        </div>
      </div>
      
      {stats.length > 0 && (
        <Row className="g-3 mb-4">
          {stats.map((stat, index) => (
            <Col md={3} sm={6} key={index}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Body className="d-flex align-items-center">
                  <div className={`rounded-circle bg-${stat.color} bg-opacity-10 p-3 me-3`}>
                    {stat.icon}
                  </div>
                  <div>
                    <h6 className="text-muted mb-1">{stat.title}</h6>
                    <h3 className="mb-0 fw-bold">{stat.value}</h3>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
      
      <Row className="mb-4 g-4">
        <Col lg={4}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <h5 className="card-title mb-3">Filter Options</h5>
              <Form.Group className="mb-3">
                <Form.Label className="fw-medium">Campaign</Form.Label>
                <Form.Select 
                  className="border rounded"
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
              
              <Form.Group>
                
                <DateRangePicker 
                  dateRange={dateRange} 
                  onDateChange={setDateRange}
                />
              </Form.Group>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={8}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="card-title mb-0">Performance Trends</h5>
                <div className="d-flex">
                  <div className="d-flex align-items-center me-3">
                    <div className="rounded-circle" style={{width: '10px', height: '10px', backgroundColor: '#4e73df'}}></div>
                    <span className="ms-2 text-muted small">Impressions</span>
                  </div>
                  <div className="d-flex align-items-center me-3">
                    <div className="rounded-circle" style={{width: '10px', height: '10px', backgroundColor: '#1cc88a'}}></div>
                    <span className="ms-2 text-muted small">Spend</span>
                  </div>
                  <div className="d-flex align-items-center">
                    <div className="rounded-circle" style={{width: '10px', height: '10px', backgroundColor: '#36b9cc'}}></div>
                    <span className="ms-2 text-muted small">Sales</span>
                  </div>
                </div>
              </div>
              
              {hasChartData ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart
                    data={chartData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f8f9fc" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#5a5c69"
                      tickFormatter={formatChartDate}
                      tick={{ fill: '#5a5c69', fontSize: 12 }}
                    />
                    <YAxis 
                      yAxisId="impressions" 
                      orientation="left"
                      stroke="#5a5c69"
                      domain={['auto', 'auto']}
                      tickFormatter={value => new Intl.NumberFormat().format(value)}
                      tick={{ fill: '#5a5c69', fontSize: 12 }}
                      allowDecimals={false}
                    />
                    <YAxis 
                      yAxisId="sales-spend" 
                      orientation="right" 
                      stroke="#5a5c69"
                      domain={['auto', 'auto']} 
                      tickFormatter={value => new Intl.NumberFormat().format(value)}
                      tick={{ fill: '#5a5c69', fontSize: 12 }}
                      allowDecimals={false}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 0.15rem 1.75rem 0 rgba(58, 59, 69, 0.15)', border: 'none' }}
                      labelStyle={{ color: '#5a5c69', fontWeight: 'bold', marginBottom: '5px' }}
                      formatter={(value, name) => {
                        return [new Intl.NumberFormat().format(value), name];
                      }}
                      labelFormatter={formatChartDate}
                    />
                    <Legend display={false} />
                    <Line
                      yAxisId="impressions"
                      type="monotone"
                      dataKey="impressions"
                      name="Impressions"
                      stroke="#4e73df"
                      strokeWidth={2}
                      dot={{ r: 3, strokeWidth: 2 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      yAxisId="sales-spend"
                      type="monotone"
                      dataKey="spend"
                      name="Spend"
                      stroke="#1cc88a"
                      strokeWidth={2}
                      dot={{ r: 3, strokeWidth: 2 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      yAxisId="sales-spend"
                      type="monotone"
                      dataKey="sales"
                      name="Sales"
                      stroke="#36b9cc"
                      strokeWidth={2}
                      dot={{ r: 3, strokeWidth: 2 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-5">
                  <div className="mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" className="text-muted" viewBox="0 0 16 16">
                      <path d="M4 11H2v3h2v-3zm5-4H7v7h2V7zm5-5v12h-2V2h2zm-2-1a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1h-2zM6 7a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7zm-5 4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1v-3z"/>
                    </svg>
                  </div>
                  <h5 className="text-muted">No data available</h5>
                  <p className="text-muted small">Try changing your filter settings</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <Card className="border-0 shadow-sm mb-4">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h5 className="card-title mb-0">Campaign Details</h5>
            
            <InputGroup style={{ maxWidth: '300px' }}>
              <InputGroup.Text className="bg-white border-end-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" className="text-muted" viewBox="0 0 16 16">
                  <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
                </svg>
              </InputGroup.Text>
              <Form.Control
                placeholder="Search campaigns..."
                className="border-start-0 ps-0"
              />
            </InputGroup>
          </div>
          
          {tableData.length > 0 ? (
            <div className="table-container">
              <div className="table-responsive">
                <Table className="table-hover campaign-table">
                  <thead>
                    <tr>
                      <th className="border-0 py-3">
                        <div className="text-uppercase text-muted small fw-semibold tracking-wider">Name</div>
                      </th>
                      <th className="border-0 py-3">
                        <div className="text-uppercase text-muted small fw-semibold tracking-wider">Status</div>
                      </th>
                      <th className="border-0 py-3">
                        <div className="text-uppercase text-muted small fw-semibold tracking-wider">Date</div>
                      </th>
                      <th className="border-0 py-3">
                        <div className="text-uppercase text-muted small fw-semibold tracking-wider">Budget</div>
                      </th>
                      <th className="border-0 py-3 text-end">
                        <div className="text-uppercase text-muted small fw-semibold tracking-wider">Impressions</div>
                      </th>
                      <th className="border-0 py-3 text-end">
                        <div className="text-uppercase text-muted small fw-semibold tracking-wider">Clicks</div>
                      </th>
                      <th className="border-0 py-3 text-end">
                        <div className="text-uppercase text-muted small fw-semibold tracking-wider">CTR</div>
                      </th>
                      <th className="border-0 py-3 text-end">
                        <div className="text-uppercase text-muted small fw-semibold tracking-wider">Spend</div>
                      </th>
                      <th className="border-0 py-3 text-end">
                        <div className="text-uppercase text-muted small fw-semibold tracking-wider">CPC</div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableData.map((campaign, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-light bg-opacity-50' : ''}>
                        <td className="py-3">
                          <div className="d-flex align-items-center">
                            <div className="rounded-circle bg-primary bg-opacity-10 d-flex align-items-center justify-content-center" 
                                style={{width: '36px', height: '36px', minWidth: '36px'}}>
                              <span className="text-primary fw-bold">{campaign.name.charAt(0).toUpperCase()}</span>
                            </div>
                            <div className="ms-3 fw-medium text-truncate" style={{maxWidth: '180px'}}>{campaign.name}</div>
                          </div>
                        </td>
                        <td className="py-3">
                          <span className={`badge rounded-pill ${
                            campaign.status === 'Active' ? 'bg-success-subtle text-success' : 
                            campaign.status === 'Paused' ? 'bg-warning-subtle text-warning' : 
                            'bg-secondary-subtle text-secondary'
                          } px-3 py-2`}>
                            {campaign.status}
                          </span>
                        </td>
                        <td className="py-3">{campaign.date}</td>
                        <td className="py-3">
                          <div className="fw-semibold">{campaign.budget}</div>
                        </td>
                        <td className="py-3 text-end">
                          <div className="text-body-secondary">{campaign.impressions}</div>
                        </td>
                        <td className="py-3 text-end">
                          <div>{campaign.clicks}</div>
                        </td>
                        <td className="py-3 text-end">
                          <div className="fw-medium">{campaign.ctr}%</div>
                        </td>
                        <td className="py-3 text-end">
                          <div className="fw-semibold text-success">{campaign.spend}</div>
                        </td>
                        <td className="py-3 text-end">
                          <div className="fw-medium">${campaign.cpc}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>

              {totalPages > 1 && (
                <div className="mt-4 pagination-container">
                  <div className="d-flex justify-content-between align-items-center flex-wrap">
                    <div className="pagination-info mb-2 mb-md-0">
                      <span className="badge bg-light text-dark px-3 py-2">
                        Page {currentPage} of {totalPages}
                      </span>
                    </div>
                    <nav>
                      <Pagination className="mb-0">
                        <Pagination.First 
                          onClick={() => handlePageChange(1)} 
                          disabled={currentPage === 1}
                          className="rounded-start"
                        />
                        <Pagination.Prev 
                          onClick={() => handlePageChange(currentPage - 1)} 
                          disabled={currentPage === 1}
                        />
                        {Array.from({ length: Math.min(totalPages, 5) }).map((_, idx) => {
                          let pageNumber;
                          if (totalPages <= 5) {
                            pageNumber = idx + 1;
                          } else if (currentPage <= 3) {
                            pageNumber = idx + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNumber = totalPages - 4 + idx;
                          } else {
                            pageNumber = currentPage - 2 + idx;
                          }
                          return (
                            <Pagination.Item
                              key={pageNumber}
                              active={pageNumber === currentPage}
                              onClick={() => handlePageChange(pageNumber)}
                            >
                              {pageNumber}
                            </Pagination.Item>
                          );
                        })}
                        <Pagination.Next 
                          onClick={() => handlePageChange(currentPage + 1)} 
                          disabled={currentPage === totalPages}
                        />
                        <Pagination.Last 
                          onClick={() => handlePageChange(totalPages)}
                          disabled={currentPage === totalPages}
                          className="rounded-end"
                        />
                      </Pagination>
                    </nav>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Alert variant="info" className="border-0 bg-light border-start border-5 border-info">
              <div className="d-flex align-items-center">
                <div className="me-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-info">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                  </svg>
                </div>
                <div>
                  <h6 className="mb-1">No campaign data available</h6>
                  <p className="mb-0 text-muted">Try adjusting your filter criteria or date range.</p>
                </div>
              </div>
            </Alert>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default CampaignDashboard;