import React from 'react';
import { Form, Input } from 'antd';

export interface FormSetNameProps {
  /**
   * @description 字段名，支持数组
   */
  name?: any;
  /**
   * @description 初始值
   * @default ''
   */
  initialValue?: any;
  /**
   * @description 纯净版样式
   */
  noStyle?: boolean;
}
/**
* @description 便捷文档地址
* @see https://reactpc.lanhanba.net/components/form/form-set-name
*/
const FormSetName: React.FC<FormSetNameProps> = ({
  name,
  initialValue = '',
  noStyle
}) => {
  return (
    <Form.Item name={name} initialValue={initialValue} noStyle={noStyle} hidden>
      <Input type='hidden' />
    </Form.Item>
  );
};

export default FormSetName;
