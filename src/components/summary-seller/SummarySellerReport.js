import React from 'react';
import { Container } from 'react-bootstrap';
import { useSellerData } from '../../hooks/seller/useSellerData';
import { useSellerFilters } from '../../hooks/seller/useSellerFilters';
import SellerHeader from './components/SellerHeader';
import SellerFilters from './components/SellerFilters';
import SellerStats from './components/SellerStats';
import SellerChart from './components/SellerChart';
import SellerTable from './components/SellerTable';
import LoadingState from '../common/LoadingState';
import ErrorState from '../common/ErrorState';

const SummarySellerReport = () => {
  const { filters, updateFilters } = useSellerFilters();
  const { data, loading, error } = useSellerData(filters);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} />;

  return (
    <Container fluid className="p-4 bg-light">
      <SellerHeader title="Seller Summary Report" dateRange={filters.dateRange} />
      <SellerStats statistics={data.statistics} />
      <SellerFilters filters={filters} onFilterChange={updateFilters} />
      <SellerChart data={data.chartData} />
      <SellerTable 
        data={data.tableData}
        pagination={data.pagination}
        onPageChange={(page) => updateFilters({ page })}
      />
    </Container>
  );
};

export default SummarySellerReport;
