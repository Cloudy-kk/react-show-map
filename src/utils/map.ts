
/**
 * 创建浏览器定位实例
 * @param {Object} options 创建浏览器定位实例的相关参数
 * https://lbs.amap.com/api/jsapi-v2/documentation#geolocation
 * @returns 浏览器定位实例
 */
function getGeolocationInstance(options: any) {
  const AMap = window.AMap;
  return new AMap.Geolocation({
    enableHighAccuracy: options.enableHighAccuracy || true, // 是否使用高精度定位，默认:true
    timeout: options.timeout || 5, // 默认5ms，设置5毫秒的原因是大多数浏览器定位不会定位到精确位置，如果timeout设置的过大部分场景会影响页面体验和逻辑
    position: options.position || 'RB', // 定位按钮的停靠位置
    offset: options.offset || new AMap.Pixel(10, 20), // 定位按钮与设置的停靠位置的偏移量，默认：Pixel(10, 20)
    // noIpLocate: 3, // 模拟定位失败时可设置此参数
    // noGeoLocation: 3, // 模拟定位失败时可设置此参数
    zoomToAccuracy: true, // 定位成功后是否自动调整地图视野到定位点
    // 目前高德地图该参数和showCircle冲突，getCityWhenFail为true时，需要将showCircle也设置为true，否则SDK就会报错，已经提工单给高德了
    getCityWhenFail: true, // 定位失败之后是否返回基本城市定位信息
    needAddress: true, // 是否需要将定位结果进行逆地理编码操作
    ...options
  });
}

/**
 * 浏览器精确定位
 * 文档：https://lbs.amap.com/demo/jsapi-v2/example/location/browser-location
 * 浏览器定位失败常见原因：https://lbs.amap.com/faq/js-api/map-js-api/position-related/43361
 * @param {*} map // 地图实例
 * @param {*} options 自定义参数
 */
export function getCurPosition(map: any, options: any) {
  const AMap = window.AMap;
  return new Promise((resolve, reject): void => {
    AMap.plugin('AMap.Geolocation', () => {
      const geolocation = getGeolocationInstance(options);
      map.addControl(geolocation);
      geolocation.getCurrentPosition((status: string, result: any) => {
        if (status === 'complete') { // 获取定位成功，返回定位信息
          return resolve(result);
        }

        reject(result);
      });
    });
  });
}


/**
 * 逆地理编码（根据经纬度解析具体的地址信息）
* 注意使用该方法前，需要初始化高德地图，并引入AMap.Geocoder插件
* @param {Array} lnglat 经纬度
* @param {String} cityName 城市名
* @param {Boolean} onlyAddress 是否仅返回具体地址
*/
export function getLngLatAddress(
  lnglat: any,
  cityName = '全国',
  onlyAddress = true
) {
  const geocoder = new window.AMap.Geocoder({
    city: cityName // 默认：“全国”
  });

  return new Promise((resolve, reject) => {
    geocoder.getAddress(lnglat, (status: string, result: any) => {
      if (status === 'complete' && result.regeocode) {
        const { regeocode } = result;
        if (onlyAddress) {
          const { formattedAddress } = regeocode || {};
          resolve(formattedAddress);
        } else {
          resolve(regeocode);
        }
      } else {
        reject(new Error(`根据经纬度查询地址失败，错误信息：${result}`));
      }
    });
  });
}