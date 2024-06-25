/*
* version: 当前版本2.15.5
*/
import React, { ReactNode, useEffect, useMemo, useState } from 'react';
import { Button, Dropdown } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import { ButtonProps } from 'antd/lib/button/button';
import cs from 'classnames';
import styles from './index.module.less';
import IconFont from '../../Base/IconFont';
import V2PopConfirm from '../V2PopConfirm';
import ExplicitBtn from './components/ExplicitBtn';
import { V2Confirm } from '../V2Confirm';
export interface OperateButtonProps extends ButtonProps {
  name: string;
  event: string;
  func?: string;
  isBatch?: boolean;
  hide?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
  usePopConfirm?: boolean;
  popConfirmContent?: string;
  useLoadingWidthAsync?: boolean;
}

export interface V2OperateProps {
  /**
   * @description 按钮列表
   */
  operateList: OperateButtonProps[]; // 操作按钮列表
  /**
    * @description 平铺的按钮，3个及以下按钮进行平铺，4个及以上平铺2个，其余收起到操作按钮
    * @default 3
    */
  showBtnCount?: number;
  /**
    * @description 点击按钮事件
    */
  onClick?: Function;
  /**
    * @description 更多按钮的位置，默认为end 收起按钮的样式默认为link(文本样式)， 如需改变样式，默认取列表最后一个的type
    */
  position?: 'front' | 'end'; // 收起的位置，默认为end
}
/**
* @description 便捷文档地址
* @see https://reactpc.lanhanba.net/components/others/v2operate
*/
const V2Operate: React.FC<V2OperateProps> = ({
  operateList = [],
  showBtnCount = 3,
  onClick,
  position = 'end',
}) => {
  const [operates, setOperates] = useState<OperateButtonProps[]>([]);
  useEffect(() => {
    if (operateList?.length) {
      setOperates([...operateList.filter((item) => !item.hide)]);
    } else if (operates?.length) {
      setOperates([]);
    }
  }, [operateList]);

  // 平铺的按钮
  const showOperate = useMemo(() => {
    return operates.slice(0, operates.length > showBtnCount ? showBtnCount - 1 : showBtnCount);
  }, [operates, showBtnCount]);

  // 更多的按钮显示在前面或者后面(默认为false，显示在最后)及更多的样式（默认为link）
  const { moreBtnPosition, moreBtnType = 'link' } = useMemo(() => {
    if (operates.length) {
      const btnPosition = position === 'front';
      const len = operates.length - 1;
      const moreItemType = operates[len].type;
      return {
        moreBtnPosition: btnPosition,
        moreBtnType: moreItemType,
      };
    } else {
      return {
        moreBtnPosition: false,
        moreBtnType: 'link',
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [operates]);

  // 需要折叠的按钮
  const dropDownOperate = useMemo(() => {
    // 小于则没有下拉
    if (operates.length < showBtnCount) {
      return [];
    }
    return operates.slice(
      operates.length > showBtnCount ? showBtnCount - 1 : showBtnCount,
      operates.length,
    );
  }, [operates, showBtnCount]);

  const handleMenuClick = async ({ key }: any, formDropdown?: boolean) => {
    const targetPermission = operates.find((permission) => permission.event === key);
    if (targetPermission) {
      // 如果来自下拉操作，并且开启了需要使用popConfirm功能，但是下拉这里不能用此功能，所以改为弹窗
      if (formDropdown && targetPermission.usePopConfirm) {
        if (targetPermission.usePopConfirm && !targetPermission.popConfirmContent) {
          console.error('V2Operate：气泡确认卡模式下，popConfirmContent必填');
        }
        V2Confirm({
          content: targetPermission.popConfirmContent,
          onSure() {
            const dispatchClick = targetPermission.onClick || onClick;
            dispatchClick && dispatchClick(targetPermission);
          }
        });
      } else {
        const dispatchClick = targetPermission.onClick || onClick;
        if (dispatchClick) {
          await dispatchClick(targetPermission);
        }
      }
    }
  };

  const menuList = useMemo(() => {
    return dropDownOperate.map((item) => ({
      label: item.name,
      key: item.event || item.name,
    }));
  }, [dropDownOperate]);

  const renderMoreBtn = (text) => {
    return (
      <Dropdown
        menu={{ items: menuList, onClick: (params) => handleMenuClick(params, true) }}
      >
        {
          moreBtnType === 'link'
            ? <Button type='link'>
              {text} <DownOutlined />
            </Button>
            : <Button style={{ paddingLeft: '5px', paddingRight: '5px' }} type='default'>
              <IconFont style={{ fontSize: '23px' }} iconHref='pc-common-icon-ic_btn_more1'></IconFont>
            </Button>
        }
      </Dropdown>
    );
  };
  return (
    <div className={cs(styles.V2Operate, 'lhb-v2-operate')}>
      {/* 更多按钮显示在前面 */}
      {moreBtnPosition && !!dropDownOperate.length && renderMoreBtn('更多')}
      {showOperate.map((item, index) => {
        if (item.usePopConfirm && !item.popConfirmContent) {
          console.error('V2Operate：气泡确认卡模式下，popConfirmContent必填');
        }
        const popConfirmContent: string = item.popConfirmContent || '';
        return item.usePopConfirm ? (
          <V2PopConfirm
            content={popConfirmContent}
            key={index}
            onOk={item.onClick ? item.onClick : () => handleMenuClick({ key: item.event })}>
            <ExplicitBtn
              item={item}
              handleMenuClick={handleMenuClick}
              btnNotClick
            />
          </V2PopConfirm>
        ) : (
          <ExplicitBtn
            item={item}
            key={index}
            handleMenuClick={handleMenuClick}
          />
        );
      })}
      {/* 更多按钮位置 */}
      {!moreBtnPosition && !!dropDownOperate.length && renderMoreBtn('更多')}
    </div>
  );
};

export default V2Operate;
