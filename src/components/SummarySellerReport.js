import React, { useState, useEffect } from 'react';
import { Card, Table, Spinner, Alert, Form, Row, Col, Button, Container, InputGroup } from 'react-bootstrap';
import DateRangePicker from './common/DateRangePicker';
import Pagination from 'react-bootstrap/Pagination';
import { fetchFromApi } from '../services/api';
import { FaCheckCircle, FaSync, FaChartLine, FaFileExport, FaDollarSign, FaShoppingCart, FaPercentage, FaTag, FaSearch } from 'react-icons/fa';

// KPI Cache utility functions
const KPI_STORAGE_KEY = 'global_kpi_value';

const SellerManager = () => {
  const [dateRange, setDateRange] = useState({
    start: (() => {
      const date = new Date();
      date.setDate(date.getDate() - 3);
      return date.toISOString().split('T')[0];
    })(),
    end: new Date().toISOString().split('T')[0]
  });

  const [allCampaignData, setAllCampaignData] = useState([]);
  const [filteredCampaigns, setFilteredCampaigns] = useState([]);
  const [clientData, setClientData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reportData, setReportData] = useState([]);
  const [fullReportData, setFullReportData] = useState([]);
  const [pageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [saveStatus, setSaveStatus] = useState({});

  // Single KPI value for all rows
  const [globalKpiValue, setGlobalKpiValue] = useState('550');

  // Load KPI values from session storage on initial render
  useEffect(() => {
    const cachedKpiValue = sessionStorage.getItem(KPI_STORAGE_KEY);
    if (cachedKpiValue) {
      setGlobalKpiValue(cachedKpiValue);
    }
    console.log("Loaded global KPI value from cache:", cachedKpiValue);
  }, []);

  // Load initial data
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
  }, []);

  // Filter data and paginate
  useEffect(() => {
    if (allCampaignData.length === 0 || loading) return;

    try {
      console.log("Filtering data by date range:", dateRange);

      // Filter by date range
      let filtered = allCampaignData.filter(campaign => {
        const campaignDate = new Date(campaign.date);
        return campaignDate >= new Date(dateRange.start) &&
          campaignDate <= new Date(dateRange.end);
      });

      console.log("Filtered campaigns:", filtered.length);
      setFilteredCampaigns(filtered);

      // Process and paginate data
      if (filtered.length > 0 && clientData.length > 0) {
        // Generate full report
        const fullReport = generateFullReport(filtered, clientData);

        // Apply search filter if needed
        let filteredReport = fullReport;
        if (searchTerm) {
          filteredReport = fullReport.filter(item =>
            item.accountName.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }

        setFullReportData(filteredReport);

        // Calculate total pages
        const total = filteredReport.length;
        const pages = Math.ceil(total / pageSize);
        console.log("Total report items:", total, "Total pages:", pages);
        setTotalPages(pages);

        // Ensure current page is valid
        const validCurrentPage = Math.min(currentPage, Math.max(1, pages || 1));
        if (validCurrentPage !== currentPage) {
          console.log("Adjusting current page from", currentPage, "to", validCurrentPage);
          setCurrentPage(validCurrentPage);
        }

        // Paginate report
        const startIndex = (validCurrentPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedReport = filteredReport.slice(startIndex, endIndex);
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
  }, [allCampaignData, clientData, dateRange, currentPage, pageSize, searchTerm]);

  // Save global KPI value
  const handleGlobalKpiChange = (value) => {
    setGlobalKpiValue(value);

    // Save to session storage
    try {
      sessionStorage.setItem(KPI_STORAGE_KEY, value);

      // Show save status
      setSaveStatus({ global: { saved: true, timestamp: Date.now() } });

      // Clear save status after 2 seconds
      setTimeout(() => {
        setSaveStatus({});
      }, 2000);

      console.log(`Updated global KPI to ${value}`);
    } catch (err) {
      console.error("Error saving global KPI value:", err);
    }
  };

  // Generate full report from filtered data
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
          clientId: clientId,
          accountName: clientName,
          sold: 0,
          sales: 0,
          ads: 0,
          adsToSaleRatio: 0,
          errors: 0,
          payNow: "",
          kpi: globalKpiValue
        };
      }

      clientMetrics[clientId].sold += Number(campaign.unitsSoldSameSku30d || 0);
      clientMetrics[clientId].sales += Number(campaign.sales1d || 0);
      clientMetrics[clientId].ads += Number(campaign.spend || 0);

      // Count errors if any relevant field exists in your data
      if (campaign.errorCount) {
        clientMetrics[clientId].errors += Number(campaign.errorCount || 0);
      }
    });

    // Calculate ratios
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

  // Reset KPI value
  const handleResetKpi = () => {
    if (window.confirm('Are you sure you want to reset KPI value?')) {
      setGlobalKpiValue('');
      sessionStorage.removeItem(KPI_STORAGE_KEY);
      console.log("Reset KPI value");
    }
  };

  // Handle search change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  // Handle page change
  const handlePageChange = (pageNumber) => {
    console.log("Changing page to:", pageNumber);
    setCurrentPage(pageNumber);
    // Scroll to top
    window.scrollTo(0, 0);
  };

  // Handle date change
  const handleDateChange = (newDateRange) => {
    console.log("Date range changed:", newDateRange);
    setDateRange(newDateRange);
    // Reset to first page when changing date
    setCurrentPage(1);
  };

  // Export data to CSV
  const handleExportData = () => {
    const csvContent = [
      // Header
      ["STT", "ACC", "Sold", "Sales", "Ads", "Ads/Sale", "Issues", "Pay Now", "KPI"].join(","),
      // Rows
      ...fullReportData.map(item => [
        item.stt,
        `"${item.accountName}"`,
        item.sold,
        item.sales.toFixed(2),
        item.ads.toFixed(2),
        item.adsToSaleRatio.toFixed(2),
        item.errors,
        item.payNow,
        globalKpiValue,
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `seller-report-${dateRange.start}-to-${dateRange.end}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Render pagination
  const renderPagination = () => {
    let items = [];

    // Limit number of pagination buttons shown
    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    // Adjust startPage if we're at the end
    if (endPage === totalPages) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    // Add first page and ellipsis if needed
    if (startPage > 1) {
      items.push(
        <Pagination.Item key="start" onClick={() => handlePageChange(1)}>1</Pagination.Item>
      );
      if (startPage > 2) {
        items.push(<Pagination.Ellipsis key="ellipsis-start" />);
      }
    }

    // Add page buttons
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

    // Add last page and ellipsis if needed
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

  // Loading state
  if (loading) return (
    <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
      <Spinner animation="border" role="status" variant="primary">
        <span className="visually-hidden">Loading...</span>
      </Spinner>
      <p className="ms-3 text-muted">Loading seller data...</p>
    </div>
  );

  // Error state
  if (error) return (
    <Alert variant="danger" className="m-4">
      <Alert.Heading>Error Loading Data</Alert.Heading>
      <p>{error}</p>
      <hr />
      <div className="d-flex justify-content-end">
        <Button variant="outline-danger" onClick={() => window.location.reload()}>
          <FaSync className="me-2" /> Retry
        </Button>
      </div>
    </Alert>
  );

  // Calculate totals from all report data
  const totalSold = reportData.reduce((sum, item) => sum + item.sold, 0);
  const totalSales = reportData.reduce((sum, item) => sum + item.sales, 0);
  const totalAds = reportData.reduce((sum, item) => sum + item.ads, 0);
  const totalAdsToSaleRatio = totalSales > 0 ? (totalAds / totalSales * 100).toFixed(2) : "0.00";

  return (
    <Container fluid className="p-0 bg-white">
      {/* Header Section */}
      <div className="py-3 px-4 mb-4 bg-white border-bottom" style={{
        boxShadow: '0 0.125rem 0.25rem rgba(0, 0, 0, 0.075)'
      }}>
        <Row className="align-items-center">
          <Col md={8}>
            <h2 className="mb-0 d-flex align-items-center text-primary">
              <FaChartLine className="me-2" /> Summary Seller Report
            </h2>
            <p className="text-muted mb-0">
              Performance data from {dateRange.start} to {dateRange.end}
            </p>
          </Col>
          <Col md={4} className="text-end">
            <Button
              variant="primary"
              className="me-2"
              onClick={handleExportData}
            >
              <FaFileExport className="me-2" /> Export Data
            </Button>
          </Col>
        </Row>
      </div>

      <div className="px-4">
        {/* Dashboard Overview */}
        <Row className="mb-4">
          <Col md={3} className="mb-3">
            <Card className="h-100 border shadow-sm" style={{ borderRadius: '10px' }}>
              <Card.Body className="d-flex align-items-center">
                <div className="rounded-circle p-3 me-3" style={{ background: 'rgba(13, 110, 253, 0.1)' }}>
                  <FaDollarSign size={24} color="#0d6efd" />
                </div>
                <div>
                  <h6 className="text-muted mb-1" style={{ fontSize: '0.85rem' }}>Total Sales</h6>
                  <h3 className="mb-0 text-primary" style={{ fontWeight: '600' }}>${totalSales.toFixed(2)}</h3>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} className="mb-3">
            <Card className="border-0 shadow-sm rounded-3 overflow-hidden">
              <Card.Body className="d-flex align-items-center p-3">
                <div className="rounded-circle bg-primary bg-opacity-10 p-3 me-3">
                  <FaTag size={20} color="#0d6efd" />
                </div>
                <div>
                  <p className="text-muted mb-1 small">Total Ads Spend</p>
                  <h3 className="mb-0 fw-bold text-primary">$2501.20</h3>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} className="mb-3">
            <Card className="h-100 border shadow-sm" style={{ borderRadius: '10px' }}>
              <Card.Body className="d-flex align-items-center">
                <div className="rounded-circle p-3 me-3" style={{ background: 'rgba(255, 193, 7, 0.1)' }}>
                  <FaPercentage size={24} color="#ffc107" />
                </div>
                <div>
                  <h6 className="text-muted mb-1" style={{ fontSize: '0.85rem' }}>Ads/Sale Ratio</h6>
                  <h3 className="mb-0 text-warning" style={{ fontWeight: '600' }}>{totalAdsToSaleRatio}%</h3>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} className="mb-3">
            <Card className="h-100 border shadow-sm" style={{ borderRadius: '10px' }}>
              <Card.Body className="d-flex align-items-center">
                <div className="rounded-circle p-3 me-3" style={{ background: 'rgba(25, 135, 84, 0.1)' }}>
                  <FaShoppingCart size={24} color="#198754" />
                </div>
                <div>
                  <h6 className="text-muted mb-1" style={{ fontSize: '0.85rem' }}>Units Sold</h6>
                  <h3 className="mb-0 text-success" style={{ fontWeight: '600' }}>{totalSold.toLocaleString()}</h3>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Filters and Controls */}
        <Row className="mb-4">
          <Col lg={4} md={6} className="mb-3">
            <Card className="h-100 border shadow-sm" style={{ borderRadius: '10px' }}>
              <Card.Body>
                <h6 className="fw-bold mb-2 text-primary">Date Range</h6>
                <DateRangePicker
                  dateRange={dateRange}
                  onDateChange={handleDateChange}
                />
              </Card.Body>
            </Card>
          </Col>
          <Col lg={4} md={6} className="mb-3">
            <Card className="h-100 border shadow-sm" style={{ borderRadius: '10px' }}>
              <Card.Body>
                <h6 className="fw-bold mb-2 text-primary">Search Accounts</h6>
                <InputGroup>
                  <InputGroup.Text className="bg-light">
                    <FaSearch className="text-muted" />
                  </InputGroup.Text>
                  <Form.Control
                    placeholder="Search by account name..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="border-start-0"
                  />
                </InputGroup>
              </Card.Body>
            </Card>
          </Col>
          <Col lg={4} className="mb-3">
            <Card className="h-100 border shadow-sm" style={{ borderRadius: '10px' }}>
              <Card.Body>
                <h6 className="fw-bold mb-2 text-primary">KPI Setting</h6>
                <InputGroup>
                  <InputGroup.Text className="bg-light">
                    <FaTag className="text-muted" />
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    value={globalKpiValue}
                    onChange={(e) => handleGlobalKpiChange(e.target.value)}
                    placeholder="Enter global KPI target"
                  />
                  <Button
                    variant="outline-secondary"
                    onClick={handleResetKpi}
                  >
                    <FaSync /> Reset
                  </Button>
                  {saveStatus.global && saveStatus.global.saved && (
                    <div style={{
                      position: 'absolute',
                      right: '50px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'green',
                      zIndex: 5
                    }}>
                      <FaCheckCircle />
                    </div>
                  )}
                </InputGroup>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Data Table */}
        <Card className="mb-4 border shadow-sm" style={{ borderRadius: '10px', overflow: 'hidden' }}>
          <Card.Header className="bg-light border-bottom">
            <h5 className="mb-0 text-primary fw-bold">Seller Performance Report</h5>
          </Card.Header>
          <Card.Body className="p-0">
            <div className="table-responsive">
              <Table className="mb-0" hover>
                <thead>
                  <tr className="bg-light">
                    <th className="text-center" style={{ width: '50px', padding: '1rem 0.5rem' }}>STT</th>
                    <th style={{ padding: '1rem 0.75rem' }}>ACC</th>
                    <th className="text-end" style={{ padding: '1rem 0.75rem' }}>Sold</th>
                    <th className="text-end" style={{ padding: '1rem 0.75rem' }}>Sales</th>
                    <th className="text-end" style={{ padding: '1rem 0.75rem' }}>Ads</th>
                    <th className="text-end" style={{ padding: '1rem 0.75rem' }}>Ads/Sale</th>
                    <th className="text-center" style={{ padding: '1rem 0.75rem' }}>Issues</th>
                    <th className="text-end" style={{ padding: '1rem 0.75rem' }}>Pay Now</th>
                    <th className="text-center" style={{ padding: '1rem 0.75rem' }}>KPI</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.map((item, index) => (
                    <tr key={item.stt} className={index % 2 === 0 ? 'bg-white' : 'bg-light'}>
                      <td className="text-center" style={{ padding: '1rem 0.5rem' }}>{item.stt}</td>
                      <td style={{ padding: '1rem 0.75rem', fontWeight: '500' }}>
                        <div className="d-flex align-items-center">
                          <div className="rounded-circle bg-primary bg-opacity-10 d-flex align-items-center justify-content-center"
                            style={{ width: '32px', height: '32px', minWidth: '32px' }}>
                            <span className="text-primary fw-bold">{item.accountName.charAt(0).toUpperCase()}</span>
                          </div>
                          <div className="ms-2">
                            <div>{item.accountName}</div>
                            <div className="text-muted small">ID: {item.clientId}</div>
                          </div>
                        </div>
                      </td>
                      <td className="text-end" style={{ padding: '1rem 0.75rem' }}>{item.sold.toLocaleString()}</td>
                      <td className="text-end" style={{ padding: '1rem 0.75rem' }}>${item.sales.toFixed(2)}</td>
                      <td className="text-end" style={{ padding: '1rem 0.75rem' }}>${item.ads.toFixed(2)}</td>
                      <td className="text-end" style={{ padding: '1rem 0.75rem' }}>
                        <span style={{
                          padding: '0.25rem 0.5rem',
                          borderRadius: '4px',
                          backgroundColor: item.adsToSaleRatio < 15
                            ? 'rgba(25, 135, 84, 0.15)'
                            : item.adsToSaleRatio < 25
                              ? 'rgba(255, 193, 7, 0.15)'
                              : 'rgba(220, 53, 69, 0.15)',
                          color: item.adsToSaleRatio < 15
                            ? '#198754'
                            : item.adsToSaleRatio < 25
                              ? '#ffc107'
                              : '#dc3545',
                          fontWeight: '500'
                        }}>
                          {item.adsToSaleRatio.toFixed(2)}%
                        </span>
                      </td>
                      <td className="text-center" style={{
                        padding: '1rem 0.75rem',
                        color: item.errors > 0 ? '#dc3545' : 'inherit',
                        fontWeight: item.errors > 0 ? '600' : 'normal'
                      }}>
                        {item.errors}
                      </td>
                      <td className="text-end" style={{ padding: '1rem 0.75rem' }}>{item.payNow}</td>
                      <td className="text-center" style={{ padding: '1rem 0.75rem' }}>{globalKpiValue}</td>
                    </tr>
                  ))}
                  <tr className="bg-light fw-bold">
                    <td colSpan="2" className="text-center" style={{ padding: '1rem 0.75rem' }}>TOTAL</td>
                    <td className="text-end" style={{ padding: '1rem 0.75rem' }}>{totalSold.toLocaleString()}</td>
                    <td className="text-end" style={{ padding: '1rem 0.75rem' }}>${totalSales.toFixed(2)}</td>
                    <td className="text-end" style={{ padding: '1rem 0.75rem' }}>${totalAds.toFixed(2)}</td>
                    <td className="text-end" style={{ padding: '1rem 0.75rem' }}>{totalAdsToSaleRatio}%</td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="d-flex justify-content-center mb-4">
            {renderPagination()}
          </div>
        )}
      </div>
    </Container>
  );
};

export default SellerManager;