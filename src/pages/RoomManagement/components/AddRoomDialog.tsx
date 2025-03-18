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
} from "@mui/material";

interface AddRoomDialogProps {
  open: boolean;
  formData: {
    title: string;
    description: string;
    price: number;
    price_extra: number;
    image: string;
    isActive: boolean;
    capacity: number;
    amenities: string[];
    displayOrder: number;
  };
  onClose: () => void;
  onInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  onCheckboxChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAmenitiesChange: (amenities: string[]) => void;
  onSubmit: () => void;
}

const AddRoomDialog: React.FC<AddRoomDialogProps> = ({
  open,
  formData,
  onClose,
  onInputChange,
  onCheckboxChange,
  onAmenitiesChange,
  onSubmit,
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Add New Room</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} sm={6}>
            <TextField
              name="title"
              label="Room Title"
              value={formData.title}
              onChange={onInputChange}
              fullWidth
              required
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
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              name="price"
              label="Price per Night ($)"
              type="number"
              value={formData.price}
              onChange={onInputChange}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              name="price_extra"
              label="Price per Extra Guest ($)"
              type="number"
              value={formData.price_extra}
              onChange={onInputChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              name="capacity"
              label="Guest Capacity"
              type="number"
              value={formData.capacity}
              onChange={onInputChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              name="displayOrder"
              label="Display Order"
              type="number"
              value={formData.displayOrder}
              onChange={onInputChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={8}>
            <FormControl fullWidth>
              <InputLabel>Amenities</InputLabel>
              <Select
                multiple
                value={formData.amenities}
                onChange={(e) => onAmenitiesChange(e.target.value as string[])}
                renderValue={(selected) => (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {(selected as string[]).map((value) => (
                      <Chip key={value} label={value} />
                    ))}
                  </Box>
                )}
              >
                {[
                  "Wi-Fi",
                  "Air Conditioning",
                  "Kitchen",
                  "TV",
                  "Pool",
                  "Parking",
                  "Washing Machine",
                  "Heating",
                  "Breakfast",
                  "Pets Allowed",
                ].map((amenity) => (
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
              rows={4}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.isActive}
                  onChange={onCheckboxChange}
                  name="isActive"
                />
              }
              label="Active (visible to customers)"
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onSubmit} variant="contained" color="primary">
          Add Room
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddRoomDialog;