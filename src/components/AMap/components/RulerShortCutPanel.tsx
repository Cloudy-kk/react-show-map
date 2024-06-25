
/**
 * @Description 测距工具快捷面板
 */
import IconFont from '@/common/components/IconFont';
import styles from './index.module.less';
import cs from 'classnames';
import { rulers } from '../ts-config';
import { message } from 'antd';

const RulerShortCutPanel = ({
  rulering, // 测距状态
  rulerType, // 测距类型
  setRulerType, // 更新测距类型 0：关闭测距
  setIsShowPanel, // 是否显示快捷面板
  setIsCheckInsideMapOperate,
}) => {

  const onClose = () => {
    setRulerType(0);
    setIsShowPanel(false);
    setIsCheckInsideMapOperate?.(false);
  };
  const onChange = (type) => {
    if (rulering) {
      message.warning('请先结束本次测距!');
      return;
    }; // 测距状态中不允许切换类型
    setRulerType(type);
  };
  return (
    <>
      <div
        className={styles.shortcutPanel
        }>
        <div className={styles.shortcut}>
            测距快捷面板
          <IconFont
            onClick={onClose}
            iconHref='pc-common-icon-ic_closeone'
            style={{ width: '7px', height: '7px' }} />
        </div>
        <span className={styles.line} />
        <div className={styles.panel}>
          {rulers.map((item) => (
            <div
              key={item.type}
              className={
                cs(styles.panelItem,
                  rulerType === item.type ? 'c-006' : 'c-132')}
              onClick={() => onChange(item.type)} // 变更测距类型
            >
              <div className={styles.icon} style={{
                borderColor: rulerType === item.type ? '#006aff' : '#ddd' }}>
                <IconFont
                  iconHref={item.icon}
                  style={{ width: '16px', height: '16px' }} />
              </div>
              <span>{item.name}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default RulerShortCutPanel;
