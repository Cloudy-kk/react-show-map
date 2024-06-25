import { CSSProperties, FC } from 'react';
// import IconFont from '@/common/components/IconFont';
import styles from './index.module.less';
import cs from 'classnames';
import { FileTextOutlined } from '@ant-design/icons';
const Explain: FC<{
  _mapIns?: any;
  style?: CSSProperties;
  className?: string;
}> = ({
  style,
  className,
}) => {
  return (<div
    className={
      cs(styles.satellite,
        className,
        'bg-fff pointer   selectNone')
    }
    onClick={() => window.open('https://staticres.linhuiba.com/project-custom/locationpc/file/行业地图说明指引.pdf ') }
    style={style} >
    <FileTextOutlined />
    <span className='inline-block ml-5'>说明文档</span>
  </div>);
};

export default Explain;
