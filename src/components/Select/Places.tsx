import { FC, useState } from 'react';
import { createPlace, placeList } from '@/common/api/common';
import Fuzzy from './Fuzzy';
import { Button, message } from 'antd';

const Places: FC<any> = ({ finallyData, enableNotFoundNode, ...props }) => {
  const [searchValue, setSearchValue] = useState<any>('');
  const [refreshKeyword, setRefreshKeyword] = useState<string>();
  const loadData = async (keyword?: string) => {
    setSearchValue(keyword);
    const params = {
      name: keyword,
      page: 1,
      size: 50,
    };
    const data = await placeList(params);
    finallyData && finallyData(data);
    return Promise.resolve(data.objectList);
  };

  const notFoundNode = (
    <>
      暂未录入该场地,
      <Button
        type='link'
        onClick={() => {
          if (searchValue.length > 200) {
            message.warn('场地名称不能超过200个字符');
            return;
          }
          createPlace({ name: searchValue, categoryId: 114 }).then(() => {
            setRefreshKeyword(searchValue);
          });
        }}
      >
        保存为新场地
      </Button>
    </>
  );

  return (
    <Fuzzy
      loadData={loadData}
      fieldNames={{
        label: 'name',
        value: 'id',
      }}
      notFoundNode={enableNotFoundNode ? notFoundNode : null}
      refreshKeyword={refreshKeyword}
      {...props}
    />
  );
};

export default Places;
