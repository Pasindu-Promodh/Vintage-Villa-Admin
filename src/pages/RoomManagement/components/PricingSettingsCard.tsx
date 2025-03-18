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
import InputAdornment from "@mui/material/InputAdornment";

interface PricingSettings {
  lunchPrice: number;
  dinnerPrice: number;
  discountRate: number;
  lastUpdated: number;
}

interface PricingSettingsCardProps {
  pricingSettings: PricingSettings;
  tempPricingSettings: PricingSettings;
  isEditingPricing: boolean;
  formatCurrency: (amount: number) => string;
  onSave: () => void;
  onCancel: () => void;
  onEdit: () => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const PricingSettingsCard: React.FC<PricingSettingsCardProps> = ({
  pricingSettings,
  tempPricingSettings,
  isEditingPricing,
  formatCurrency,
  onSave,
  onCancel,
  onEdit,
  onChange,
}) => {
  return (
    <Card elevation={3} sx={{ p: 2, mb: 3 }}>
      <CardHeader
        title="Meal & Discount Settings"
        action={
          isEditingPricing ? (
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
          <Grid item xs={12} sm={4}>
            {isEditingPricing ? (
              <TextField
                name="lunchPrice"
                label="Lunch Price ($)"
                type="number"
                value={tempPricingSettings.lunchPrice}
                onChange={onChange}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">$</InputAdornment>
                  ),
                }}
              />
            ) : (
              <Typography>
                Lunch Price: {formatCurrency(pricingSettings.lunchPrice)}
              </Typography>
            )}
          </Grid>
          <Grid item xs={12} sm={4}>
            {isEditingPricing ? (
              <TextField
                name="dinnerPrice"
                label="Dinner Price ($)"
                type="number"
                value={tempPricingSettings.dinnerPrice}
                onChange={onChange}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">$</InputAdornment>
                  ),
                }}
              />
            ) : (
              <Typography>
                Dinner Price: {formatCurrency(pricingSettings.dinnerPrice)}
              </Typography>
            )}
          </Grid>
          <Grid item xs={12} sm={4}>
            {isEditingPricing ? (
              <TextField
                name="discountRate"
                label="Multi-day Discount (%)"
                type="number"
                value={tempPricingSettings.discountRate}
                onChange={onChange}
                fullWidth
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">%</InputAdornment>
                  ),
                }}
              />
            ) : (
              <Typography>
                Multi-day Discount: {pricingSettings.discountRate}%
              </Typography>
            )}
          </Grid>
        </Grid>
        <Typography
          variant="caption"
          color="text.secondary"
          display="block"
          mt={2}
        >
          Last updated: {new Date(pricingSettings.lastUpdated).toLocaleString()}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default PricingSettingsCard;