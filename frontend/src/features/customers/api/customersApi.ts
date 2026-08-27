import { axiosClient } from '../../../shared/api/axiosClient';
import type { PagedResult } from '../../../shared/api/types';
import type { CustomerDto } from '../types/dto';

export interface CustomerListParams {
  pageNumber?: number;
  pageSize?: number;
  search?: string;
}

export interface CreateCustomerInput {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
}

export interface UpdateCustomerInput {
  firstName: string;
  lastName: string;
  phoneNumber: string;
}

export const customersApi = {
  async getCustomers(params: CustomerListParams): Promise<PagedResult<CustomerDto>> {
    const { data } = await axiosClient.get<PagedResult<CustomerDto>>('/customers', { params });
    return data;
  },

  async getCustomer(id: string): Promise<CustomerDto> {
    const { data } = await axiosClient.get<CustomerDto>(`/customers/${id}`);
    return data;
  },

  async createCustomer(input: CreateCustomerInput): Promise<CustomerDto> {
    const { data } = await axiosClient.post<CustomerDto>('/customers', input);
    return data;
  },

  async updateCustomer(id: string, input: UpdateCustomerInput): Promise<CustomerDto> {
    const { data } = await axiosClient.put<CustomerDto>(`/customers/${id}`, input);
    return data;
  },

  async deleteCustomer(id: string): Promise<void> {
    await axiosClient.delete(`/customers/${id}`);
  },
};
