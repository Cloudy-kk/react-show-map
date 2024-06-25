import React, { useEffect, useMemo, useState } from 'react';
import './index.global.less';
import { Tag, DatePicker, Select, DatePickerProps, SelectProps, Switch } from 'antd';
import { dateFns, deepCopy, floorKeep, refactorNull } from '@lhb/func';
import dayjs from 'dayjs';
import { v4 } from 'uuid'; // 用来生成不重复的key
import { antPrefix, useDocument } from '../../config-v2';
import V2Message from '../../Others/V2Hint/V2Message';
function getTimestamp(value) {
  return value.startOf('day').valueOf();
}

export interface V2MultipleDatePickerProps {
  onChange?: Function;
  placeholder?: string;
  disabled?: boolean;
  selectProps?: SelectProps;
  /**
   * @description 日期格式
   * @default YYYY-MM-DD
   */
  format?: String;
  /**
   * @description 最多可选日期个数
   */
  maxLength?: Number;
  /**
   * @description DatePicker的属性设置，具体请参考 https://ant.design/components/date-picker-cn/#DatePicker
  */
  datePickerProps?: DatePickerProps;
  /**
   * @description 提供给V2FormMultipleDatePicker用，对外使用无意义
  */
  selectedDate?: Array<any>;
  /**
   * @description 开启后模式默认是范围选
   * @default false
  */
  defaultIsRange?: Array<any>;
}
const V2MultipleDatePicker: React.FC<V2MultipleDatePickerProps> = (props) => {
  const {
    selectedDate = [],
    onChange,
    format = 'YYYY-MM-DD',
    selectProps = {},
    datePickerProps = {},
    placeholder = '请选择日期',
    maxLength = 700,
    defaultIsRange = false,
    disabled = false
  } = refactorNull(props);
  const documentReal = useDocument();
  /* isRange、rangeStart、disabledDateCache 都是用来混合使用范围选择日期的 */
  const [isRange, setIsRange] = useState<boolean>(defaultIsRange);
  const [rangeStart, setRangeStart] = useState<number | undefined>();
  const [disabledDateCache, setDisabledDateCache] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [key, setKey] = useState<string>();
  useEffect(() => {
    if (!key) {
      setKey(v4());
    }
  }, []);
  // 如果是范围选就要先把禁止操作项插进去
  useEffect(() => {
    if (open) {
      if (isRange) {
        setDisabledDateCache(deepCopy(selectedDate));
      }
    }
  }, [open]);
  const onValueChange = (date) => {
    const t = getTimestamp(date);
    const index = selectedDate.indexOf(t);
    const clone = deepCopy(selectedDate);
    if (index > -1) {
      clone.splice(index, 1);
    } else {
      clone.push(t);
    }
    if (clone.length > maxLength) {
      return V2Message.error(`最多只能选择${maxLength}个日期`);
    }
    // 如果开启了范围操作
    if (isRange) {
      if (!rangeStart) { // 没有起始日期时，点击后先存起来
        setRangeStart(t);
      } else if (rangeStart === t) { // 如果点击了同一个起始日期，就取消选中
        setRangeStart(undefined);
      } else { // 点击了不同的数字，需要帮助其范围选中
        let start;
        let end;
        if (t > rangeStart) {
          end = t;
          start = rangeStart;
        } else {
          end = rangeStart;
          start = t;
        }
        while (start < end) {
          start += dateFns.day;
          if (start < end && !clone.includes(start)) {
            clone.push(start);
          }
        }
        if (clone.length > maxLength) {
          return V2Message.error(`最多只能选择${maxLength}个日期`);
        }
        // 选完后需要重置起始日期，以及把选完的项目加入到禁止点击中
        setRangeStart(undefined);
        setDisabledDateCache(deepCopy(clone));
      }
    }
    return onChange && onChange(clone);
  };

  const dateRender = (currentDate) => {
    const isSelected = selectedDate.indexOf(getTimestamp(currentDate)) > -1;
    return (
      <div
        className={`${antPrefix}-picker-cell-inner`}
        style={
          isSelected
            ? {
              position: 'relative',
              zIndex: 2,
              display: 'inlineBlock',
              width: '24px',
              height: '22px',
              lineHeight: '22px',
              backgroundColor: '#006AFF',
              color: '#fff',
              margin: 'auto',
              borderRadius: '2px',
              transition: 'background 0.3s, border 0.3s'
            }
            : {}
        }
      >
        {currentDate.date()}
      </div>
    );
  };

  const renderTag = ({ value, onClose }) => {
    const handleClose = () => {
      // 如果是范围选状态，就重置起始日期，并且把删除的日期移除禁止点击项
      if (isRange) {
        setRangeStart(undefined); // 收起后默认移除范围选的起始日期
        setDisabledDateCache(selectedDate.filter((t) => t !== value)); // 收起后默认取消禁选操作
      }
      onClose();
      onChange && onChange(selectedDate.filter((t) => t !== value));
    };
    return (
      <Tag key={value} onClose={handleClose} closable={!disabled}>
        {dayjs(value).format(format)}
      </Tag>
    );
  };
  const changeRange = () => { // 开启范围选择状态与否的操作方法
    setIsRange((status) => {
      if (status) { // 当前是范围状态，会转变为散选状态，清除缓存
        setDisabledDateCache([]);
      } else { // 当前是散选状态，会转变为范围状态，添加缓存
        setDisabledDateCache(deepCopy(selectedDate));
      }
      return !status;
    });
  };

  const disabledDate = (current) => {
    if (datePickerProps && datePickerProps.disabledDate) {
      return datePickerProps.disabledDate(current) || disabledDateCache.includes(dayjs(dayjs(current).format('YYYY-MM-DD')).valueOf());
    }
    return disabledDateCache.includes(dayjs(dayjs(current).format('YYYY-MM-DD')).valueOf());
  };

  const handlerBlur = () => {
    setOpen(false);
    setRangeStart(undefined); // 收起后默认移除范围选的起始日期
  };

  const handlerClear = () => {
    onChange && onChange([]);
    if (isRange) { // 范围状态需要重置
      setRangeStart(undefined); // 收起后默认移除范围选的起始日期
      setDisabledDateCache([]); // 收起后默认取消禁选操作
    }
  };
  const renderExtraFooter = () => {
    return (<>
      <Switch checkedChildren='范围' unCheckedChildren='单日' checked={isRange} onChange={changeRange} />
      <div className='multipleDropdownExtraFooter'>{checkedDates.join('、')}</div>
    </>);
  };
  const checkedDates = useMemo(() => {

    const dates: string[] = [];
    let cacheRange: number[] = [];
    selectedDate && selectedDate.sort().forEach((timer, index) => {
      if (selectedDate[index + 1] && +floorKeep(timer, dateFns.day, 2) === selectedDate[index + 1]) {
        cacheRange.push(timer);
        return;
      }
      // 如果cacheRange有数据
      if (cacheRange.length) {
        dates.push(`${dayjs(cacheRange[0]).format('YYYY.MM.DD')}~${dayjs(timer).format('YYYY.MM.DD')}`);
        cacheRange = [];
      } else {
        dates.push(dayjs(timer).format('YYYY.MM.DD'));
      }
    });
    return dates;
  }, [selectedDate]);
  return (
    <Select
      allowClear
      placeholder={placeholder}
      {...selectProps}
      mode='multiple'
      value={selectedDate}
      maxTagCount='responsive'
      onClear={handlerClear}
      tagRender={renderTag}
      open={open}
      onFocus={() => setOpen(true)}
      onBlur={handlerBlur}
      dropdownMatchSelectWidth={false}
      disabled={disabled}
      popupClassName={`v2MultipleDropdownClassName v2MultipleDropdownClassName${key}`}
      dropdownStyle={{ height: '270px', width: '280px', minWidth: '0' }}
      dropdownRender={() => {
        return (
          <DatePicker
            {...datePickerProps}
            format={() => ''}
            onChange={onValueChange}
            value={''}
            renderExtraFooter={renderExtraFooter}
            showToday={false}
            open
            dateRender={dateRender}
            disabledDate={disabledDate}
            style={{ ...datePickerProps.style, visibility: 'hidden' }}
            getPopupContainer={() => {
              return documentReal?.querySelector(`.v2MultipleDropdownClassName${key}`);
            }}
          />
        );
      }}
    />
  );
};

export default V2MultipleDatePicker;
