import React, { useState } from "react";
import { db, storage } from "../../../config/firebaseConfig";
import { collection, addDoc, getDocs} from "firebase/firestore";
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  uploadBytes,
} from "firebase/storage";
import {
  Button,
  Typography,
  List,
  Box,
  LinearProgress,
  Chip,
  Paper,
  Grid,
  IconButton,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import TagSelector from '../../../components/TagSelector';
import useTags from "../../../components/useTags";
import { useSnackbar } from 'notistack';

interface ImageWithTags {
  file: File;
  tags: string[];
}

interface ImageUploaderProps {
  onUploadComplete: () => void;
  getTagName: (tagId: string) => string;
  tagMap: { [key: string]: string };
  formatFileSize: (bytes: number) => string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  onUploadComplete,
  getTagName,
  formatFileSize,
}) => {
  const [images, setImages] = useState<ImageWithTags[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedSize, setUploadedSize] = useState(0);
  const [totalSize, setTotalSize] = useState(0);
  const [converting, setConverting] = useState(false);
  const [conversionProgress, setConversionProgress] = useState(0);
  const [convertedCount, setConvertedCount] = useState(0);
  const [totalToConvert, setTotalToConvert] = useState(0);

  const { updateTagUsageCounts } = useTags();
  const { enqueueSnackbar } = useSnackbar();
  
  // Add responsive design hooks
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Handle Image Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const filePreviews = files.map((file) => URL.createObjectURL(file));

      setImages(files.map((file) => ({ file, tags: [] })));
      setImagePreviews(filePreviews);
      setTotalSize(files.reduce((sum, file) => sum + file.size, 0));
    }
  };

  // Remove tag from an image
  const removeTagFromImage = (imageIndex: number, tagIndex: number) => {
    const newImages = [...images];
    newImages[imageIndex].tags.splice(tagIndex, 1);
    setImages(newImages);
  };

  // Helper function to get original file extension
  const getOriginalExtension = (file: { name: any }) => {
    const filename = file.name;
    const lastDot = filename.lastIndexOf(".");
    return lastDot !== -1 ? filename.substring(lastDot) : "";
  };

  // Function to create a thumbnail version of an image
  const createThumbnail = (
    file: File,
    maxWidth = 200,
    maxHeight = 200
  ): Promise<File> => {
    return new Promise((resolve, reject) => {
      // Create a canvas element to draw the image
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      // Create an image object to load the file
      const img = new Image();

      // Set up image loading
      img.onload = () => {
        // Calculate thumbnail dimensions while maintaining aspect ratio
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        // Set canvas dimensions to match the thumbnail size
        canvas.width = width;
        canvas.height = height;

        // Draw the image on the canvas (resized)
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
        } else {
          reject(new Error("Failed to get canvas context"));
        }

        // Convert to WebP format with lower quality for thumbnails
        canvas.toBlob(
          (blob) => {
            if (blob) {
              // Create a new file with thumbnail prefix
              const fileName =
                "thumb_" + file.name.replace(/\.[^/.]+$/, "") + ".webp";
              const thumbnailFile = new File([blob], fileName, {
                type: "image/webp",
              });
              resolve(thumbnailFile);
            } else {
              reject(new Error("Thumbnail creation failed"));
            }
          },
          "image/webp",
          0.7 // Lower quality for thumbnails
        );
      };

      img.onerror = () => {
        reject(new Error("Failed to load image for thumbnail creation"));
      };

      // Load the image from the file
      img.src = URL.createObjectURL(file);
    });
  };

  // Enhanced conversion function with progress tracking
  const convertToWebP = (file: File) => {
    return new Promise((resolve, reject) => {
      // Create a canvas element to draw the image
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      // Create an image object to load the file
      const img = new Image();

      // Set up image loading
      img.onload = () => {
        // Set canvas dimensions to match the image
        canvas.width = img.width;
        canvas.height = img.height;

        // Draw the image on the canvas
        if (ctx) {
          ctx.drawImage(img, 0, 0);
        } else {
          reject(new Error("Failed to get canvas context"));
        }

        // Convert to WebP format
        canvas.toBlob((blob) => {
          if (blob) {
            // Create a new file with WebP extension
            const fileName = file.name.replace(/\.[^/.]+$/, "") + ".webp";
            const webpFile = new File([blob], fileName, {
              type: "image/webp",
            });
            resolve(webpFile);
          } else {
            reject(new Error("WebP conversion failed"));
          }
        }, "image/webp"); // 0.85 is the quality (adjust as needed)
      };

      img.onerror = () => {
        reject(new Error("Failed to load image"));
      };

      // Load the image from the file
      img.src = URL.createObjectURL(file);
    });
  };

  // Batch convert images with thumbnails
  const batchConvertImagesWithThumbnails = async (
    imagesToConvert: ImageWithTags[]
  ) => {
    setConverting(true);
    setConversionProgress(0);
    setConvertedCount(0);
    setTotalToConvert(imagesToConvert.length);

    const convertedImages = [];

    for (let i = 0; i < imagesToConvert.length; i++) {
      const image = imagesToConvert[i];
      try {
        // Convert to WebP
        const webpFile = await convertToWebP(image.file);

        // Create thumbnail
        const thumbnailFile = await createThumbnail(image.file);

        convertedImages.push({
          file: webpFile,
          thumbnailFile,
          originalFile: image.file,
          tags: image.tags,
          originalSize: image.file.size,
          newSize: (webpFile as File).size,
          thumbnailSize: (thumbnailFile as File).size,
        });
      } catch (error) {
        console.error("Conversion failed for ", image.file.name, error);
        // If conversion fails, use original file
        convertedImages.push({
          file: image.file,
          thumbnailFile: null, // No thumbnail in case of error
          originalFile: image.file,
          tags: image.tags,
          originalSize: image.file.size,
          newSize: image.file.size,
          thumbnailSize: 0,
        });
      }

      // Update conversion progress
      setConvertedCount(i + 1);
      setConversionProgress(
        Math.round(((i + 1) / imagesToConvert.length) * 100)
      );
    }

    setConverting(false);
    return convertedImages;
  };

  // Upload photos to Firebase
  const uploadPhotos = async () => {
    if (images.length === 0) {
      enqueueSnackbar("No images selected for upload", { variant: "warning" });
      return;
    }

    try {
      // Process any custom tags first
      for (const image of images) {
        for (let i = 0; i < image.tags.length; i++) {
          const tagId = image.tags[i];

          // Check if this is a custom tag that needs to be created
          if (tagId.startsWith("custom:")) {
            const tagName = tagId.replace("custom:", "");

            // Create the tag in Firestore
            const tagDoc = await addDoc(collection(db, "tags"), {
              name: tagName,
              count: 0,
              createdAt: Date.now(),
            });

            // Replace the custom ID with the real Firestore ID
            image.tags[i] = tagDoc.id;
          }
        }
      }

      // Show toast that conversion is starting
      enqueueSnackbar("Converting images to WebP format with thumbnails...", { variant: "info" });
      

      // Convert all images to WebP with progress tracking and create thumbnails
      const convertedImages = await batchConvertImagesWithThumbnails(images);

      // Calculate storage savings
      const originalTotalSize = convertedImages.reduce(
        (sum, img) => sum + img.originalSize,
        0
      );
      const newTotalSize = convertedImages.reduce(
        (sum, img) => sum + img.newSize + (img.thumbnailSize || 0),
        0
      );
      const savedBytes = originalTotalSize - newTotalSize;
      const savingsPercentage = Math.round(
        (savedBytes / originalTotalSize) * 100
      );

      // Show savings message if there are any
      if (savedBytes > 0) {
        const savingsMessage = `WebP conversion saved ${formatFileSize(
          savedBytes
        )} (${savingsPercentage}% reduction)`;
        enqueueSnackbar(savingsMessage, { variant: "success" });
      }

      // Now proceed with uploads
      setUploading(true);
      setUploadProgress(0);
      setUploadedSize(0);
      let uploadedBytes = 0;
      const currentDate = Date.now();

      // Show toast that upload is starting
      enqueueSnackbar(`Starting upload of ${convertedImages.length} image(s) with thumbnails...`, { variant: "info" });

      // Get the next display order
      let maxDisplayOrder = 0;
      const photosSnapshot = await getDocs(collection(db, "photos"));
      const photos = photosSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        displayOrder: doc.data().displayOrder || 0,
      }));

      if (photos.length > 0) {
        maxDisplayOrder = Math.max(...photos.map((p) => p.displayOrder || 0));
      }

      const uploadPromises = convertedImages.map(
        (convertedImage, index) => {
          const file = convertedImage.file as File;
          const thumbnailFile = convertedImage.thumbnailFile;
          const tags = convertedImage.tags;
          
          return new Promise<void>(async (resolve, reject) => {
            try {
              // First upload the main image
              const storageRef = ref(storage, `photos/${file.name}`);
              const uploadTask = uploadBytesResumable(storageRef, file as Blob);
              let thumbnailUrl: string | null = null;

              uploadTask.on(
                "state_changed",
                (snapshot) => {
                  const delta =
                    snapshot.bytesTransferred -
                      (uploadTask as any)._prevBytesTransferred || 0;
                  (uploadTask as any)._prevBytesTransferred =
                    snapshot.bytesTransferred;

                  uploadedBytes += delta;
                  setUploadedSize(uploadedBytes);
                  setUploadProgress(
                    Math.round((uploadedBytes / newTotalSize) * 100)
                  );
                },
                (error) => {
                  console.error("Upload error:", error);
                  enqueueSnackbar(`Error uploading ${file.name}`, { variant: "error" });
                  reject(error);
                },
                async () => {
                  try {
                    const imageUrl = await getDownloadURL(
                      uploadTask.snapshot.ref
                    );

                    // Upload thumbnail if it exists
                    if (thumbnailFile) {
                      const thumbStorageRef = ref(
                        storage,
                        `thumbnails/${thumbnailFile.name}`
                      );
                      await uploadBytes(thumbStorageRef, thumbnailFile);
                      thumbnailUrl = await getDownloadURL(thumbStorageRef);
                    }

                    // Add document to Firestore with both URLs
                    await addDoc(collection(db, "photos"), {
                      imageUrl,
                      thumbnailUrl,
                      tags,
                      storagePath: `photos/${file.name}`,
                      thumbnailPath: thumbnailFile
                        ? `thumbnails/${thumbnailFile.name}`
                        : null,
                      size: file.size,
                      thumbnailSize: thumbnailFile ? thumbnailFile.size : 0,
                      filename: file.name,
                      originalFilename:
                        file.name.replace(".webp", "") +
                        getOriginalExtension(
                          convertedImages[index].originalFile
                        ),
                      uploadDate: currentDate,
                      displayOrder: maxDisplayOrder + index + 1,
                    });

                    // Increment usage count for each tag
                    for (const tagId of tags) {
                      updateTagUsageCounts([tagId], []);
                    }

                    resolve();
                  } catch (error) {
                    console.error("Firestore upload error:", error);
                    enqueueSnackbar(`Error saving metadata for ${file.name}`, { variant: "error" });
                    reject(error);
                  }
                }
              );
            } catch (error) {
              reject(error);
            }
          });
        }
      );

      await Promise.all(uploadPromises);

      // Show upload complete toast
      enqueueSnackbar(`Upload complete! ${convertedImages.length} image${
          convertedImages.length !== 1 ? "s" : ""
        } with thumbnails uploaded successfully.`, { variant: "success" });
    } catch (error) {
      console.error("Upload failed:", error);
      enqueueSnackbar("Some uploads failed. Please try again.", { variant: "error" });
    } finally {
      setUploading(false);
      setUploadProgress(100);
      setImages([]);
      setImagePreviews([]);
      onUploadComplete();
    }
  };

  return (
    <Paper 
      elevation={3} 
      sx={{ 
        p: isMobile ? 1 : 2,  // Reduced padding on mobile
        mb: 3,
        width: '100%',
        boxSizing: 'border-box'
      }}
    >
      <Typography variant="h5" mb={isMobile ? 1 : 2}>
        Upload Images
      </Typography>
      <Box sx={{ 
        width: '100%',
        overflow: 'hidden',
        '& input': {
          width: '100%',
          boxSizing: 'border-box'
        }
      }}>
        <input
          type="file"
          multiple
          onChange={handleFileChange}
          style={{ marginBottom: isMobile ? 8 : 16 }}
        />
      </Box>

      {/* Selected Images Preview */}
      {images.length > 0 && (
        <Box mt={isMobile ? 1 : 2}>
          <Typography variant="h6" mb={1}>
            Selected Images ({images.length})
          </Typography>
          <List sx={{ p: 0 }}>
            {images.map(({ file, tags }, index) => (
              <Paper 
                key={index} 
                elevation={2} 
                sx={{ 
                  p: isMobile ? 1 : 2,
                  mb: isMobile ? 1 : 2,
                  width: '100%',
                  boxSizing: 'border-box'
                }}
              >
                <Grid container spacing={isMobile ? 1 : 2} alignItems="center">
                  <Grid item xs={12} sm={3}>
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: isMobile ? 'center' : 'flex-start'
                    }}>
                      <img
                        src={imagePreviews[index]}
                        alt=""
                        style={{ 
                          maxWidth: "100%", 
                          maxHeight: 150,
                          objectFit: 'contain'
                        }}
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={9}>
                    <Typography 
                      variant="subtitle1"
                      sx={{
                        wordBreak: 'break-word',
                        overflowWrap: 'break-word'
                      }}
                    >
                      {file.name} ({formatFileSize(file.size)})
                    </Typography>

                    {/* Tags section */}
                    <Box mt={isMobile ? 0.5 : 1}>
                      <Typography variant="subtitle2">Tags:</Typography>
                      <Box display="flex" flexWrap="wrap" gap={0.5} mb={0.5}>
                        {tags.map((tag, tagIndex) => (
                          <Chip
                            key={tagIndex}
                            label={
                              tag.startsWith("custom:")
                                ? tag.replace("custom:", "")
                                : getTagName(tag)
                            }
                            onDelete={() => removeTagFromImage(index, tagIndex)}
                            size="small"
                          />
                        ))}
                      </Box>

                      {/* Add new tag */}
                      <Box mt={0.5}>
                        <TagSelector
                          selectedTags={images[index].tags}
                          onTagsChange={(newTags: string[]) => {
                            const newImages = [...images];
                            newImages[index].tags = newTags;
                            setImages(newImages);
                          }}
                          label="Tags"
                          placeholder="Add tags to this image"
                        />
                      </Box>
                    </Box>

                    {/* Remove image button */}
                    <Box mt={0.5} display="flex" justifyContent="flex-end">
                      <IconButton
                        onClick={() => {
                          const newImages = [...images];
                          const newPreviews = [...imagePreviews];

                          newImages.splice(index, 1);
                          newPreviews.splice(index, 1);

                          setImages(newImages);
                          setImagePreviews(newPreviews);
                        }}
                        color="error"
                        size={isMobile ? "small" : "medium"}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            ))}
          </List>
        </Box>
      )}

      <Button
        onClick={uploadPhotos}
        variant="contained"
        fullWidth={isMobile}
        disabled={uploading || images.length === 0}
        sx={{ mt: isMobile ? 1 : 2 }}
      >
        {uploading ? "Uploading..." : "Upload Photos"}
      </Button>

      {/* Conversion Progress */}
      {converting && (
        <Box mt={isMobile ? 1 : 2}>
          <Typography variant="body1" mb={0.5}>
            Converting images to WebP format...
          </Typography>
          <LinearProgress variant="determinate" value={conversionProgress} />
          <Typography variant="body2" mt={0.5}>
            {`Converting: ${convertedCount} / ${totalToConvert} (${conversionProgress}%)`}
          </Typography>
        </Box>
      )}

      {/* Upload Progress */}
      {uploading && (
        <Box mt={isMobile ? 1 : 2}>
          <LinearProgress variant="determinate" value={uploadProgress} />
          <Typography variant="body2" mt={0.5}>
            {`Uploading: ${formatFileSize(uploadedSize)} / ${formatFileSize(
              totalSize
            )} (${uploadProgress}%)`}
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default ImageUploader;