import React from "react";
import { useNavigate } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import HomeIcon from "@mui/icons-material/Home";

interface DashboardHeaderProps {
  title: string;
  /** Optional actions rendered on the right side of the header (buttons, icons, etc.) */
  actions?: React.ReactNode;
}

/**
 * Consistent top bar for every dashboard page: a back-to-home button,
 * the page title, and an optional slot for page-specific actions.
 * Sticks to the top of the viewport so it's always reachable on mobile.
 */
const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  title,
  actions,
}) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <AppBar
      position="sticky"
      color="default"
      elevation={1}
      sx={{ mb: isMobile ? 2 : 3, top: 0 }}
    >
      <Toolbar sx={{ gap: 1, px: isMobile ? 1.5 : 3 }}>
        <IconButton
          edge="start"
          onClick={() => navigate("/")}
          aria-label="Back to dashboard"
        >
          {isMobile ? <ArrowBackIcon /> : <HomeIcon />}
        </IconButton>
        <Typography
          variant={isMobile ? "subtitle1" : "h6"}
          component="h1"
          noWrap
          sx={{ flexGrow: 1, fontWeight: 600 }}
        >
          {title}
        </Typography>
        {actions && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            {actions}
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default DashboardHeader;
