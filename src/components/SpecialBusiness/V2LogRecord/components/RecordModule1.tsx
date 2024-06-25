import React from 'react';
import styles from '../index.module.less';
import cs from 'classnames';
import { Steps } from 'antd';
import IconFont from '../../../Base/IconFont';

const RecordModule1: React.FC<any> = ({
  className,
  items
}) => {
  return (
    <Steps
      className={cs([styles.V2LogRecord, styles.V2LogRecordModule1, className])}
      progressDot={(_, { status }) => {
        console.log(111, status);
        return (
          status === 'finish' ? <IconFont className={styles.V2LogRecordDot} iconHref='pc-common-icon-ic_liucheng_gaoliang'/> : <IconFont className={styles.V2LogRecordDot} iconHref='pc-common-icon-ic_liucheng_unselect'/>
        );
      }}
      direction='vertical'
      items={items.map(item => {
        return {
          title: <>
            <div className={styles.V2LogRecordTitle}>
              <div className={styles.V2LogRecordLeft}>
                <div className={styles.V2LogRecordLeftInner}>
                  <div>{item.name}</div>
                  <div>
                    {item.titleExtra}
                  </div>
                </div>
              </div>
              <div className={styles.V2LogRecordRight}>{item.time}</div>
            </div>
            <div>{item.middleExtra}</div>
          </>,
          description: item.description,
          status: item.status || 'wait',
        };
      })}
    />
  );
};

export default RecordModule1;
