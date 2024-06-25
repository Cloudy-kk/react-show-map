/*
* 当前版本：2.15.5
*/
import React, { ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import cs from 'classnames';
import styles from './index.module.less';
import treeStyles from '../V2FormTreeSelect/index.module.less';
import { Checkbox, Col, Row, Tree } from 'antd';
import V2DragList from '../../Data/V2DragList';
import V2FormInput, { V2FormInputProps } from '../V2FormInput/V2FormInput';
import V2Message from '../../Others/V2Hint/V2Message';
import { useMethods } from '@lhb/hook';
import { unstable_batchedUpdates } from 'react-redux/es/utils/reactBatchedUpdates';
import { deepCopy, isArray, recursionEach } from '@lhb/func';

export interface treeConfigProps {
  /**
   * @description 自定义节点 label、id、children 的字段
   */
  fieldNames?: object;
  /**
   * @description 默认展开所有树节点
   */
  defaultExpandAll?: boolean;
  /**
   * @description 默认展开指定的树节点
   */
  defaultExpandedKeys?: string[];
}
export interface customTitleProps {
  left?: (selectNum, totalNum) => ReactNode,
  right?: (selectNum, totalNum) => ReactNode,
}
export interface V2TransferProps {
  /**
   * @description 额外插入的外层class
   */
  className?: string;
  /**
   * @description 颜色变化后触发的回调
   */
  onChange?: Function;
  /**
   * @description 左侧树节点选择完全受控（父子节点选中状态不再关联）
   */
  checkStrictly?: boolean;
  /**
   * @description checkStrictly = false 前提下，onChange返回的数据是否需要携带上级组件的id
   */
  needFullKeys?: boolean;
  /**
   * @description 默认选中的树节点
   */
  defaultCheckKeys?: string[];
  /**
   * @description treeNodes 数据,默认格式 [{label, id, children}]
   */
  treeData?: object[];
  /**
   * @description 左侧配置项
   */
  treeConfig?: treeConfigProps;
  /**
   * @description 左侧配置项
   */
  customTitle?: customTitleProps;
  /**
   * @description 是否隐藏拖拽按钮
   */
  noDrag?: boolean;
  /**
   * @description 是否显示清空按钮
   */
  showClearAll?: boolean;
  /**
   * @description 左侧搜索框配置项
   */
  inputConfig?: V2FormInputProps
  /**
   * @description 右侧label使用自定义展示字段`customLabel`, 不会影响左侧展示
   */
  rightUseCustomLabel?: boolean;
}
/**
* @description 便捷文档地址
* @see https://reactpc.lanhanba.net/components/form/v2transfer
*/
const V2Transfer: React.FC<V2TransferProps> = ({
  defaultCheckKeys,
  treeData,
  treeConfig,
  className,
  onChange,
  checkStrictly = false,
  needFullKeys = false,
  customTitle = {},
  noDrag = false,
  showClearAll = true,
  inputConfig,
  rightUseCustomLabel = false
}) => {
  const rightDrag: any = useRef(null);
  const [searchValue, setSearchValue] = useState<string>('');
  const [fullList, setFullList] = useState<any>(); // 用来缓存的初始化treeData数据
  const [fullMap, setFullMap] = useState<any>({}); // 用来缓存的初始化treeData value => nodePaths数据
  const [rightData, setRightData] = useState<any[]>([]); // 选中测列表
  const [checkedKeys, setCheckedKeys] = useState<React.Key[]>(); // 已选中的key值
  const [expandedKeys, setExpandedKeys] = useState<any[]>();
  const [checkedList, setCheckedList] = useState<any[]>([]); // search状态下，checkbox列的选中状态
  const methods = useMethods({
    onExpand(expandedKeys) {
      setExpandedKeys(expandedKeys);
    },
    // 左侧操作
    onCheck(checkedKeysValue) {
      // 如果是checkStrictly下，onCheck原始结构为 {checked, halfChecked}。否则是 <string| number>[]
      // 为了方便我们自身的search组件（不管啥状态都是 <string| number>[]）
      // 也为了方便兼容 checkStrictly 和非 checkStrictly，做了以下判断
      const _checkedKeysValue = isArray(checkedKeysValue) ? checkedKeysValue : checkedKeysValue.checked;
      const newData: any = [];
      if (_checkedKeysValue?.length) { // 只存最下级子节点选中项
        recursionEach(fullList, 'children', (item) => { // 这里用全量数据，避免数据丢失
          const sortIndex = _checkedKeysValue.indexOf(item.id);
          if (sortIndex !== -1) {
            newData.push({
              ...item,
              sortIndex
            });
          }
        }, !checkStrictly);
        newData.sort((a, b) => a.sortIndex - b.sortIndex);
      }
      unstable_batchedUpdates(() => {
        setCheckedKeys(newData.map(item => item.id)); // 左侧tree相关操作，会统一在切换成search时，进行数据导入，不需要单独做
        methods.resetRightData(newData);
      });
    },
    /* 右侧操作 */
    resetRightData(data) {
      setRightData(data);
      rightDrag.current && rightDrag.current.init(data);
    },
    onRightChange(items) {
      unstable_batchedUpdates(() => {
        setRightData(items);
        setCheckedKeys(items.map(item => item.id));
      });
    },
    onRightDelete(e, _, _items) { // 删除一项
      if (checkedKeys?.length) {
        const _checkedKeys = deepCopy(checkedKeys);
        const index = _checkedKeys.indexOf(e.id);
        _checkedKeys.splice(index, 1);
        unstable_batchedUpdates(() => {
          setCheckedKeys(_checkedKeys);
          setCheckedList(_checkedKeys);
          setRightData(_items);
        });
      }
    },
    onClearAll() {
      unstable_batchedUpdates(() => {
        if (rightData.find(item => item.deleteDisabled)) {
          V2Message.info('部分不可删除项未被删除');
        }
        const newDate = rightData.filter(item => item.deleteDisabled) || [];
        const keys = newDate.map(item => item.id);
        methods.resetRightData(newDate);
        setCheckedKeys(keys); // 重置 tree选中列表
        setCheckedList(keys); // 重置 search状态的 CheckedGroup选中列表
      });
    },
    onSearchChecked(checkedValue) { // search状态下，左侧checkedGroup的操作变更
      let newCheckedKeys = deepCopy(checkedKeys);
      if (checkedList?.length > checkedValue?.length) { // 删除一项
        const target = checkedList.find(item => !checkedValue.includes(item));
        newCheckedKeys = newCheckedKeys?.filter(item => item !== target);
      } else { // 新增一项
        const target = checkedValue[checkedValue.length - 1];
        newCheckedKeys?.push(target);
      }
      methods.onCheck(newCheckedKeys);
      setCheckedList(checkedValue);
    }
  });
  // search的时候用的
  const dynamicSearchData = useMemo(() => {
    if (searchValue) { // 把所有的最下级子节点给统筹起来，作为一个list
      const newData: any[] = [];
      const newCheckList: any[] = [];
      recursionEach(fullList, 'children', (item) => {
        if (item.label.indexOf(searchValue) > -1) {
          newData.push(item);
          if (checkedKeys?.includes(item.value)) {
            newCheckList.push(item.value);
          }
        }
      }, !checkStrictly);
      setCheckedList(newCheckList);
      return newData;
    } else { // 搜不到就没有呗
      return [];
    }
  }, [fullList, searchValue]);
  useEffect(() => {
    if (treeData?.length) {
      const newData: any = []; // 右侧选中默认数据
      const newFullMap: any = deepCopy(fullMap); // 存储的映射表
      if (treeConfig?.fieldNames) { // 把入参合并成我组件想要的参数，即 label,id,children
        const treeFieldNames = { title: 'label', key: 'id', children: 'children' };
        Object.assign(treeFieldNames, treeConfig?.fieldNames);
        const _expandedKeys: any[] = [];
        recursionEach(treeData, treeFieldNames.children, (item) => {
          item.label = item[treeFieldNames.title];
          item.id = item[treeFieldNames.key];
          item.children = item[treeFieldNames.children];
          // 特殊处理
          if (checkStrictly) { // 可以选父级
            if (defaultCheckKeys?.includes(item.id)) {
              newData.push({
                ...item,
                sortIndex: defaultCheckKeys.indexOf(item.id)
              });
            }
          } else { // 最下级子节点
            if (!item.children && defaultCheckKeys?.includes(item.id)) {
              newData.push({
                ...item,
                sortIndex: defaultCheckKeys.indexOf(item.id)
              });
            }
          }
          _expandedKeys.push(item.id);

          // 在这里进行 needFullKeys 所学的数据缓存
          if (item.parentId) {
            newFullMap[item.id] = [item.id].concat(newFullMap[item.parentId]);
          } else {
            newFullMap[item.id] = [item.id];
          }
        });
        // 这里对展开全部和展开部分进行拦截
        if (treeConfig.defaultExpandAll) {
          setExpandedKeys(_expandedKeys);
        } else if (treeConfig.defaultExpandedKeys) {
          setExpandedKeys(treeConfig.defaultExpandedKeys);
        }
      }
      unstable_batchedUpdates(() => {
        setCheckedKeys(defaultCheckKeys);
        setFullList(treeData);
        setFullMap(newFullMap);
        methods.resetRightData(newData.sort((a: any, b: any) => a.sortIndex - b.sortIndex));
      });
    }
  }, [defaultCheckKeys, treeData]);
  useEffect(() => {
    if (fullList) {
      let res = checkedKeys || [];
      if (!checkStrictly && needFullKeys) {
        res = [];
        checkedKeys?.forEach(item => {
          res = res?.concat(fullMap[item]);
        });
        res = res.filter((item, index) => res.indexOf(item) === index);
      }
      onChange && onChange(res);
    }
  }, [checkedKeys]);
  return (
    <div className={cs(styles.V2Transfer, className)}>
      <Row className={cs(styles.V2TransferWrapper, treeStyles.V2FormTreeSelect, styles.V2TransferWrapperSearch)}>
        <Col span={12} className={cs(styles.V2TransferCol, styles.V2TransferMainLeft)}>
          <div className={styles.V2TransferMain}>
            <div className={cs(styles.V2TransferMainHead)}>
              {
                customTitle?.left ? (
                  <div style={{ lineHeight: '32px' }}>
                    { customTitle?.left(rightData?.length, fullList?.length) }
                  </div>
                ) : (<V2FormInput placeholder='请输入搜索信息' {...inputConfig} onChange={(v) => setSearchValue(v.target.value)}/>)
              }
            </div>
            <div className={styles.V2TransferMainList}>
              <div style={{ display: searchValue ? 'none' : 'block' }}>
                <Tree
                  checkable
                  selectable={false}
                  expandedKeys={expandedKeys}
                  checkedKeys={checkedKeys}
                  onCheck={methods.onCheck}
                  onExpand={methods.onExpand}
                  treeData={fullList}
                  fieldNames={{ title: 'label', key: 'id', children: 'children' }}
                  checkStrictly={checkStrictly}
                />
              </div>
              <Checkbox.Group
                className={styles.V2V2TransferSearchList}
                style={{ display: searchValue ? 'block' : 'none' }}
                value={checkedList}
                onChange={methods.onSearchChecked}
              >
                <Row>
                  {
                    dynamicSearchData.map((item, index) => {
                      return (
                        <Col key={index} span={24} style={{ lineHeight: '32px' }}>
                          <Checkbox value={item.value}>{item.label}</Checkbox>
                        </Col>
                      );
                    })
                  }
                </Row>
              </Checkbox.Group>
            </div>
          </div>
        </Col>
        <Col span={12} className={cs(styles.V2TransferCol, styles.V2TransferMainRight)}>
          <div className={styles.V2TransferMain}>
            <div className={styles.V2TransferMainHead}>
              <div className={styles.V2TransferTitle}>
                <div className={styles.V2TransferTitleLeft}>
                  {
                    customTitle?.right ? customTitle?.right(rightData?.length, fullList?.length) : <>已选:{rightData?.length || 0}个</>
                  }
                </div>
                {
                  showClearAll && (
                    <div className={styles.V2TransferTitleRight} onClick={methods.onClearAll}>
                      清空
                    </div>
                  )
                }
              </div>
            </div>
            <div className={styles.V2TransferMainList}>
              <V2DragList
                onRef={rightDrag}
                useDelete
                titleKey={rightUseCustomLabel ? 'rightCustomLabel' : 'label'}
                noDrag={noDrag}
                data={rightData}
                setData={setRightData}
                onChange={methods.onRightChange}
                onDelete={methods.onRightDelete}
              />
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default V2Transfer;
