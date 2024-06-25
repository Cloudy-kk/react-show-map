import { FC, useRef, useEffect, useState } from 'react';
import { storesList } from '@/common/api/common';
import Fuzzy from './Fuzzy';

const Stores: FC<any> = ({ addAllStores = false, defaultCheck = false, finallyData, showNumber = true, ...props }) => {
  const mode = props?.mode;
  const hasStore = useRef(true); // 筛选项为空时是否有门店
  const defaultCheckFirst = useRef(defaultCheck); // 筛选项为空时是否有门店
  const [hasNumberStore, setHasNumberStore] = useState<Record<string, any>>({});

  const loadData = async (keyword?: string) => {
    const params = {
      keyword,
    };
    const data = await storesList(params);
    if (!keyword) {
      hasStore.current = !!(Array.isArray(data) && data.length);
    }
    // 如果默认需要全部门店且参数为空的时候列表存在
    if (addAllStores && hasStore.current) {
      // 添加所有门店
      data.unshift({ id: -1, name: '所有门店' });
    }
    finallyData && finallyData(data);
    // 需要默认选中/默认选中第一个-筛选时不进行默认选中
    defaultCheckFirst.current && data.length && props.onChange(mode ? [data[0].id] : data[0].id);
    defaultCheckFirst.current = false;
    return Promise.resolve(data);
  };

  useEffect(() => {
    if (showNumber) {
      setHasNumberStore({
        customOptionItem: (store: Record<string, any>) => {
          const { name, number } = store;
          return (
            <>
              {number ? <span className='color-help'>[{number}]</span> : null}
              <span> {name}</span>
            </>
          );
        },
        optionLabelProp: 'label',
      });
    }
  }, [showNumber]);

  return (
    <Fuzzy
      loadData={loadData}
      fieldNames={{
        label: 'name',
        value: 'id',
      }}
      {...hasNumberStore}
      {...props}
    />
  );
};

export default Stores;
