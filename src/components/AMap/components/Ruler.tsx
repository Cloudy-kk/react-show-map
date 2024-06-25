/**
 * @description 测距组件，需引入地图插件
 * [AMap.RangingTool,AMap.Walking,AMap.Driving,AMap.Riding]
 */
import { CSSProperties, FC, memo, useEffect, useRef, useState } from 'react';
import IconFont from '@/common/components/IconFont';
import styles from './index.module.less';
import cs from 'classnames';
import { rulers } from '../ts-config';
import { getLngLatAddress } from '@/common/utils/map';
import { useMethods } from '@lhb/hook';
import { isNotEmptyAny } from '@lhb/func';
import { message } from 'antd';

interface RulerInfoType {
  startAddress?: string;
  endAddress?: string;
  mode?: string;
  time?: number;
  distance?: number;
}

interface Props {
  _mapIns?: any;
  style?: CSSProperties;
  className?: string;
  clearClickEvent: Function;
  addClickEvent: Function;
  rulering:boolean;
  setRulering:Function;
  rulerType: number; // 测距类型
  setRulerType: Function; // 设置测距类型 用于测距开始和测距结束的时候重置
  setSelected: Function; // 设置工具箱的选中效果
  setIsShowBox: Function; // 设置是否显示工具箱
  setIsShowPanel: Function;
  setTargetOperation?: Function;
  targetOperation?: string;
  // isCheckInsideMapOperate?:boolean;
  isCheckOutsideMapOperate?:boolean;
  setIsCheckInsideMapOperate?:Function;
  setIsCheckOutsideMapOperate?:Function;
}

