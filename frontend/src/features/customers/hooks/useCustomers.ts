import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { customersApi } from '../api/customersApi';
import type { CustomerListParams } from '../api/customersApi';
import { customerKeys } from './queryKeys';
import { toCustomerModel } from '../types/model';
import type { PagedResult } from '../../../shared/api/types';
import type { Customer } from '../types/model';

export function useCustomers(filters: CustomerListParams) {
  return useQuery({
    queryKey: customerKeys.list(filters),
    queryFn: () => customersApi.getCustomers(filters),
    select: (data): PagedResult<Customer> => ({ ...data, items: data.items.map(toCustomerModel) }),
    placeholderData: keepPreviousData,
  });
}

export function useCustomer(id: string | undefined) {
  return useQuery({
    queryKey: customerKeys.detail(id ?? ''),
    queryFn: () => customersApi.getCustomer(id as string),
    select: toCustomerModel,
    enabled: Boolean(id),
  });
}
