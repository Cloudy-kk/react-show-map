import { CSSProperties, FC, memo, useEffect, useState } from 'react';
import { useMethods } from '@lhb/hook';
import IconFont from '@/common/components/IconFont';
import styles from './index.module.less';
import cs from 'classnames';
// 卫星图插件
// 组件如果直接使用在Amap组件下会自动注入_mapIns
// 插入TileLayer不必引入插件，AMap.MapType切换卫星图需要引入插件
const Satellite: FC<{
  _mapIns?: any;
  style?: CSSProperties;
  className?: string;
  URLParamsRef?:any;
  setSelected?:Function;
}> = ({
  _mapIns,
  style,
  className,
  URLParamsRef,
  setSelected
}) => {
  const [show, setShow] = useState<boolean>(false);
  useEffect(() => {
    if (!_mapIns) return;
    _mapIns.addLayer(new window.AMap.TileLayer.Satellite({ visible: false }));
  }, [_mapIns]);
  const {
    onChangeShow
  } = useMethods({
    onChangeShow: () => {
      if (URLParamsRef) {
        URLParamsRef.current.satellite = !show;
      }
      const type = !show;
      setShow(!show);
      setSelected && setSelected((state) => !show ? state + 1 : state - 1);
      const layers = _mapIns.getLayers();
      layers.forEach(layer => layer.CLASS_NAME === 'AMap.TileLayer.Satellite' && (type ? layer.show() : layer.hide()));
    }
  });
  return <div
    className={
      cs(styles.satellite,
        className,
        'bg-fff pointer selectNone',
        show ? 'c-006' : 'c-132')
    }
    onClick={onChangeShow}
    style={style} >
    <IconFont
      iconHref='iconic_map_weixing'
      style={{ width: '16px', height: '16px' }} />
    <span className='inline-block ml-5'>卫星</span>

  </div>;
};

export default memo(Satellite);
