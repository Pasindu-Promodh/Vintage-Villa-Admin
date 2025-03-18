import * as React from "react";
import { Paper, Typography, Box, IconButton, Button, Chip, Grid, Divider, List } from "@mui/material";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";

interface Room {
  id: string;
  title: string;
  description: string;
  price: number;
  price_extra: number;
  image: string;
  isActive: boolean;
  displayOrder: number;
  capacity: number;
  amenities: string[];
  lastUpdated: number;
}

interface RoomListProps {
  rooms: Room[];
  loading: boolean;
  formatCurrency: (amount: number) => string;
  onEdit: (room: Room) => void;
  onToggleStatus: (room: Room) => void;
  onMove: (roomIndex: number, direction: "up" | "down") => void;
  onDelete: (room: Room) => void;
}

const RoomList: React.FC<RoomListProps> = ({
  rooms,
  loading,
  formatCurrency,
  onEdit,
  onToggleStatus,
  onMove,
  onDelete,
}) => {
  if (rooms.length === 0 && !loading) {
    return (
      <Typography variant="body1" color="text.secondary" align="center">
        No rooms added yet
      </Typography>
    );
  }

  return (
    <List>
      {rooms.map((room, index) => (
        <Paper key={room.id} elevation={2} sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={3}>
              {room.image ? (
                <img
                  src={room.image}
                  alt={room.title}
                  style={{ maxWidth: "100%", maxHeight: 150 }}
                />
              ) : (
                <Box
                  sx={{
                    height: 150,
                    bgcolor: "grey.300",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    No Image
                  </Typography>
                </Box>
              )}
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <Typography variant="h6" mr={1}>
                  {room.title}
                </Typography>
                <Chip
                  size="small"
                  label={room.isActive ? "Active" : "Inactive"}
                  color={room.isActive ? "success" : "default"}
                />
              </Box>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Price: {formatCurrency(room.price)} / night
                {room.price_extra > 0 &&
                  ` (${formatCurrency(room.price_extra)} per additional guest)`}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Capacity: {room.capacity} guests
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  display: "-webkit-box",
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: "vertical",
                }}
              >
                {room.description}
              </Typography>

              {room.amenities && room.amenities.length > 0 && (
                <Box mt={1}>
                  <Typography variant="subtitle2">Amenities:</Typography>
                  <Box display="flex" flexWrap="wrap" gap={1}>
                    {room.amenities.map((amenity, idx) => (
                      <Chip key={idx} label={amenity} size="small" />
                    ))}
                  </Box>
                </Box>
              )}

              <Typography variant="body2" color="text.secondary" mt={1}>
                Display Order: {room.displayOrder}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Box
                display="flex"
                flexDirection="column"
                gap={1}
                alignItems="flex-end"
              >
                <IconButton
                  onClick={() => onMove(index, "up")}
                  disabled={index === 0}
                  color="primary"
                  size="small"
                >
                  <ArrowUpwardIcon />
                </IconButton>
                <IconButton
                  onClick={() => onMove(index, "down")}
                  disabled={index === rooms.length - 1}
                  color="primary"
                  size="small"
                >
                  <ArrowDownwardIcon />
                </IconButton>
                <Divider sx={{ width: "100%", my: 1 }} />
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => onToggleStatus(room)}
                  sx={{ mb: 1 }}
                >
                  {room.isActive ? "Disable" : "Enable"}
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  onClick={() => onEdit(room)}
                  sx={{ mb: 1 }}
                >
                  Edit
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  size="small"
                  onClick={() => onDelete(room)}
                >
                  Delete
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      ))}
    </List>
  );
};

export default RoomList;