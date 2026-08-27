import type { CustomerDto } from './dto';

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  createdDate: Date;
}

export function toCustomerModel(dto: CustomerDto): Customer {
  return { ...dto, createdDate: new Date(dto.createdDate) };
}

export function customerFullName(customer: Pick<Customer, 'firstName' | 'lastName'>): string {
  return `${customer.firstName} ${customer.lastName}`;
}
