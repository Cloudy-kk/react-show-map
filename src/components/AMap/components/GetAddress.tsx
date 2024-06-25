import { useMethods } from '@lhb/hook';
import { CSSProperties, FC, useEffect, useRef, useState } from 'react';
import IconFont from '@/common/components/IconFont';
import styles from './index.module.less';
import cs from 'classnames';
import { message } from 'antd';
/** 点标记
 * 地址解析
 * 根据点击的经纬度获取对应的地址
 */
const GetAddress: FC<{
  _mapIns?: any;
  style?: CSSProperties;
  className?: string;
  clearClickEvent: Function;
  addClickEvent: Function;
  URLParamsRef?:any;
  setTargetOperation?: Function;
  targetOperation?: String;
  setSelected:any
  // isCheckInsideMapOperate?:boolean;
  isCheckOutsideMapOperate?:boolean;
  setIsCheckInsideMapOperate?:Function;
  setIsCheckOutsideMapOperate?:Function;
}> = ({
  _mapIns,
  style,
  className,
  clearClickEvent,
  addClickEvent,
  URLParamsRef,
  targetOperation,
  setTargetOperation,
  setSelected,
  // isCheckInsideMapOperate,
  isCheckOutsideMapOperate,
  setIsCheckInsideMapOperate,
  setIsCheckOutsideMapOperate
}) => {
  const labelMarkerRef = useRef<any>(null);
  const [geocoderIns, setGeocoderIns] = useState<any>(null);
  const [groupIns, setGroupIns] = useState<any>(null);
  const [status, setStatus] = useState<boolean>(false);
  useEffect(() => {
    if (!_mapIns) return;
    if (!window?.AMap?.Geocoder) {
      throw new Error('AMap.Geocoder 未引入！');
    }
    const geocoder = new window.AMap.Geocoder({});
    setGeocoderIns(geocoder);
    const group = new window.AMap.OverlayGroup();
    _mapIns.add(group);
    setGroupIns(group);
    labelMarkerRef.current = new window.AMap.Marker({
      content: ' ',
      map: _mapIns,
      anchor: 'top-left',
      offset: [-34, 6]
    });
  }, [_mapIns]);

  useEffect(() => {
    // 点标记时
    if (targetOperation && targetOperation === 'ruler') {
      _mapIns.off('click', regeoCode);
      setStatus(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetOperation]);
  useEffect(() => {
    if (isCheckOutsideMapOperate) {
      setStatus(false);
      setSelected((state) => (state === 0 ? 0 : state - 1));
      addClickEvent && addClickEvent();
      _mapIns.off('click', regeoCode);
      setTargetOperation && setTargetOperation('');
    }
  }, [isCheckOutsideMapOperate]);
  const {
    onClickBtn,
    regeoCode,
    // clickMarker
  } = useMethods({
    onClickBtn: () => {
      if (status) {
        // setIsCheckOutsideMapOperate?.(true);
        setIsCheckInsideMapOperate?.(false);
        setStatus(false);
        setSelected((state) => (state === 0 ? 0 : state - 1));
        addClickEvent && addClickEvent();
        _mapIns.off('click', regeoCode);
        // 清空所有的点位
        // groupIns && groupIns.clearOverlays();
        // groupIns && groupIns.hide();
        setTargetOperation && setTargetOperation('');
      } else {
        // if (URLParamsRef) {
        //   URLParamsRef.current.pushpinInfo = [];
        // }
        setIsCheckOutsideMapOperate?.(false);
        setIsCheckInsideMapOperate?.(true);

        setStatus(true);
        setSelected((state) => state + 1);
        _mapIns && _mapIns.on('click', regeoCode);
        clearClickEvent && clearClickEvent();
        groupIns && groupIns.show();
        setTargetOperation && setTargetOperation('dotMark');
      }

    },
    regeoCode: (e) => {
      // if (!status) return;
      if (URLParamsRef?.current?.pushpinInfo?.length >= 10) {
        message.error('标记最多十个！'); return;
      }
      const { lnglat } = e;
      geocoderIns.getAddress(lnglat, (statusCode, result) => {
        // URLParamsRef.current.pushpinInfo 默认值为空数组[]
        if (statusCode === 'complete' && result.regeocode) {
          const address = result.regeocode.formattedAddress;
          // 判断是否包含台湾省信息

          if (URLParamsRef) {
            URLParamsRef.current.pushpinInfo = [...URLParamsRef.current.pushpinInfo, { lnglat, address }];
            if (Number(result.regeocode.addressComponent.adcode) === 710000) {
              URLParamsRef.current.limit += 1;
            }
          }
          const content = `<svg style='width: 26px; height: 26px;' aria-hidden><use xlink:href='#iconic_biaoji'/></svg>`;
          const marker = new window.AMap.Marker({
            content,
            position: lnglat,
            anchor: 'bottom-center',
          });
          // amapGetAddressSignLabel 通过 src/common/styles/amap.less 引入样式
          const labelContent = `${address}`;
          const labelMarker = new window.AMap.Marker({
            content: labelContent,
            position: lnglat,
            anchor: 'top-left',
          });
          // 标记点关闭按钮
          labelMarker.on('click', (e) => {
            // 判断点中的是关闭按钮
            if (e.originEvent?.target?.nodeName === 'svg') {
              const arr:any = [];
              if (URLParamsRef) {
                URLParamsRef.current.pushpinInfo.map((item) => {
                  if (item.lnglat !== lnglat) {
                    arr.push({ lnglat: item.lnglat, address: item.address });
                  }
                });
                URLParamsRef.current.pushpinInfo = arr;
                if (Number(result.regeocode.addressComponent.adcode) === 710000) {
                  URLParamsRef.current.limit -= 1;
                }
              }
              groupIns?.removeOverlay(marker);
              groupIns?.removeOverlay(labelMarker);
            }
          });
          groupIns?.addOverlay(marker);
          groupIns?.addOverlay(labelMarker);
        } else {
          message.warning('根据经纬度查询地址失败');
        }
      });

    },
    clickMarker: (e) => {
      groupIns && groupIns.removeOverlay(e);
    }
  });
  return <div
    className={
      cs(styles.satellite,
        className,
        'bg-fff pointer selectNone',
        status ? 'c-006' : 'c-132'
      )
    }
    onClick={onClickBtn}
    style={style} >
    <IconFont
      iconHref='iconic_sign'
      style={{ width: '14px', height: '14px' }} />
    {/* <span className='inline-block ml-5'>{status && '清除'}标记</span> */}
    <span className='inline-block ml-5'>标记</span>
  </div>;
};

export default GetAddress;
