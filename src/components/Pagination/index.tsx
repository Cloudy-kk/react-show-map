import { Pagination } from 'antd';
import { CusPaginationProps } from './ts-config';
import { FC } from 'react';
import styles from './index.module.less';

const CustomerPagination: FC<CusPaginationProps> = ({
  total,
  current,
  onChange,
  onShowSizeChange,
  pageSize,
  disabled,
  extraPagination,
  pageSizeOptions,
  clickPagination,
  ...props
}) => {

  return (
    <div className={styles.pagination}>
      <div>{typeof extraPagination === 'function' ? extraPagination() : extraPagination}</div>
      <div onClick={() => clickPagination && clickPagination()}>
        <Pagination
          {...props}
          current={current || 1}
          total={total}
          pageSize={pageSize}
          showSizeChanger
          disabled={disabled}
          showQuickJumper
          showTotal={(total) => `共 ${total} 条`}
          onChange={onChange}
          onShowSizeChange={onShowSizeChange}
          pageSizeOptions={pageSizeOptions || [20, 50, 100]}
        />
      </div>
    </div>
  );
};

export default CustomerPagination;
