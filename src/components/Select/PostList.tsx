/**
 * 岗位列表
 */
import React from 'react';
import { positionSearch } from '@/common/api/position';
import Fuzzy from './Fuzzy';

const PostList: React.FC<any> = ({ extraParams = {}, ...props }) => {
  // 获取岗位列表
  const loadData = async (keyword: string) => {
    const params = {
      keyword,
      ...extraParams,
    };
    const result = await positionSearch(params);
    return Promise.resolve(result);
  };

  return (
    <Fuzzy
      loadData={loadData}
      fieldNames={{
        label: 'name',
        value: 'id',
      }}
      {...props}
    />
  );
};

export default PostList;
