import React, { useState } from "react";
import {
  List,
  Paper,
  Grid,
  Typography,
  Box,
  IconButton,
  Chip,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
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

interface ImageListProps {
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

const ImageList: React.FC<ImageListProps> = ({
  photos,
  getTagName,
  formatFileSize,
  onDeletePhoto,
  onUpdateTags,
  onMoveUp,
  onMoveDown,
  sortOrder,
}) => {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingPhotoId, setEditingPhotoId] = useState("");
  const [editingTags, setEditingTags] = useState<string[]>([]);
  const [confirmDeleteDialogOpen, setConfirmDeleteDialogOpen] = useState(false);
  const [photoToDelete, setPhotoToDelete] = useState<Photo | null>(null);

  // Open edit dialog for a photo
  const openEditDialog = (photo: Photo) => {
    setEditingPhotoId(photo.id);
    setEditingTags([...photo.tags]);
    setEditDialogOpen(true);
  };

  // Open confirm delete dialog
  const openConfirmDeleteDialog = (photo: Photo) => {
    setPhotoToDelete(photo);
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
    await onUpdateTags(editingPhotoId, editingTags);
    setEditDialogOpen(false);
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (photoToDelete) {
      await onDeletePhoto(
        photoToDelete.id,
        photoToDelete.storagePath,
        photoToDelete.thumbnailPath
      );
      setConfirmDeleteDialogOpen(false);
      setPhotoToDelete(null);
    }
  };

  return (
    <>
      <List>
        {photos.length === 0 ? (
          <Typography variant="body1" color="text.secondary" align="center">
            No images uploaded yet
          </Typography>
        ) : (
          photos.map((photo, index) => (
            <Paper key={photo.id} elevation={2} sx={{ p: 2, mb: 2 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={3}>
                  <img
                    src={photo.thumbnailUrl || photo.imageUrl}
                    alt={photo.filename || "Photo"}
                    style={{
                      maxWidth: "100%",
                      maxHeight: 150,
                      objectFit: "contain",
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1">
                    {photo.filename || "Unknown filename"}
                  </Typography>
                  <Typography variant="body2">
                    Size: {photo.size ? formatFileSize(photo.size) : "Unknown"}
                  </Typography>
                  <Typography variant="body2">
                    Uploaded:{" "}
                    {photo.uploadDate
                      ? new Date(photo.uploadDate).toLocaleString()
                      : "Unknown date"}
                  </Typography>
                  <Typography variant="body2">
                    Display Order: {photo.displayOrder || 0}
                  </Typography>

                  <Box mt={1}>
                    <Typography variant="subtitle2">Tags:</Typography>
                    <Box display="flex" flexWrap="wrap" gap={1}>
                      {photo.tags && photo.tags.length > 0 ? (
                        photo.tags.map((tag, tagIndex) => (
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
                  </Box>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Box
                    display="flex"
                    flexDirection="column"
                    gap={1}
                    alignItems="flex-end"
                  >
                    {sortOrder === "displayOrder" && (
                      <>
                        <IconButton
                          onClick={() => onMoveUp(index)}
                          disabled={index === 0}
                          color="primary"
                          size="small"
                          title="Move up"
                        >
                          <ArrowUpwardIcon />
                        </IconButton>
                        <IconButton
                          onClick={() => onMoveDown(index)}
                          disabled={index === photos.length - 1}
                          color="primary"
                          size="small"
                          title="Move down"
                        >
                          <ArrowDownwardIcon />
                        </IconButton>
                        <Divider sx={{ width: "100%", my: 1 }} />
                      </>
                    )}
                    <IconButton
                      onClick={() => openEditDialog(photo)}
                      color="primary"
                      title="Edit tags"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => openConfirmDeleteDialog(photo)}
                      color="error"
                      title="Delete photo"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          ))
        )}
      </List>

      {/* Edit Tags Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
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
          {photoToDelete && (
            <Typography variant="body2" color="text.secondary" mt={1}>
              Filename: {photoToDelete.filename}
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
    </>
  );
};

export default ImageList;
