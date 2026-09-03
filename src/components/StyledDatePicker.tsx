import React from "react";
import {
  Box,
  Button,
  IconButton,
  Dialog,
  DialogContent,
  DialogActions,
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
  /** Background color used for the selected-day highlight only - the date number itself keeps its normal color. */
  selectionColor?: string;
  /** Show a "Today" quick-select button above the calendar. */
  showTodayShortcut?: boolean;
}

/**
 * A single-date field styled to match the booking calendar on the
 * customer-facing site: click to open a calendar in a dialog, with booked
 * dates shown in red, past dates greyed out, and today marked with a
 * small dash. Uses a Dialog (not a Popover) so sizing is always reliable
 * on every screen width instead of fighting anchor-based cropping.
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
  const [open, setOpen] = React.useState(false);

  const today = startOfDay(new Date());

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, width: fullWidth ? "100%" : undefined }}>
      <Button
        variant="outlined"
        size="small"
        startIcon={<CalendarTodayIcon fontSize="small" />}
        onClick={() => setOpen(true)}
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
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullScreen={isMobile}
        maxWidth="xs"
        fullWidth={!isMobile}
      >
        <DialogContent
          sx={{
            p: isMobile ? 1 : 2,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            overflowX: "hidden",
            "& .rdrCalendarWrapper": {
              fontSize: isMobile ? 12 : 14,
              width: "100%",
              maxWidth: "100%",
              boxSizing: "border-box",
            },
            "& .rdrMonth": {
              width: "100%",
              boxSizing: "border-box",
              padding: isMobile ? 0 : undefined,
            },
            "& .rdrWeekDays, & .rdrDays": {
              width: "100%",
              boxSizing: "border-box",
            },
            // The library draws its own "today" marker by default;
            // hide it since we render our own below.
            "& .rdrDayToday .rdrDayNumber:after": { display: "none" },
          }}
        >
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1, alignSelf: "flex-start" }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Box component="span" sx={{ display: "inline-block", width: 10, height: 10, borderRadius: "50%", backgroundColor: "#ffa196", border: "1px solid #c62828" }} />
              Booked / unavailable
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Box component="span" sx={{ display: "inline-block", width: 10, height: 10, borderRadius: "50%", backgroundColor: "#eeeeee", border: "1px solid #9e9e9e" }} />
              Past date
            </Box>
          </Typography>
          {showTodayShortcut && (
            <Button
              size="small"
              variant="text"
              onClick={() => {
                onChange(new Date());
                setOpen(false);
              }}
              sx={{ mb: 0.5, textTransform: "none", alignSelf: "flex-start" }}
            >
              Set to Today
            </Button>
          )}
          <Calendar
            date={value ?? new Date()}
            onChange={(date: Date) => {
              onChange(date);
              setOpen(false);
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
              let color: string = theme.palette.text.primary;

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
                        bottom: 3,
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: 8,
                        height: 2,
                        backgroundColor: isBooked ? "#c62828" : "#1976d2",
                      }}
                    />
                  )}
                </div>
              );
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} size="small">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StyledDatePicker;