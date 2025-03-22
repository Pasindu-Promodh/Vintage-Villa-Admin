import React, { useState } from "react";
import {
  Grid,
  Typography,
  Box,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Card,
  CardMedia,
  CardActionArea,
  Paper,
  Container,
  Divider,
  Tooltip,
  Snackbar,
  Alert,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import TagSelector from "../../../components/TagSelector";

interface Photo {
  id: string;
  imageUrl: string;
  thumbnailUrl: string;
  tags: string[];
  storagePath: string;
  thumbnailPath?: string;
  size: number;
  filename: string;
  uploadDate: number;
  displayOrder: number;
}

interface ImageLibraryProps {
  photos: Photo[];
  getTagName: (tagId: string) => string;
  formatFileSize: (bytes: number) => string;
  onDeletePhoto: (
    id: string,
    storagePath?: string,
    thumbnailPath?: string
  ) => Promise<void>;
  onUpdateTags: (photoId: string, newTags: string[]) => Promise<void>;
  onMoveUp: (index: number) => Promise<void>;
  onMoveDown: (index: number) => Promise<void>;
  sortOrder: string;
  tagMap: { [key: string]: string };
}

const ImageLibrary: React.FC<ImageLibraryProps> = ({
  photos,
  getTagName,
  formatFileSize,
  onDeletePhoto,
  onUpdateTags,
  onMoveUp,
  onMoveDown,
  sortOrder,
}) => {
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingTags, setEditingTags] = useState<string[]>([]);
  const [confirmDeleteDialogOpen, setConfirmDeleteDialogOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  
  // Add theme and media query for responsive adjustments
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Open details dialog for a photo
  const openDetailsDialog = (photo: Photo) => {
    setSelectedPhoto(photo);
    setDetailsDialogOpen(true);
  };

  // Open edit dialog for the selected photo
  const openEditDialog = () => {
    if (selectedPhoto) {
      setEditingTags([...selectedPhoto.tags]);
      setEditDialogOpen(true);
    }
  };

  // Open confirm delete dialog
  const openConfirmDeleteDialog = () => {
    setConfirmDeleteDialogOpen(true);
  };

  // Remove tag in edit dialog
  const removeTagFromEdit = (index: number) => {
    const newTags = [...editingTags];
    newTags.splice(index, 1);
    setEditingTags(newTags);
  };

  // Save updated tags
  const saveUpdatedTags = async () => {
    if (selectedPhoto) {
      await onUpdateTags(selectedPhoto.id, editingTags);
      // Update selected photo to reflect changes
      setSelectedPhoto({
        ...selectedPhoto,
        tags: [...editingTags],
      });
      setEditDialogOpen(false);
    }
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (selectedPhoto) {
      await onDeletePhoto(
        selectedPhoto.id,
        selectedPhoto.storagePath,
        selectedPhoto.thumbnailPath
      );
      setConfirmDeleteDialogOpen(false);
      setDetailsDialogOpen(false);
      setSelectedPhoto(null);
    }
  };

  // Find index of selected photo
  const findPhotoIndex = () => {
    if (!selectedPhoto) return -1;
    return photos.findIndex((photo) => photo.id === selectedPhoto.id);
  };

  // Handle move up action from details modal
  const handleMoveUp = async () => {
    const index = findPhotoIndex();
    if (index > 0) {
      await onMoveUp(index);
    }
  };

  // Handle move down action from details modal
  const handleMoveDown = async () => {
    const index = findPhotoIndex();
    if (index >= 0 && index < photos.length - 1) {
      await onMoveDown(index);
    }
  };

  // Copy image URL to clipboard
  const copyImageUrl = () => {
    if (selectedPhoto) {
      navigator.clipboard.writeText(selectedPhoto.imageUrl)
        .then(() => {
          setSnackbarMessage("Image URL copied to clipboard");
          setSnackbarOpen(true);
        })
        .catch((error) => {
          setSnackbarMessage("Failed to copy URL: " + error.message);
          setSnackbarOpen(true);
        });
    }
  };

  // Close snackbar
  const handleSnackbarClose = (_event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  return (
    <Container 
      disableGutters={isMobile} 
      maxWidth={false} 
      sx={{ 
        px: isMobile ? 1 : 2,
        width: '100%'
      }}
    >
      {photos.length === 0 ? (
        <Typography variant="body1" color="text.secondary" align="center">
          No images uploaded yet
        </Typography>
      ) : (
        <Grid container spacing={isMobile ? 1 : 2}>
          {photos.map((photo) => (
            <Grid item xs={6} sm={4} md={3} key={photo.id}>
              <Card sx={{ height: "100%" }}>
                <CardActionArea onClick={() => openDetailsDialog(photo)}>
                  <Box sx={{ position: "relative", paddingTop: "100%" }}>
                    <CardMedia
                      component="img"
                      image={photo.thumbnailUrl || photo.imageUrl}
                      alt={photo.filename || "Photo"}
                      sx={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        objectFit: "cover"
                      }}
                    />
                  </Box>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Photo Details Dialog */}
      <Dialog
        open={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
      >
        {selectedPhoto && (
          <>
            <DialogTitle>
              {selectedPhoto.filename || "Photo Details"}
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={isMobile ? 2 : 3}>
                <Grid item xs={12} md={6}>
                  <Paper elevation={0} sx={{ p: isMobile ? 1 : 2, textAlign: "center" }}>
                    <img
                      src={selectedPhoto.imageUrl}
                      alt={selectedPhoto.filename || "Photo"}
                      style={{
                        maxWidth: "100%",
                        maxHeight: isMobile ? "300px" : "400px",
                        objectFit: "contain",
                      }}
                    />
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box sx={{ p: isMobile ? 1 : 2 }}>
                    <Typography variant="h6">File Information</Typography>
                    <Divider sx={{ my: 1 }} />
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body1">
                        <strong>Filename:</strong> {selectedPhoto.filename || "Unknown"}
                      </Typography>
                      <Typography variant="body1">
                        <strong>Size:</strong> {selectedPhoto.size ? formatFileSize(selectedPhoto.size) : "Unknown"}
                      </Typography>
                      <Typography variant="body1">
                        <strong>Uploaded:</strong> {selectedPhoto.uploadDate
                          ? new Date(selectedPhoto.uploadDate).toLocaleString()
                          : "Unknown date"}
                      </Typography>
                      <Typography variant="body1">
                        <strong>Display Order:</strong> {selectedPhoto.displayOrder || 0}
                      </Typography>

                      {/* URL with Copy Button */}
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <Typography variant="body1" sx={{ mr: 1 }}>
                          <strong>URL:</strong>
                        </Typography>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            flexGrow: 1, 
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {selectedPhoto.imageUrl}
                        </Typography>
                        <Tooltip title="Copy URL">
                          <IconButton onClick={copyImageUrl} size="small" color="primary">
                            <ContentCopyIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>

                    <Typography variant="h6">Tags</Typography>
                    <Divider sx={{ my: 1 }} />
                    <Box display="flex" flexWrap="wrap" gap={1} mb={3}>
                      {selectedPhoto.tags && selectedPhoto.tags.length > 0 ? (
                        selectedPhoto.tags.map((tag, tagIndex) => (
                          <Chip
                            key={tagIndex}
                            label={getTagName(tag)}
                            size="small"
                          />
                        ))
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No tags
                        </Typography>
                      )}
                    </Box>

                    {sortOrder === "displayOrder" && (
                      <Box display="flex" gap={1} mb={3}>
                        <Button
                          variant="outlined"
                          startIcon={<ArrowUpwardIcon />}
                          onClick={handleMoveUp}
                          disabled={findPhotoIndex() === 0}
                          size="small"
                        >
                          Move Up
                        </Button>
                        <Button
                          variant="outlined"
                          startIcon={<ArrowDownwardIcon />}
                          onClick={handleMoveDown}
                          disabled={findPhotoIndex() === photos.length - 1}
                          size="small"
                        >
                          Move Down
                        </Button>
                      </Box>
                    )}

                    <Box display="flex" gap={2} flexWrap={isMobile ? "wrap" : "nowrap"}>
                      <Button
                        variant="contained"
                        startIcon={<EditIcon />}
                        onClick={openEditDialog}
                        color="primary"
                        fullWidth={isMobile}
                      >
                        Edit Tags
                      </Button>
                      <Button
                        variant="contained"
                        startIcon={<DeleteIcon />}
                        onClick={openConfirmDeleteDialog}
                        color="error"
                        fullWidth={isMobile}
                      >
                        Delete
                      </Button>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDetailsDialogOpen(false)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Edit Tags Dialog */}
      <Dialog 
        open={editDialogOpen} 
        onClose={() => setEditDialogOpen(false)}
        fullWidth
        maxWidth="sm"
        fullScreen={isMobile}
      >
        <DialogTitle>Edit Tags</DialogTitle>
        <DialogContent>
          <Box mt={2}>
            <Typography variant="subtitle2">Current Tags:</Typography>
            <Box display="flex" flexWrap="wrap" gap={1} mb={2} mt={1}>
              {editingTags.map((tag, index) => (
                <Chip
                  key={index}
                  label={getTagName(tag)}
                  onDelete={() => removeTagFromEdit(index)}
                  size="small"
                />
              ))}
              {editingTags.length === 0 && (
                <Typography variant="body2" color="text.secondary">
                  No tags
                </Typography>
              )}
            </Box>

            <Box mt={2}>
              <TagSelector
                selectedTags={editingTags}
                onTagsChange={setEditingTags}
                label="Edit Tags"
                placeholder="Add or remove tags"
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={saveUpdatedTags} variant="contained" color="primary">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Delete Dialog */}
      <Dialog
        open={confirmDeleteDialogOpen}
        onClose={() => setConfirmDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to delete this photo?
          </Typography>
          {selectedPhoto && (
            <Typography variant="body2" color="text.secondary" mt={1}>
              Filename: {selectedPhoto.filename}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            color="error"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity="success" variant="filled">
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ImageLibrary;