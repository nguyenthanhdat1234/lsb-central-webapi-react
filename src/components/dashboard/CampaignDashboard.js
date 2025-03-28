import React from 'react';
import { Container } from 'react-bootstrap';
import { useCampaignData } from '../../hooks/campaign/useCampaignData';
import DashboardLayout from './components/DashboardLayout';
import DashboardHeader from './components/DashboardHeader';
import DashboardStats from './components/DashboardStats';
import DashboardFilters from './components/DashboardFilters';
import CampaignChart from './components/CampaignChart';
import CampaignTable from './components/CampaignTable';
import LoadingState from '../common/LoadingState';
import ErrorState from '../common/ErrorState';

const CampaignDashboard = ({ reportType }) => {
  const { data, loading, error, filters, updateFilters } = useCampaignData();

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} />;

  return (
    <DashboardLayout>
      <DashboardHeader title={getReportTitle(reportType)} dateRange={filters.dateRange} />
      <DashboardStats stats={data.stats} />
      <DashboardFilters 
        filters={filters}
        onFilterChange={updateFilters}
        availableCampaigns={data.campaigns}
      />
      <CampaignChart data={data.chartData} />
      <CampaignTable 
        data={data.tableData}
        pagination={data.pagination}
        onPageChange={(page) => updateFilters({ page })}
      />
    </DashboardLayout>
  );
};

export default CampaignDashboard;
