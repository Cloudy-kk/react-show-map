import { Space } from 'antd';
import React from 'react';
import cs from 'classnames';
import styles from '../index.module.less';
import { useMethods } from '@lhb/hook';

const V2FormSelector: React.FC<any> = ({
  options,
  form,
  name,
  value,
  mode,
  required,
  onChange,
  disabled
}) => {
  const methods = useMethods({
    onChecked(newValue, disabled) {
      if (!disabled) {
        if (form) {
          const origin = form.getFieldValue(name) || [];
          let res: any[] = [...origin];
          const index = res.indexOf(newValue);
          if (mode === 'multiple') { // 多选
            if (index === -1) {
              res.push(newValue);
            } else {
              res.splice(index, 1);
            }
          } else { // 单选
            if (index === -1) {
              res = [newValue];
            } else if (!required) {
              res = [];
            }
          }
          form.setFieldValue(name, res);
          onChange?.(res);
          if (res?.length && required) {
            form.validateFields([name]);
          }
        } else {
          console.error('请确认您的Form组件有配置form参数');
        }
      }
    }
  });
  return (
    <Space>
      {
        options?.map((item, index) => {
          return (
            <div
              key={index}
              className={cs([
                styles.V2FormSelectorItem,
                value?.includes(item.value) && styles.V2Active,
                (disabled || item.disabled) && styles.V2Disabled
              ])}
              onClick={() => methods.onChecked(item.value, (disabled || item.disabled))}
            >{item.label}</div>
          );
        })
      }
    </Space>
  );
};
export default V2FormSelector;
