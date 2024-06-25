import React from 'react';
import RecordModule1 from './components/RecordModule1';
import RecordModule2 from './components/RecordModule2';

export interface V2LogRecordModule1ItemsProps {
  /**
   * @description title基础内容
   */
  name?: React.ReactNode;
  /**
   * @description title扩展内容
   */
  titleExtra?: React.ReactNode;
  /**
   * @description 时间内容
   */
  time?: React.ReactNode;
  /**
   * @description title与description中间插槽
   */
  middleExtra?: React.ReactNode;
  /**
   * @description 描述
   */
  description?: React.ReactNode;
  /**
   * @description 当前状态, 可选['wait', 'finish']
   * @default wait
   */
  status?: 'wait' | 'finish' | string;
}


export interface V2LogRecordModule2ChildrenProps {
  /**
   * @description title基础内容
   */
  name?: React.ReactNode;
  /**
   * @description title扩展内容
   */
  titleExtra?: React.ReactNode;
  /**
   * @description 时间内容
   */
  time?: React.ReactNode;
  /**
   * @description 描述
   */
  description?: React.ReactNode;
  date?: string; // 不对外开发，用以承载date数据
  /**
   * @description 当前状态, 可选['wait', 'finish']
   * @default 外层status
   */
  status?: 'wait' | 'finish' | string;
}

export interface V2LogRecordModule2ItemsProps {
  /**
   * @description module2的配置项
   */
  children?: V2LogRecordModule2ChildrenProps[];
  /**
   * @description 日期内容
   */
  date?: string;
  /**
   * @description 当前状态, 可选['wait', 'finish']
   * @default wait
   */
  status?: 'wait' | 'finish' | string;
}


export interface V2LogRecordProps {
  /**
   * @description 额外插入的外层class
   */
  className?: string;
  /**
   * @description 配置项，type=1时，适配V2LogRecordModule1ItemsProps，type=2时，适配V2LogRecordModule2ItemsProps
   */
  items: V2LogRecordModule1ItemsProps[] | V2LogRecordModule2ItemsProps[];
  /**
   * @description 款式类型，可选[1, 2]
   * @default 1
   */
  type?: number;
}

/**
* @description 便捷文档地址
* @see https://reactpc.lanhanba.net/components/special/v2log-record
*/
const V2LogRecord: React.FC<V2LogRecordProps> = ({
  className,
  items,
  type = 1
}) => {
  return (
    type === 2 ? <RecordModule2 className={className} items={items}/> : <RecordModule1 className={className} items={items}/>
  );
};

export default V2LogRecord;
