/*
* version: 当前版本2.15.5
*/
import React, { useState } from 'react';
import { Button } from 'antd';
import cs from 'classnames';
import styles from '../index.module.less';
const ExplicitBtn: React.FC<any> = ({
  item,
  btnNotClick = false,
  handleMenuClick,
  onClick
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const customOnClick = async () => {
    if (!btnNotClick) { // 如果是非popover下点击的，就走这套
      const myClick = item.onClick ? item.onClick : () => handleMenuClick({ key: item.event });
      if (item.useLoadingWidthAsync) {
        setLoading(true);
        await myClick();
        setLoading(false);
      } else {
        myClick();
      }
    } else { // 如果是popover下点击的，就触发默认的onClick事件，这事件是为了触发popover功能的
      onClick?.();
    }
  };
  return (
    <Button
      className={cs([
        item.type === 'ghost' && styles.v2Ghost,
        item.danger && 'V2OperateBtnDanger',
      ])}
      key={item.event || item.name}
      type={item.type || 'link'}
      icon={item.icon}
      disabled={item.disabled}
      loading={loading}
      // 如果有onClick事件则直接调用onClick事件，没有则调用统一的onClick事件
      onClick={customOnClick}
    >
      {item.name}
    </Button>
  );
};

export default ExplicitBtn;
