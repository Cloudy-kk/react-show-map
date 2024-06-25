import { FC, memo, ReactNode, forwardRef, useImperativeHandle, useRef } from 'react';
import { Input } from 'antd';
import styles from './index.module.less';
import cs from 'classnames';
import POISearch from './POISearch';
import ToolBox from './ToolBox';
interface ILocation{
  lng:number|string;
  lat:number|string;
}
interface ISearchData{
  id:number|string;
  name:string;
  address:string;
  location:ILocation
}
interface Props{
  _mapIns?:any; // 地图对象
  city:any; // 城市
  level?:number;
  clearClickEvent?:any;
  addClickEvent?:any;
  URLParamsRef?:any;
  share?:boolean;
  explain?:boolean;
  children?:ReactNode;
  boxRef?:any;
  searchSelect?:any;// 搜索类型可选内容
  searchData?:ISearchData[];// 搜索得到的值
  isPOISearch?:boolean;// 是否POI搜索
  setInputValue?:any;// 获取搜索输入框的值
  matchLabel?:any;
  iconStyle?:any;
  [props: string]: any;
}
// 综合的头部组件 搜索框和工具库
const TopCon: FC<Props> = forwardRef(({
  _mapIns,
  city,
  level,
  clearClickEvent,
  addClickEvent,
  URLParamsRef,
  getAddress,
  ruler,
  satellite,
  share,
  explain,
  children,
  boxRef,
  boxStyle,
  boxConStyle,
  searchSelect,
  searchData,
  isPOISearch,
  setInputValue,
  matchLabel,
  iconStyle,
  heartMap,
  ...props
}, ref) => {
  const POISearchRef = useRef<any>(null);
  useImperativeHandle(ref, () => ({
    clear: POISearchRef.current.clear,
  }));
  return (
    <div className={cs(styles.topSearch, props.className)}>
      <Input.Group compact>
        <POISearch
          boxStyle={boxStyle}
          city={city}
          level={level}
          _mapIns={_mapIns}
          URLParamsRef={URLParamsRef}
          searchSelect={searchSelect}
          searchData={searchData}
          isPOISearch={isPOISearch}
          setInputValue={setInputValue}
          ref={POISearchRef}
          matchLabel={matchLabel}
          iconStyle={iconStyle}
        />
        <div className={styles.boxCon}
          style={{
            ...boxConStyle
          }}>

          <ToolBox
            ref={boxRef}
            _mapIns={_mapIns}
            clearClickEvent={clearClickEvent}
            addClickEvent={addClickEvent}
            URLParamsRef={URLParamsRef}
            share={share}
            explain={explain}
            children={children}
            getAddress={getAddress}
            ruler={ruler}
            satellite={satellite}
            heartMap={heartMap}
            city={city}
            level={level}
            needHeatMapPermission={props?.needHeatMapPermission}
            setIsOpenHeatMap={props?.setIsOpenHeatMap}
            topLevel={props?.topLevel}
            setIsCheckInsideMapOperate={props?.setIsCheckInsideMapOperate}
            isCheckOutsideMapOperate={props?.isCheckOutsideMapOperate}
            setIsCheckOutsideMapOperate={props?.setIsCheckOutsideMapOperate}
          />
        </div>
      </Input.Group>
    </div>);
});

export default memo(TopCon);
