import React from 'react';
import { Typography, Paper, Grid, Card, CardContent } from '@mui/material';

interface DBStats {
  totalImages: number;
  totalSize: number;
}

interface StatsDisplayProps {
  stats: DBStats;
  formatFileSize: (bytes: number) => string;
}

const StatsDisplay: React.FC<StatsDisplayProps> = ({ stats, formatFileSize }) => {
  return (
    <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Database Statistics
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                Total Images
              </Typography>
              <Typography variant="h4">{stats.totalImages}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                Total Storage Used
              </Typography>
              <Typography variant="h5">
                {formatFileSize(stats.totalSize)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default StatsDisplay;