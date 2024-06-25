/*
* version: 当前版本2.10.12
*/
import React, { ReactNode, useState } from 'react';
import { Form, Input, Tooltip, TooltipProps } from 'antd';
import { FormItemProps } from 'antd/lib/form/index';
import { TextAreaProps } from 'antd/lib/input';
import cs from 'classnames';
import styles from './index.module.less';
import { useMethods } from '@lhb/hook';
const { TextArea } = Input;

export interface DefaultFormItemProps {
  /**
   * @description 字段名，支持数组
   */
  name?: string | number | (string | number)[];
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
   * @default   {}
   */
  formItemConfig?: FormItemProps; // Form.Item的其他入参
  /**
   * @description 是否禁用
   * @default false
   */
  disabled?: boolean;
}

//  textarea输入框
export interface V2FormTextAreaProps extends DefaultFormItemProps {
  /**
   * @description 输入框提示
   * @default  如有label则为请输入+label，否则为请输入
   */
  placeholder?: string;
  /**
   * @description 输入框提示
   * @default  如有label则为请输入+label，否则为请输入
   */
  /**
   * @description 最大长度
   */
  maxLength?: number; // 字数
  /**
   * @description 是否可以点击图标删除
   */
  allowClear?: boolean;
  /**
   * @description input的属性，详情可见https://ant.design/components/input-cn/#API
   */
  config?: TextAreaProps & { ref?: any }; // antd TextArea 的入参
  /**
   * @description 额外插入的外层class
   */
  className?: string;
  /**
   * @description 额外插入的textareaClass
   */
  textareaClassName?: string;
  /**
   * @description 是否禁止前后输入空格
   */
  removeSpace?: boolean;
  /**
   * @description 是否必填
   * @default false
   */
  required?: boolean;
  /**
   * @description 失去焦点的回调
   */
  blur?: Function;
  /**
   * @description 获取焦点的回调
   */
  focus?: Function;
  /**
   * @description tooltip配置
   */
  tooltip?: TooltipProps & {
    defaultValue?: ReactNode;
    formatter?: Function;
  };
  /**
   * @description 颜色变化后触发的回调
   */
  onChange?: Function;
}
/**
* @description 便捷文档地址
* @see https://reactpc.lanhanba.net/components/form/v2form-text-area
*/
const V2FormTextArea: React.FC<V2FormTextAreaProps> = ({
  label,
  name,
  rules = [],
  placeholder = `请输入${label || ''}`,
  maxLength,
  noStyle = false,
  allowClear = true,
  formItemConfig,
  config,
  required,
  removeSpace = false,
  disabled,
  className,
  textareaClassName,
  blur,
  focus,
  tooltip,
  onChange,
}) => {
  const [open, setOpen] = useState<boolean>(false);
  const [tipValue, setTipValue] = useState(tooltip?.defaultValue);
  let _rules = rules;
  // 未设置rules 规则,但是有设置必填，就添加一个默认的规则
  // 只要设置了 rules，就完全托管给rules自行校验
  if (!_rules?.length) {
    if (required) {
      _rules = _rules.concat([{ required: true }]);
    }
  }
  const methods = useMethods({
    normFile(e: any) { // 去除input的前后空格
      return e.target.value.replace(/(^\s*)|(\s*$)/g, '');
    },
    doFocus() {
      tooltip && setOpen(true);
      focus && focus();
    },
    doBlur() {
      setOpen(false);
      blur && blur();
    },
    onChange(v) {
      if (tooltip?.formatter) {
        setTipValue(tooltip?.formatter(v.target.value));
      }
      onChange && onChange(v);
    }
  });
  /* config */
  const wrapperConfig = {
    label,
    noStyle,
    className: className,
    // 如果传入有规则或只有必填一个选项，则默认添加字符串不能为空格的规则
    ...formItemConfig
  };
  const innerConfig = {
    name,
    rules: _rules.length ? _rules.concat([{ whitespace: true, message: `${label || ''}不能为空字符` }]) : [],
    getValueFromEvent: (removeSpace && methods.normFile) || undefined
  };
  /* components */
  const inputCom = () => (<TextArea
    allowClear={allowClear}
    placeholder={placeholder}
    maxLength={maxLength}
    disabled={disabled}
    className={cs(styles.V2FormTextArea, textareaClassName, [
      (disabled || config?.disabled) && styles.V2FormTextAreaDisabled
    ])}
    {...config}
    onChange={methods.onChange}
    onFocus={methods.doFocus}
    onBlur={methods.doBlur}
  />);
  return (
    tooltip ? (
      <Form.Item {...wrapperConfig}>
        <Tooltip
          {...tooltip}
          open={tooltip?.title || tipValue ? open : false}
          title={tooltip?.title || tipValue}
          placement={tooltip?.placement || 'topLeft' }
          overlayInnerStyle={{ ...tooltip?.overlayInnerStyle, minWidth: '48px' }}>
          <Form.Item noStyle {...innerConfig}>
            {inputCom()}
          </Form.Item>
        </Tooltip>
      </Form.Item>
    ) : (
      <Form.Item {...wrapperConfig} {...innerConfig}>
        {inputCom()}
      </Form.Item>
    )
  );
};
V2FormTextArea.displayName = 'V2FormTextArea';
export default V2FormTextArea;
