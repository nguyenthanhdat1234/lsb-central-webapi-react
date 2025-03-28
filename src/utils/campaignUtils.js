export const getReportTitle = (reportType) => {
  const titles = {
    singleCountry: 'Single Country Report',
    multipleCountry: 'Multiple Country Report',
    default: 'Campaign Performance Report'
  };
  return titles[reportType] || titles.default;
};

export const processCampaignData = (rawData) => {
  // ...existing processing logic...
};
