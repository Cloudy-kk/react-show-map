import { MUNICIPALITY_AND_SAR } from '@/common/utils/map';

export const colorSet = ['#BAE7FF', '#91D5FF', '#40A9FF', '#1890FF', '#096DD9'];
export const regionColor = [
  'rgba(0,75,255, 1)',
  'rgba(189,226,159, 1)',
  'rgba(136,255,174, 1)',
  'rgba(249,133,87, 1)',
  'rgba(107,250,255, 1)',
  'rgba(255,183,200, 1)',
  'rgba(78,176,255, 1)',
  'rgba(0,255,159, 1)',
  'rgba(255,225,192, 1)'
];


export const countryColorSet = [

  { adcode: 110000, name: '北京市', color: '#1890FF' },
  { adcode: 120000, name: '天津市', color: '#40A9FF' },
  { adcode: 130000, name: '河北省', color: '#91D5FF' },
  { adcode: 140000, name: '山西省', color: '#BAE7FF' },
  { adcode: 150000, name: '内蒙古自治区', color: '#BAE7FF' },

  { adcode: 210000, name: '辽宁省', color: '#40A9FF' },
  { adcode: 220000, name: '吉林省', color: '#BAE7FF' },
  { adcode: 230000, name: '黑龙江省', color: '#BAE7FF' },

  { adcode: 310000, name: '上海市', color: '#1890FF' },
  { adcode: 320000, name: '江苏省', color: '#096DD9' },
  { adcode: 330000, name: '浙江省', color: '#096DD9' },
  { adcode: 340000, name: '安徽省', color: '#40A9FF' },
  { adcode: 350000, name: '福建省', color: '#91D5FF' },
  { adcode: 360000, name: '江西省', color: '#BAE7FF' },
  { adcode: 370000, name: '山东省', color: '#91D5FF' },

  { adcode: 410000, name: '河南省', color: '#40A9FF' },
  { adcode: 420000, name: '湖北省', color: '#40A9FF' },
  { adcode: 430000, name: '湖南省', color: '#69C0FF' },
  { adcode: 440000, name: '广东省', color: '#096DD9' },
  { adcode: 450000, name: '广西壮族自治区', color: '#40A9FF' },
  { adcode: 460000, name: '海南省', color: '#1890FF' },

  { adcode: 500000, name: '重庆市', color: '#91D5FF' },
  { adcode: 510000, name: '四川省', color: '#1890FF' },
  { adcode: 520000, name: '贵州省', color: '#91D5FF' },
  { adcode: 530000, name: '云南省', color: '#91D5FF' },
  { adcode: 540000, name: '西藏自治区', color: '#BAE7FF' },

  { adcode: 610000, name: '陕西省', color: '#69C0FF' },
  { adcode: 620000, name: '甘肃省', color: '#BAE7FF' },
  { adcode: 630000, name: '青海省', color: '#BAE7FF' },
  { adcode: 640000, name: '宁夏回族自治区', color: '#BAE7FF' },
  { adcode: 650000, name: '新疆维吾尔自治区', color: '#BAE7FF' },
  { adcode: 710000, name: '台湾省', color: '#91D5FF' },
  { adcode: 810000, name: '香港特别行政区', color: '#C7CDE7' },
  { adcode: 820000, name: '澳门特别行政区', color: '#FAC6DD' },

];

// 显示全国范围的level值（展示全国范围下的不同省份）
export const COUNTRY_LEVEL = 1;
// 显示省范围的level值 （展示省范围下的不同城市）
export const PROVINCE_LEVEL = 2;
// 显示市范围的level值 （展示市范围下的不同区）
export const CITY_LEVEL = 3;
// 显示区范围的level值
export const DISTRICT_LEVEL = 4;

// 定义省市区对应的zoom的值的区间起始值
// 显示全国范围的地图缩放级别
export const PROVINCE_ZOOM = 6;
// 显示市范围的地图缩放级别
export const CITY_ZOOM = 8;
// 显示区范围的地图缩放级别
export const DISTRICT_ZOOM = 10;

