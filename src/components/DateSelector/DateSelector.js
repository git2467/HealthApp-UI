import * as React from "react";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import { Button, Box } from "@mui/material";

import "../Button/Button.scss";

export default function DateSelector({ date, onDateChange, showNavButtons }) {
  date = dayjs(date);
  const handleDateChange = (newDate) => {
    onDateChange(newDate);
  };

  const incrementDate = () => {
    onDateChange(dayjs(date).add(1, "day"));
  };

  const decrementDate = () => {
    onDateChange(dayjs(date).subtract(1, "day"));
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box display="flex" alignItems="center" gap={1}>
        {showNavButtons && (
          <Button
            className="iconButtons"
            variant="outlined"
            onClick={decrementDate}
          >
            {"<"}
          </Button>
        )}

        <DatePicker
          label="DD/MM/YY"
          format="DD/MM/YYYY"
          views={["year", "month", "day"]}
          value={date}
          onChange={handleDateChange}
        />
        {showNavButtons && (
          <Button
            className="iconButtons"
            variant="outlined"
            onClick={incrementDate}
          >
            {">"}
          </Button>
        )}
      </Box>
    </LocalizationProvider>
  );
}
