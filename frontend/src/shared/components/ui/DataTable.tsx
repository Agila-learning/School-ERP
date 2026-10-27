import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  TablePagination,
  Typography,
  Skeleton
} from '@mui/material';

export interface Column {
  id: string;
  label: string;
  minWidth?: number;
  align?: 'right' | 'left' | 'center';
  format?: (value: any, row: any) => React.ReactNode;
}

interface DataTableProps {
  columns: Column[];
  rows: any[];
  page: number;
  rowsPerPage: number;
  totalCount: number;
  onPageChange: (event: unknown, newPage: number) => void;
  onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  loading?: boolean;
  emptyStateMessage?: string;
}

const DataTable: React.FC<DataTableProps> = ({ 
  columns, 
  rows, 
  page, 
  rowsPerPage, 
  totalCount, 
  onPageChange, 
  onRowsPerPageChange,
  loading = false,
  emptyStateMessage = "No data found."
}) => {
  return (
    <Paper sx={{ width: '100%', overflow: 'hidden', boxShadow: 'none', border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
      <TableContainer sx={{ maxHeight: 600 }}>
        <Table stickyHeader aria-label="data table">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align}
                  style={{ minWidth: column.minWidth }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              // Loading Skeleton State
              Array.from(new Array(rowsPerPage)).map((_, index) => (
                <TableRow key={`skeleton-${index}`}>
                  {columns.map((col) => (
                    <TableCell key={`skeleton-col-${col.id}`} align={col.align}>
                      <Skeleton animation="wave" height={24} width={col.id === 'actions' ? 60 : '80%'} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : rows.length === 0 ? (
              // Empty State
              <TableRow>
                <TableCell colSpan={columns.length} align="center" sx={{ py: 8 }}>
                  <Typography variant="body1" color="text.secondary">
                    {emptyStateMessage}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              // Data Rows
              rows.map((row, index) => {
                return (
                  <TableRow hover role="checkbox" tabIndex={-1} key={row.id || index}>
                    {columns.map((column) => {
                      const value = row[column.id];
                      return (
                        <TableCell key={column.id} align={column.align}>
                          {column.format ? column.format(value, row) : value}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 25, 50, 100]}
        component="div"
        count={totalCount}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
      />
    </Paper>
  );
};

export default DataTable;
