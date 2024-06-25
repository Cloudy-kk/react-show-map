import { FC } from 'react';
import { Form, Input } from 'antd';
import { FormInputProps } from './ts-config';

const FormInput: FC<FormInputProps> = ({
  label,
  name,
  rules = [],
  placeholder = `请输入${label || ''}`,
  maxLength,
  onClickInput,
  prefix,
  formItemConfig = {},
  config = {},
  blur,
  removeSpace = false,
}) => {
  // 去除input的前后空格
  const normFile = (e: any) => {
    return e.target.value.replace(/(^\s*)|(\s*$)/g, '');
  };

  return (
    <Form.Item
      name={name}
      label={label}
      rules={rules}
      getValueFromEvent={(removeSpace && normFile) || undefined}
      {...formItemConfig}
    >
      <Input
        maxLength={maxLength}
        prefix={prefix}
        placeholder={placeholder}
        autoComplete='off'
        {...config}
        onClick={() => onClickInput && onClickInput()}
        onBlur={() => blur && blur()}
      />
    </Form.Item>
  );
};

export default FormInput;
