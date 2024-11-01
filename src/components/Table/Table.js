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
  TextField,
  Select,
  MenuItem,
} from "@mui/material";

import DeleteIcon from "@mui/icons-material/Delete";

export default function Table({
  columns,
  rows,
  groupedRows,
  count,
  page,
  onPageChange,
  onRowSelected,
  isHover,
  onDelete,
  onInputChange,
}) {
  const handlePageChange = (page) => {
    onPageChange(page);
  };

  const handleRowClick = (row) => {
    if (onRowSelected != null) {
      onRowSelected(row);
    }
  };

  const handleDeleteClick = (event, rowToDelete) => {
    onDelete(rowToDelete.id);
  };

  const handleTextChange = (event, row, field) => {
    onInputChange(event.target.value, row, field);
  };

  // blur lets parent component know that user has exited the textfield
  const handleTextBlur = (event, row, field) => {
    onInputChange(event.target.value, row, field, "blur");
  };

  const handleSelectChange = (event, row, field) => {
    onInputChange(event.target.value, row, field);
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
              {onDelete != null && (
                <TableCell className="tableCell">Actions</TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {/* Unified row rendering logic for both groupedRows and normal rows */}
            {(groupedRows ?? rows)?.map((groupedRow, groupedIndex) => {
              const isGrouped = Array.isArray(groupedRow); // Check if it's groupedRows
              console.log(isGrouped);

              // transform into array if input is not array
              const rowList = isGrouped ? groupedRow : [groupedRow];

              return rowList.map((row, rowIndex) => (
                <TableRow
                  key={isGrouped ? `${groupedIndex}-${rowIndex}` : row.id}
                  className={`tableRow ${isHover ? "hover" : "no-hover"}`}
                  hover={isHover}
                  onClick={() => handleRowClick(row)}
                >
                  {/* Render header for first row in groupedRows */}
                  {isGrouped && rowIndex === 0 ? (
                    <TableCell colSpan={columns.length}>{row}</TableCell>
                  ) : (
                    columns.map((column) => (
                      <TableCell key={column.field}>
                        {/* Render based on column type */}
                        {column.type === "input" ? (
                          <TextField
                            value={row[column.field]}
                            onChange={(event) =>
                              handleTextChange(event, row, column.field)
                            }
                            onBlur={(event) =>
                              handleTextBlur(event, row, column.field)
                            }
                          />
                        ) : column.type === "select" ? (
                          <Select
                            value={
                              row[column.field]?.find(
                                (option) => option.selected
                              )?.value
                            }
                            onChange={(event) =>
                              handleSelectChange(event, row, column.field)
                            }
                          >
                            {row[column.field]?.map((option) => (
                              <MenuItem key={option.label} value={option.value}>
                                {option.value}
                              </MenuItem>
                            ))}
                          </Select>
                        ) : (
                          row[column.field] // Default case: Render the cell value as text
                        )}
                      </TableCell>
                    ))
                  )}

                  {/* Render Delete icon if onDelete is provided */}
                  {onDelete != null && (!isGrouped || rowIndex !== 0) && (
                    <TableCell>
                      <DeleteIcon
                        onClick={(event) => handleDeleteClick(event, row)}
                        style={{ cursor: "pointer", color: "red" }}
                      />
                    </TableCell>
                  )}
                </TableRow>
              ));
            })}
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
