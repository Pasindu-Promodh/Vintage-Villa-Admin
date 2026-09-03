import React from "react";
import { Box, useTheme, useMediaQuery } from "@mui/material";
import { DateRange, RangeKeyDict } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

interface BookingDateRangeCalendarProps {
  value: [Date | null, Date | null];
  onChange: (value: [Date | null, Date | null]) => void;
  /** Allow past dates to be picked. Defaults to false (blocks past dates). */
  allowPastDates?: boolean;
}

/**
 * The same styled react-date-range calendar used on the customer-facing
 * booking site, reused here for the admin dashboard's booking date filter.
 */
const BookingDateRangeCalendar: React.FC<BookingDateRangeCalendarProps> = ({
  value,
  onChange,
  allowPastDates = true,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const selectionRange = {
    startDate: value[0] ?? new Date(),
    endDate: value[1] ?? value[0] ?? new Date(),
    key: "selection",
  };

  const handleChange = (ranges: RangeKeyDict) => {
    const { startDate, endDate } = ranges.selection;
    onChange([startDate ?? null, endDate ?? null]);
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        width: "100%",
        overflowX: "hidden",
        "& .rdrCalendarWrapper": {
          fontSize: 14,
          maxWidth: "100%",
          ...(isMobile && { width: "100%" }),
        },
        "& .rdrMonths": {
          flexWrap: "wrap",
          justifyContent: "center",
          ...(isMobile && { width: "100%" }),
        },
        "& .rdrMonth": isMobile
          ? {
              width: "100%",
              padding: "0 0.5em 1em 0.5em",
            }
          : {},
        ...(isMobile && {
          "& .rdrDateDisplayWrapper": {
            width: "100%",
          },
        }),
      }}
    >
      <DateRange
        ranges={[selectionRange]}
        onChange={handleChange}
        minDate={allowPastDates ? undefined : new Date()}
        moveRangeOnFirstSelection={false}
        months={isMobile ? 1 : 2}
        direction={isMobile ? "vertical" : "horizontal"}
        rangeColors={[theme.palette.primary.main]}
        showDateDisplay
      />
    </Box>
  );
};

export default BookingDateRangeCalendar;