// 定义省市区各个级别下合适的缩放级别
// 全国视角下，各个省份展示时的合适的缩放级别
export const PROVINCE_FIT_ZOOM = 7.25;
// 省份视角下，各个市展示时的合适的缩放级别
export const CITY_FIT_ZOOM = 8.8;
// 市的视角下，各个区展示时的合适的缩放级别
export const DISTRICT_FIT_ZOOM = 13.5;
// 区的视角下，地图展示时的合适的缩放级别
export const BUSINESS_FIT_ZOOM = 15;

// 显示商圈名称和围栏的缩放级别
export const BUSINESS_ZOOM = 14;

// 重庆市下的重庆市区code
export const CQ_CODE_CITY = '500100';
// 重庆市下的重庆郊县code
export const CQ_CODE_SUBURB = '500200';
// 重庆市下的重庆郊县name
export const CQ_SUBURB_NAME = '重庆郊县';

/**
   * 通过高德获取的当前地图中心和请求返回的数据库内存储的省市区信息
   * 高德返回的城市值示例：
   * 正常省市区值：{province: '甘肃省', city: '兰州市', citycode: '0931', district: '城关区'}
   * 中国范围外： {province: Array(0), city: '', citycode: '', district: ''}
   * 中国海域：{province: '中华人民共和国', city: '', citycode: '', district: ''}
   * 北京。。。：{province: '北京市', city: '', citycode: '010', district: '西城区'}
   * 特别行政区：{province: '澳门特别行政区', city: '', citycode: '1853', district: '嘉模堂区'}
   * 台湾省：{province: '台湾省', city: '', citycode: '1886', district: ''} 无下属行政区需兼容处理
   */
export interface City {
  province: string | [];
  city: string;
  citycode: string;
  district: string;
  id: number;
  name: string;
  provinceId: number;
  districtList: District[];
}

type District = {
  cityId: number;
  code: string;
  id: number;
  lat: string;
  lng: string;
  name: string;
}
export interface heartMapList {
  id: number;
  /** 省ID	*/
  provinceId: number;
  /** 市ID*/
  cityId: number;
  /** 区ID */
  districtId: number;
  /** 人群类型（1工作人群，2餐饮人群） */
  crowdType: number;
  /**  经度*/
  longitude: number;
  /** 纬度 */
  latitude: number;
  /** 热力指 */
  heatCount: number;
}

export const rulers = [{
  icon: 'iconic_zhixian',
  type: 1,
  name: '直线'
}, {
  icon: 'icona-22ic_buxing22',
  type: 2,
  name: '步行'
}, {
  icon: 'iconic_jiache',
  type: 3,
  name: '驾车'
}, {
  icon: 'iconic_qiche1',
  type: 4,
  name: '骑行'
}];

export const centerOfChina = [113.920639, 37.290792]; // 中国地图中心点经纬度（目测的大概位置）
export const centerOfChinaZoom = 4.56; // 中国地图的默认缩放级别


/**
 * 通过高德地图获取到的城市名，特殊场景：直辖市、直辖县
 * @param data 通过高德获取到的当前地图中心点的省市区信息
 */
export function getAMapCityName(data: any) {
  const { city, province, district } = data || {};
  // 有城市名时
  if (city) return city;
  // 地图定位在重庆，重庆作为直辖市（相当于省级行政单位），分为重庆市（相当于市级行政单位）、重庆郊县（相当于市级行政单位），重庆郊县下的区级数据共通的规则是'xxx县'
  if (province.includes('重庆')) {
    // 如果当前district是重庆下的县时
    if (district && district.substring(district.length - 1) === '县') return CQ_SUBURB_NAME;
    return province;
  }
  // 直辖市时
  if (MUNICIPALITY_AND_SAR.find((item: any) => province.includes(item))) return province;
  // 省辖县（全国有15个）
  return district;
}
