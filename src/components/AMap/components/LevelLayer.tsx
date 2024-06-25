/**
 * @Description 自定义图层的展示
 * TODO 重构，逻辑解耦
 */
import {
  initDistrictLayer,
  getDistrictBounds,
  countryDistrictLayerColors,
  otherDistrictLayerColors
} from '@/common/utils/map';
import { isArray } from '@lhb/func';
import { useMethods } from '@lhb/hook';

import {
  FC,
  memo,
  useEffect,
  useRef,
  // useMemo,
  useState
} from 'react';
import {
  colorSet,
  countryColorSet,
  regionColor
} from '../ts-config';
import { targetValSort } from '@/common/utils/ways';
// 行政区背景色插件
const LevelLayer: FC<{
  _mapIns?: any;
  level: any;
  city: any;
  isAllLevel?: boolean;
  targetData?: any[]; // 地图展示数据时，根据数据中的排名，展示不同的背景色
}> = ({
  _mapIns,
  level,
  city,
  isAllLevel = false,
  targetData,
}) => {

  const [provinceLayer, setProvinceLayer] = useState<any>(null);
  const [cityLayer, setCityLayer] = useState<any>(null);
  const [districtLayer, setDistrictLayer] = useState<any>(null);
  const [prevLevel, setPrevLevel] = useState<number>();
  const [prevCity, setPrevCity] = useState<any>({});
  const [cityList, setCityList] = useState<any>([]);
  const targetIndexRef = useRef(0);
  /**
   * 0810 UI交互修改的新逻辑 https://confluence.lanhanba.com/pages/viewpage.action?pageId=67532456
   * 只针对行业地图的页面
   */
  const layerRef: any = useRef({ // 全国和省份时的自定义图层
    countryLayer: null, // 全国时的图层（定义各个省的颜色）
    provinceLayer: null, // 某个省份时的图层（定义各个市的颜色）
  });
  const cacheRef: any = useRef({ // 缓存必要的数据进行数据对比防止重复的渲染
    level: '', // 前端定义的缩放级别
    targetData: [], // 传入的targetData数据
    adcode: '', // 缩放到省份时用到的行政编码
  });
  useEffect(() => {
    if (!_mapIns) return;
    if (!window?.AMap?.DistrictSearch) {
      throw new Error('AMap.DistrictSearch 未引入！');
    }
    methods.getDistrictList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [_mapIns]);
  useEffect(() => {
    if (!_mapIns) return;
    switch (level) {
      case 1: // 全国级别
        districtLayer && districtLayer.hide();
        cityLayer && cityLayer.hide();
        methods.drawLevel1Layer();
        break;
      case 2: // 省级别
        provinceLayer && provinceLayer.hide();
        districtLayer && districtLayer.hide();
        methods.drawLevel2Layer(city, level);
        break;
      case 3:
      case 4: // 区级别
        methods.clearLayer();
        setPrevLevel(4);
        if (isAllLevel) {
          provinceLayer && provinceLayer.hide();
          cityLayer && cityLayer.hide();
          methods.drawLevel3Layer(city, level);
        } else {
          provinceLayer && provinceLayer.hide();
          cityLayer && cityLayer.hide();
          districtLayer && districtLayer.hide();
        }
        break;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [_mapIns, level, city, isAllLevel, targetData]);

  // 品牌 | 商圈数是否变化
  const targetDataIsUnaltered = (data) => {
    if (isArray(data)) {
      const cacheTarget = cacheRef.current.targetData?.[0]?.areas || [];
      const curTarget = data?.[0]?.areas || [];
      const cacheLen = cacheTarget?.length;
      const curLen = curTarget?.length;
      let isSame = true;
      curTarget.forEach((curItem: any, index: number) => {
        if (curItem?.id !== cacheTarget?.[index]?.id) {
          isSame = false;
        }
      });

      return cacheRef.current.targetData?.length === data?.length &&
      cacheLen === curLen &&
      isSame;
    }
    return true;
  };
  const methods = useMethods({
    // 获取所有的行政区
    getDistrictList: async () => {
      // https://lbs.amap.com/api/jsapi-v2/documentation#districtsearch
      const city: any = await getDistrictBounds(
        {
          subdistrict: 3, // 0：不返回下级行政区 1：返回下一级行政区 2：返回下两级行政区 3：返回下三级行政区
          showbiz: false, // 是否显示商圈，默认值true 可选为true/false，为了能够精准的定位到街道，特别是在快递、物流、送餐等场景下，强烈建议将此设置为false
        },
        '中华人民共和国',
        false);
      // 所有省份的行政区域
      setCityList(city[0].districtList);
    },
    drawLevel1Layer: () => {
      // 为了不影响原有逻辑，传入了targetData才执行新的逻辑
      if (isArray(targetData)) {
        // 缩放级别和数据不变时，不做重新渲染
        // console.log(`cacheRef`, cacheRef);
        // console.log(`drawLevel1Layer`);
        const isUnaltered = targetDataIsUnaltered(targetData);
        // console.log(`此时的targetDataIsUnaltered`, isUnaltered);
        if (cacheRef.current.level === level && isUnaltered) return;
        cacheRef.current.level = level;
        cacheRef.current.targetData = targetData;
        cacheRef.current.adcode = '';
        methods.clearLayer(); // 清除图层后再开始绘制新的图层
        methods.drawLayerMethod({
          depth: 1
        });
        return;
      }
      // 已经处在全国地图不需要重新渲染图层
      if (prevLevel === 1) return;
      setPrevLevel(1);
      if (provinceLayer) {
        // 全国地图的图层不需要重复生成，复用
        provinceLayer.show();
        return;
      };
      // 省级行政区图层
      const disCountry = new window.AMap.DistrictLayer.Country({
        SOC: 'CHN',
        depth: 1,
        opacity: 1,
        styles: {
          'coastline-stroke': '#57625A',
          'province-stroke': '#57625A',
          'fill': function (props) {
            return methods.getColor(props.adcode);
          },
          'stroke-width': 1.3
        }
      });
      disCountry.setMap(_mapIns);
      setProvinceLayer(disCountry);
      setPrevCity(city);
    },
    drawLayerMethod(options) { // 全国省份图层的渲染逻辑
      // console.log(`开始绘制图层：`, options, cacheRef, targetData);
      const { depth, adcode } = options;
      // 根据勾选的品牌/商圈，在聚合状态下，根据交互设计，将排名靠前的省份的背景色单独设置
      const targetLayer = initDistrictLayer(
        _mapIns,
        {
          'stroke-width': 1.5,
          ...((adcode) && { 'province-stroke': '#ADB7B7', 'city-stroke': '#fff' }),
        },
        options,
        targetData as any[],
        {
          matchingFields: 'adcode',
          dataTargetFields: 'code',
          colors: methods.initDistrictLayerColors(adcode) // 根据规则生成

        },
      );
      _mapIns.add(targetLayer);

      // targetLayer.setMap(_mapIns);
      // 全国省份
      if (depth === 1) {
        layerRef.current.countryLayer = targetLayer;
        return;
      }
      // 省份下的所有城市
      layerRef.current.provinceLayer = targetLayer;
    },
    initDistrictLayerColors(adcode) {
      const data: any = targetValSort(targetData as any[], 'total'); // 排序
      const len: number = data.length;
      const colors: string[] = [];
      for (let i = 0; i < len; i++) {
        const total = data[i].total;
        if (!total) break;
        const colorItem = adcode ? otherDistrictLayerColors[i] : countryDistrictLayerColors[i];
        colors.push(colorItem || '#F2F2F2');
      }
      return colors; // 默认颜色
    },
    clearLayer() {
      layerRef.current.countryLayer && (_mapIns.remove(layerRef.current.countryLayer));
      layerRef.current.provinceLayer && (_mapIns.remove(layerRef.current.provinceLayer));
    },
    drawLevel2Layer: (curCity, level) => {
      // 为了不影响原有逻辑，传入了targetData才执行新的逻辑
      if (isArray(targetData)) {
        let adcode;
        cityList.forEach(city => {
          if (city.name === curCity?.province) {
            adcode = city.adcode;
          }
        });
        // console.log(`drawLevel2Layer`);

        const isUnaltered = targetDataIsUnaltered(targetData);
        // console.log(`最新的`, level, adcode, targetData);
        // console.log(`此时的targetDataIsUnaltered`, isUnaltered, cacheRef);
        // 缩放级别&&数据&&adcode不变时，不做重新渲染
        if (cacheRef.current.level === level &&
          isUnaltered &&
          cacheRef.current.adcode === adcode) return;
        cacheRef.current.level = level;
        cacheRef.current.targetData = targetData;
        cacheRef.current.adcode = adcode;
        methods.clearLayer(); // 清除图层后再开始绘制新的图层
        methods.drawLayerMethod({
          depth: 1,
          adcode
        });
        return;
      }
      if ((prevLevel === 2 && (curCity?.province === prevCity?.province))) return;
      setPrevLevel(level);
      let adcode;
      cityList.forEach(city => {
        if (city.name === curCity?.province) {
          adcode = city.adcode;
        }
      });
      if (cityLayer) { // 省下面所有市的行政区图层
        cityLayer.setDistricts([adcode]);
        cityLayer.show();
      } else {
        // 市级地图
        const cityLayerIns = methods.createDistrictLayer(adcode, 1);
        cityLayerIns.setMap(_mapIns);
        setCityLayer(cityLayerIns);
      }
      curCity && setPrevCity(curCity);
    },
    // 绘制行政区
    drawLevel3Layer: (curCity, level) => {
      if ((prevLevel === 3 && (curCity?.province === prevCity?.province && curCity?.city === prevCity?.city))) return;
      setPrevLevel(level);
      let adcode;
      // TODO 待优化，使用for而不是forEach
      cityList.forEach(city => {
        // 台湾地图只有省的数据，下属区等都没有
        if (city.name === curCity?.province) {
          city?.districtList.forEach(district => {
            // 直辖市
            if (curCity?.city === '') {
              // 上海等直辖市city = ''
              adcode = district.adcode;

            } else {
              if (district.name === curCity?.city) {
                adcode = district.adcode;
              }
            }
          });
        }
      });
      /**
       * 硬编码
       * 因为高德地图将重庆市分为了重庆郊县、重庆城区，选择了不同的选项展示不同的行政区。产品要求将两者合二为一，所以在设置时将设置两个adcode
       */
      if (adcode === '500100' || adcode === '500200') {
        adcode = ['500100', '500200'];
      }
      if (districtLayer) {
        districtLayer.setDistricts(isArray(adcode) ? adcode : [adcode]);
        districtLayer.show();
      } else {
        // 区级地图
        const opts = {
          opacity: 0.3,
          styles: {
            'fill': () => {
              // 保证每次渲染时都是按照regionColor的顺序去填充，防止在regionColor的长度内有同种颜色的出现
              targetIndexRef.current++;
              if (targetIndexRef.current > regionColor.length - 1) {
                targetIndexRef.current = 0;
              }
              const targetColor = regionColor[targetIndexRef.current];
              return targetColor;
            },
            'stroke-width': 2,
            'province-stroke': '#0051C2',
            'city-stroke': '#0051C2', // 中国地级市边界
            'county-stroke': '#0051C2' // 中国区县边界
          },
        };
        const districtLayerIns = methods.createDistrictLayer(isArray(adcode) ? adcode : [adcode], 2, opts);
        districtLayerIns.setMap(_mapIns);
        setDistrictLayer(districtLayerIns);
      }
      setPrevCity(curCity);
    },
    getColor: (adcode?: number) => {
      let color = '';
      // 省级图层
      if (adcode) {
        const res = countryColorSet.find(item => item.adcode === adcode);
        if (!res) {
          const num = Math.floor(Math.random() * colorSet.length);
          color = colorSet[num];
        } else {
          color = res.color;
        }
      } else { // 省以外的其他层级
        const num = Math.floor(Math.random() * colorSet.length);
        color = colorSet[num];
      }
      return color;
    },
    createDistrictLayer: (adcode, depth, opts) => {
      // 图层 https://lbs.amap.com/api/jsapi-v2/documentation#districtlayer
      return new window.AMap.DistrictLayer.Province({
        // 行政区的编码 adcode与省市行政区对照表
        adcode: isArray(adcode) ? adcode : [adcode],
        // depth设定数据的层级深度，depth为0的时候只显示国家面，depth为1的时候显示省级， 当国家为中国时设置depth为2的可以显示市一级
        depth: depth,
        opacity: 1,
        styles: {
          'fill': function () {
            return methods.getColor();
          },
          'stroke-width': 1.3,
          'province-stroke': '#57625A',
          'city-stroke': '#57625A', // 中国地级市边界
          'county-stroke': '#57625A'
        },
        ...opts
      });
    },
  });
  return <></>;
};

export default memo(LevelLayer);

