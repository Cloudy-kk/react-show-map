/*
* version: 当前版本2.7.4
*/
import React, { useState } from 'react';
import styles from './index.module.less';
import cs from 'classnames';
import { Resizable } from 'react-resizable';
import { floorKeep } from '@lhb/func';

/**
 * 将column映射成对象形式
 * @param key 列的唯一标识，dataIndex或者key
 * @param parentKey 父层级,有父层级的情况，会默认使用-隔开
 */
export const getColumnKey = (key, parentKey) => {
  const result = Array.isArray(key) ? key.join('.') : key;
  return parentKey ? `${parentKey}-${result}` : result;
};

/**
 * 递归生成列的宽度映射对象
 * @param columns 表格的列
 * @param parentKey 父层级,有父层级的情况，会默认使用-隔开
 */
export const flattenDeepGetColumnKey = (columns, parentKey?: any) => {
  return columns.reduce((size, column) => {
    let newSize = { ...size };
    const columnKey = getColumnKey(column.dataIndex || column.key, parentKey);
    if (Array.isArray(column.children)) {
      const subSize = flattenDeepGetColumnKey(column.children, columnKey);
      newSize = { ...size, ...subSize };
    } else {
      newSize[columnKey] = column.width || 220;
    }
    return newSize;
  }, {});
};

export const ResizableTitle: React.FC<any> = (props) => {
  const { onResize, width, tableRef, resizeDividerRef, ...restProps } = props;
  // 添加偏移量
  const [offset, setOffset] = useState(0);
  // 添加显示线总偏移量
  const [dividerOffset, setDividerOffset] = useState(0);
  if (!width) {
    return <th {...restProps} />;
  }
  return (
    <Resizable
      className={styles.V2Resizable}
      width={Number(width) + Number(offset)}
      height={0}
      handle={
        <span
          className={cs([styles.V2ResizableDandle, 'v2ResizableDandle', offset && styles.V2ResizableDandleActive])}
          // 拖拽层偏移
          style={{ transform: `translateX(${offset}px)` }}
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
        />
      }
      onResizeStart={(e) => {
        const offset = tableRef.current.getBoundingClientRect().left;
        setDividerOffset(offset);
        // 显示拖拽线
        const newOffset = +floorKeep(e.target.getBoundingClientRect().left, offset, 1);
        resizeDividerRef.current.style.transform = `translateX(${newOffset + 5}px)`;
        resizeDividerRef.current.style.display = 'block';
      }}
      onResize={(_, targetNode) => {
        const newOffset = +floorKeep(targetNode.node.getBoundingClientRect().left, dividerOffset, 1);
        resizeDividerRef.current.style.transform = `translateX(${newOffset + 5}px)`;
        // 这里只更新偏移量，数据列表其实并没有伸缩
        setOffset(targetNode.size.width - width);
      }}
      // 拖拽结束更新
      onResizeStop={(...argument) => {
        // 拖拽结束以后偏移量归零
        setOffset(0);
        // 隐藏拖拽线
        resizeDividerRef.current.style.display = 'none';
        // 这里是props传进来的事件，在外部是列数据中的onHeaderCell方法提供的事件，请自行研究官方提供的案例
        onResize(...argument);
      }}
      draggableOpts={{ enableUserSelectHack: false }}
    >
      <th {...restProps} />
    </Resizable>
  );
};

