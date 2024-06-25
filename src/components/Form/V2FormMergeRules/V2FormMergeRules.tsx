import React, { ReactNode } from 'react';
import { Form, FormItemProps, Space } from 'antd';
import { NamePath } from 'antd/lib/form/interface';
import styles from './index.module.less';
import cs from 'classnames';
export interface V2FormMergeRulesProps {
  /**
   * @description 为 true 时不带样式，作为纯字段控件使用
   * @default  false
   */
  noStyle?: boolean;
  /**
   * @description 如果需要具备手动触发，dependencies合并校验，建议设置此参数
   */
  noMeanName?: string;
  /**
   * @description label 标签的文本
   */
  label?: ReactNode;
  /**
   * @description 是否必填
   * @default false
   */
  required?: boolean;
  /**
   * @description 是否撑满, 一般用于在弹窗内表单样式美化
   */
  full?: boolean;
  /**
   * @description Form.Item中rule属性设置，具体请参考 https://ant.design/components/form-cn/#Rule
   */
  rules: any[];
  /**
   * @description Form.Item中dependencies属性设置，具体请参考 https://ant.design/components/form-cn/#dependencies
   */
  dependencies: NamePath[];
  /**
   * @description Form.Item的属性设置，具体请参考 https://ant.design/components/form-cn/#Form.Item
   * @default   {}
   */
  formItemConfig?: FormItemProps;
  /**
   * @description 额外插入的外层class
   */
  className?: string;
  /**
   * @description 内容是否紧贴，不要间距
   */
  cling?: boolean;
  /**
   * @description slot插槽
   */
  children?: any; // 类似vue的slot
}
/**
* @description 便捷文档地址
* @see https://reactpc.lanhanba.net/components/form/v2form-merge-rules
*/
const V2FormMergeRules: React.FC<V2FormMergeRulesProps> = ({
  required,
  children,
  full = false,
  rules,
  dependencies,
  formItemConfig,
  label,
  className,
  noStyle = false,
  cling = false,
  noMeanName,
}) => {
  return (
    <Form.Item
      name={noMeanName ? `no-mean-${noMeanName}` : 'no-mean'} // 只是为了让item不报错
      label={label}
      rules={rules}
      dependencies={dependencies}
      required={required}
      noStyle={noStyle}
      {
        ...formItemConfig
      }
    >
      <Space className={cs([
        full && styles.V2FormMergeRulesFull,
        cling && styles.V2FormMergeRulesCling,
      ], className)}
      >
        {children}
      </Space>
    </Form.Item>
  );
};
V2FormMergeRules.displayName = 'V2FormMergeRules';
export default V2FormMergeRules;

