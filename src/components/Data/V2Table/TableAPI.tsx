/*
* version: 当前版本2.8.1
*/
import React, { ReactNode } from 'react';
import { ColumnsType, TablePaginationConfig } from 'antd/lib/table/interface';
import { ButtonProps, TableProps } from 'antd/lib/index';

type RecordType = any;
interface defaultSorterProps {
  order: string;
  orderBy: string;
}

export interface FetchData {
  dataSource: Array<Record<string, any>>;
  count?: number;
}

export interface rowSelectionOperateProps {
  text: string;
  onClick: Function;
  icon?: ReactNode;
  btnConfig?: ButtonProps;
}

type PaginationProps = boolean & TablePaginationConfig;

export interface FilteredTableProps extends TableProps<RecordType> {
  /**
   * @description  是否展示外边框和列边框
   * @default true
   */
  bordered: boolean;
  /**
   * @description promise请求，返回 dataSource(必须) 和 count(非必须)
   */
  onFetch: (params?: object) => Promise<FetchData>;
  /**
   * @description 自定义className
   */
  className?: string;
  /**
   * @description 筛选项的参数，该参数变化的时候会触发请求
   * @default {}
   */
  filters?: object;
  /**
   * @description 表格行 key 的取值，可以是字符串或一个函数
   */
  rowKey: string | ((record: any) => string);
  /**
   * @description 是否显示分页，默认为true，不需要分页传false
   * @type true | false
   * @default true
   */
  pagination?: PaginationProps; // 是否显示分页-默认显示
  /**
   * @description  一页的数量
   * @default 20
   */
  pageSize?: number;
  /**
   * @description  是否禁用分页
   * @default false
   */
  paginationDisabled: boolean;
  /**
   * @description  分页的额外配置，更多参数请参考 antd 的分页
   */
  paginationConfig?: object;
  /**
   * @description ant-table 的 expandable参数
   */
  expandable?: object;
  /**
   * @description 默认排序的字段
   * @type {order: asc | desc | undefined, orderBy: string}
   */
  defaultSorter?: defaultSorterProps; // 首次进入默认排序入参
  /**
   * @description 指定树形结构的列名
   * @default children
   */
  childrenColumnName?: string; // 指定树形结构的列名
  /**
   * @description  树结构表格默认是否展开
   * @default true
   */
  defaultExpandAll?: boolean; // 树结构表格默认是否展开，默认为true
  /**
    * @description  分页器左侧额外节点
    * @default --
    */
  paginationLeft?: ReactNode | (() => ReactNode);
  /**
   * @description  是否在当前页刷新，入参改变分页会回到第一页，如需要在当前页刷新，可以传true
   * @default false
   */
  refreshCurrent?: boolean;
  /**
   * @description 把column的底部占位符移除, ps: 如果table不需要 右上角的配置模块，就设置为true
   * @default false
   */
  hideColumnPlaceholder?: boolean;
  /**
   * @description 特殊参数whiteTooltip，默认false，true时变成白色tooltip，并不被文本tip掌控。columns其他参数请查看ant table columns
   */
  defaultColumns?: ColumnsType[];
  /**
   * @description 列表项配置模块样式
   */
  tableSortStyle: React.CSSProperties;
  /**
   * @description 动态表单moduleKey，必须同步维护至 https://yapi.lanhanba.com/project/378/interface/api/46017，注意此功能需要培训，请联系组内其他前端或上级管理。
   */
  tableSortModule?: string;
  /**
   * @description 是否开启可拖拽功能, 性能问题很严重，谨慎使用
   */
  useResizable?: boolean;
  /**
   * @description  表格是否可滚动，也可以指定滚动区域的宽、高，详情可参考antd的scroll
   * @default { x: 'max-content' }
   */
  scroll?: { // 是否需要开启滚动
    x?: string | number,
    y?: string | number,
    scrollToFirstRowOnChange?: boolean,
  };
  /**
   * @description table样式模版 可选[base, easy]
   */
  type?: string;
  /**
   * @description 批量操作按钮组,ButtonProps参考ant button
   */
  rowSelectionOperate?: rowSelectionOperateProps[];
  /**
   * @description 特殊操作需要手动控制批量按钮时，传入的已选中项场地。大于0时，才会显示
   */
  specialSelectedRowKeysLength?: number;
  /**
   * @description 支持boolean和ReactNode、Element、String。为true时：仅做无数据居中显示，其他保有true的作用，且可作为empty文案 slot
   */
  emptyRender?: any;
  /**
   * @description 是否锁定带有fixed参数的项的width，使用defaultColumns里的width值
   * @default true
   */
  lockFixedWidth?: boolean;
  /**
   * @description 提供columnRender使用的外部导入的动态参数
   */
  columnRenderDynamicConf?: any;
  /**
   * @description 是否是在V2from下使用，如果为true，则会有一套制定的适配样式载入
   * @default false
   */
  inv2form?: boolean;
  /**
   * @description 是否显示批操作列（包含选中计数）
   * @default true
   */
  showBatchOperate?: Boolean;
  /**
   * @description 表格行的类名
   */
  rowClassName?: (record: any, index: number) => string;
}

const TableApi: React.FC<FilteredTableProps> = () => {
  return <></>;
};

export default TableApi;
