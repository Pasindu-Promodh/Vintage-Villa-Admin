import * as React from "react";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";

interface AlertMessageProps {
  message: string;
  type: "success" | "error" | "info" | "warning";
}

const AlertMessage: React.FC<AlertMessageProps> = ({ message, type }) => {
  if (!message) return null;
  
  const getBackgroundColor = () => {
    switch (type) {
      case "success":
        return "success.light";
      case "error":
        return "error.light";
      case "info":
        return "info.light";
      case "warning":
        return "warning.light";
      default:
        return "grey.300";
    }
  };

  return (
    <Paper
      elevation={1}
      sx={{ p: 2, mb: 2, bgcolor: getBackgroundColor(), color: "white" }}
    >
      <Typography>{message}</Typography>
    </Paper>
  );
};

export default AlertMessage;