import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Box,
  Chip,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { UnavailableDates } from "../../../../components/Types";

interface UnavailableDateDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  selectedUnavailableDate: UnavailableDates | null;
  onEdit: (date: UnavailableDates) => void;
  formatDate: (dateString: string) => string;
}

const UnavailableDateDetailsDialog: React.FC<
  UnavailableDateDetailsDialogProps
> = ({ open, onClose, selectedUnavailableDate, onEdit, formatDate }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  if (!selectedUnavailableDate) return null;

  const handleEdit = () => {
    onEdit(selectedUnavailableDate);
    onClose();
  };

  const roomLabel =
    !selectedUnavailableDate.roomId || selectedUnavailableDate.roomId === "all"
      ? "All Rooms"
      : selectedUnavailableDate.roomTitle || selectedUnavailableDate.roomId;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          m: isMobile ? 0 : 2,
          borderRadius: isMobile ? 0 : undefined,
        },
      }}
    >
      <DialogTitle sx={{ px: isMobile ? 2 : 3 }}>
        Unavailable Date Details
      </DialogTitle>
      <DialogContent sx={{ px: isMobile ? 2 : 3 }}>
        <Box>
          <Box sx={{ mb: 1.5 }}>
            <Chip label={roomLabel} color="default" size="small" />
          </Box>
          <Typography variant="body1" sx={{ mb: 1 }}>
            <strong>Start Date:</strong>{" "}
            {formatDate(selectedUnavailableDate.startDate)}
          </Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>
            <strong>End Date:</strong>{" "}
            {formatDate(selectedUnavailableDate.endDate)}
          </Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>
            <strong>Reason:</strong>{" "}
            {selectedUnavailableDate.reason || "No reason specified"}
          </Typography>
          <Typography variant="body1">
            <strong>Created At:</strong>{" "}
            {formatDate(selectedUnavailableDate.createdAt)}
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: isMobile ? 2 : 3, pb: isMobile ? 2 : 1.5 }}>
        <Button
          onClick={handleEdit}
          color="primary"
          size={isMobile ? "small" : "medium"}
        >
          Edit
        </Button>
        <Button
          onClick={onClose}
          color="secondary"
          size={isMobile ? "small" : "medium"}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UnavailableDateDetailsDialog;
