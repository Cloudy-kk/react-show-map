/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, forwardRef, useRef, ReactNode, useImperativeHandle, useMemo, ForwardedRef } from 'react';
import cs from 'classnames';
import './index.global.less';
import { deepCopy, debounce, concatObjArray } from '@lhb/func';
import { ConfigProvider, Empty, Select, Spin } from 'antd';
import { SelectProps } from 'antd/es/select';
import { useMethods } from '@lhb/hook';
import { unstable_batchedUpdates } from 'react-redux/es/utils/reactBatchedUpdates';
import { blurFloat } from '../../config-v2';
import { SearchOutlined } from '@ant-design/icons';

export interface FuzzyHandles {
  /**
   * @description 往当前options插入一个option
   */
  addOption: (item: any) => void;
  /**
   * @description 插入一组默认的options
   */
  setOptions: (options: any[], setInSelect?: boolean) => void;
  /**
   * @description 提供给父级，根据传入 id/ids 获取选中项；父级使用 getItem: (data) => fuzzyRef.current.getItem(data)
   */
  getItem: (data: any) => any;
  /**
   * @description 底层ant-select的dom节点
   */
  selectRef: any;
}
export interface FuzzyProps extends SelectProps {
  /**
   * @description 渲染时是否直接渲染一次
   * @default true
   */
  immediateOnce?: boolean;
  /**
   *@description 数据请求
   */
  loadData: Function;
  /**
   * @description 额外插入的浮层外层class
   */
  popupClassName?: string;
  /**
   *@description 查找数据时的状态展示
   */
  notFoundNode?: ReactNode;
  /**
   *@description 初始化查询关键词
   */
  keyword?: string;
  /**
   *@description 防抖的时间
   */
  debounceTimeout?: number;
  /**
   *@description 自定义渲染子节点
   */
  customOptionItem?: (option: Record<string, any>) => ReactNode;
  /**
   *@description 自定义空内容
   */
  renderEmptyReactNode?: ReactNode;
  /**
   * @description 额外dropdown样式
   */
  dropdownStyle?: React.CSSProperties;
  /**
   *@description Fuzzy
   */
  ref?: any;
  /**
   * @description 是否需要缓存选中options,仅mode='multiple'时生效
   */
  needCacheSelect?: boolean;
  /**
   * @description 缓存选中的options插入的位置 可选 'bottom'
   * @default top
   */
  cacheSelectLocation?: 'bottom' | 'top' | string;
  /**
   * @description 是否不允许任何mode类型下，在blur时重载查询列表
   * @default false
   */
  blurUnReloadAll?: boolean;
};

interface ResultTypes {
  fetching: boolean;
  options: Array<Record<string, any>>;
}

