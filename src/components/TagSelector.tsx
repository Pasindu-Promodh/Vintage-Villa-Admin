import { useState } from "react";
import {
  Autocomplete,
  TextField,
  Chip,
  Box,
  Typography,
  IconButton,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import useTags from "./useTags";

// Define the Tag type
interface Tag {
  id: string;
  name: string;
  count: number;
  createdAt: number;
}

interface TagSelectorProps {
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  label?: string;
  placeholder?: string;
  helperText?: string;
  fullWidth?: boolean;
  disabled?: boolean;
}

function TagSelector({
  selectedTags = [],
  onTagsChange,
  label = "Tags",
  placeholder = "Select or type tags",
  helperText,
  fullWidth = true,
  disabled = false,
}: TagSelectorProps) {
  const { tags, loading } = useTags();
  const [inputValue, setInputValue] = useState("");

  // Convert tag IDs to tag objects for display
  const selectedTagObjects = selectedTags
    .map((tagId) => tags.find((tag) => tag.id === tagId))
    .filter((tag): tag is Tag => tag !== undefined);

  // Handle adding a custom tag (entered by user)
  const handleAddCustomTag = () => {
    if (!inputValue.trim()) return;

    // Check if this tag already exists in the database
    const existingTag = tags.find(
      (tag) => tag.name.toLowerCase() === inputValue.trim().toLowerCase()
    );

    if (existingTag) {
      // If tag exists but isn't selected, add it
      if (!selectedTags.includes(existingTag.id)) {
        onTagsChange([...selectedTags, existingTag.id]);
      }
    } else {
      // For custom tags not in the database, we'll use the name prefixed with "custom:"
      // This will let the parent component know it needs to create this tag
      const customTagId = `custom:${inputValue.trim()}`;
      if (!selectedTags.includes(customTagId)) {
        onTagsChange([...selectedTags, customTagId]);
      }
    }

    setInputValue("");
  };

  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="subtitle2" gutterBottom>
        {label}
      </Typography>

      <Box display="flex" alignItems="flex-start" gap={1}>
        <Autocomplete<Tag, true>
          multiple
          id="tag-selector"
          options={tags}
          loading={loading}
          disabled={disabled}
          fullWidth={fullWidth}
          getOptionLabel={(option) => option.name}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          value={selectedTagObjects}
          inputValue={inputValue}
          onInputChange={(_event, newInputValue) => {
            setInputValue(newInputValue);
          }}
          onChange={(_event, newValue) => {
            // Convert tag objects back to IDs
            const newTagIds = newValue.map((tag) => tag.id);
            onTagsChange(newTagIds);
          }}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => (
              <Chip
                label={option.name}
                size="small"
                {...getTagProps({ index })}
              />
            ))
          }
          renderInput={(params) => (
            <TextField
              {...params}
              variant="outlined"
              placeholder={selectedTagObjects.length === 0 ? placeholder : ""}
              helperText={helperText}
              size="small"
              onKeyDown={(e) => {
                if (e.key === "Enter" && inputValue) {
                  e.preventDefault();
                  handleAddCustomTag();
                }
              }}
            />
          )}
        />

        <IconButton
          color="primary"
          onClick={handleAddCustomTag}
          disabled={!inputValue.trim() || disabled}
          sx={{ mt: 0.5 }}
        >
          <AddIcon />
        </IconButton>
      </Box>

      {/* Suggested tags */}
      {tags.length > 0 && (
        <Box mt={2}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Suggested tags:
          </Typography>
          <Box display="flex" flexWrap="wrap" gap={1}>
            {tags
              .sort((a, b) => b.count - a.count)
              .slice(0, 10)
              .map((tag) => (
                <Chip
                  key={tag.id}
                  label={tag.name}
                  size="small"
                  variant={
                    selectedTags.includes(tag.id) ? "filled" : "outlined"
                  }
                  onClick={() => {
                    if (selectedTags.includes(tag.id)) {
                      onTagsChange(selectedTags.filter((id) => id !== tag.id));
                    } else {
                      onTagsChange([...selectedTags, tag.id]);
                    }
                  }}
                  sx={{
                    bgcolor: selectedTags.includes(tag.id)
                      ? "primary.main"
                      : "transparent",
                    color: selectedTags.includes(tag.id)
                      ? "primary.contrastText"
                      : "primary.main",
                  }}
                />
              ))}
          </Box>
        </Box>
      )}
    </Box>
  );
}

export default TagSelector;