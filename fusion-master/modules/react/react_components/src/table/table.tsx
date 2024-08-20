import { LensProps } from "@focuson/state";
import { Paper, Table, TableCell, TableBody, TableHead, TableRow, TableContainer } from "@mui/material";
import React from "react";

export type DataTableProps = {
  cols: string[],
  rows: React.ReactNode[][]
  noData?: React.ReactNode
  selected?: number
  onClick?: ( col: number, row?: number ) => void
}
const selectedRowStyle = {
  backgroundColor: '#f0f0f0', // example color, adjust as needed
  '&:hover': {
    backgroundColor: '#e0e0e0' // darker on hover
  }
};
const dataRowSx = {
  '&:nth-of-type(odd)': { backgroundColor: '#f5f5f5' },
  '&:nth-of-type(even)': { backgroundColor: '#e0e0e0' },
}
export function DataTable ( { cols, rows, noData, onClick, selected }: DataTableProps ) {

  const click = onClick ? onClick : ( col: number, row?: number ) => {}
  return <TableContainer component={Paper}>
    <Table size="small">
      <TableHead>
        <TableRow sx={{
          '& > th': {
            backgroundColor: '#1976d2', color: 'white', fontWeight: 'bold'
          }
        }}>{cols.map ( ( col, index ) => <TableCell onClick={() => click ( index )} key={index}>{col}</TableCell> )}</TableRow>
      </TableHead>
      <TableBody>
        {rows.map ( ( row, rowIndex ) => (
          <TableRow
            key={rowIndex}
            sx={rowIndex === selected ? selectedRowStyle : undefined}
          >{row.map ( ( cell, colIndex ) => <TableCell onClick={() => click ( colIndex, rowIndex )} key={colIndex}>{cell}</TableCell> )}
          </TableRow>
        ) )}
        {rows.length === 0 && noData && <TableRow sx={dataRowSx}><TableCell colSpan={100}>{noData}</TableCell></TableRow>}

      </TableBody>
    </Table>
  </TableContainer>

}