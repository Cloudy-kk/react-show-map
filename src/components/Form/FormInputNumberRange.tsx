import { FC } from 'react';
import { Form, InputNumber } from 'antd';
import cs from 'classnames';
import { isNotEmpty, contrast } from '@lhb/func';
import { FormInputNumberRangeProps } from './ts-config';
import styles from './index.module.less';

interface InputNumberRangeProps {
  value?: any;
  onChange?: any;
  addonAfter?: string;
  max?: number;
  min?: number;
}

const InputNumberRange: FC<InputNumberRangeProps> = ({ value, onChange, addonAfter, min, max }) => {
  const changeMix = (minValue: any) => {
    onChange({ ...value, min: minValue });
  };

  const changeMax = (maxValue: any) => {
    onChange({ ...value, max: maxValue });
  };

  const compareValue = () => {
    const min = contrast(value, 'min');
    const max = contrast(value, 'max');
    // 失去焦点的时候如果最小值大于最大值，则两个值进行位置替换
    if (isNotEmpty(min) && isNotEmpty(max) && Number(min) > Number(max)) {
      onChange({ ...value, min: max, max: min });
    }
  };

  return (
    <div className={cs('ant-picker ant-picker-range', styles.inputNumberRange)}>
      <div className={cs('ant-picker-input', styles.inputNumber)}>
        <InputNumber
          value={value?.min}
          bordered={false}
          placeholder={'最小值'}
          min={min}
          max={max}
          onChange={changeMix}
          onBlur={compareValue}
        />
      </div>
      <div className={cs('ant-picker-range-separator', styles.line)}></div>
      <div className={cs('ant-picker-input', styles.inputNumber)}>
        <InputNumber
          value={value?.max}
          bordered={false}
          placeholder={'最大值'}
          min={min}
          max={max}
          onChange={changeMax}
          addonAfter={addonAfter}
          onBlur={compareValue}
        />
      </div>
    </div>
  );
};

const FormInputNumberRange: FC<FormInputNumberRangeProps> = ({
  label,
  name,
  rules = [],
  formItemConfig = {},
  isRely = true,
  addonAfter,
  max,
  min,
}) => {
  const checkNumbers = (_: any, value: any) => {
    const haveMin = isNotEmpty(contrast(value, 'min'));
    const haveMax = isNotEmpty(contrast(value, 'max'));
    // 需要校验两个值同时存在
    if (isRely && ((haveMin && !haveMax) || (!haveMin && haveMax))) {
      return Promise.reject(new Error(`请输入${!haveMin ? '最小值' : '最大值'}`));
    }
    return Promise.resolve();
  };

  const relayCheck = [{ validator: checkNumbers }];

  return (
    <Form.Item name={name} label={label} rules={rules.concat(relayCheck)} {...formItemConfig}>
      <InputNumberRange addonAfter={addonAfter} max={max} min={min} />
    </Form.Item>
  );
};

export default FormInputNumberRange;
