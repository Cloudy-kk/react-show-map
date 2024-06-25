/*
* version: 当前版本2.10.14
*/
import React, { ReactNode } from 'react';
import { Form, FormItemProps, InputNumberProps, Input, TooltipProps } from 'antd';
import { NamePath } from 'antd/lib/form/interface';
import styles from './index.module.less';
import './index.global.less';
import cs from 'classnames';
import { deepCopy, isUndef } from '@lhb/func';
import V2FormSelect from '../V2FormSelect/V2FormSelect';
import V2FormInputNumber from '../V2FormInputNumber/V2FormInputNumber';

export interface DefaultFormItemProps {
  /**
   * @description 字段名，支持数组
   * @default NamePath[]
   */
  name?: NamePath | any;
  /**
   * @description 如果需要具备手动触发，dependencies合并校验，建议设置此参数
   */
  noMeanName?: string;
  /**
   * @description label 标签的文本
   */
  label?: ReactNode;
  /**
   * @description 为 true 时不带样式，作为纯字段控件使用
   * @default  false
   */
  noStyle?: boolean;
  /**
   * @description Form.Item中rule属性设置，具体请参考 https://ant.design/components/form-cn/#Rule
   */
  rules?: any[];
  /**
   * @description Form.Item的属性设置，具体请参考 https://ant.design/components/form-cn/#Form.Item
   */
  formItemConfig?: FormItemProps; // Form.Item的其他入参
  /**
   * @description Form.Item的属性设置，具体请参考 https://ant.design/components/form-cn/#Form.Item
   */
  formItemMinConfig?: FormItemProps; // Form.Item的其他入参
  /**
   * @description Form.Item的属性设置，具体请参考 https://ant.design/components/form-cn/#Form.Item
   */
  formItemMaxConfig?: FormItemProps; // Form.Item的其他入参
  /**
   * @description 是否禁用
   * @default false
   */
  disabled?: boolean;
}

