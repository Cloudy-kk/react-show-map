import { FC } from 'react';
import { employeesList } from '@/common/api/employee';
import Fuzzy from './Fuzzy';

const Employees: FC<any> = ({
  finallyData,
  ...props
}) => {
  const loadData = async (keyword?: string) => {
    const params = {
      keyword
    };
    const data = await employeesList(params);
    finallyData && finallyData(data);
    return Promise.resolve(data);
  };

  return (
    <Fuzzy
      loadData={loadData}
      fieldNames={{
        label: 'name',
        value: 'id'
      }}
      {...props}/>
  );
};

export default Employees;
