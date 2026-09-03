import { useState, useEffect } from "react";
import { db, storage } from "../../config/firebaseConfig";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import {
  Container,
  Typography,
  Box,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Button,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import TagIcon from "@mui/icons-material/Tag";
import ImageUploader from "./components/ImageUploader";
import ImageList from "./components/ImageList";
import StatsDisplay from "./components/StatsDisplay";
import useTags from "../../components/useTags";
import { useSnackbar } from 'notistack';
import DashboardHeader from "../../components/DashboardHeader";

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

interface DBStats {
  totalImages: number;
  totalSize: number;
}

const GalleryManagement = () => {
  // Add theme and media query hooks for responsive design
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // State variables
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [sortOrder, setSortOrder] = useState<string>("displayOrder");
  const [dbStats, setDbStats] = useState<DBStats>({
    totalImages: 0,
    totalSize: 0,
  });
  const [tagMap, setTagMap] = useState<{ [key: string]: string }>({});
  const { updateTagUsageCounts } = useTags();
  const { enqueueSnackbar } = useSnackbar();

  // Toast function using Snackbar
  const showToast = (message: string, variant: 'success' | 'error' | 'warning' | 'info' = 'success') => {
    enqueueSnackbar(message, { variant });
  };

  const fetchTagMap = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "tags"));
      const tagMapping: { [key: string]: string } = {};

      querySnapshot.docs.forEach((doc) => {
        const data = doc.data();
        tagMapping[doc.id] = data.name || "Unknown Tag";
      });

      setTagMap(tagMapping);
      return tagMapping;
    } catch (error) {
      console.error("Error fetching tags:", error);
      showToast("Failed to load tags", "error");
      return {};
    }
  };

  // Keep original fetchPhotos function
  const fetchPhotos = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "photos"));
      const photoList = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          // Ensure tags is always an array (for backwards compatibility)
          tags: Array.isArray(data.tags) ? data.tags : [],
          // Ensure displayOrder exists
          displayOrder: data.displayOrder || 0,
        };
      }) as Photo[];

      // Calculate database stats
      const totalSize = photoList.reduce(
        (sum, photo) => sum + (photo.size || 0),
        0
      );
      setDbStats({
        totalImages: photoList.length,
        totalSize: totalSize,
      });

      // Sort photos based on current sort criteria
      sortPhotos(photoList, sortOrder);
      setPhotos(photoList);
    } catch (error) {
      console.error("Error fetching photos:", error);
      showToast("Failed to load photos", "error");
    }
  };

  // Modify sortPhotos to accept photos array as parameter
  const sortPhotos = (photoArray: Photo[], order: string) => {
    const sortedPhotos = [...photoArray];

    switch (order) {
      case "displayOrder":
        sortedPhotos.sort(
          (a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)
        );
        break;
      case "newest":
        sortedPhotos.sort((a, b) => (b.uploadDate || 0) - (a.uploadDate || 0));
        break;
      case "oldest":
        sortedPhotos.sort((a, b) => (a.uploadDate || 0) - (b.uploadDate || 0));
        break;
      case "name":
        sortedPhotos.sort((a, b) =>
          (a.filename || "").localeCompare(b.filename || "")
        );
        break;
      case "size":
        sortedPhotos.sort((a, b) => (b.size || 0) - (a.size || 0));
        break;
      default:
        break;
    }

    return sortedPhotos;
  };

  useEffect(() => {
    fetchTagMap().then(() => {
      fetchPhotos();
    });
    // eslint-disable-next-line
  }, []);

  // Handle sort order change
  const handleSortChange = (event: SelectChangeEvent) => {
    const newSortOrder = event.target.value;
    setSortOrder(newSortOrder);
    const sortedPhotos = sortPhotos(photos, newSortOrder);
    setPhotos(sortedPhotos);
  };

  // Get tag name from tag ID
  const getTagName = (tagId: string) => {
    return tagMap[tagId] || tagId;
  };

  // Move a photo up in display order
  const movePhotoUp = async (index: number) => {
    if (index === 0) return;

    const newPhotos = [...photos];
    const currentPhoto = newPhotos[index];
    const prevPhoto = newPhotos[index - 1];

    try {
      // Swap display orders in Firestore
      await updateDoc(doc(db, "photos", currentPhoto.id), {
        displayOrder: prevPhoto.displayOrder,
      });

      await updateDoc(doc(db, "photos", prevPhoto.id), {
        displayOrder: currentPhoto.displayOrder,
      });

      // Swap in local array
      const temp = currentPhoto.displayOrder;
      currentPhoto.displayOrder = prevPhoto.displayOrder;
      prevPhoto.displayOrder = temp;

      // Swap positions in array
      [newPhotos[index], newPhotos[index - 1]] = [
        newPhotos[index - 1],
        newPhotos[index],
      ];
      setPhotos(newPhotos);
      
      showToast("Image order updated successfully");
    } catch (error) {
      console.error("Error updating order:", error);
      showToast("Failed to update order", "error");
    }
  };

  // Move a photo down in display order
  const movePhotoDown = async (index: number) => {
    if (index === photos.length - 1) return;

    const newPhotos = [...photos];
    const currentPhoto = newPhotos[index];
    const nextPhoto = newPhotos[index + 1];

    try {
      // Swap display orders in Firestore
      await updateDoc(doc(db, "photos", currentPhoto.id), {
        displayOrder: nextPhoto.displayOrder,
      });

      await updateDoc(doc(db, "photos", nextPhoto.id), {
        displayOrder: currentPhoto.displayOrder,
      });

      // Swap in local array
      const temp = currentPhoto.displayOrder;
      currentPhoto.displayOrder = nextPhoto.displayOrder;
      nextPhoto.displayOrder = temp;

      // Swap positions in array
      [newPhotos[index], newPhotos[index + 1]] = [
        newPhotos[index + 1],
        newPhotos[index],
      ];
      setPhotos(newPhotos);
      
      showToast("Image order updated successfully");
    } catch (error) {
      console.error("Error updating order:", error);
      showToast("Failed to update order", "error");
    }
  };

  // Delete photo and its thumbnail
  const deletePhoto = async (
    id: string,
    storagePath?: string,
    thumbnailPath?: string
  ) => {
    try {
      // Get the photo to track tags
      const photoRef = doc(db, "photos", id);
      const photoDoc = await getDoc(photoRef);
      const photoData = photoDoc.data();
      const oldTags = photoData?.tags || [];

      // Delete from Firestore
      await deleteDoc(photoRef);

      // Delete main image from Storage
      if (storagePath) {
        await deleteObject(ref(storage, storagePath));
      }

      // Delete thumbnail if it exists
      if (thumbnailPath) {
        await deleteObject(ref(storage, thumbnailPath));
      }

      // Update tag usage counts (all tags removed)
      await updateTagUsageCounts([], oldTags);

      showToast("Photo deleted successfully");
      fetchPhotos();
    } catch (error) {
      console.error("Error deleting image:", error);
      showToast("Failed to delete photo", "error");
    }
  };

  // Format file size helper
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    else if (bytes < 1048576) return (bytes / 1024).toFixed(2) + " KB";
    else return (bytes / 1048576).toFixed(2) + " MB";
  };

  // Update photo tags
  const updatePhotoTags = async (photoId: string, newTags: string[]) => {
    try {
      // Get the current photo to compare tags
      const photoRef = doc(db, "photos", photoId);
      const photoDoc = await getDoc(photoRef);
      const currentData = photoDoc.data();
      const oldTags = currentData?.tags || [];

      // Find added and removed tags
      const addedTags = newTags.filter((tag) => !oldTags.includes(tag));
      const removedTags = oldTags.filter(
        (tag: string) => !newTags.includes(tag)
      );

      // Update the photo's tags
      await updateDoc(photoRef, {
        tags: newTags,
      });

      // Update tag usage counts
      await updateTagUsageCounts(addedTags, removedTags);

      showToast("Tags updated successfully");
      fetchPhotos();
    } catch (error) {
      console.error("Error updating tags:", error);
      showToast("Failed to update tags", "error");
    }
  };

  return (
    <Container 
      maxWidth={false} 
      disableGutters
      sx={{ 
        width: '100%'
      }}
    >
      <DashboardHeader
        title="Gallery Management"
        actions={
          <Button
            variant="contained"
            color="primary"
            size="small"
            startIcon={<TagIcon />}
            onClick={() => (window.location.href = "/tag-management")}
          >
            {isMobile ? "Tags" : "Manage Tags"}
          </Button>
        }
      />

      <Box sx={{ px: isMobile ? 1.5 : 2 }}>

      {/* Database Stats */}
      <StatsDisplay stats={dbStats} formatFileSize={formatFileSize} />

      {/* Image Upload Section */}
      <ImageUploader
        onUploadComplete={() => {
          // Add a small delay before refreshing
          setTimeout(() => {
            fetchTagMap().then(() => {
              fetchPhotos();
            });
          }, 500); // Small delay to ensure Firebase has completed all operations
        }}
        getTagName={getTagName}
        tagMap={tagMap}
        formatFileSize={formatFileSize}
      />

      {/* Uploaded Photos */}
      <Paper 
        elevation={3} 
        sx={{ 
          p: isMobile ? 1 : 2,
          mb: 2
        }}
      >
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
          flexDirection={isMobile ? "column" : "row"}
          gap={isMobile ? 1 : 0}
        >
          <Typography 
            variant="h5" 
            sx={{ fontSize: isMobile ? '1.25rem' : '1.5rem' }}
          >
            Uploaded Images ({photos.length})
          </Typography>

          {/* Sort Order Selector */}
          <FormControl 
            variant="outlined" 
            size="small" 
            sx={{ 
              minWidth: 150,
              width: isMobile ? '100%' : 'auto'
            }}
          >
            <InputLabel id="sort-order-label">Sort By</InputLabel>
            <Select
              labelId="sort-order-label"
              value={sortOrder}
              onChange={handleSortChange}
              label="Sort By"
            >
              <MenuItem value="displayOrder">Custom Order</MenuItem>
              <MenuItem value="newest">Newest First</MenuItem>
              <MenuItem value="oldest">Oldest First</MenuItem>
              <MenuItem value="name">Filename</MenuItem>
              <MenuItem value="size">Size (Largest First)</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {sortOrder === "displayOrder" && (
          <Typography variant="body2" color="text.secondary" mb={2}>
            In custom order mode, you can change the order using the up/down
            arrows.
          </Typography>
        )}

        <ImageList
          photos={photos}
          getTagName={getTagName}
          formatFileSize={formatFileSize}
          onDeletePhoto={deletePhoto}
          onUpdateTags={updatePhotoTags}
          onMoveUp={movePhotoUp}
          onMoveDown={movePhotoDown}
          sortOrder={sortOrder}
          tagMap={tagMap}
        />
      </Paper>
      </Box>
    </Container>
  );
};

export default GalleryManagement;