export interface V2FormRangeInputProps extends DefaultFormItemProps {
  /**
   * @description 最小值输入框提示语
   */
  minPlaceholder?: string;
  /**
   * @description 最大值输入框提示语
   */
  maxPlaceholder?: string;
  /**
   * @description 最大数
   */
  max?: number;
  /**
   * @description 最小数
   */
  min?: number;
  /**
   * @description 小数点位数
   */
  precision?: number;
  /**
   * @description 是否植入默认规则组,非必填：min和max同时不填就不校验，不然校验 min <= max,必填：min <= max
   * @default false
   */
  useBaseRules?: boolean;
  /**
   * @description 额外插入的部分内容
   */
  extra?: any;
  /**
   * @description 是否必填
   * @default false
   */
  required?: boolean;
  /**
   * @description 使用Form.List时，同时要用useBaseRules需要把外层name传入
   */
  formListName?: string;
  /**
   * @description 公共配置部分，具体请参考 https://ant.design/components/input-number-cn/#API
   */
  config?: InputNumberProps;
  /**
   * @description 最小值配置部分，具体请参考 https://ant.design/components/input-number-cn/#API
   */
  minConfig?: InputNumberProps;
  /**
   * @description 最大值配置部分，具体请参考 https://ant.design/components/input-number-cn/#API
   */
  maxConfig?: InputNumberProps;
  /**
   * @description 有第三个参数时，插入initialValue为选择框插入options
   */
  selectConfig?: { initialValue?: any, options: any[] };
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
* @see https://reactpc.lanhanba.net/components/form/v2form-range-input
*/
const V2FormRangeInput: React.FC<V2FormRangeInputProps> = ({
  label,
  name,
  noMeanName,
  rules = [],
  useBaseRules,
  formListName,
  minPlaceholder = '最小值',
  maxPlaceholder = '最大值',
  max = 99999999999.99,
  min = 0.01,
  precision = 2,
  extra,
  required,
  selectConfig,
  formItemConfig = {},
  formItemMinConfig = {},
  formItemMaxConfig = {},
  config = {},
  noStyle = false,
  minConfig = {},
  maxConfig = {},
  disabled,
  tooltip
}) => {
  // 如果rules里没有设置 validator，就是用默认 validator;
  const _rules = deepCopy(rules);
  useBaseRules && _rules.push(({ getFieldValue }) => ({
    validator() {
      const min = getFieldValue(formListName ? [formListName].concat(name[0]) : name[0]);
      const max = getFieldValue(formListName ? [formListName].concat(name[1]) : name[1]);

      if (!required) { // 如果非必填，同时未填最小和最大，不做校验
        if (!min && !max) {
          return Promise.resolve();
        } else if ((!isUndef(min) && !isUndef(max)) && min <= max) {
          return Promise.resolve();
        }
      } else {
        if (isUndef(min) || isUndef(max)) {
          return Promise.reject(new Error('请填写所有项'));
        } else if (min <= max) {
          return Promise.resolve();
        }
      }
      return Promise.reject(new Error('请确保后值大于等于前值'));
    },
  }));

  const clearStyle = {
    border: 'none'
  };
  const _minConfig = {
    ...config,
    ...minConfig
  };
  const _maxConfig = {
    ...config,
    ...maxConfig
  };
  return (
    // 最外层的name没有实际意义，是为了触发监听
    <Form.Item
      label={label}
      name={noMeanName ? `no-mean-${noMeanName}` : 'no-mean'} // 只是为了让item不报错
      rules={_rules}
      dependencies={[
        formListName ? [formListName].concat(name[0]) : name[0],
        formListName ? [formListName].concat(name[1]) : name[1],
      ]}
      noStyle={noStyle}
      required={required}
      {...formItemConfig}
    >
      <div className={cs(styles.V2FormRangeInput, 'v2FormRangeInput', [
        (disabled || config?.disabled) && styles.V2FormRangeInputDisabled,
        name[2] && styles.V2FormRangeInputSelector
      ])}
      >
        <div className={styles.V2FormRangeInputWrapper}>
          <Input.Group compact className={cs(styles.V2FormRangeInputGroup, 'v2FormRangeInputGroup')}>
            <V2FormInputNumber
              name={name[0]}
              noStyle
              formItemConfig={formItemMinConfig}
              placeholder={minPlaceholder}
              min={min}
              max={max}
              precision={precision}
              disabled={disabled}
              tooltip={tooltip?.[0]}
              onChange={_minConfig.onChange}
              config={{
                controls: false,
                formatter: (value: any) => value,
                style: clearStyle,
                ..._minConfig
              }}
            />
            <div className={cs(styles.V2FormRangeInputSingle, 'v2formRangeInputSingle')}>
              <div className={styles.V2FormRangeInputSingleBorder}></div>
            </div>
            <V2FormInputNumber
              name={name[1]}
              noStyle
              formItemConfig={formItemMaxConfig}
              placeholder={maxPlaceholder}
              min={min}
              max={max}
              precision={precision}
              disabled={disabled}
              tooltip={tooltip?.[1]}
              onChange={_maxConfig.onChange}
              config={{
                controls: false,
                formatter: (value: any) => value,
                style: clearStyle,
                ..._maxConfig
              }}
            />
          </Input.Group>
          {name[2] ? (
            <V2FormSelect
              name={name[2]}
              noStyle={true}
              formItemConfig={{
                initialValue: selectConfig?.initialValue
              }}
              allowClear={false}
              disabled={disabled || config.disabled}
              options={selectConfig?.options || []}
            />
          ) : (
            extra && (
              <div className={styles.V2FormRangeInputExtra}>{extra}</div>
            )
          )}
        </div>
      </div>
    </Form.Item>
  );
};
V2FormRangeInput.displayName = 'V2FormRangeInput';
export default V2FormRangeInput;