const { Option } = Select;
/**
* @description 便捷文档地址
* @see https://reactpc.lanhanba.net/components/form/fuzzy
*/
const Fuzzy: React.FC<FuzzyProps> = forwardRef(({
  immediateOnce = true, // 渲染时是否直接渲染一次
  loadData,
  keyword: keywordStr = '', // immediateOnce为true时，loadDa的入参
  debounceTimeout = 300,
  notFoundNode,
  customOptionItem,
  fieldNames = {},
  onChange,
  children,
  dropdownStyle,
  popupClassName,
  renderEmptyReactNode,
  needCacheSelect = false,
  cacheSelectLocation = 'top',
  blurUnReloadAll = false,
  ...props
}, ref: ForwardedRef<FuzzyHandles>) => {
  const cacheSelect = props?.mode === 'multiple' && needCacheSelect; // 只允许在多选模式下使用缓存选中项功能
  const [selectOptions, setSelectOptions] = useState<any[]>([]);
  const [result, setResult] = useState<ResultTypes>({
    fetching: false,
    options: []
  });
  const selectRef: any = useRef();
  const fetchRef = useRef(0);
  // 暴露子组件的方法
  useImperativeHandle(ref, () => ({
    addOption: addHandle,
    setOptions: setHandle,
    getItem: getItem,
    selectRef: selectRef.current
  }));
  useEffect(() => {
    // 默认请求一次
    immediateOnce && loadDataHandle(keywordStr);
  }, [immediateOnce]);

  const debounceLoadData = debounce((keyword: string) => {
    fetchRef.current += 1;
    const fetchId = fetchRef.current;
    setResult({
      fetching: true,
      options: [],
    });
    loadDataHandle(keyword, fetchId);
  }, debounceTimeout);

  const loadDataHandle = async (keyword: string, fetchId?: number) => {
    const data = await loadData(keyword);
    if (fetchId && (fetchId !== fetchRef.current)) return;
    setResult({
      fetching: false,
      options: data
    });
  };
  const getItem = (data) => {
    let curResult: any = null;
    const options = realOptions;
    const valueKey = (fieldNames as any).value;

    if (!Array.isArray(options) || options.length === 0) {
      return curResult;
    }
    if (Array.isArray(data)) {
      curResult = options.filter(item => data.includes(item[valueKey]));
    } else {
      curResult = options.find(item => item[valueKey] === data);
    }
    return curResult ? deepCopy(curResult) : null;
  };

  const addHandle = (item: any) => {
    const id = item[(fieldNames as any).value];
    if (!(result.options.find((option: any) => option[(fieldNames as any).value] === id))) {
      const options = deepCopy(result.options);
      options.push(item);
      setResult((state) => ({ ...state, options }));
      loadData(); // 更新finallyData中的数据
    }
  };
  // 为了避免immediateOnce默认请求一次接口的逻辑和此处逻辑的先后问题，请在调用此方法前将immediateOnce设为false
  const setHandle = (options: any[], setInSelect) => {
    if (!(Array.isArray(options) && options.length)) return;
    unstable_batchedUpdates(() => {
      setResult({
        fetching: false,
        options,
      });
      if (cacheSelect && setInSelect) {
        setSelectOptions(options);
      }
    });
  };
  const methods = useMethods({
    onChange(value, option: any) {
      if (cacheSelect) { // 如果设置了选中项缓存
        // 需要对labelInValue参数进行兼容。
        const valueIds = props.labelInValue ? value.map(item => {
          return item.value; // 这里ant不管你是否设置了fieldNames，他返回的都是value。
        }) : value;
        const newOptions = concatObjArray(selectOptions, result.options, (fieldNames as any).value);
        setSelectOptions(newOptions.filter(item => {
          return valueIds.includes(item[(fieldNames as any).value]);
        }));
      }
      onChange && onChange(value, option);
    }
  });

  const realOptions = useMemo(() => {
    if (cacheSelect) {
      // 需要保证顺序
      const resultOptionsValue = result.options?.map(item => {
        return item[(fieldNames as any).value];
      }) || [];
      const residueOptions = selectOptions.filter(item => {
        return !resultOptionsValue.includes(item[(fieldNames as any).value]);
      });
      return cacheSelectLocation === 'bottom' ? [...result.options, ...residueOptions] : [...residueOptions, ...result.options];
    }
    return result.options || [];
  }, [selectOptions, result.options]);
  return (
    <ConfigProvider renderEmpty={() => renderEmptyReactNode || <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={'请输入关键词进行搜索'} />}>
      <Select
        ref={selectRef}
        showSearch={true}
        onSearch={debounceLoadData}
        filterOption={false}
        onChange={methods.onChange}
        className='v2Fuzzy'
        autoClearSearchValue={false}
        notFoundContent={result.fetching ? <Spin size='small' /> : notFoundNode}
        popupClassName={cs('v2FuzzyPopup', popupClassName)}
        dropdownStyle={dropdownStyle}
        // 多选的情况下 失焦的时候默认请求一次全部的数据
        onBlur={
          !blurUnReloadAll && blurFloat(props)
            ? () => debounceLoadData()
            : props?.onBlur
        }
        showArrow
        suffixIcon={<SearchOutlined />}
        {...props}
      >
        {
          children || realOptions.map((option) => {
            return (<Option
              value={option[(fieldNames as any).value]}
              key={option[(fieldNames as any).value]}
              label={option[(fieldNames as any).label]}
              disabled={option.disabled}
            >
              { typeof customOptionItem === 'function' ? customOptionItem(option) : option[(fieldNames as any).label] }
            </Option>);
          })
        }
      </Select>
    </ConfigProvider>
  );
});

export default Fuzzy;
