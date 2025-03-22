import React from 'react';
import { Chip } from '@mui/material';

interface StatusChipProps {
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  size?: 'small' | 'medium';
}

const StatusChip: React.FC<StatusChipProps> = ({ status, size = 'small' }) => {
  // Get status chip color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'error';
      case 'completed':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <Chip
      label={status}
      color={getStatusColor(status) as any}
      size={size}
    />
  );
};

export default StatusChip;