/*
* version 2.13.7
*/
import React, { ForwardedRef, ReactNode, forwardRef, useContext, useEffect, useImperativeHandle, useState } from 'react';
import cs from 'classnames';
import styles from './index.module.less';
import { Form, FormItemProps, Radio, RadioGroupProps } from 'antd';
import { useMethods } from '@lhb/hook';
import V2Message from '../../Others/V2Hint/V2Message';
import { V2FormContext } from '../V2Form';
import { isNotEmpty } from '@lhb/func';
export interface V2FormRadioHandles {
  /**
   * @description 是否初始化显示清空操作
   */
  initClearCom: () => void;
}
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
   * @description 是否禁用
   * @default false
   */
  disabled?: boolean;
  /**
   * @description 为 true 时不带样式，作为纯字段控件使用
   * @default false
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
}

export interface V2FormRadioProps extends DefaultFormItemProps {
  /**
   * @description 数据化配置选项内容，相比 jsx 定义会获得更好的渲染性能
   * @default []
   */
  options: any[];
  /**
   * @description 用于设置 Radio options 类型
   * @default default
   */
  optionType?: 'default' | 'button';
  /**
   * @description 选项变化时的回调函数
   * @type  function(e:Event)
   */
  onChange?: Function;
  /**
   * @description 选项变化时的回调函数，仅在canClearEmpty时触发
   */
  onClear?: Function;
  /**
   * @description Radio的属性设置，具体请参考https://ant.design/components/radio-cn/#API
   * @default   {}
   */
  config?: RadioGroupProps & { ref?: any };
  //
  /**
   * @description 是否必填
   * @default false
   */
  required?: boolean;
  /**
   * @description 额外插入的外层class
   */
  className?: string;
  /**
   * @description form实例
   */
  form?: any;
  /**
   * @description 允许彻底清空选择
   */
  canClearEmpty?: boolean;
  ref?: any;
}
/**
* @description 便捷文档地址
* @see https://reactpc.lanhanba.net/components/form/v2form-radio
*/
const V2FormRadio: React.FC<V2FormRadioProps> = forwardRef(({
  label,
  name,
  rules = [],
  options = [],
  optionType = 'default',
  formItemConfig = {},
  config = {},
  onChange,
  onClear,
  required,
  disabled,
  noStyle,
  className,
  form,
  canClearEmpty = false
}, ref: ForwardedRef<V2FormRadioHandles>) => {
  const { form: baseForm } = useContext(V2FormContext);
  const _form = form || baseForm;
  let _label = label;
  const [showRadioClear, setShowRadioClear] = useState<boolean>(false);
  if (canClearEmpty && !_form) {
    V2Message.error('设置canClearEmpty为true时，必须传染form');
  }
  if (canClearEmpty) {
    const labelExtra = (
      <span
        style={{ color: '#999', marginLeft: '4px' }}
        onClick={() => {
          _form.setFieldValue(name, null);
          setShowRadioClear(false);
          onClear && onClear();
        }}
      >[清除选择]</span>
    );
    _label = <>{label}{showRadioClear ? labelExtra : undefined}</>;
  }
  let _rules = rules;
  // 未设置rules 规则,但是有设置必填，就添加一个默认的规则
  // 只要设置了 rules，就完全托管给rules自行校验
  if (!_rules?.length) {
    if (required) {
      _rules = _rules.concat([{ required: true, message: `请选择${label || ''}` }]);
    }
  }
  const methods = useMethods({
    onChange(e) {
      setShowRadioClear(isNotEmpty(e.target.value));
      onChange && onChange(e);
    },
    initClearCom() {
      if (canClearEmpty && _form && isNotEmpty(_form.getFieldValue(name))) {
        setShowRadioClear(true);
      }
    }
  });
  useImperativeHandle(ref, () => ({
    initClearCom: methods.initClearCom
  }));
  useEffect(() => {
    methods.initClearCom();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <Form.Item
      noStyle={noStyle}
      name={name}
      className={cs(styles.V2FormRadio, className)}
      label={_label}
      rules={_rules}
      {...formItemConfig}
    >
      <Radio.Group
        options={options}
        optionType={optionType}
        disabled={disabled}
        onChange={methods.onChange}
        {...config}
      />
    </Form.Item>
  );
});
V2FormRadio.displayName = 'V2FormRadio';
export default V2FormRadio;
