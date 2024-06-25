import { FC, useState } from 'react';
import { brandList, createBrand } from '@/common/api/common';
import Fuzzy from './Fuzzy';
import { Button, message } from 'antd';

const Brands: FC<any> = ({ finallyData, enableNotFoundNode, ...props }) => {
  const [refreshKeyword, setRefreshKeyword] = useState<string>();
  const [searchValue, setSearchValue] = useState<any>('');
  const loadData = async (keyword?: string) => {
    setSearchValue(keyword);
    const params = {
      name: keyword,
      page: 1,
      size: 50,
    };
    const data = await brandList(params);
    finallyData && finallyData(data);
    return Promise.resolve(data.objectList);
  };

  const notFoundNode = (
    <>
      暂未录入该品牌,
      <Button
        type='link'
        onClick={() => {
          if (searchValue.length > 15) {
            message.warn('品牌名称不能超过15个字符');
            return;
          }
          createBrand({ name: searchValue }).then(() => {
            setRefreshKeyword(searchValue);
          });
        }}
      >
        保存为新品牌
      </Button>
    </>
  );

  return (
    <Fuzzy
      loadData={loadData}
      fieldNames={{
        label: 'name',
        value: 'code',
      }}
      notFoundNode={enableNotFoundNode ? notFoundNode : null}
      refreshKeyword={refreshKeyword}
      {...props}
    />
  );
};

export default Brands;
