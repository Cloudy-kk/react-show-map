/*
* version: 当前版本2.10.12
*/
import React, { ReactNode } from 'react';
import { NamePath } from 'antd/lib/form/interface';
import styles from './index.module.less';
import V2FormMergeRules from '../V2FormMergeRules/V2FormMergeRules';
import V2FormInput from '../V2FormInput/V2FormInput';
import V2FormInputNumber from '../V2FormInputNumber/V2FormInputNumber';
import { FormItemProps, TooltipProps } from 'antd';
export interface V2FormMultipleInputProps {
  /**
   * @description label 标签的文本
   */
  label?: ReactNode;
  /**
   * @description 为 true 时不带样式，作为纯字段控件使用
   * @default false
   */
  noStyle?: boolean;
  /**
   * @description 是否必填
   * @default false
   */
  required?: boolean;
  /**
   * @description Form.Item中rule属性设置，具体请参考 https://ant.design/components/form-cn/#Rule
   */
  rules?: any[];
  /**
   * @description 字段名，支持数组
   * @type NamePath[]
   */
  name?: NamePath | any;
  /**
   * @description 使用Form.List时，同时要用useBaseRules需要把外层name传入
   */
  formListName?: string;
  /**
   * @description 文本框类型，默认是text，可选 number
   */
  type?: 'text' | 'number' | string;
  /**
   * @description 小数点位数，当type为number时生效
   */
  precision?: number;
  /**
   * @description 最大数，当type为number时生效
   */
  max?: number;
  /**
   * @description 最小数，当type为number时生效
   */
  min?: number;
  /**
   * @description 整体的placeholder
   */
  placeholder?: Array<string>;
  /**
   * @description 额外插入的部分内容
   */
  extra?: any;
  /**
   * @description 是否禁用
   * @default false
   */
  disabled?: boolean;
  /**
   * @description 输入框配置项列表,自行查看ant的input和inputNumber文档
   * @default []
   */
  config?: Array<any>;
  /**
   * @description Form.Item的属性设置，具体请参考 https://ant.design/components/form-cn/#Form.Item
   * @default []
   */
  formItemConfig?: Array<FormItemProps>;
  /**
   * @description tooltip配置
   */
  tooltip?: Array<TooltipProps & {
    defaultValue?: ReactNode;
    formatter?: Function;
  }>;
}
/**
* @description 便捷文档地址
* @see https://reactpc.lanhanba.net/components/form/v2form-multiple-input
*/
const V2FormMultipleInput: React.FC<V2FormMultipleInputProps> = ({
  required,
  rules = [],
  name,
  formListName,
  label,
  type = 'text',
  max = 99999999999.99,
  min = 0.01,
  precision = 2,
  placeholder = [],
  formItemConfig = [],
  config = [],
  extra,
  noStyle = false,
  disabled,
  tooltip,
}) => {
  const InputCom = type === 'number' ? V2FormInputNumber : V2FormInput;
  const moreConfig: any = {};
  if (type === 'number') {
    moreConfig.min = min;
    moreConfig.max = max;
    moreConfig.precision = precision;
  }
  if (required && !rules?.length) {
    console.error('V2FormMultipleInput：设置required的同时，必须设置rules！！！');
  }
  return (<V2FormMergeRules
    label={label}
    dependencies={name.map(item => {
      return formListName ? [formListName].concat(item) : item;
    })}
    required={required}
    noStyle={noStyle}
    className={styles.V2FormMultipleInput}
    rules={rules}>
    {
      name.map((item, index) => {
        return (<InputCom
          name={item}
          key={index}
          formItemConfig={{
            noStyle: true,
            ...formItemConfig[index]
          }}
          tooltip={tooltip?.[index]}
          placeholder={placeholder[index] || '请输入'}
          config={{
            disabled,
            ...config[index]
          }}
          {
            ...moreConfig
          }
        />);
      })
    }
    {
      extra && (
        <div className={styles.V2FormMultipleInputExtra}>{extra}</div>
      )
    }
  </V2FormMergeRules>);
};
V2FormMultipleInput.displayName = 'V2FormMultipleInput';
export default V2FormMultipleInput;

