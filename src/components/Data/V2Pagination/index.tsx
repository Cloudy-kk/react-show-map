/*
* version: 当前版本2.7.0
*/
import React, { ReactNode } from 'react';
import { Pagination } from 'antd';
import { PaginationProps } from 'antd/lib/pagination/Pagination';
import styles from './index.module.less';

export interface CusPaginationProps extends PaginationProps {
  /**
   * @description 额外传入分页器左侧的内容
   */
  extraPagination?: ReactNode | (() => ReactNode);
}
/**
* @description 便捷文档地址
* @see https://reactpc.lanhanba.net/components/Data/v2pagination
*/
const V2Pagination: React.FC<CusPaginationProps> = ({
  total,
  current = 1,
  onChange,
  onShowSizeChange,
  pageSize = 20,
  disabled,
  extraPagination,
  pageSizeOptions = [20, 50, 100],
  showSizeChanger = true,
  showQuickJumper = true,
  ...props
}) => {
  return (
    <div className={styles.v2Pagination}>
      <div>{typeof extraPagination === 'function' ? extraPagination() : extraPagination}</div>
      <Pagination
        current={current}
        total={total}
        showSizeChanger={showSizeChanger}
        showQuickJumper={showQuickJumper}
        pageSize={pageSize}
        disabled={disabled}
        showTotal={(total) => <>共 <span className={styles.total}>{total}</span> 条</>}
        onChange={(page, pageSize) => onChange && onChange(page, pageSize)}
        onShowSizeChange={onShowSizeChange}
        pageSizeOptions={pageSizeOptions}
        {...props}
      />
    </div>
  );
};

export default V2Pagination;
