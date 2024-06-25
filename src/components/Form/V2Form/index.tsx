import React, { createContext } from 'react';
import { Form, FormProps } from 'antd';
import './index.global.less';
import cs from 'classnames';
export const V2FormContext = createContext<{
  form?: any;
}>({});
const { Provider: V2FormProvider } = V2FormContext;

type FormLayout = 'horizontal' | 'inline' | 'vertical';
export interface V2FormProps extends FormProps {
  /**
   * @description 额外插入的外层class
   */
  className?: string;
  /**
   * @description 表单布局 可选值[ 'horizontal', 'vertical', 'inline' ]
   * @default vertical
   */
  layout?: FormLayout;
  /**
   * @description 渲染函数
   */
  children?: any;
}
/**
* @description 便捷文档地址
* @see https://reactpc.lanhanba.net/components/form/v2form
*/
const V2Form: React.FC<V2FormProps> = ({
  children,
  layout = 'vertical',
  className,
  ...props
}) => {
  return (
    <Form className={cs('v2Form', `v2Form-${layout}`, className)} layout={layout} {...props}>
      <V2FormProvider value={{
        form: props.form,
      }}>
        {
          React.Children.map(children, (child) => {
            if (child?.type?.render?.displayName === 'V2Table') {
              const _inv2form = child.props?.inv2form;
              return React.cloneElement(child as React.ReactElement, {
                inv2form: typeof _inv2form === 'boolean' ? _inv2form : true
              });
            } else {
              return child;
            }
          })
        }
      </V2FormProvider>
    </Form>
  );
};

export default V2Form;
