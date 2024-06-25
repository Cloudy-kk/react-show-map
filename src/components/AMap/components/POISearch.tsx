/**
 * 地图poi兴趣点的搜索,
 */
import { AutoComplete, Input, Button, Tooltip } from 'antd';
import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle, CSSProperties } from 'react';
import IconFont from '@/common/components/IconFont';
import styles from './index.module.less';
import cs from 'classnames';
import { useMethods } from '@lhb/hook';
import { debounce, isNotEmptyAny } from '@lhb/func';
import { CITY_LEVEL, COUNTRY_LEVEL, DISTRICT_LEVEL, PROVINCE_LEVEL } from '../ts-config';

// 地图搜索插件
interface Props {
  boxStyle?: CSSProperties, // 框元素的样式
  isInlineBlock?: boolean,
  // city?: string, // 限制搜索范围
  citylimit?: boolean, // 是否强制在范围内搜索
  _mapIns?: any,
  debounceTimeout?: number;
  ref?: any;
  className?: any;
  URLParamsRef?:any;
  city?:any;
  level?:number;
  searchSelect?:any;// 搜索类型可选内容
  searchData?:any;// 搜索得到的值
  isPOISearch?:boolean;// 是否POI搜索
  setInputValue?:any;// 获取搜索输入框的值
  matchLabel?:any;// 外层传入自定义lable样式
  iconStyle?:any;// 外层传入自定义marker样式
}

