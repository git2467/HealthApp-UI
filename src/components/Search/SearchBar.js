import * as React from "react";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import Autocomplete from "@mui/material/Autocomplete";
import axios from "axios";

export default function SearchBar({ foodData }) {
  //autocomplete

  //display results table
  try {
    var data = {
      query: "Cheddar cheese",
      dataType: ["Foundation", "SR Legacy"],
      pageSize: 25,
      pageNumber: 2,
      sortBy: "dataType.keyword",
      sortOrder: "asc",
    };
    axios
      // https://fdc.nal.usda.gov/portal-data/external/173858
      .post(
        `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=rOo4DaIsn7eVzqvRnLPSrUA4khrQ3v3pydrAFDVg`,
        data
      )
      .then((res) => {
        // console.log(res);
        // console.log(res.data);
        // console.log(res.data.foods);
      });
  } catch (error) {
    console.log("error");
  }

  return (
    <Stack spacing={2} sx={{ width: 300 }}>
      <Autocomplete
        freeSolo
        id="free-solo-2-demo"
        disableClearable
        options={foodData.map((option) => option.description)}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Search input"
            InputProps={{
              ...params.InputProps,
              type: "search",
            }}
          />
        )}
      />
    </Stack>
  );
}
