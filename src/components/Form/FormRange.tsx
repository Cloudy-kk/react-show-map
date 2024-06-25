import { FC } from 'react';
import { Form, InputNumber, Input } from 'antd';
import styles from './index.module.less';
// import { FormInputProps } from './ts-config';

const FormRange: FC<any> = ({
  label,
  // name,
  leftName,
  rightName,
  leftRules = [],
  rightRules = [],
  leftItemConfig = {},
  rightItemConfig = {},
  leftConfig = {},
  rightConfig = {},
  max,
  min,
  division = null,
  extra = null,
  formItemConfig = {},
  // config = {},
}) => {

  return (
    <Form.Item label={label} className={styles.formRange} {...formItemConfig}>
      <Input.Group compact>
        <Form.Item
          name={leftName}
          rules={leftRules}
          {...leftItemConfig}
        >
          <InputNumber
            // placeholder={placeholder}
            min={min}
            max={max}
            {...leftConfig} />
        </Form.Item>
        { division || <span className='pl-10 pr-10'>-</span> }
        <Form.Item
          name={rightName}
          rules={rightRules}
          {...rightItemConfig}
        >
          <InputNumber
            // placeholder={placeholder}
            min={min}
            max={max}
            {...rightConfig} />
        </Form.Item>
        { extra }
      </Input.Group>
    </Form.Item>
  );
};

export default FormRange;
