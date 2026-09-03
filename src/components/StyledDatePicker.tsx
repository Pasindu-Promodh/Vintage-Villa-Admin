import React from "react";
import {
  Box,
  Button,
  IconButton,
  Popover,
  Typography,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { Calendar } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { format, isBefore, isSameDay, startOfDay } from "date-fns";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import ClearIcon from "@mui/icons-material/Clear";

interface StyledDatePickerProps {
  label: string;
  value: Date | null;
  onChange: (date: Date | null) => void;
  /** Dates to highlight in red as already booked/unavailable. */
  bookedDates?: Date[];
  /** Dates before this are greyed out as past. Omit to allow any date. */
  minDate?: Date;
  allowClear?: boolean;
  fullWidth?: boolean;
  /** Color used for the selected-day highlight. Defaults to the site's brand green. */
  selectionColor?: string;
  /** Show a "Today" quick-select button above the calendar. */
  showTodayShortcut?: boolean;
}

/**
 * A single-date field styled to match the booking calendar used on the
 * customer-facing site: click to open a small calendar, with booked dates
 * shown in red, past dates greyed out, and today marked with a small dot.
 * Independent of any other field, so a start date can be picked without
 * forcing an end date (and vice versa) - unlike a locked range picker.
 */
const StyledDatePicker: React.FC<StyledDatePickerProps> = ({
  label,
  value,
  onChange,
  bookedDates = [],
  minDate,
  allowClear = true,
  fullWidth = true,
  selectionColor = "#99ff96",
  showTodayShortcut = false,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);

  const today = startOfDay(new Date());

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, width: fullWidth ? "100%" : undefined }}>
      <Button
        variant="outlined"
        size="small"
        startIcon={<CalendarTodayIcon fontSize="small" />}
        onClick={(e) => setAnchorEl(e.currentTarget)}
        fullWidth={fullWidth}
        sx={{ justifyContent: "flex-start", textTransform: "none", minWidth: 0 }}
      >
        <Typography variant="body2" noWrap component="span">
          {value ? `${label}: ${format(value, "dd MMM yyyy")}` : label}
        </Typography>
      </Button>
      {allowClear && value && (
        <IconButton size="small" onClick={() => onChange(null)}>
          <ClearIcon fontSize="small" />
        </IconButton>
      )}
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <Box
          sx={{
            p: 1,
            maxWidth: "calc(100vw - 32px)",
            "& .rdrCalendarWrapper": {
              fontSize: 14,
              ...(isMobile && { width: "100%" }),
            },
          }}
        >
          {showTodayShortcut && (
            <Button
              size="small"
              variant="text"
              onClick={() => {
                onChange(new Date());
                setAnchorEl(null);
              }}
              sx={{ mb: 0.5, textTransform: "none" }}
            >
              Set to Today
            </Button>
          )}
          <Calendar
            date={value ?? new Date()}
            onChange={(date: Date) => {
              onChange(date);
              setAnchorEl(null);
            }}
            minDate={minDate}
            color={selectionColor}
            dayContentRenderer={(date: Date) => {
              const isBooked = bookedDates.some((d) => isSameDay(d, date));
              const isPast = minDate
                ? isBefore(date, startOfDay(minDate))
                : false;
              const isToday = isSameDay(date, today);

              let backgroundColor: string | undefined;
              let color: string | undefined;

              if (isBooked) {
                backgroundColor = "#ffa196";
                color = "#c62828";
              } else if (isPast) {
                backgroundColor = "#eeeeee";
                color = "#9e9e9e";
              }

              return (
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 4,
                    backgroundColor,
                    color,
                  }}
                >
                  {date.getDate()}
                  {isToday && (
                    <span
                      style={{
                        position: "absolute",
                        bottom: 2,
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: 4,
                        height: 4,
                        borderRadius: "50%",
                        backgroundColor: isBooked ? "#c62828" : "#1976d2",
                      }}
                    />
                  )}
                </div>
              );
            }}
          />
        </Box>
      </Popover>
    </Box>
  );
};

export default StyledDatePicker;