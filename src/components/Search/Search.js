import React, { useState, useEffect } from "react";
import { fetchFoods } from "../../api/FDCApi";
import Table from "../Table/Table";
import "./Search.scss";
import "../TextField/TextField.scss";

import { TextField, CircularProgress, Box, Chip } from "@mui/material";

export default function Search({ onRowSelected }) {
  const columns = [
    { label: "Food Name", field: "description" },
    { label: "FDC ID", field: "id" },
  ];

  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState();
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState([]);

  const searchFoods = async () => {
    setLoading(true);
    try {
      const response = await fetchFoods(searchTerm, page);
      setCount(response.data.totalPages);
      setPage(response.data.currentPage);
      setRows(
        response.data.foods.map((food) => {
          return {
            id: food.fdcId,
            description: food.description,
          };
        })
      );
    } catch (error) {
      console.error("Error fetching search results:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchTerm != "") {
      searchFoods(searchTerm, page);
    }
  }, [searchTerm, page]);

  return (
    <div className="searchContainer">
      <Box sx={{ padding: 3 }}>
        <h1>Food Nutrition Database</h1>
        <TextField
          className="primary-textfield search-textfield"
          label="Type here to search for a food"
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          fullWidth
        />
        {loading ? (
          <Box
            sx={{ display: "flex", justifyContent: "center", marginTop: 40 }}
          >
            <CircularProgress className="loadingIcon" />
          </Box>
        ) : (
          searchTerm && (
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 1,
                marginTop: 2,
                maxHeight: 400,
                overflowY: "auto",
                border: "1px solid #ddd",
                padding: 2,
                borderRadius: 2,
              }}
            >
              {rows.length > 0
                ? rows.map((row) => (
                    <Chip
                      key={row.id}
                      label={row.description}
                      onClick={() => onRowSelected(row)}
                      clickable
                    />
                  ))
                : searchTerm && <p>No results found.</p>}
            </Box>
          )
        )}
      </Box>
    </div>
  );
}
