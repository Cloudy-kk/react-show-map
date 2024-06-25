import React, { useEffect, useState } from 'react';
import AMapLoader from '@amap/amap-jsapi-loader';
import styles from './index.module.less';
import { aMapKey } from '../config-v2';
export interface AMapProps {
  /**
   * @description 申请好的Web端开发者Key，首次调用 load 时必填，请根据自己项目替换默认key
   * @default aMapKey
   */
  mapKey?: string;
  /**
   * @description 需要使用的的插件列表，请参考 https://lbs.amap.com/api/javascript-api/guide/abc/plugins
   */
  plugins?: any[];
  /**
   * @description 版本号
   */
  version?: string;
  /**
   * @description 高德组件库，请参考 https://lbs.amap.com/api/amap-ui/intro
   */
  AMapUI?: any;
  /**
   * @description 地图Map类参数，请参考 https://lbs.amap.com/api/javascript-api/reference/map#MapOption
   */
  mapOpts?: object;
  /**
   * @description AMapLoader.load参数，请参考 https://lbs.amap.com/api/jsapi-v2/guide/abc/load
   */
  config?: object;
  /**
   * @description AMapLoader.load完成后回调，function (map: 地图实例, mapDom: 目标dom){}
   */
  loaded?: Function;
  /**
   * @description 外层样式
   */
  styleOpt?: React.CSSProperties;
  /**
   * @description 宽
   */
  width?: string;
  /**
   * @description 高
   */
  height?: string;
  /**
   * @description 是否自动执行释放高德地图内存的优化，目前项目中，因代码结构问题（三元表达式），执行自动清理会有问题，因代码改动量较大时，传入false
   * @default true
   */
  isMemoryClean?: boolean;
  children?: React.ReactNode;
}
/**
* @description 便捷文档地址
* @see https://reactpc.lanhanba.net/components/Map/amap
*/
const Amap: React.FC<AMapProps> = ({
  width = '100%',
  height = '100%',
  styleOpt = {},
  mapKey = aMapKey,
  version = '2.0', // 默认最新的2.0版本
  plugins = [],
  AMapUI = {},
  config = {}, // 其他高德地图的配置项
  mapOpts = {},
  loaded = () => {},
  isMemoryClean = true,
  children
}) => {
  const [mapIns, setMapIns] = useState<any>(null); // 地图实例
  const [mapDom, setMapDom] = useState<any>(null); // 地图DOM

  useEffect(() => {
    mapDom && !mapIns && init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapDom]);

  const targetDom = (dom: any) => {
    setMapDom(dom);
  };
  const destroyMapWebgl = () => {
    (mapDom.querySelector('canvas.amap-layer') as any)?.getContext('webgl')?.getExtension('WEBGL_lose_context')?.loseContext();
  };
  useEffect(() => {
    return () => {
      // 弥补高德destroy方法未能正确清理内存的bug，目前高德尚未解决，只能我们自行解决了。
      if (!isMemoryClean || !mapIns || !mapDom) return;
      destroyMapWebgl();
      mapIns.remove(mapIns.getLayers(), mapIns.getAllOverlays());
      mapIns.clearEvents();
      mapIns.clearMap();
      mapIns.destroy();
      setMapIns(null);
    };
  }, [mapIns]);

  const init = async () => {
    // https://lbs.amap.com/api/jsapi-v2/guide/abc/load
    await AMapLoader.load({
      key: mapKey, // 申请好的Web端开发者Key，首次调用 load 时必填
      version, // 指定要加载的 JSAPI 的版本，默认为 2.0
      plugins, // 需要使用的的插件列表，如比例尺'AMap.Scale'等
      AMapUI,
      ...config
    }).then((AMap: any) => {
      const map = new AMap.Map(mapDom, mapOpts);
      setMapIns(map);
      loaded && loaded(map, mapDom);
    });
  };

  // 自定义组件时，默认注入地图实例和地图DOM
  const renderChildren = () => {
    return (
      React.Children.map(children, (child: any) => {
        if (!child) return child;
        const { props } = child;
        // 明确声明preventAmap不需要注入的不注入地图相关属性
        if (props && props.preventAmap) {
          return child;
        }
        // 默认注入地图实例和地图DOM
        return React.cloneElement(child, {
          _mapIns: mapIns,
          _mapDom: mapDom
        });
      })
    );
  };

  return (
    <div style={{
      width,
      height,
      ...styleOpt
    }}
    className={styles.V2AMap}>
      {/* 地图dom */}
      <div
        ref={(dom) => targetDom(dom)}
        style={{
          width: '100%',
          height: '100%'
        }}>
      </div>
      {/* 自定义组件  */}
      {
        mapIns && renderChildren()
      }
    </div>
  );
};

export default Amap;
