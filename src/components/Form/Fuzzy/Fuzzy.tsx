/* eslint-disable react-hooks/exhaustive-deps */
import { FC, useState, useEffect, memo, useRef, ReactNode } from 'react';
import cs from 'classnames';
import '../V2Fuzzy/index.global.less';
import { Select, Spin } from 'antd';
import { SelectProps } from 'antd/es/select';
import { debounce } from '@lhb/func';
import { SearchOutlined } from '@ant-design/icons';

export interface FuzzyProps {
  immediateOnce?: boolean;
  loadData: Function;
  /**
   * @description 额外插入的浮层外层class
   */
  popupClassName?: string;
  /**
   *@description 查找数据时的状态展示
   */
  notFoundNode?: ReactNode;
  keyword?: string;
  refreshKeyword?: string;
  debounceTimeout?: number;
  customOptionItem?: (option: Record<string, any>) => ReactNode;
  customOptions?: {label, value}[];
  loaded?: (ref: any) => void;
  getResult?: Function
};

interface ResultTypes {
  fetching: boolean;
  options: Array<Record<string, any>>;
}

const { Option } = Select;
const Fuzzy: FC<FuzzyProps & SelectProps> = memo(({
  immediateOnce = true, // 渲染时是否直接渲染一次
  customOptions,
  loadData,
  keyword: keywordStr = '', // immediateOnce为true时，loadDa的入参
  refreshKeyword,
  debounceTimeout = 300,
  notFoundNode,
  customOptionItem,
  fieldNames = {},
  onChange,
  children,
  loaded,
  getResult,
  popupClassName,
  ...props
}) => {
  const selectRef = useRef<any>(null);
  const [result, setResult] = useState<ResultTypes>({
    fetching: false,
    options: []
  });
  const fetchRef = useRef(0);
  useEffect(() => {
    loaded && loaded(selectRef.current);
  }, []);
  useEffect(() => {
    // 默认请求一次
    immediateOnce && loadDataHandle(keywordStr);
  }, [immediateOnce]);

  useEffect(() => {
    // 关键字更新则请求一次
    refreshKeyword && loadDataHandle(refreshKeyword);
  }, [refreshKeyword]);

  useEffect(() => {
    // 默认请求一次
    customOptions && customOptions.length && setResult({
      fetching: false,
      options: customOptions,
    });
    getResult && customOptions && customOptions.length && getResult(customOptions);
  }, [customOptions]);

  const debounceLoadData = debounce((keyword: string) => {
    fetchRef.current += 1;
    const fetchId = fetchRef.current;
    setResult({
      fetching: true,
      options: [],
    });
    getResult && getResult([]);
    loadDataHandle(keyword, fetchId);
  }, debounceTimeout);

  const loadDataHandle = async (keyword: string, fetchId?: number) => {
    const data = await loadData(keyword);
    if (fetchId && (fetchId !== fetchRef.current)) return;
    setResult({
      fetching: false,
      options: data
    });
    getResult && getResult(data);
  };

  return (
    <Select
      showSearch={true}
      onSearch={debounceLoadData}
      filterOption={false}
      onChange={onChange}
      className='v2Fuzzy'
      autoClearSearchValue={false}
      notFoundContent={result.fetching ? <Spin size='small' /> : notFoundNode}
      popupClassName={cs('v2FuzzyPopup', popupClassName)}
      // 多选的情况下 失焦的时候默认请求一次全部的数据
      onBlur={(props?.mode === 'multiple' || props?.mode === 'tags') ? () => debounceLoadData() : props?.onBlur}
      ref={selectRef}
      suffixIcon={<SearchOutlined />}
      {...props}>
      {
        children || result.options.map((option) => (
          <Option
            value={option[(fieldNames as any).value]}
            key={option[(fieldNames as any).value]}
            label={option[(fieldNames as any).label]}
            disabled={option.disabled}>
            { typeof customOptionItem === 'function' ? customOptionItem(option) : option[(fieldNames as any).label]}
          </Option>
        ))
      }
    </Select>
  );
});

export default Fuzzy;
