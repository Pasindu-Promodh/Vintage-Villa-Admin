import * as React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControlLabel,
  Checkbox,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Chip,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { RoomDialogProps } from "../../../components/Types";
import { AMENITIES_LIST } from "../../../components/Constants";

const AddRoomDialog: React.FC<RoomDialogProps> = ({
  open,
  formData,
  onClose,
  onInputChange,
  onCheckboxChange,
  onAmenitiesChange,
  onSubmit,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          m: isMobile ? 0 : 2,
          width: isMobile ? '100%' : undefined,
          maxHeight: isMobile ? '100%' : '90vh',
          borderRadius: isMobile ? 0 : undefined
        }
      }}
    >
      <DialogTitle sx={{ px: isMobile ? 2 : 3 }}>Add New Room</DialogTitle>
      <DialogContent sx={{ px: isMobile ? 2 : 3 }}>
        <Grid container spacing={isMobile ? 1.5 : 2} sx={{ mt: 0.5 }}>
          <Grid item xs={12} sm={6}>
            <TextField
              name="title"
              label="Room Title"
              value={formData.title}
              onChange={onInputChange}
              fullWidth
              required
              size={isMobile ? "small" : "medium"}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              name="image"
              label="Image URL"
              value={formData.image}
              onChange={onInputChange}
              fullWidth
              placeholder="http://example.com/image.jpg"
              size={isMobile ? "small" : "medium"}
            />
          </Grid>
          <Grid item xs={6} sm={4}>
            <TextField
              name="price"
              label="Price ($)"
              type="number"
              value={formData.price}
              onChange={onInputChange}
              fullWidth
              required
              size={isMobile ? "small" : "medium"}
            />
          </Grid>
          <Grid item xs={6} sm={4}>
            <TextField
              name="price_extra"
              label="Extra Guest ($)"
              type="number"
              value={formData.price_extra}
              onChange={onInputChange}
              fullWidth
              size={isMobile ? "small" : "medium"}
            />
          </Grid>
          <Grid item xs={6} sm={4}>
            <TextField
              name="capacity"
              label="Capacity"
              type="number"
              value={formData.capacity}
              onChange={onInputChange}
              fullWidth
              size={isMobile ? "small" : "medium"}
            />
          </Grid>
          <Grid item xs={6} sm={4}>
            <TextField
              name="displayOrder"
              label="Display Order"
              type="number"
              value={formData.displayOrder}
              onChange={onInputChange}
              fullWidth
              size={isMobile ? "small" : "medium"}
            />
          </Grid>
          <Grid item xs={12} sm={8}>
            <FormControl fullWidth size={isMobile ? "small" : "medium"}>
              <InputLabel>Amenities</InputLabel>
              <Select
                multiple
                value={formData.amenities}
                onChange={(e) => onAmenitiesChange(e.target.value as string[])}
                renderValue={(selected) => (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {(selected as string[]).map((value) => (
                      <Chip key={value} label={value} size={isMobile ? "small" : "medium"} />
                    ))}
                  </Box>
                )}
              >
                {AMENITIES_LIST.map((amenity) => (
                  <MenuItem key={amenity} value={amenity}>
                    {amenity}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField
              name="description"
              label="Description"
              value={formData.description}
              onChange={onInputChange}
              fullWidth
              multiline
              rows={isMobile ? 12 : 10}
              required
              size={isMobile ? "small" : "medium"}
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.isActive}
                  onChange={onCheckboxChange}
                  name="isActive"
                  size={isMobile ? "small" : "medium"}
                />
              }
              label="Active (visible to customers)"
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: isMobile ? 2 : 3, pb: isMobile ? 2 : 1.5 }}>
        <Button onClick={onClose} size={isMobile ? "small" : "medium"}>Cancel</Button>
        <Button 
          onClick={onSubmit} 
          variant="contained" 
          color="primary"
          size={isMobile ? "small" : "medium"}
        >
          Add Room
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddRoomDialog;