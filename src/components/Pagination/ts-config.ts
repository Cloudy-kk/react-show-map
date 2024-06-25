import { PaginationProps } from 'antd/lib/pagination/Pagination';
import { ReactNode } from 'react';
export interface CusPaginationProps extends PaginationProps {
  extraPagination: ReactNode | (() => ReactNode);
  clickPagination?: () => void;
}