const Ruler: FC<Props> = ({
  _mapIns, // 地图实例
  style,
  className,
  clearClickEvent,
  addClickEvent,
  rulering, // 测距中
  setRulering,
  rulerType, // 测距类型
  setRulerType,
  setSelected,
  setIsShowBox,
  setIsShowPanel,
  targetOperation,
  setTargetOperation,
  // isCheckInsideMapOperate,
  isCheckOutsideMapOperate,
  setIsCheckInsideMapOperate,
  setIsCheckOutsideMapOperate
}) => {

  const nodePositionsRef:any = useRef([]);
  const totalDistanceRef:any = useRef(0);

  const [status, setStatus] = useState<boolean>(false);
  const [rulerIns, setRulerIns] = useState<any>(null);

  const [totalDistance, setTotalDistance] = useState<any>(0); // 记录所有节点间的总距离
  const [rulerMarkers, setRulerInfoMarkers] = useState<any>([]);


  useEffect(() => {
    if (!_mapIns) return;

    if (!window?.AMap?.RangingTool) {
      throw new Error('AMap.RangingTool 未引入！');
    }
    const offset = new window.AMap.Pixel(-7, -7);
    // 测距实例配置
    const startMarkerOptions = {
      icon: 'https://staticres.linhuiba.com/project-custom/locationpc/map/icon_ruler_qidian.png',
      offset
    };
    const midMarkerOptions = {
      icon: 'https://staticres.linhuiba.com/project-custom/locationpc/map/icon_ruler_zhongjian.png',
      offset };
    const endMarkerOptions = {
      icon: 'https://staticres.linhuiba.com/project-custom/locationpc/map/icon_ruler_zhongdian.png',
      offset };
    const lineOptions = {
      strokeColor: '#F23030',
      strokeOpacity: 1,
    };
    const tmpLineOptions = {
      strokeColor: 'F3B8B8',
      strokeOpacity: 1,
    };
    const rulerOptions = {
      lineOptions,
      tmpLineOptions,
      startMarkerOptions,
      midMarkerOptions,
      endMarkerOptions,
      startLabelText: '起点',
      endLabelText: '直线距离{d}公里</div>',

    };
    const ruler = new window.AMap.RangingTool(_mapIns, rulerOptions);
    setRulerIns(ruler);
  }, [_mapIns]);

  useEffect(() => {
    if (!_mapIns) return;

    const tipMarker = new window.AMap.Marker({
      map: _mapIns,
      anchor: 'top-left',
      zIndex: 999,
      content: ' ',
      offset: new window.AMap.Pixel(6, 6),
    });
    _mapIns.add(tipMarker);

    const handleMouseMove = (e) => {
      const lngLat = e.lnglat; // 鼠标位置信息
      let dis = 0;
      // 直线
      const tempPosi = nodePositionsRef.current.slice(-1)[0];
      const tempDis = window.AMap.GeometryUtil.distance(tempPosi, lngLat); // 直线

      totalDistanceRef.current = totalDistance;
      dis = totalDistanceRef.current + tempDis;

      const content = `
      <div style="width: 176px; height: 51px; background: #fff; padding: 6px;border-radius: 2px;
      border: 1px solid #333333;">
      <span style="font-size: 14px;font-weight: bolder;color: #333;">
      当前距离 <span style="color: #F23030;"> ${(dis / 1000).toFixed(2)}</span> 公里</span></br>
      <span style="font-size: 12px;">单击继续，双击或右键结束</span> </div>`;

      tipMarker.setPosition(lngLat); // 设置覆盖物的位置信息
      tipMarker.setContent(content); // 更新距离
    };



    if (rulering && rulerType === 1) {
      _mapIns.on('mousemove', handleMouseMove);
    }

    return () => {
      _mapIns.off('mousemove', handleMouseMove);
      _mapIns.remove(tipMarker);
    };

  }, [_mapIns, rulering, nodePositionsRef, totalDistance, totalDistanceRef]);

  // 测距类型发生变化的时候
  useEffect(() => {
    if (!rulerIns) return;

    // 监听测距过程中添加的节点信息;
    const handleAddNode = ({ position }) => {
      // 将当前节点位置添加到节点位置数组中
      setRulering(true);

      nodePositionsRef.current = [...nodePositionsRef.current, position];
      const length = nodePositionsRef.current.length;
      // 直线
      if (length >= 2 && rulerType === 1) {
        // 当节点数大于等于2时，计算两点之间的距离，并累加到总距离上
        const lastNode = nodePositionsRef.current[length - 2];
        const distance = window.AMap.GeometryUtil.distance(lastNode, position);
        const newTotalDistance = totalDistanceRef.current + distance;

        setTotalDistance(newTotalDistance); // 更新总距离
        totalDistanceRef.current = newTotalDistance;
      }

      // 非直线
      if (length === 2 && rulerType !== 1) {
        rulerIns.turnOff();
      }
    };

    // 监听测距结束
    const handleEnd = () => {

      const end = nodePositionsRef.current.slice(-1)[0];
      if (rulerType !== 1) {
        const record = rulerIns._lastRecord;
        drawEndMarker(nodePositionsRef.current[0], end, record);
      }
      setTotalDistance(0);
      setRulerType(0);
      setRulering(false);
      rulerIns.turnOff();
      nodePositionsRef.current = [];
      totalDistanceRef.current = 0;
      addClickEvent && addClickEvent(); // 恢复地图点击事件
    };


    if (rulerType) {
      setSelected((state) => (state === 0 ? 0 : state - 1)); // 清除工具箱按钮高亮
      clearClickEvent && clearClickEvent(); // 清除地图点击事件
      rulerIns?.turnOn(); // 开启距离量测功能
      setTargetOperation && setTargetOperation('ruler'); // 记录当前操作类型

      rulerIns.on('addnode', handleAddNode);
      rulerIns.on('end', handleEnd);
    }

    // 在 useEffect 返回函数中清除事件监听器
    return () => {
      rulerIns.off('addnode', handleAddNode);
      rulerIns.off('end', handleEnd);

    };
  }, [rulerType, rulerMarkers]);

  // 监听end事件
  useEffect(() => {
    if (!rulerIns) return;

    if (!rulerType) {
      setStatus(false);
      setRulering(false);
      addClickEvent && addClickEvent(); // 恢复地图点击事件
      rulerIns.turnOff(); // 关闭在地图上的测距状态
      setSelected((state) => state - 1); // 设置工具箱状态
      return;
    }
  }, [status, rulerType]);
  useEffect(() => {
    if (isCheckOutsideMapOperate) {
      setStatus(false);
      setSelected((state) => (state === 0 ? 0 : state - 1)); // 清除工具箱按钮高亮
      addClickEvent && addClickEvent(); // 添加地图点击事件
      setTargetOperation && setTargetOperation(''); // 清除当前操作类型
      setRulerType(0); // 重置测距类型
      rulerIns?.turnOff(); // 关闭距离量测功能
      setIsShowPanel(false);
    }
  }, [isCheckOutsideMapOperate]);
  useEffect(() => {
    if (!targetOperation) {
      setStatus(false);
      return;
    }
    if (targetOperation && targetOperation === 'dotMark') {
      rulerIns.turnOff(); // 关闭在地图上的测距状态
    }
  }, [targetOperation]);

  const {
    onClickRuler,
    calculateDistance,
    drawEndMarker,
  } = useMethods({

    /**
     * @description 点击工具箱中ruler工具
     * @param type 测距类型
     */
    onClickRuler: (type: number) => {
      setIsShowBox(false); // 关闭工具箱
      if (status) {
        // setIsCheckOutsideMapOperate?.(true);
        setIsCheckInsideMapOperate?.(false);
        setStatus(false);
        setSelected((state) => (state === 0 ? 0 : state - 1)); // 清除工具箱按钮高亮
        addClickEvent && addClickEvent(); // 添加地图点击事件
        setTargetOperation && setTargetOperation(''); // 清除当前操作类型
        setRulerType(0); // 重置测距类型
        rulerIns?.turnOff(); // 关闭距离量测功能
      } else {
        setIsCheckOutsideMapOperate?.(false);
        setIsCheckInsideMapOperate?.(true);
        setStatus(true);
        setRulerType(type); // 设置测距类型
        setSelected((state) => state + 1); // 高亮工具箱按钮
        setIsShowPanel(true); // 打开快捷面板
        clearClickEvent && clearClickEvent(); // 清除地图点击事件
        rulerIns?.turnOn(); // 开启距离量测功能
        setTargetOperation && setTargetOperation('ruler'); // 记录当前操作类型
      }
    },



    /**
     * @description 调取高德接口获取测距数据
     * @param start 起点经纬度（地址）
     * @param end 终点经纬度（地址）
     * @param mode 测距类型
     * @param Constructor //实例
     * @return 返回测距信息 { mode, distance, time }
     */
    calculateDistance: (start, end, mode, Constructor, record) => {
      return new Promise((resolve, reject) => {
        const instance = new Constructor(_mapIns);
        instance.search(start, end, function (status, result) {
          if (status === 'complete') {
            const distance = result.routes[0].distance || 0;
            const time = result.routes[0].time || 0;
            const info = { mode, distance, time };
            resolve(info);
          } else {
            rulerIns._removeRecord(record);
            message.error(`获取${mode}数据失败。`);
            reject(`获取${mode}数据失败：` + result);
          }
        });
      });
    },

    /**
     * @description 绘制结束距离信息
     * @param start 起点经纬度（必须是经纬度信息，因为获取地址采用的是经纬度为参数）
     * @param end 终点经纬度
     * @param record 本条测距记录
     * @return 返回
     */
    drawEndMarker: async (start, end, record) => {
      if (!start && !end) return;

      const startAddress = String(await getLngLatAddress(start)) || '-';
      const endAddress = String(await getLngLatAddress(end)) || '-';

      let measureInfo:RulerInfoType = {
        startAddress,
        endAddress,
        mode: rulers[rulerType - 1].name,
        time: 0,
        distance: 0,
      };
      let info = {};
      switch (rulerType) {
        case 1: // 直线
          const distance = window.AMap.GeometryUtil.distance(start, end);
          info = { startAddress, endAddress, mode: '直线', distance };
          break;
        case 2: // 步行
          if (!window?.AMap?.Walking) {
            throw new Error('AMap.Walking 未引入！');
          }
          info = await calculateDistance(start, end, '步行', window.AMap.Walking, record);
          break;
        case 3: // 驾车
          if (!window?.AMap?.Driving) {
            throw new Error('AMap.Driving 未引入！');
          }
          info = await calculateDistance(start, end, '驾车', window.AMap.Driving, record);

          break;
        case 4: // 骑行
          if (!window?.AMap?.Riding) {
            throw new Error('AMap.Riding 未引入！');
          }
          info = await calculateDistance(start, end, '骑行', window.AMap.Riding, record);
          break;
        default:
          break;
      }

      measureInfo = {
        ...measureInfo,
        ...info
      };

      if (isNotEmptyAny(measureInfo)) {
        const group :any = [];
        const endMarker = new window.AMap.Marker({
          map: _mapIns,
          zIndex: 999,
          anchor: 'top-left',
          icon: ' ',
          offset: new window.AMap.Pixel(-6, 30)
        });


        const closeIcon = new window.AMap.Marker({
          map: _mapIns,
          anchor: 'top-left',
          zIndex: 999,
          content: `<svg style='width: 8px; height: 8px;' aria-hidden><use xlink:href='#iconic_close_colour_seven' style='fill:#132144 '/>
          </svg>`,
          offset: new window.AMap.Pixel(160, 35)
        });

        const t = measureInfo.time || 0;
        const dis = measureInfo.distance || 0;
        const time = t > 3600 ? (t / 3600).toFixed(1) : (t / 60).toFixed(0);
        const distance = dis >= 1000 ? (dis / 1000).toFixed(2) : dis.toFixed(0);


        // amapRuler 通过 src/common/styles/amap.less 引入样式
        const con = `<div class='amapRuler'>
        <div class='disTitle'>${measureInfo.mode || '-'}距离</div>
        <div class="tipsItems" >
          <div class='itemDis'><span class="count">${distance}<span class="unit">${dis >= 1000 ? 'km' : 'm'}</span></span><span class="des">距离</span>
          </div>
          <div class="itemTime"><span class="count">${time || '-'}<span class="unit">${t > 3600 ? 'h' : 'min'}</span></span><span class="des">约耗时</span>
          </div>
        </div>
        <div class="address">
          <span class="tipsLabel">起点：</span><span style="margin-bottom:14px">${measureInfo.startAddress || '-'}</span>
          <span class="tipsLabel">终点：</span><span>${measureInfo.endAddress || '-'}</span>
        </div>
      </div>`;

        endMarker.setPosition(end);
        endMarker.setContent(con);
        closeIcon.setPosition(end);// 设置覆盖物的位置信息

        group.push(endMarker);
        group.push(closeIcon);

        setRulerInfoMarkers(group);

        closeIcon.on('click', () => {
          _mapIns.remove(group);
          rulerIns._removeRecord(record);
        });

        _mapIns.add(group);

        return group;
      }
    },

  });


  return (
    <div className={styles.rulerTool}>
      <div
        className={cs(styles.satellite, className, 'bg-fff pointer selectNone', status ? 'c-006' : 'c-132')}
        onClick={() => onClickRuler(1)}
        style={style}
      >
        <IconFont iconHref='iconic_celiang' style={{ width: '14px', height: '14px' }} />
        <span className='inline-block ml-5'>测距</span>
      </div>
      <div>
        {/* 测距hover */}
        <div className={styles.moreRuler}>
          {rulers.map((item) => (
            <div
              key={item.type}
              className={cs(styles.satellite, 'bg-fff pointer selectNone', rulerType === item.type ? 'c-006' : 'c-132')}
              onClick={() => onClickRuler(item.type)} // 变更测距类型
            >
              <IconFont iconHref={item.icon} style={{ width: '16px', height: '16px' }} />
              <span className='inline-block ml-19'>{item.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default memo(Ruler);
