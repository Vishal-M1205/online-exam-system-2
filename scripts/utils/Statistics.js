export class Statistics {
  // Aggregates enrollment counts by status (Pending, Approved, Rejected) and returns total
  calculateStats(enrollments) {
    const stats = enrollments.reduce(
      (result, e) => {
        switch (e.status) {
          case 'Pending':
            result.pending++;
            break;
          case 'Approved':
            result.approved++;
            break;
          case 'Rejected':
            result.rejected++;
            break;
        }
        return result;
      },
      {
        pending: 0,
        approved: 0,
        rejected: 0,
      }
    );
    return { total: enrollments.length, ...stats };
  }

  // Converts enrollment status counts to percentage values
  calculateStatsPercent(data) {
    return {
      pending: (data.pending * 100) / data.total,
      rejected: (data.rejected * 100) / data.total,
      approved: (data.approved * 100) / data.total,
    };
  }
}
