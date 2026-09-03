import { useState, useEffect } from "react";
import { db } from "../config/firebaseConfig";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import {
  Button,
  TextField,
  Container,
  Typography,
  IconButton,
  Box,
  Chip,
  Paper,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  Alert,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import DashboardHeader from "../components/DashboardHeader";

interface Tag {
  id: string;
  name: string;
  count: number;
  createdAt: number;
}

function TagManagement() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [tags, setTags] = useState<Tag[]>([]);
  const [newTagName, setNewTagName] = useState("");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [editTagName, setEditTagName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    fetchTags();
  }, []);

  // Fetch all tags from Firestore
  const fetchTags = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "tags"));
      const tagList = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name || "",
          count: data.count || 0,
          createdAt: data.createdAt || Date.now(),
        };
      }) as Tag[];

      // Sort tags alphabetically
      tagList.sort((a, b) => a.name.localeCompare(b.name));
      setTags(tagList);
    } catch (error) {
      console.error("Error fetching tags:", error);
      setErrorMessage("Failed to load tags");
    }
  };

  // Add a new tag
  const addTag = async () => {
    if (!newTagName.trim()) {
      setErrorMessage("Tag name cannot be empty");
      return;
    }

    // Check if tag already exists
    if (
      tags.some(
        (tag) => tag.name.toLowerCase() === newTagName.trim().toLowerCase()
      )
    ) {
      setErrorMessage("This tag already exists");
      return;
    }

    try {
      await addDoc(collection(db, "tags"), {
        name: newTagName.trim(),
        count: 0,
        createdAt: Date.now(),
      });

      setNewTagName("");
      setErrorMessage("");
      fetchTags();
    } catch (error) {
      console.error("Error adding tag:", error);
      setErrorMessage("Failed to add tag");
    }
  };

  // Delete a tag
  const deleteTag = async (id: string) => {
    try {
      await deleteDoc(doc(db, "tags", id));
      fetchTags();
    } catch (error) {
      console.error("Error deleting tag:", error);
      setErrorMessage("Failed to delete tag");
    }
  };

  // Open edit dialog
  const openEditDialog = (tag: Tag) => {
    setEditingTag(tag);
    setEditTagName(tag.name);
    setEditDialogOpen(true);
  };

  // Update tag
  const updateTag = async () => {
    if (!editingTag) return;

    if (!editTagName.trim()) {
      setErrorMessage("Tag name cannot be empty");
      return;
    }

    // Check if new name already exists (excluding current tag)
    if (
      tags.some(
        (tag) =>
          tag.id !== editingTag.id &&
          tag.name.toLowerCase() === editTagName.trim().toLowerCase()
      )
    ) {
      setErrorMessage("This tag name already exists");
      return;
    }

    try {
      await updateDoc(doc(db, "tags", editingTag.id), {
        name: editTagName.trim(),
      });

      setEditDialogOpen(false);
      setErrorMessage("");
      fetchTags();
    } catch (error) {
      console.error("Error updating tag:", error);
      setErrorMessage("Failed to update tag");
    }
  };

  return (
    <Container disableGutters={isMobile}>
      <DashboardHeader title="Tag Management" />

      <Box sx={{ px: isMobile ? 1.5 : 0 }}>
      <Box mb={isMobile ? 2 : 4}>
        <Typography variant="body1" mb={isMobile ? 2 : 3} color="text.secondary">
          Create and manage tags that can be used for your images. These tags
          will be available in dropdown menus when uploading or editing images.
        </Typography>
      </Box>

      {/* Error messages */}
      {errorMessage && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
          onClose={() => setErrorMessage("")}
        >
          {errorMessage}
        </Alert>
      )}

      {/* Add new tag */}
      <Paper elevation={3} sx={{ p: isMobile ? 2 : 3, mb: isMobile ? 2 : 4 }}>
        <Typography variant="h6" mb={2}>
          Add New Tag
        </Typography>
        <Box display="flex" flexDirection={isMobile ? "column" : "row"} gap={2}>
          <TextField
            label="Tag Name"
            fullWidth
            size={isMobile ? "small" : "medium"}
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                addTag();
              }
            }}
          />
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={addTag}
            fullWidth={isMobile}
            size={isMobile ? "medium" : "large"}
          >
            Add
          </Button>
        </Box>
      </Paper>

      {/* Tag list */}
      <Paper elevation={3} sx={{ p: isMobile ? 2 : 3 }}>
        <Typography variant="h6" mb={2}>
          Existing Tags ({tags.length})
        </Typography>

        {tags.length > 0 ? (
          <Grid container spacing={2}>
            {tags.map((tag) => (
              <Grid item xs={12} sm={6} md={4} key={tag.id}>
                <Card variant="outlined">
                  <CardContent>
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Box>
                        <Chip label={tag.name} color="primary" sx={{ mb: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                          Used {tag.count} times
                        </Typography>
                      </Box>
                      <Box>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => openEditDialog(tag)}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => deleteTag(tag.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography variant="body1" color="text.secondary" textAlign="center">
            No tags created yet. Add your first tag above.
          </Typography>
        )}
      </Paper>
      </Box>

      {/* Edit Tag Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        fullScreen={isMobile}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Edit Tag</DialogTitle>
        <DialogContent>
          <TextField
            label="Tag Name"
            fullWidth
            value={editTagName}
            onChange={(e) => setEditTagName(e.target.value)}
            sx={{ mt: 2 }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                updateTag();
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={updateTag} variant="contained" color="primary">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default TagManagement;
