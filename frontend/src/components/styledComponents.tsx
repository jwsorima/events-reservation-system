import { TablePagination } from "@mui/material";
import { styled } from '@mui/material/styles';
import Tooltip, { tooltipClasses, TooltipProps } from '@mui/material/Tooltip';

export const StyledTablePagination = styled(TablePagination)(() => ({
  '& .MuiTablePagination-actions button': {
    display: 'none'
  },
  '& .MuiTablePagination-spacer': {
    display: 'none',
  },
  '& .MuiTablePagination-toolbar': {
    justifyContent: 'flex-start',
  },
}));

export const AddressTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: '#f5f5f9',
    color: 'rgba(0, 0, 0, 0.87)',
    maxWidth: 310,
    fontSize: theme.typography.pxToRem(12),
    border: '1px solid #dadde9',
    padding: '10px',
  },
}));