const POISearch: React.FC<Props> = forwardRef(({
  boxStyle = { width: 265 },
  city,
  level,
  citylimit = true,
  _mapIns,
  debounceTimeout = 300,
  className,
  URLParamsRef,
  searchSelect,
  searchData,
  isPOISearch,
  setInputValue,
  matchLabel,
  iconStyle
}, ref) => {

  const fetchRef = useRef(0);
  const labelMarkerRef = useRef<any>(null);
  const [result, setResult] = useState<any>({
    fetching: false,
    list: []
  });
  const [options, setOptions] = useState<any>([]);
  const [POISearchIns, setPOISearchIns] = useState<any>(null);
  const [markerGroup, setMarkerGroup] = useState<any>(null);
  const [searchValue, setSearchValue] = useState<string | undefined>(undefined);
  const [searchCity, setSearchCity] = useState<any>(null);
  useEffect(() => {
    if (!city) return;
    if (!level) {
      setSearchCity(city);
      return;
    };
    let optCity = '';
    switch (level) {
      case COUNTRY_LEVEL:
        optCity = ''; // 搜索范围为全国
        break;
      case PROVINCE_LEVEL:
        optCity = isNotEmptyAny(city.province) ? city.province : ''; // 搜索范围为全省
        break;
      case CITY_LEVEL:
      case DISTRICT_LEVEL:
        // 高德地图城市限制传参最高到市级，区级也传城市名称
        optCity = isNotEmptyAny(city.city) ? city.city : (isNotEmptyAny(city.province) ? city.province : '');
        break;
    }
    setSearchCity(optCity);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [city, level]);
  useEffect(() => {
    if (!_mapIns) return;
    labelMarkerRef.current = new window.AMap.Marker({
      content: ' ',
      map: _mapIns,
      anchor: 'top-left',
      offset: [-34, 6]
    });
    if (!window?.AMap?.PlaceSearch) {
      throw new Error('AMap.PlaceSearch 未引入！');
    }
  }, [_mapIns]);
  useImperativeHandle(ref, () => ({
    clear: clearMarker
  }));
  const {
    clearMarker,
    loadData,
    createPoiMarker,
    changePoiSelect,
    loadDataHandle,
    debounceLoadData,
    onClickSearch
  } = useMethods({
    clearMarker: () => {
      if (markerGroup) {
        markerGroup.clearOverlays();
        _mapIns.remove(markerGroup);
        setMarkerGroup(null);
      };
      if (URLParamsRef) {
        URLParamsRef.current.poiMarkerLng = null;
        URLParamsRef.current.poiMarkerLat = null;
        URLParamsRef.current.poiMarkerName = null;
        URLParamsRef.current.limit === 0 ? 0 : URLParamsRef.current.limit -= 1;
      }

      setSearchValue(undefined);
      setOptions([]);
      setResult({
        fetching: false,
        list: []
      });
    },
    loadData: async (keyword: string) => {
      let ins;
      // 设置城市
      if (!POISearchIns) {
        ins = new window.AMap.PlaceSearch({
          pageSize: 10, // 单页显示结果条数
          pageIndex: 1, // 页码
          city: searchCity, // 兴趣点城市
          citylimit: citylimit, // 是否强制限制在设置的城市内搜索
        });
        setPOISearchIns(ins);
      } else {
        ins = POISearchIns;
        POISearchIns.setCity(searchCity);
      };
      return new Promise(function (resolve,) {
        ins.search(keyword, function (status, result) {
          if (status === 'complete' && result.info === 'OK') {
            resolve(result?.poiList?.pois || []);
          } else {
            resolve([]);
          };
        });
      });
    },
    loadDataHandle: async (keyword: string, fetchId?: number) => {
      let data = await loadData(keyword);
      if (fetchId && (fetchId !== fetchRef.current)) return;
      // 在非POI搜索情况下，使用外层搜索得到的值
      if (searchSelect && !isPOISearch) {
        data = searchData;
      }
      const options = data.map(_ => {
        return {
          value: _?.id,
          name: _?.name,
          label: (
            <div className='poiSearchOption mb-7'>
              <div className='fn-14 c-132'>
                {_.name}
              </div>
              <Tooltip title={_.address}>
                <div className='fn-12 c-959'>
                  {_.address}
                </div>
              </Tooltip>
            </div>

          )
        };
      });
      setResult({
        fetching: false,
        list: data
      });
      setOptions(options);
    },
    debounceLoadData: debounce((keyword: string) => {
      fetchRef.current += 1;
      const fetchId = fetchRef.current;
      setResult({
        fetching: true,
        list: [],
      });
      loadDataHandle(keyword, fetchId);
    }, debounceTimeout),
    changePoiSelect: (value, option) => {
      const selectedPoi = result.list.filter(poi => (poi?.id === value || poi?.name === value));
      // 这里是从选项中筛选出来的所以必定有结果
      const poi = selectedPoi[0];
      setSearchValue(poi.name);
      setInputValue && setInputValue(option.name);
      if (markerGroup) {
        markerGroup.clearOverlays();
        _mapIns.remove(markerGroup);
        setMarkerGroup(null);
      };
      const marker = createPoiMarker(poi);
      const layerGroup = new window.AMap.OverlayGroup([marker]);
      _mapIns.setFitView(marker);
      _mapIns.add(layerGroup);
      setMarkerGroup(layerGroup);
      // setResult({
      //   fetching: false,
      //   list: []
      // });
      // setOptions([]);
    },
    createPoiMarker: (poi) => {
      let marker;
      if (matchLabel && !isPOISearch) {
      // 外层通过iconStyle传入marker样式
        marker = new window.AMap.Marker({
          map: _mapIns,
          ...iconStyle(poi)
        });
      } else {
        // poi搜索，使用原先marker样式
        marker = new window.AMap.Marker({
          map: _mapIns,
          icon: new window.AMap.Icon({
            image: 'https://staticres.linhuiba.com/project-custom/locationpc/ic_map_standard_marker@2x.png',
            size: [35, 35],
            imageSize: [35, 35],
            position: [poi.location.lng, poi.location.lat],
          }),
          anchor: 'bottom-center',
          position: [poi.location.lng, poi.location.lat],
        });
      }
      // 判断是否包含台湾省信息
      const getLngLatAddress = (lnglat) => {
        const geocoder = new window.AMap.Geocoder();
        return geocoder.getAddress(lnglat, function(status, result) {
          if (status === 'complete' && result.info === 'OK') {
            // result为对应的地理位置详细信息
            if (URLParamsRef) {
              if (Number(result.regeocode.addressComponent.adcode) === 710000) {
                URLParamsRef.current.limit += 1;
              }
            }
          }
        });
      };
      getLngLatAddress([poi.location.lng, poi.location.lat]);
      if (URLParamsRef) {
        URLParamsRef.current.poiMarkerLng = poi.location.lng;
        URLParamsRef.current.poiMarkerLat = poi.location.lat;
        URLParamsRef.current.poiMarkerName = poi.name;
      }


      marker.on('mouseover', () => {
        // amapPOISearchPoiMarkerLabel 通过 src/common/styles/amap.less 引入样式
        let labelContent = `<div class='amapPOISearchPoiMarkerLabel'>
        <div class='trangle'></div>
        <div class='marker'>${poi.name}</div>
        </div>`;
        if (matchLabel && !isPOISearch) {
          labelContent = matchLabel(poi);
        }
        labelMarkerRef.current.setMap(_mapIns); // 防止有的页面使用map.clear()
        labelMarkerRef.current.setPosition([poi.location.lng, poi.location.lat]);
        labelMarkerRef.current.setContent(labelContent);
        if (matchLabel && !isPOISearch) {
          labelMarkerRef.current.setOffset(new window.AMap.Pixel(-100, 25));
        } else {
          // 同上，offset: [-34, 6]
          labelMarkerRef.current.setOffset(new window.AMap.Pixel(-34, 6));
        }
      });
      marker.on('mouseout', () => {
        labelMarkerRef.current.setContent(' ');
      });
      return marker;
    },
    onClickSearch: () => {
      const insList: any = [];
      if (markerGroup) {
        markerGroup.clearOverlays();
        _mapIns.remove(markerGroup);
        setMarkerGroup(null);
      };
      result.list.map(value => {
        if (markerGroup) {
          markerGroup.clearOverlays();
          _mapIns.remove(markerGroup);
          setMarkerGroup(null);
        };
        const marker = createPoiMarker(value);
        insList.push(marker);
      });
      const layerGroup = new window.AMap.OverlayGroup(insList);
      _mapIns.setFitView(insList);
      setMarkerGroup(layerGroup);
      _mapIns.add(layerGroup);
    },
  });
  useEffect(() => {
    debounceLoadData(searchValue);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchData]);
  return (
    <>
      {searchSelect }
      <Input.Group
        className={cs(styles.poiSearch, 'bg-fff', className)}
        style={boxStyle}>
        <AutoComplete
          value={searchValue}
          style={{ width: 'calc(100% - 64px)' }}
          options={options}
          onSearch={debounceLoadData}
          onSelect={changePoiSelect}
          onChange={(value) => { setSearchValue(value); setInputValue && setInputValue(value); }}
        >
          <Input
            placeholder='请输入要查询的地点' />
        </AutoComplete>
        <Button
          type='text'
          className='c-656'
          onClick={onClickSearch}
          icon={<IconFont iconHref='iconsearch' />} />
        <Button
          type='text'
          className='c-656'
          onClick={clearMarker}
          icon={<IconFont iconHref='iconic-closexhdpi' />} />
      </Input.Group>
    </>
  );
});

export default POISearch;
