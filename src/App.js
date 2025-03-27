import React, { useState } from 'react';
import CampaignDashboard from './components/CampaignDashboard';
import ClientManager from './components/ClientManager';
import { Navbar, Container, Nav, Col, Row } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

function App() {
  const [activeSection, setActiveSection] = useState('reports');
  const [activeReportType, setActiveReportType] = useState('singleCountry');

  // Xử lý khi click vào menu chính
  const handleMainNavigation = (section) => {
    setActiveSection(section);
    if (section === 'reports') {
      setActiveReportType('singleCountry'); // Default report type
    }
  };

  // Xử lý khi click vào submenu của Reports
  const handleReportNavigation = (reportType) => {
    setActiveReportType(reportType);
  };

  return (
    <div className="App bg-dark text-white min-vh-100">
      {/* Header - chung cho tất cả các phần */}
      <Navbar bg="dark" variant="dark" className="border-bottom border-secondary">
        <Container fluid>
          <Navbar.Brand>LSB Automation Ads Tool V2 - 2025 (1.1.2411.13 alpha)</Navbar.Brand>
        </Container>
      </Navbar>
      
      <Container fluid className="mt-3">
        <Row>
          {/* Sidebar - chung cho tất cả các phần */}
          <Col md={2} className="bg-dark border-end border-secondary">
            {/* Main Menu */}
            <Nav className="flex-column">
              <Nav.Link 
                active={activeSection === 'reports'} 
                onClick={() => handleMainNavigation('reports')}
                className="fw-bold"
              >
                <i className="bi bi-bar-chart-line me-2"></i>
                Reports
              </Nav.Link>
              
              {/* Submenu cho Reports - chỉ hiển thị khi Reports được chọn */}
              {activeSection === 'reports' && (
                <div className="ms-3 mt-2">
                  <Nav className="flex-column">
                    <Nav.Link 
                      active={activeReportType === 'singleCountry'} 
                      onClick={() => handleReportNavigation('singleCountry')}
                    >
                      Single Country
                    </Nav.Link>
                    <Nav.Link 
                      active={activeReportType === 'multipleCountry'} 
                      onClick={() => handleReportNavigation('multipleCountry')}
                    >
                      Multiple Country
                    </Nav.Link>
                    <Nav.Link>Drafts</Nav.Link>
                    <Nav.Link>Budgets</Nav.Link>
                    <Nav.Link>Products</Nav.Link>
                    <Nav.Link>Targeting</Nav.Link>
                    <Nav.Link>Setting</Nav.Link>
                  </Nav>
                </div>
              )}
              
              <Nav.Link 
                active={activeSection === 'clients'} 
                onClick={() => handleMainNavigation('clients')}
                className="fw-bold mt-3"
              >
                <i className="bi bi-people-fill me-2"></i>
                Client Manager
              </Nav.Link>
            </Nav>
          </Col>
          
          {/* Content Area - render component dựa trên state */}
          <Col md={10} className="p-0">
            {activeSection === 'reports' && <CampaignDashboard reportType={activeReportType} />}
            {activeSection === 'clients' && <ClientManager />}
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default App;