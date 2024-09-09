import React from "react";
import "./Table.scss";

import {
  Table as MuiTable,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Pagination,
} from "@mui/material";

export default function Table({
  columns,
  rows,
  count,
  page,
  onPageChange,
  onRowSelected,
  isHover,
}) {
  const handlePageChange = (page) => {
    onPageChange(page);
  };

  const handleRowClick = (row) => {
    if (onRowSelected != null) {
      onRowSelected(row);
    }
  };

  return (
    <>
      <TableContainer component={Paper} sx={{ marginTop: 2 }}>
        <MuiTable>
          <TableHead className="tableHead">
            <TableRow>
              {columns?.map((column) => (
                <TableCell className="tableCell">{column.label}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows?.map((row) => (
              <TableRow
                className={`tableRow ${isHover ? "hover" : "no-hover"}`}
                key={row.id}
                hover={isHover}
                onClick={() => handleRowClick(row)}
              >
                {columns?.map((column) => (
                  <TableCell>{row[column.field]}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </MuiTable>
      </TableContainer>
      {onPageChange != null && (
        <Pagination
          count={count}
          page={page}
          onChange={(event, value) => handlePageChange(value)}
          sx={{ marginTop: 2, display: "flex", justifyContent: "center" }}
        />
      )}
    </>
  );
}
