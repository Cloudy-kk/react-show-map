/* 将请求/分页/排序/参数改变封装到一起的table组件 */
/*
* version: 当前版本2.15.20
*/
/**
 * 注意:
 * onFetch必传，返回{ dataSource, count }，如无分页，count可不返回
 * 默认进入请求一次，如果分页直接点击分页即可；
 * 如需重新请求数据，变更filters，filters是个对象
 * useEffect监听filters是浅比较，只要重新setState filters的值(即使filters是个空对象)都会重新触发请求(分页回到第一页)
 * 直接在外部触发传入的onFetch不会生效，因为onFetch封装在handleChange里面，直接触发onFetch并不会触发handleChange，
 */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { MutableRefObject, ReactNode, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import './index.global.less';
import styles from './index.module.less';
import { Button, ButtonProps, ConfigProvider, Empty, Popover, Table, Typography } from 'antd';
import { Summary } from 'rc-table';
import V2Pagination from '../../Data/V2Pagination';
import cs from 'classnames';
import { TableColumnType, TableProps } from 'antd/lib/index';
import { TablePaginationConfig } from 'antd/lib/table/interface';
import { deepCopy, floorKeep, getTreeKeys, refactorColumns } from '@lhb/func';
import IconFont from '../../Base/IconFont';
import { ResizableTitle, flattenDeepGetColumnKey, getColumnKey } from './ResizableTitle';
import V2DragList, { V2DragListHandles } from '../V2DragList';
import { useColumns } from '@lhb/hook';
// 升级后需要注意这里是否需要改动
import { getConfigCustomField, postConfigCustomField } from '@/common/api/common';
import { emptyRenderDefault, pageConfig } from '../../config-v2';
const DEFAULT_OBJECT: any = {};

type RecordType = any;
interface defaultSorterProps {
  order: string;
  orderBy: string;
}
export interface V2TableHandles {
  /**
   * @description 数据渲染函数
   */
  onload: (isCurPage?: boolean) => void;
}
export interface FetchData {
  dataSource: Array<Record<string, any>>;
  count?: number;
}

type PaginationProps = boolean & TablePaginationConfig;

export interface V2TableProps extends TableProps<RecordType> {
  bordered?: boolean; // 是否显示table的表格线
  onFetch: (params?: object) => Promise<FetchData>;
  className?: string;
  filters?: object;
  rowKey: string;
  pagination?: PaginationProps; // 是否显示分页-默认显示
  pageSize?:number; // 分页大小-默认20
  paginationDisabled?: boolean;
  paginationConfig?: object;
  expandable?: object; // ant-table 的 expandable参数
  defaultSorter?: defaultSorterProps; // 首次进入默认排序入参
  childrenColumnName?: string; // 指定树形结构的列名
  defaultExpendAll?: boolean; // 树结构表格默认是否展开，默认为true
  paginationLeft?: ReactNode | (() => ReactNode);
  refreshCurrent?: false; // 当前页刷新
  hideColumnPlaceholder?: boolean; // 把column的底部占位符移除
  defaultColumns: any;
  tableSortStyle?: any; // 是否需要列表项配置模块
  tableSortModule?: string; // moduleKey
  useResizable?: boolean; // 是否开启可拖拽功能, 性能问题很严重，官网建议单页不超过10条数据时使用
  scroll?: { // 是否需要开启滚动，详情可参考antd的scroll
    x?: string | number,
    y?: string | number,
    scrollToFirstRowOnChange?: boolean,
  };
  type?: string; // [base, easy]
  rowSelectionOperate?: Array<{
    text: string,
    onClick: any,
    icon?: any,
    btnConfig?: ButtonProps
  }>;
  emptyRender?: any;
  specialSelectedRowKeysLength?: number;
  lockFixedWidth?: boolean;
  columnRenderDynamicConf?: any;
  components?: any;
  inv2form?: boolean;
  showBatchOperate?: boolean;
  rowClassName?: (record, index) => string
}
/**
* @description 便捷文档地址
* @see https://reactpc.lanhanba.net/components/Data/v2table
*/
const V2Table: any = React.forwardRef<any, V2TableProps>(
  (
    {
      onFetch,
      className = '',
      filters: extraFilters = DEFAULT_OBJECT,
      rowKey,
      bordered = true,
      defaultColumns,
      tableSortModule,
      tableSortStyle = {},
      rowSelection,
      rowSelectionOperate,
      pagination = true,
      pageSize = 20,
      paginationDisabled = false,
      paginationLeft,
      paginationConfig = {},
      expandable = undefined,
      defaultSorter = DEFAULT_OBJECT,
      childrenColumnName = 'children',
      scroll = { x: 'max-content' },
      defaultExpendAll = true,
      refreshCurrent = false,
      hideColumnPlaceholder = false,
      type = 'base',
      useResizable = false,
      emptyRender = emptyRenderDefault,
      specialSelectedRowKeysLength,
      lockFixedWidth = true,
      columnRenderDynamicConf,
      components,
      inv2form = false,
      showBatchOperate = true,
      rowClassName,
      ...props
    },
    ref
  ) => {
    // 提示警告
    if (hideColumnPlaceholder && useResizable) {
      console.error('请不要混用 useResizable 和 hideColumnPlaceholder');
    }

    const tableRef: MutableRefObject<any> = useRef(null); // v2tableInner target
    const _scroll = {
      x: 'max-content',
      ...scroll
    };
    const dragRef: MutableRefObject<V2DragListHandles | null> = useRef(null);
    const DEFAULT_PAGINATION = { [pageConfig.pageKey]: 1, [pageConfig.pageSizeKey]: pageSize }; // 初始化pagination

    // 防止内存泄漏
    const [alive, setAlive] = useState<boolean>(true);
    // 入参
    const [fields, setFields] = useState<any>({
      ...(pagination && DEFAULT_PAGINATION),
      ...defaultSorter,
    });

    // 返回值
    const [data, setData] = useState<any>({
      loading: true,
      dataSource: [],
      count: 0,
    });

    // 展开行
    const [expandedRowKeys, setExpandedRowKeys] = useState<any[]>([]);

    // 请求接口
    const handleChange = async (newValue: any) => {
      if (!alive) return; // 防止内存泄漏
      try {
        setData({ dataSource: [], count: 0, loading: true });
        const params = { ...newValue, ...extraFilters };
        params && setFields(params);
        const { dataSource, count } = await onFetch(params);
        setData({
          dataSource: dataSource,
          count,
          loading: false
        });
        // 根据dataSource中是否有children(默认是children)，来决定每次请求是否展开全部行
        const needExpendAll = dataSource.find((item) => item[childrenColumnName]);
        // 默认展开且为树状结构
        if (defaultExpendAll && needExpendAll) {
          const expandedRowKeys = getTreeKeys(dataSource, [], rowKey, childrenColumnName, false);
          setExpandedRowKeys(expandedRowKeys);
        }
        // 如果是有数据，但是因为当前page页没有数据，就再次向 page-1 的页面发起请求进行查询
        if (count && count > 0 && !dataSource?.length) {
          handleChange({
            [pageConfig.pageKey]: fields[pageConfig.pageKey] - 1,
            [pageConfig.pageSizeKey]: fields[pageConfig.pageSizeKey] || DEFAULT_PAGINATION[pageConfig.pageSizeKey]
          });
        }
      } catch (_err) {
        setData({ dataSource: [], count: 0, loading: false });
      }
    };
    // 排序
    const handleSorterChange = (_: any, __: any, sorter: any) => {
      const values = {
        ...fields,
        [pageConfig.pageKey]: refreshCurrent ? fields[pageConfig.pageKey] : 1,
        [pageConfig.pageSizeKey]: fields[pageConfig.pageSizeKey],
        orderBy: sorter.columnKey,
        order: sorter.column ? (sorter.order === 'ascend' ? 'asc' : 'desc') : undefined,
      };
      handleChange(values);
    };
    // 分页相关
    const handlePageNoChange = (value: any, pageSize: number) => {
      const values = {
        ...fields,
        [pageConfig.pageKey]: fields[pageConfig.pageSizeKey] === pageSize ? value : 1,
        [pageConfig.pageSizeKey]: pageSize,
      };
      handleChange(values);
    };
    // filter变化的时候重新请求数据
    useEffect(() => {
      setAlive(true);
      const params = {
        ...fields,
        ...(pagination && { [pageConfig.pageKey]: refreshCurrent ? fields[pageConfig.pageKey] : 1, [pageConfig.pageSizeKey]: fields[pageConfig.pageSizeKey] }),
      };
      handleChange(params);
      return () => {
        setAlive(false);
      };
    }, [extraFilters]);

    /* 操作列表配置弹窗 start */
    /* 动态表头相关 */
    const [confColumns, setConfColumns] = useState<any[]>([]);
    const [newColumn, setNewColumn] = useState(defaultColumns); // 为了给拖拽功能提供便利
    const [cacheTableSortConfigData, SetCacheTableSortConfigData] = useState<any[]>([]);
    const [cacheColumnsSize, setCacheColumnsSize] = useState<any>(); // 存储动态列表头的宽度数据，不直接存到confColumns是为了提高性能。
    const resizeDividerRef: MutableRefObject<any> = useRef(); // 拖拽的线 target，在ResizableTitle里通过直接操作dom，来增加性能。
    // 拖拽功能缓存
    const [columnSize, setColumnSize] = useState(useResizable ? () =>
      flattenDeepGetColumnKey(newColumn) : {}
    );
    const handleResize = useCallback(
      (key) => (e, { size }) => {
        const target: any = cacheTableSortConfigData.find(item => key === item.key);
        const imposeWidth = target?.dragMinWidth ? target?.dragMinWidth : 100;
        const _width = size.width ? (size.width < imposeWidth ? imposeWidth : size.width) : undefined;
        setColumnSize({
          ...columnSize,
          [key]: _width
        });
        if (tableSortModule) { // 存储功能需要有动态表头。
          const _cacheTableSortConfigData = [...cacheTableSortConfigData];
          const _cacheColumnsSize = {};
          _cacheTableSortConfigData.forEach(item => {
            if (item.key === key) {
              item.width = _width || 220;
            } else if (!item.width) {
              item.width = 220;
            }
            _cacheColumnsSize[item.key] = item.width;
          });
          setCacheColumnsSize(_cacheColumnsSize); // 存接口的时候，也要反向重置本地数据
          // 存到接口
          postConfigCustomField({
            module: tableSortModule,
            fields: JSON.stringify(_cacheTableSortConfigData)
          });
        }
      },
      [columnSize, cacheTableSortConfigData]
    );
    useEffect(() => {
      if (useResizable) {
        setNewColumn(newColumn.map(item => {
          return {
            ...item,
            width: columnSize[item.key]
          };
        }));
      }
    }, [columnSize]);
    const columns = useColumns(confColumns, newColumn);
    useEffect(() => {
      if (tableSortModule) {
        getConfigCustomField({
          module: tableSortModule
        }).then(({ fields }) => {
          const newConfColumns = refactorColumns(newColumn, fields, lockFixedWidth);
          if (useResizable) { // 开启拖拽功能才用
            const newColumnSize = {};
            newConfColumns.forEach(item => {
              if (item.width) {
                newColumnSize[item.key] = item.width;
              }
            });
            setColumnSize({
              ...columnSize,
              ...newColumnSize
            });
          }
          setConfColumns(newConfColumns);
        });
      }
    }, []);
    // 监听tableSortConfig.data的变化，开始缓存
    useEffect(() => {
      SetCacheTableSortConfigData(deepCopy(confColumns));
    }, [confColumns]);
    const [tableSortConfigVisible, setTableSortConfigVisible] = useState<boolean>(false);
    useEffect(() => {
      if (tableSortConfigVisible) {
        resetDragList();
      }
    }, [tableSortConfigVisible]);
    const resetDragList = () => {
      dragRef.current?.init(confColumns);
    };
    const saveDragList = () => {
      if (tableSortModule) {
        let _cacheTableSortConfigData = cacheTableSortConfigData;
        if (cacheColumnsSize) { // 本次进入页面后进行过拖拽操作。
          _cacheTableSortConfigData = _cacheTableSortConfigData.map(item => {
            return {
              ...item,
              width: cacheColumnsSize[item.key]
            };
          });
        }
        // 需要同时存储到接口里
        setConfColumns(_cacheTableSortConfigData);
        postConfigCustomField({
          module: tableSortModule,
          fields: JSON.stringify(_cacheTableSortConfigData)
        });
        setTableSortConfigVisible(false);
      }
    };
    const dragListChangeHandle = (data) => {
      SetCacheTableSortConfigData(data);
    };
    /* 操作列表配置弹窗 end */

    // 将load方法暴露给父组件，可在父组件中使用该方法
    useImperativeHandle(ref, () => ({
      onload: (isCurPage) =>
        handleChange(
          pagination
            ? {
              [pageConfig.pageKey]: isCurPage ? fields[pageConfig.pageKey] : 1,
              [pageConfig.pageSizeKey]: fields[pageConfig.pageSizeKey] || DEFAULT_PAGINATION[pageConfig.pageSizeKey],
            }
            : {}
        ),
    }));

    // columns的参数-只处理columns传入
    const addColumnDataIndex = (column: ColumnProps<any>) => {
      return {
        ...column,
        dataIndex: column.key as string | number, // 列数据在数据项中对应的路径-必须设置dataIndex，传入只需传入key，两个取相同字段
      };
    };

    // 渲染columns
    const renderColumnNode = (columns: Array<any>, isChildren: boolean, columnSize, handleResize, parentKey?: any) => {
      // 为列表拖拽配置按钮占位
      // const _columns = isChildren ? columns : columns.concat({
      //   isPlaceHolder: true
      // });
      let _columns = columns.map(item => {
        return {
          ...item
        };
      });
      if (!isChildren && !hideColumnPlaceholder) {
        const index = _columns.findIndex(item => { return item.fixed === 'right'; });
        if (index !== -1) { // 有右侧悬浮参数
          _columns.splice(index, 0, {
            isPlaceHolder: true
          });
          // 对最后一个右侧悬浮物，挂载一个className,用来加padding-right, 因为dragList的icon会挡住排序和筛选的图标
          const target = _columns[_columns.length - 1];
          if (target.sorter || target.filters) {
            if (_scroll?.y) {
              target.className = cs('V2TableFixV2DragListTD8px', _columns[_columns.length - 1].className);
            } else {
              target.className = cs('V2TableFixV2DragListTD', _columns[_columns.length - 1].className);
            }
          }
        } else {
          _columns = _columns.concat({
            isPlaceHolder: true
          });
        }
      }
      return _columns.map((column, index) => {
        if (column.width) {
          const _width = parseInt(column.width);
          if (_width < 100) {
            column.width = 100;
          }
        } else {
          column.width = 220;
        }
        if (column.isPlaceHolder) {
          column.width = undefined;
        }
        const rightOperateSlot = column.rightOperateSlot || [];
        const rightSafeWidth = rightOperateSlot.length ? floorKeep(rightOperateSlot?.length, 22, 3) : 0;
        const computedMaxWidth = (_column) => { // 计算内容溢出限制width
          let _maxWidth: any;
          if (hideColumnPlaceholder && !_column.importWidth) {
            _maxWidth = 'auto';
          } else {
            _maxWidth = +floorKeep(parseInt(_column.width), inv2form ? 18 : 34, 1);
            if (rightSafeWidth) {
              _maxWidth = +floorKeep(_maxWidth, rightSafeWidth, 1);
            }
          }
          return _maxWidth;
        };
        // 如果设置了最大为220，或者没有设置width，默认220
        // ui说，未来不会有多行，全部强制写死即可
        // 我靠，上面之句话，ui食言了，我不删就留个惊醒，信不过啊各位，一定要写灵活
        if (column.width) {
          // inv2form 下，ui设计的左右padding 为8px，border1px，所以减去 9X2 = 18px
          // 常规情况下 左右padding 为 16px，border1px，所以减去 17X2 = 34px
          if (!column.render) {
            column.render = (val, record, index) => {
              const ToolCom = (
                <Typography.Text
                  ellipsis={{ tooltip: column.noTooltip ? false : {
                    title: column.staticTooltipTitle ? (
                      typeof column.staticTooltipTitle === 'function' ? column.staticTooltipTitle(val, record, index, columnRenderDynamicConf) : column.staticTooltipTitle
                    ) : val,
                    overlayClassName: cs([styles.v2TableToolTip])
                  } }}
                  style={{ maxWidth: computedMaxWidth(column) }}
                ><>{val}</></Typography.Text>
              );
              return rightSafeWidth ? (
                <div className={styles.v2TableToolTipWrapper}>
                  {ToolCom}
                  <div className={styles.v2TableRightOperateSlot} style={{ width: rightSafeWidth }}>
                    {
                      column.rightOperateSlot.map((item, index2) => {
                        return (
                          <IconFont
                            key={index2}
                            iconHref={item.icon}
                            className={cs(styles.v2TableRightOperateSlotIcon, item.className)}
                            style={item.style}
                            onClick={() => item.onClick(val, record, index, columnRenderDynamicConf)}/>
                        );
                      })
                    }
                  </div>
                </div>
              ) : ToolCom;
            };
          } else {
            const _render = column.render;
            column.render = (val, record, index) => {
              const GetToolCom = () => {
                if (column.noControlled) {
                  return _render(val, record, index, columnRenderDynamicConf, {
                    maxWidth: computedMaxWidth(column)
                  });
                } else {
                  return (
                    <Typography.Text
                      ellipsis={{ tooltip: column.noTooltip ? false : {
                        title: column.staticTooltipTitle ? (
                          typeof column.staticTooltipTitle === 'function' ? column.staticTooltipTitle(val, record, index, columnRenderDynamicConf) : column.staticTooltipTitle
                        ) : (
                        // 只有白色背景。或者是强行要求render的样式被tooltip继承时，才使用带元素样式的值，否则都使用感觉的val
                          column.whiteTooltip || column.forceTooltipRender ? _render(val, record, index, columnRenderDynamicConf, {
                            maxWidth: computedMaxWidth(column)
                          }) : val
                        ),
                        overlayClassName: cs([styles.v2TableToolTip, column.whiteTooltip && styles.whiteStyle])
                      } }}
                      style={{ maxWidth: computedMaxWidth(column) }}
                    >
                      <>
                        {
                          _render(val, record, index, columnRenderDynamicConf, {
                            maxWidth: computedMaxWidth(column)
                          })
                        }
                      </>
                    </Typography.Text>
                  );
                }
              };
              return rightSafeWidth ? (
                <div className={styles.v2TableToolTipWrapper}>
                  {
                    GetToolCom()
                  }
                  <div className={styles.v2TableRightOperateSlot} style={{ width: rightSafeWidth }}>
                    {
                      column.rightOperateSlot.map((item, index2) => {
                        return (
                          <IconFont
                            key={index2}
                            iconHref={item.icon}
                            className={cs(styles.v2TableRightOperateSlotIcon, item.className)}
                            style={item.style}
                            onClick={() => item.onClick(val, record, index, columnRenderDynamicConf)}/>
                        );
                      })
                    }
                  </div>
                </div>
              ) : GetToolCom();
            };
          }
        }
        if (column.isPlaceHolder) {
          return (<Table.Column
            dataIndex={`placeHolder_${index}`}
            key={`placeHolder_${index}`}
          />);
        }
        /* 开启 useResizable时才需要使用的功能 start */
        const columnKey = useResizable ? getColumnKey(column.dataIndex || column.key, parentKey) : undefined;
        if (useResizable) {
          const width = column.children ? undefined : columnSize[columnKey];
          column.width = width;
          column.onHeaderCell = () => ({
            width,
            onResize: handleResize(columnKey),
            resizeDividerRef,
            tableRef
          });
        }
        /* 开启 useResizable时才需要使用的功能 end */
        // eslint-disable-next-line react/jsx-key
        return (<Table.Column {...addColumnDataIndex(column)}>
          {column.children && renderColumnNode(column.children, true, columnSize, handleResize, columnKey)}
        </Table.Column>);
      });
    };

    const onExpand = (expanded: boolean, record: { [x: string]: any }) => {
      const key = record[rowKey];
      const arr = expandedRowKeys.slice();
      const targetIndex = arr.findIndex((item) => item === record[rowKey]);
      if (expanded) {
        arr.push(key);
      } else {
        arr.splice(targetIndex, 1);
      }
      setExpandedRowKeys(arr);
    };

    const tableRowClassName = (_, index) => {
      const extra = rowClassName ? rowClassName(_, index) : undefined;
      return cs(index % 2 === 1 ? 'custom-ant-table-single-row' : '', extra);
    };

    const customizeRenderEmpty = (className) => (
      data.loading ? <div style={{ height: '202px', width: '100%' }}></div> : <Empty
        className={className}
        image='https://staticres.linhuiba.com/assets/img/empty.png'
        description={
          <span style={{ color: '#222', fontSize: '14px' }}>
            {emptyRender && typeof emptyRender !== 'boolean' ? emptyRender : '暂无内容'}
          </span>
        }
      />
    );
    return (
      <>
        {/* 存在checkbox多选时，需要有个显示选中数量列，然后table的scroll是需要做相关的 _scroll.y 计算 */}
        { showBatchOperate && (specialSelectedRowKeysLength || (rowSelection?.type === 'checkbox' && rowSelection.selectedRowKeys?.length)) ? <div className={styles.v2TableSelected}>
          <span className={styles.v2TableSelectedText}>
            已选中<span className={styles.v2TableSelectedNum}>{specialSelectedRowKeysLength || rowSelection?.selectedRowKeys?.length}</span>项
          </span>
          {rowSelectionOperate?.map((item, index) => {
            return <Button key={index} className={cs(styles.v2TableSelectedBtn, 'v2TableSelectedBtn')} icon={item.icon} onClick={item.onClick} {...item.btnConfig}>{item.text}</Button>;
          })}
        </div> : undefined }
        <div
          className={cs(styles.v2Table, 'lhb-v2-table', className, [
            type === 'easy' && styles.v2TableEasy,
            emptyRender && styles.v2TableEmptyRender,
            fields[pageConfig.pageSizeKey] && fields[pageConfig.pageSizeKey] >= 100 && 'lhb-v2-table-performance', // 超过100行，就开启高性能模式，放弃部分动画效果
          ])}
          ref={ref}
        >
          <div ref={tableRef} className={styles.v2TableInner}>
            <ConfigProvider renderEmpty={customizeRenderEmpty}>
              <Table
                {...props}
                rowKey={rowKey}
                bordered={bordered}
                loading={data.loading}
                dataSource={data.dataSource}
                pagination={false}
                // 如果设置了scroll.y 且设置了rowSelection.type === 'checkbox' 且 存在勾选中的项就把这40的高度算进去
                scroll={(specialSelectedRowKeysLength || (rowSelection?.type === 'checkbox' && rowSelection.selectedRowKeys?.length)) && typeof _scroll?.y === 'number' ? {
                  ..._scroll,
                  y: _scroll.y - 40,
                  x: !data.count ? undefined : _scroll.x
                } : {
                  ..._scroll,
                  x: !data.count ? undefined : _scroll.x
                }}
                showSorterTooltip={false}
                rowSelection={rowSelection}
                childrenColumnName={childrenColumnName}
                rowClassName={tableRowClassName}
                components={useResizable ? {
                  header: {
                    cell: components?.header?.cell ? components?.header?.cell : ResizableTitle,
                    row: components?.header?.row,
                    wrapper: components?.header?.wrapper,
                  },
                } : components}
                expandable={{
                  expandedRowKeys,
                  onExpand,
                  // 只有需要折叠操作的table，才开始iconfont替换
                  expandIcon: expandable ? ({ expanded, onExpand, record }) =>
                    expanded ? (
                      <IconFont style={{ color: '#AAAAAA' }} iconHref='pc-common-icon-ic_open' onClick={e => onExpand(record, e)} />
                    ) : (
                      <IconFont style={{ color: '#AAAAAA' }} iconHref='pc-common-icon-a-ic_fold' onClick={e => onExpand(record, e)} />
                    ) : undefined,
                  ...expandable,
                }}
                onChange={handleSorterChange}
              >
                {/* 如果传入是columns则使用columns 否则渲染children(与table用法一致) */}
                {(columns && Array.isArray(columns) && renderColumnNode(columns, false, columnSize, handleResize))}
              </Table>
            </ConfigProvider>
            {emptyRender && !data?.dataSource?.length ? customizeRenderEmpty(styles.customEmpty) : undefined}
            {/* 拖拽宽度所需要的一条分割线，贯穿thead和tbody */}
            <div ref={resizeDividerRef} className={styles.V2ResizableDivider}></div>
          </div>
          {pagination && (
            <V2Pagination
              current={fields[pageConfig.pageKey]}
              pageSize={fields[pageConfig.pageSizeKey]}
              total={data.count}
              disabled={paginationDisabled || data.loading}
              onChange={handlePageNoChange}
              extraPagination={paginationLeft}
              className={styles.v2TablePagination}
              {...paginationConfig}
            />
          )}
          {
            // 如果了key才会有配置模块
            tableSortModule && <>
              {/* 如果设置了滚动范围，就要额外处理icon的位置 */}
              <div className={cs(styles.v2TableSortConfig, _scroll?.y ? styles.v2TableSortConfigScroll : '')} style={tableSortStyle}>
                <Popover
                  overlayClassName='v2TableSortConfigPop'
                  arrowPointAtCenter
                  placement='bottomRight'
                  open={tableSortConfigVisible}
                  onOpenChange={setTableSortConfigVisible}
                  content={
                    <>
                      <V2DragList
                        onRef={dragRef}
                        className={cs(cacheTableSortConfigData?.length > 9 ? 'v2TableSortConfigDragListScroll' : '')}
                        onChange={dragListChangeHandle}
                        useStick
                        useChecked
                        data={cacheTableSortConfigData}
                        setData={SetCacheTableSortConfigData}
                      />
                      <div className='v2TableSortConfigPopBtn'>
                        <ConfigProvider autoInsertSpaceInButton={false}>
                          <Button className='v2TableSortConfigPopSave' size='small' type='primary' onClick={saveDragList}>保存</Button>
                          <Button className='v2TableSortConfigPopReset' size='small' onClick={resetDragList}>重置</Button>
                        </ConfigProvider>
                      </div>
                    </>
                  }
                  trigger='click'
                >
                  <div style={{ width: '100%', height: '100%', fontSize: '14px' }}>
                    <IconFont iconHref='pc-common-icon-ic_field'/>
                  </div>
                </Popover>
              </div>
            </>
          }
        </div>
      </>
    );
  },
);

interface ColumnProps<RecordType> extends TableColumnType<RecordType> {
  children?: any;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function Column<RecordType>(_: ColumnProps<RecordType>) {
  return null;
}

interface ColumnGroupProps<RecordType> extends Omit<TableColumnType<RecordType>, 'children'> {
  children:
  | React.ReactElement<ColumnProps<RecordType>>
  | React.ReactElement<ColumnProps<RecordType>>[];
}

/* istanbul ignore next */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function ColumnGroup<RecordType>(_: ColumnGroupProps<RecordType>) {
  return null;
}

V2Table.Column = Column;
V2Table.ColumnGroup = ColumnGroup;
V2Table.Summary = Summary;
V2Table.displayName = 'V2Table';
export default V2Table;
