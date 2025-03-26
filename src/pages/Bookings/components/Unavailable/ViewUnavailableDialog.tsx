import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Box,
} from '@mui/material';
import { UnavailableDates } from '../../../../components/Types';

interface UnavailableDateDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  selectedUnavailableDate: UnavailableDates | null;
  onEdit: (date: UnavailableDates) => void;
  formatDate: (dateString: string) => string;
}

const UnavailableDateDetailsDialog: React.FC<UnavailableDateDetailsDialogProps> = ({
  open,
  onClose,
  selectedUnavailableDate,
  onEdit,
  formatDate,
}) => {
  if (!selectedUnavailableDate) return null;

  const handleEdit = () => {
    onEdit(selectedUnavailableDate);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Unavailable Date Details</DialogTitle>
      <DialogContent>
        <Box>
          <Typography variant="body1" sx={{ mb: 1 }}>
            <strong>Start Date:</strong> {formatDate(selectedUnavailableDate.startDate)}
          </Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>
            <strong>End Date:</strong> {formatDate(selectedUnavailableDate.endDate)}
          </Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>
            <strong>Reason:</strong> {selectedUnavailableDate.reason || 'No reason specified'}
          </Typography>
          <Typography variant="body1">
            <strong>Created At:</strong> {formatDate(selectedUnavailableDate.createdAt)}
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button 
          onClick={handleEdit} 
          color="primary"
        >
          Edit
        </Button>
        <Button 
          onClick={onClose} 
          color="secondary"
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UnavailableDateDetailsDialog;