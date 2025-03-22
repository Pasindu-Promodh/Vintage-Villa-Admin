import * as React from "react";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";

interface EditRoomDialogProps {
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

const EditRoomDialog: React.FC<EditRoomDialogProps> = ({
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

  const amenitiesList = [
    "Wi-Fi",
    "Air Conditioning",
    "Pantry",
    "TV",
    "Pool",
    "Parking",
    "Washing Machine",
    "Heating",
    "Breakfast",
    "Pets Allowed",
    "Bed linen",
    "Towels",
    "Shower cap",
    "Paper napkins",
    "Filtered water",
    "Coffee (Nescafé)",
    "Black tea bags",
    "Green tea bags",
    "Flavored tea bags",
    "Sugar sachets",
    "Snacks",
    "Soap",
    "Shampoo",
    "Conditioner",
    "Toilet paper",
  ];

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
      <DialogTitle sx={{ px: isMobile ? 2 : 3 }}>Edit Room</DialogTitle>
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
                {amenitiesList.map((amenity) => (
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
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditRoomDialog;