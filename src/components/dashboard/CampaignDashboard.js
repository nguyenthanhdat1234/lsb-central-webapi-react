import React from 'react';
import { Row, Col, Spinner, Alert, Card, Table } from 'react-bootstrap';
import DashboardHeader from './DashboardHeader';
import DashboardStats from './DashboardStats';
import DashboardFilters from './DashboardFilters';
import PerformanceChart from './PerformanceChart';
import CampaignTable from './CampaignTable';
import { useCampaignData } from '../../hooks/dashboard/useCampaignData';
import { useFilters } from '../../hooks/dashboard/useFilters';

const CampaignDashboard = ({ reportType }) => {
  const { filters, updateFilters } = useFilters();
  const { data, loading, error } = useCampaignData(filters);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} />;

  return (
    <div className="dashboard-container p-4 bg-light">
      <DashboardHeader 
        title={getReportTitle(reportType)}
        dateRange={filters.dateRange}
      />
      
      <DashboardStats data={data.stats} />
      
      <Row className="mb-4 g-4">
        <Col lg={4}>
          <DashboardFilters 
            campaigns={data.campaigns}
            selectedCampaign={filters.campaign}
            onCampaignChange={(campaign) => updateFilters({ campaign })}
            dateRange={filters.dateRange}
            onDateChange={(dateRange) => updateFilters({ dateRange })}
          />
        </Col>
        
        <Col lg={8}>
          <PerformanceChart data={data.chartData} />
        </Col>
      </Row>

      <Card className="border-0 shadow-sm mb-4">
        <Card.Body>
          <CampaignTable 
            data={data.tableData}
            pagination={data.pagination}
            onPageChange={(page) => updateFilters({ page })}
          />
          <Table className="table-hover border">
            <thead>
              <tr className="bg-white">
                {/* existing headers */}
              </tr>
            </thead>
            {/* existing table body */}
          </Table>
        </Card.Body>
      </Card>
    </div>
  );
};

export default CampaignDashboard;
