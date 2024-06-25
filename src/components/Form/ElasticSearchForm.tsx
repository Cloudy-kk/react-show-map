/**
 * @Description 可展开/折叠的搜索框组件
 * 注意 rightOperate的位置和普通的SearchForm中的位置不同
 * itemRowHeight 采用外部传入的方式，不在组件内获取，因为有些自定义样式的缘故无法计算准确
 */

/* 内置搜索和重置的form */
import React, {
  useImperativeHandle,
  useMemo,
  useState
} from 'react';
import { Form, Button } from 'antd';
import { SearchFormProps } from './ts-config';
import { debounce } from '@lhb/func';
import cs from 'classnames';
import styles from './index.module.less';
import IconFont from '@/common/components/IconFont';

const ElasticSearchForm: React.FC<SearchFormProps> = ({
  onSearch,
  children,
  layout = 'inline',
  className,
  labelAlign = 'left',
  labelLength = 4,
  extra,
  onRef,
  onOkText,
  form, // 如果外部传入form则由外部传入form控制
  onFinish, // 如果需要对参数进行处理，则可通过传入onFinish函数来自行处理
  onCustomerReset,
  hiddenOkBtn = false,
  rightOperate,
  showResetBtn = true,
  itemRowHeight = 50, // 行高
  isElastic = false, // 是否可展示折叠
  elasticRow = 2, // 默认展开的行数
  ...props
}) => {
  const [searchForm] = Form.useForm();
  const [isFold, setIsFold] = useState<boolean>(true); // 是否折叠，默认折叠
  // const [itemRowHeight, setItemRowHeight] = useState<number>(42); // 默认行高
  // const itemRef: any = useRef();

  // useEffect(() => {
  //   const targetNode = itemRef.current;
  //   if (!targetNode) return;
  //   const { height } = targetNode.getBoundingClientRect();
  //   height && setItemRowHeight(height);
  // }, []);

  const foldHeight = useMemo(() => itemRowHeight * elasticRow, [elasticRow, itemRowHeight]);
  // 外部组件清空form
  useImperativeHandle(onRef, () => ({
    resetFormFields: (isEmit: boolean) => {
      onReset(isEmit);
    },
  }));

  // 查询
  const onFinishSearch = () => {
    debounceSearch();
  };

  // 重置
  const onReset = (isEmit = true) => {
    if (!isEmit) return;
    (form || searchForm).resetFields();
    onCustomerReset && onCustomerReset();
    debounceSearch();
  };

  // 查询添加防抖
  const debounceSearch = debounce(() => {
    const values = (form || searchForm).getFieldsValue();
    onSearch && onSearch(values);
  }, 600);

  return (
    <>
      <Form
        {...props}
        className={cs(styles.formSearch, styles.formElasticSearch, styles[`searchLabel${labelLength}`], className)}
        form={form || searchForm}
        layout={layout}
        labelAlign={labelAlign}
        onFinish={onFinish || onFinishSearch}
      >
        <div
          className={cs(styles.flexWrapCon)}
          style={isElastic && isFold ? {
            overflow: 'hidden',
            height: `${foldHeight}px`,
            // transition: '0.3s'
          } : {}}>
          {children}
        </div>
      </Form>
      <div className={styles.flexBetweenCon}>
        {/* <div
          ref={itemRef}
          className={styles.flexWrapCon}> */}
        <Form.Item>
          {!hiddenOkBtn && (
            <Button type='primary' onClick={() => (form || searchForm).submit()}>
              {onOkText || '查询'}
            </Button>
          )}
          {
            showResetBtn && (
              <Button
                className={styles.resetBtn}
                type='link'
                icon={<IconFont iconHref='icon-xzzw_ic_reset_normal' />}
                onClick={() => onReset()}
              >
                重置
              </Button>
            )
          }
          {extra}
          {
            isElastic ? (<>
              <span onClick={() => setIsFold(!isFold)}>
                <span
                  className='c-244 pointer pr-6'>
                  {isFold ? '更多指标' : '收起'}
                </span>
                <IconFont
                  iconHref={isFold ? 'iconic_shouqi_seven' : 'iconic_zhankai_seven'}
                  className='c-244'/>
              </span>
            </>) : null
          }
        </Form.Item>
        {/* </div> */}
        <div>
          {rightOperate}
        </div>
      </div>
    </>
  );
};

export default ElasticSearchForm;
