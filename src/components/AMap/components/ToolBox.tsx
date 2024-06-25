import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import cs from 'classnames';
import styles from './index.module.less';
import IconFont from '../../IconFont';
import GetAddress from './GetAddress'; // 点标记
import Ruler from './Ruler'; // 测距
import Satellite from './Satellite'; // 卫星图插件
import Share from './Share'; // 分享
import Explain from './Explain'; // 说明文档
import HeatMapTool from './HeatMapTool'; // 人口热力
import RulerShortCutPanel from './RulerShortCutPanel'; // 工具箱快捷面板


// import { CaretDownOutlined } from '@ant-design/icons';
import { tenantCheck } from '@/common/api/common';
const ToolBox:any = forwardRef<any, any>(
  (
    {
      _mapIns,
      clearClickEvent,
      addClickEvent,
      URLParamsRef,
      share = false,
      explain = false,
      getAddress = true,
      heartMap = true, // 热力开关
      ruler = true,
      satellite = true,
      children,
      extraCityInfo, // 通过外部传递相关city参数去获取热力信息
      externalStatus, // 初始化控制热力图开关
      // isShowInCountry, // 是否在全国状态下显示热力图
      // isCheckInsideMapOperate, // 工具箱内部是否已选中地图操作按钮，用于与该组件外的地图操作功能互斥（目前有标记、测距）
      setIsCheckInsideMapOperate, // 工具箱内部是否已选中地图操作按钮，用于与该组件外的地图操作功能互斥（目前有标记、测距）
      isCheckOutsideMapOperate, // 外部是否选中了地图操作按钮
      setIsCheckOutsideMapOperate, //
      needHeatMapPermission = false, // 热力图接口是否需要数据权限，默认不需要（目前网规场景需要）
      setIsOpenHeatMap, // 是否打开热力图开关
      topLevel, // 热力图的可显示的最高级别-对应COUNTRY_LEVEL、PROVINCE_LEVEL...
      toolBoxWrapperStyle, // 样式
      beforeIcon, // 工具箱icon
      afterIcon, // 箭头icon
    },
    ref
  ) => {

    const [selected, setSelected] = useState<number>(0);

    // 目前用在工具箱中的标记和测距的标记，两者互斥，选择了其中一种操作，另外的操作状态就清除掉
    const [targetOperation, setTargetOperation] = useState<string>(''); // 当前操作
    const [isShowPanel, setIsShowPanel] = useState<boolean>(false); // 是否显示测距快捷面板
    const [isShowBox, setIsShowBox] = useState<boolean>(false);
    const [rulerType, setRulerType] = useState<number>(0); // 测距类型 1-直线 2-步行 3-驾车 4-骑行
    const [rulering, setRulering] = useState<boolean>(false);
    const [handleHeatMap, setHandleHeatMap] = useState<boolean>(false);

    const onClickBox = () => {
      setIsShowBox(!isShowBox);
      if (targetOperation === 'ruler' && isShowPanel) {
        setIsShowPanel(false);
        setRulerType(0);
        setIsCheckInsideMapOperate(false);// 此时会关闭测距快捷面板，并设置测距类型为空，所以内部工具箱内部未被选中任何操作
      }
    };

    const getHeatMapConfig = () => {
      tenantCheck().then(({ heatMapFlag }) => {
        // console.log('heatMapFlag', heatMapFlag);
        setHandleHeatMap(heatMapFlag);
      });
    };

    useEffect(() => {
      getHeatMapConfig();
    }, []);


    // 暴露相关方法
    useImperativeHandle(ref, () => ({
      handleSelected: setSelected,
    }));

    return (
      <div className={styles.toolBoxCon}>
        <div
          className={
            cs(styles.satellite,
              'bg-fff pointer ct selectNone mb-5',
              selected > 0 || isShowPanel ? 'c-006' : 'c-132')
          }
          style={{
            borderRadius: '4px',
            ...toolBoxWrapperStyle
          }}
          onClick={onClickBox}
        >
          {
            beforeIcon || <IconFont
              iconHref='iconic_gongjuxiang'
              style={{ width: '14px', height: '14px' }} />
          }
          <span className='ml-5 mr-8 c-222 fs-14'>工具箱</span>
          {
            afterIcon || <IconFont
              iconHref='iconarrow-down'
              className='fs-12 c-959'
            />
          }
          {/* <span className={styles.iconArrow}>
            <CaretDownOutlined />
          </span> */}

        </div>

        {/* 测距工具面板  工具箱打开的时候不显示*/}
        {isShowPanel &&
        <RulerShortCutPanel
          rulerType={rulerType}
          setRulerType={setRulerType}
          setIsShowPanel={setIsShowPanel}
          rulering={rulering}
          setIsCheckInsideMapOperate={setIsCheckInsideMapOperate}
        />}

        {/* 工具箱内容 */}
        <div
          className={styles.content}
          style={{
            display: isShowBox ? 'block' : 'none'
          }}
        >
          <div>
            {/* 标记 */}
            {getAddress && <GetAddress
              clearClickEvent={clearClickEvent}
              addClickEvent={addClickEvent}
              _mapIns={_mapIns}
              URLParamsRef={URLParamsRef}
              targetOperation={targetOperation}
              setTargetOperation={setTargetOperation}
              setSelected={setSelected}
              // isCheckInsideMapOperate={isCheckInsideMapOperate}
              isCheckOutsideMapOperate={isCheckOutsideMapOperate}
              setIsCheckInsideMapOperate={setIsCheckInsideMapOperate}
              setIsCheckOutsideMapOperate={setIsCheckOutsideMapOperate}
            />}
            {/* 测距 */}
            {ruler && <Ruler
              clearClickEvent={clearClickEvent}
              addClickEvent={addClickEvent}
              _mapIns={_mapIns}
              setSelected={setSelected}
              setIsShowBox={setIsShowBox}
              rulering={rulering}
              setRulering={setRulering}
              rulerType={rulerType}
              setRulerType={setRulerType}
              setIsShowPanel={setIsShowPanel}
              targetOperation={targetOperation}
              setTargetOperation={setTargetOperation}
              // isCheckInsideMapOperate={isCheckInsideMapOperate}
              isCheckOutsideMapOperate={isCheckOutsideMapOperate}
              setIsCheckInsideMapOperate={setIsCheckInsideMapOperate}
              setIsCheckOutsideMapOperate={setIsCheckOutsideMapOperate}
            />}
            {/* 卫星 */}
            {satellite && <Satellite
              _mapIns={_mapIns}
              URLParamsRef={URLParamsRef}
              setSelected={setSelected}
            />}
            {/* 分享 */}
            {share && <Share
              _mapIns={_mapIns}
              URLParamsRef={URLParamsRef}
              setSelected={setSelected}
            />}
            {/* 说明文档 */}
            {explain && <Explain/>}
            {/* 热力图 */}
            {heartMap && handleHeatMap && <HeatMapTool
              _mapIns={_mapIns}
              setSelected={setSelected}
              externalStatus={externalStatus}
              extraCityInfo={extraCityInfo}
              // isShowInCountry={isShowInCountry} // 是否在全国状态下显示热力图
              needPermission={needHeatMapPermission}
              setIsOpenHeatMap={setIsOpenHeatMap}
              topLevel={topLevel}
            />}
          </div>
          {children}
        </div>
      </div>
    );
  });

export default ToolBox;
