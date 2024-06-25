import React from 'react';
import styles from '../index.module.less';
import cs from 'classnames';
import { Steps } from 'antd';
import IconFont from '../../../Base/IconFont';

const RecordModule2: React.FC<any> = ({
  className,
  items
}) => {
  const getItems = () => {
    const newItems: any[] = [];
    items.forEach(item => {
      item.children?.forEach((item2, index2) => {
        newItems.push({
          date: !index2 ? item.date : undefined,
          status: item2.status || item.status,
          ...item2
        });
      });
    });
    return newItems;
  };
  return (
    <Steps
      className={cs([styles.V2LogRecord, styles.V2LogRecordModule2, className])}
      progressDot={(_, { status }) => {
        return (
          status === 'finish' ? <IconFont className={styles.V2LogRecordDot} iconHref='pc-common-icon-ic_liucheng_gaoliang'/> : <IconFont className={styles.V2LogRecordDot} iconHref='pc-common-icon-ic_liucheng_unselect'/>
        );
      }}
      direction='vertical'
      items={getItems()?.map(item => {
        return {
          title: <>
            <div className={styles.V2LogRecordTitle}>
              <div className={styles.V2LogRecordTime}>{item.time}</div>
              <div className={styles.V2LogRecordName}>{item.name}</div>
              <div className={styles.V2LogRecordContent}>{item.description}</div>
              <div>{item.titleExtra}</div>
            </div>
            <div className={styles.V2LogRecordDate}>{item.date}</div>
          </>,
          status: item.status || 'wait',
        };
      })}
    />
  );
};

export default RecordModule2;
