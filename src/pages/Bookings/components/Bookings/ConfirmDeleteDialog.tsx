import React from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  Typography, 
  Box, 
  DialogActions, 
  Button 
} from '@mui/material';
import { Booking } from '../../../../components/Types';

interface ConfirmDeleteDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirmDelete: () => void;
  selectedBooking: Booking | null;
}

const ConfirmDeleteDialog: React.FC<ConfirmDeleteDialogProps> = ({
  open, 
  onClose, 
  onConfirmDelete, 
  selectedBooking
}) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Confirm Deletion</DialogTitle>
      <DialogContent>
        <Typography>
          Are you sure you want to delete this booking? This action cannot be undone.
        </Typography>
        {selectedBooking && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Booking ID:</strong> {selectedBooking.id}
            </Typography>
            <Typography variant="body2">
              <strong>Customer:</strong> {selectedBooking.customerName}
            </Typography>
            <Typography variant="body2">
              <strong>Room:</strong> {selectedBooking.roomTitle}
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onConfirmDelete} color="error">
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDeleteDialog;