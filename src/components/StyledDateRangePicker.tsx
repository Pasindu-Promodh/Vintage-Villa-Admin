import React from "react";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogActions,
  Typography,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { DateRange, RangeKeyDict } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { format, isBefore, isSameDay, startOfDay } from "date-fns";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";

interface StyledDateRangePickerProps {
  /** Shown on the trigger button, e.g. "Check-in" / "Check-out" or "Start" / "End". */
  startLabel: string;
  endLabel: string;
  value: [Date | null, Date | null];
  onChange: (value: [Date | null, Date | null]) => void;
  /** Dates to highlight in red as already booked/unavailable. */
  bookedDates?: Date[];
  /** Dates before this are greyed out and unselectable. Defaults to today. */
  minDate?: Date;
}

/**
 * A single combined field for picking a check-in/check-out (or
 * start/end) date range. Opens the exact same styled calendar used on
 * the customer-facing booking site - green range highlight, red booked
 * days, grey past days - as one range selection instead of two
 * independent single-date fields.
 */
const StyledDateRangePicker: React.FC<StyledDateRangePickerProps> = ({
  startLabel,
  endLabel,
  value,
  onChange,
  bookedDates = [],
  minDate = new Date(),
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [open, setOpen] = React.useState(false);

  const selectionRange = {
    startDate: value[0] ?? new Date(),
    endDate: value[1] ?? value[0] ?? new Date(),
    key: "selection",
  };

  const handleChange = (ranges: RangeKeyDict) => {
    const { startDate, endDate } = ranges.selection;
    onChange([startDate ?? null, endDate ?? null]);
  };

  const label =
    value[0] && value[1]
      ? `${format(value[0], "dd MMM yyyy")} \u2192 ${format(value[1], "dd MMM yyyy")}`
      : `${startLabel} / ${endLabel}`;

  return (
    <>
      <Button
        variant="outlined"
        size="small"
        startIcon={<CalendarTodayIcon fontSize="small" />}
        onClick={() => setOpen(true)}
        fullWidth
        sx={{ justifyContent: "flex-start", textTransform: "none" }}
      >
        <Typography variant="body2" noWrap component="span">
          {label}
        </Typography>
      </Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullScreen={isMobile}
        maxWidth="md"
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
              maxWidth: "100%",
              boxSizing: "border-box",
              ...(isMobile && { width: "100%" }),
            },
            "& .rdrMonths": {
              flexWrap: "wrap",
              justifyContent: "center",
              ...(isMobile && { width: "100%" }),
            },
            "& .rdrMonth": isMobile
              ? { width: "100%", boxSizing: "border-box", padding: 0 }
              : {},
            "& .rdrWeekDays, & .rdrDays": isMobile
              ? { width: "100%", boxSizing: "border-box" }
              : {},
            ...(isMobile && {
              "& .rdrDateDisplayWrapper": { width: "100%" },
            }),
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
          <DateRange
            ranges={[selectionRange]}
            onChange={handleChange}
            minDate={minDate}
            moveRangeOnFirstSelection={false}
            months={isMobile ? 1 : 2}
            direction={isMobile ? "vertical" : "horizontal"}
            rangeColors={["#99ff96"]}
            showDateDisplay
            dayContentRenderer={(date: Date) => {
              const isBooked = bookedDates.some((d) => isSameDay(d, date));
              const isPast = isBefore(date, startOfDay(minDate));

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
                </div>
              );
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} size="small" variant="contained">
            Done
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default StyledDateRangePicker;