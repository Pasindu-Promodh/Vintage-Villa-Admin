import * as React from "react";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import { GeneralSettings } from "../../../components/Types";

interface GeneralSettingsCardProps {
  generalSettings: GeneralSettings;
  tempGeneralSettings: GeneralSettings;
  isEditing: boolean;
  onSave: () => void;
  onCancel: () => void;
  onEdit: () => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const GeneralSettingsCard: React.FC<GeneralSettingsCardProps> = ({
  generalSettings,
  tempGeneralSettings,
  isEditing,
  onSave,
  onCancel,
  onEdit,
  onChange,
}) => {
  return (
    <Card elevation={3} sx={{ p: 2, mb: 3 }}>
      <CardHeader
        title="Guest Communication"
        subheader="Link shared with guests when a booking is marked completed"
        action={
          isEditing ? (
            <Box>
              <IconButton onClick={onSave} color="primary" title="Save">
                <SaveIcon />
              </IconButton>
              <IconButton onClick={onCancel} color="error" title="Cancel">
                <CancelIcon />
              </IconButton>
            </Box>
          ) : (
            <IconButton onClick={onEdit} color="primary" title="Edit">
              <EditIcon />
            </IconButton>
          )
        }
      />
      <CardContent>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            {isEditing ? (
              <TextField
                name="reviewUrl"
                label="Review Link"
                placeholder="https://g.page/r/.../review"
                value={tempGeneralSettings.reviewUrl}
                onChange={onChange}
                fullWidth
                helperText="Shown as a review request in the email sent when a booking is marked Completed. Leave blank to skip the review request."
              />
            ) : (
              <Typography sx={{ wordBreak: "break-all" }}>
                Review Link:{" "}
                {generalSettings.reviewUrl || (
                  <Typography component="span" color="text.secondary">
                    Not set
                  </Typography>
                )}
              </Typography>
            )}
          </Grid>
        </Grid>
        {generalSettings.lastUpdated > 0 && (
          <Typography
            variant="caption"
            color="text.secondary"
            display="block"
            mt={2}
          >
            Last updated:{" "}
            {new Date(generalSettings.lastUpdated).toLocaleString()}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default GeneralSettingsCard;
