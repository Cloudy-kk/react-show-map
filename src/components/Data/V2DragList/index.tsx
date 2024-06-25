import React, { useEffect, useImperativeHandle, useMemo, useState } from 'react';
import './index.global.less';
import cs from 'classnames';
import {
  SortableContainer,
  SortableElement,
  SortableHandle,
} from 'react-sortable-hoc';
import { arrayMoveImmutable } from 'array-move';
import { Checkbox, Typography } from 'antd';
import { useMethods } from '@lhb/hook';
import IconFont from '../../Base/IconFont';
import V2Message from '../../Others/V2Hint/V2Message';
import { deepCopy } from '@lhb/func';
import { usePopContainer } from '../../config-v2';
export interface V2DragListHandles {
  /**
   * @description 手动初始化数据
   */
  init: (data: DataProps[]) => void;
}
export interface DataProps {
  title?: string;
  dragDisabled?: boolean;
  dragChecked?: boolean;
  editDisabled?: boolean;
  deleteDisabled?: boolean;
  fixed?: string;
  [p:string]: any;
}
export interface V2DragListProps {
  /**
   * @description 初始化数据，仅加载一次
   */
  data: DataProps[];
  /**
   * @description 更新 `data` 的方法, 如果有需要手动调用 init 的时候，就必须要传入，不调用时，可以不穿
   */
  setData?: any;
  /**
   * @description 类名
   */
  className?: string;
  /**
   * @description 更新回调 (data) => {}
   */
  onChange?: Function;
  /**
   * @description 移除回调 (targetItem, index, items) => {}
   */
  onDelete?: Function;
  /**
   * @description (无论单选还是多选)选中后回调 (index) => {}，支持异步 () => Promise.reslove()
   */
  onChecked?: Function;
  /**
   * @description 编辑按钮回调 (targetItem, index) => {}
   */
  onEdit?: Function;
  /**
   * @description 是否可置顶
   * @default true
   */
  useStick?:boolean;
  /**
   * @description 是否可删除
   * @default true
   */
  useDelete?: boolean;
  /**
   * @description 是否可编辑
   * @default true
   */
  useEdit?: boolean;
  /**
   * @description 是否开启多选模式
   * @default false
   */
  useChecked?:boolean;
  /**
   * @description 是否开启单选模式
   * @default false
   */
  useRadio?:boolean;
  /**
   * @description 是否隐藏拖拽按钮
   * @default false
   */
  noDrag?: boolean;
  /**
   * @description 是否固定显示icon
   * @default false
   */
  unHiddenIcon?:boolean;
  /**
   * @description ref
   */
  onRef?: any;
  /**
   * @description key的取值
   */
  titleKey?: string;
}
const IconFontStyle = {
  marginRight: '12px',
  color: '#666',
  fontSize: '14px',
};
// 拖动按钮
const DragHandle = SortableHandle(() => <IconFont style={{ color: '#666', fontSize: '14px' }} iconHref='pc-common-icon-ic_move' />);
/**
* @description 便捷文档地址
* @see https://reactpc.lanhanba.net/components/Data/v2drag-list
*/
const V2DragList: React.FC<V2DragListProps> = ({
  data,
  setData,
  onChange,
  onDelete,
  onChecked,
  onEdit,
  className,
  useStick = false,
  useEdit = false,
  useDelete = false,
  useRadio = false,
  useChecked = false,
  unHiddenIcon = false,
  noDrag = false,
  onRef,
  titleKey = 'title',
}) => {
  if (useRadio && useChecked) {
    V2Message.error('不能同时开启单选和多选模式');
  }
  const popContainer = usePopContainer();
  const [items, setItems] = useState<any[]>([]);
  const [disabledItems, setDisabledItems] = useState<any[]>([]);
  const [disabledBottomItems, setDisabledBottomItems] = useState<any[]>([]);
  const [isDragged, setIsDragged] = useState<boolean>(false);
  const methods = useMethods({
    changeSort(items) {
      setItems(items);
      onChange && onChange(disabledItems.concat(items, disabledBottomItems));
    },
    onSortStart() {
      setTimeout(() => {
        setIsDragged(true);
      });
    },
    onSortEnd({ oldIndex, newIndex }) {
      const _items = arrayMoveImmutable(items, oldIndex, newIndex);
      methods.changeSort(_items);
      setTimeout(() => {
        setIsDragged(false);
      });
    },
    toStick(index, e) {
      e.stopPropagation();
      const _items = arrayMoveImmutable(items, index, 0);
      methods.changeSort(_items);
    },
    toEdit(index, e) {
      e.stopPropagation();
      const _items = [...items];
      onEdit && onEdit(_items.splice(index, 1)?.[0], index);
    },
    async toDelete(index, e) {
      e.stopPropagation();
      const _items = [...items];
      const target = _items.splice(index, 1);
      if (onDelete) {
        await onDelete(target[0], index, _items);
      }
      methods.changeSort(_items);
    },
    toChecked(index) {
      const _items = deepCopy(items);
      _items[index].dragChecked = !_items[index].dragChecked;
      methods.changeSort(_items);
      onChecked && onChecked(index);
    },
    onLiClick(index) {
      if (useRadio) {
        const _items = items.map(item => ({
          ...item,
          dragChecked: false,
        }));
        _items[index].dragChecked = true;
        methods.changeSort(_items);
        onChecked && onChecked(index);
      }
    }
  });
  /* components */
  // 容器
  const Container = useMemo(() => {
    return SortableContainer<any>(({ children }) => {
      return <div>{children}</div>;
    });
  }, []);

  // 单项
  const SortableItem = useMemo(() => {
    return SortableElement<any>(({ value, sortIndex }) => {
      return (<div
        className={cs([
          'v2DragLi',
          unHiddenIcon && 'v2DragLiUnHidden',
          isDragged && 'v2DragLiUnMove',
          useRadio && items[sortIndex].dragChecked && 'v2DragRadioChecked'
        ])}
        onClick={() => methods.onLiClick(sortIndex)}
      >
        {/* 只有纯文案的时候存在溢出...的场景，checkbox的时候目前几乎不可能存在超长字段，所以暂时不用管 */}
        {
          !useChecked ? (
            <Typography.Text
              ellipsis={{
                tooltip: {
                  title: value,
                }
              }}
              style={{ flex: 1 }}
            >
              <>{value}</>
            </Typography.Text>
          ) : (
            <div>
              <Checkbox checked={items[sortIndex].dragChecked} onChange={() => methods.toChecked(sortIndex)}>
                {value}
              </Checkbox>
            </div>
          )
        }
        <div className='v2DragLiIcons' style={{ color: '#ccc' }}>
          {
            useEdit && !items[sortIndex].editDisabled && <IconFont iconHref='pc-common-icon-ic_edit' style={IconFontStyle} onClick={(e) => methods.toEdit(sortIndex, e)}/>
          }
          {
            useDelete && !items[sortIndex].deleteDisabled && <IconFont iconHref='pc-common-icon-ic_delete' style={IconFontStyle} onClick={(e) => methods.toDelete(sortIndex, e)}/>
          }
          {
            useStick && <IconFont iconHref='pc-common-icon-ic_top' style={IconFontStyle} onClick={(e) => methods.toStick(sortIndex, e)}/>
          }
          {
            !noDrag && <DragHandle />
          }
        </div>
      </div>);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, isDragged]);

  useEffect(() => {
    if (!items.length && !disabledItems.length && !disabledBottomItems.length) {
      setDisabledItems(data.filter(item => item.dragDisabled && item.fixed !== 'right'));
      setItems(data.filter(item => !item.dragDisabled));
      setDisabledBottomItems(data.filter(item => item.dragDisabled && item.fixed === 'right'));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useImperativeHandle(onRef, () => ({
    init(data) { // 手动初始化数据
      setDisabledItems(data.filter(item => item.dragDisabled && item.fixed !== 'right'));
      setItems(data.filter(item => !item.dragDisabled));
      setDisabledBottomItems(data.filter(item => item.dragDisabled && item.fixed === 'right'));
      setData && setData(data);
    }
  }));
  return (
    <div className={cs('v2DragList', className)}>
      {
        disabledItems.map((item, index) => (
          <div key={index} className='v2DragLi v2DragDisabled'>
            {
              !useChecked ? item[titleKey] : <div>
                <Checkbox checked={item.dragChecked} disabled>{item[titleKey]}</Checkbox>
              </div>
            }
          </div>
        ))
      }
      <Container
        onSortStart={methods.onSortStart}
        onSortEnd={methods.onSortEnd}
        useDragHandle
        helperContainer={popContainer}
      >
        {items.map((value, index) => (
          <SortableItem key={`item-${value[titleKey]}`} index={index} sortIndex={index} value={value[titleKey]} />
        ))}
      </Container>
      {
        disabledBottomItems.map((item, index) => (
          <div key={index} className='v2DragLi v2DragDisabled'>
            {
              !useChecked ? item[titleKey] : <div>
                <Checkbox checked={item.dragChecked} disabled>{item[titleKey]}</Checkbox>
              </div>
            }
          </div>
        ))
      }
    </div>
  );
};

export default V2DragList;
