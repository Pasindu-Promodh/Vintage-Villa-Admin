import React from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  Typography, 
  Box, 
  DialogActions, 
  Button, 
  TextField,
  CircularProgress
} from '@mui/material';
import { Booking } from '../../../../components/Types';

interface EmailConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  onSendEmail: () => void;
  loading: boolean;
  selectedBooking: Booking | null;
  editForm: Partial<Booking>;
  emailMessage: string;
  setEmailMessage: (message: string) => void;
}

const EmailConfirmationDialog: React.FC<EmailConfirmationDialogProps> = ({
  open, 
  onClose, 
  onSendEmail, 
  loading,
  selectedBooking,
  editForm,
  emailMessage,
  setEmailMessage
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Send Status Update Email</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Typography variant="body1" gutterBottom>
            The booking status has been updated to{" "}
            <strong>{editForm.status}</strong>. Would you like to send an
            email notification to the customer?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Customer: {selectedBooking?.customerName} (
            {selectedBooking?.customerEmail})
          </Typography>
          <TextField
            label="Additional Message (Optional)"
            multiline
            rows={4}
            value={emailMessage}
            onChange={(e) => setEmailMessage(e.target.value)}
            fullWidth
            placeholder="Add any specific information you'd like to include in the email..."
            sx={{ mt: 2 }}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Don't Send Email
        </Button>
        <Button
          onClick={onSendEmail}
          color="primary"
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : "Send Email"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EmailConfirmationDialog;