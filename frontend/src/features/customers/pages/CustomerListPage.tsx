import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCustomers } from '../hooks/useCustomers';
import { useDeleteCustomer } from '../hooks/useCustomerMutations';
import { useQueryParamsState } from '../../../shared/hooks/useQueryParamsState';
import { CustomerFilters } from '../components/CustomerFilters';
import { DataTable } from '../../../shared/components/DataTable';
import type { DataTableColumn } from '../../../shared/components/DataTable';
import { Pagination } from '../../../shared/components/Pagination';
import { useDialog } from '../../../shared/hooks/useDialog';
import { useToast } from '../../../shared/components/Toast/useToast';
import type { Customer } from '../types/model';
import { customerFullName } from '../types/model';
import { normalizeError } from '../../../shared/api/apiError';

const DEFAULT_FILTERS = { pageNumber: 1, pageSize: 10, search: '' };

export function CustomerListPage() {
  const [filters, setFilters] = useQueryParamsState(DEFAULT_FILTERS);
  const navigate = useNavigate();
  const { confirm } = useDialog();
  const { showToast } = useToast();

  const { data, isLoading, isFetching } = useCustomers({
    pageNumber: filters.pageNumber,
    pageSize: filters.pageSize,
    search: filters.search || undefined,
  });

  const deleteCustomer = useDeleteCustomer();

  const handleSearchChange = useCallback((search: string) => setFilters({ search, pageNumber: 1 }), [setFilters]);

  async function handleDelete(customer: Customer) {
    const confirmed = await confirm({
      title: 'Delete customer',
      message: `Delete ${customerFullName(customer)}? This can't be undone. Customers with existing bookings can't be deleted.`,
      confirmLabel: 'Delete',
      danger: true,
    });
    if (!confirmed) return;

    try {
      await deleteCustomer.mutateAsync(customer.id);
      showToast('Customer deleted.', 'success');
    } catch (error) {
      showToast(normalizeError(error).firstMessage, 'error');
    }
  }

  const columns: DataTableColumn<Customer>[] = [
    { key: 'name', header: 'Name', render: (customer) => customerFullName(customer) },
    { key: 'email', header: 'Email', render: (customer) => customer.email },
    { key: 'phone', header: 'Phone', render: (customer) => customer.phoneNumber },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (customer) => (
        <div className="row-actions">
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => navigate(`/customers/${customer.id}/edit`)}
          >
            Edit
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-sm btn-danger-text"
            onClick={() => handleDelete(customer)}
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <h1>Customers</h1>
        <button type="button" className="btn btn-primary" onClick={() => navigate('/customers/new')}>
          Add customer
        </button>
      </div>

      <CustomerFilters search={filters.search} onSearchChange={handleSearchChange} />

      <DataTable
        columns={columns}
        items={data?.items ?? []}
        getRowKey={(customer) => customer.id}
        isLoading={isLoading}
        emptyTitle="No customers found"
        emptyDescription="Try clearing your search or add a new customer."
      />

      {data && (
        <Pagination
          pageNumber={data.pageNumber}
          totalPages={data.totalPages}
          onPageChange={(page) => setFilters({ pageNumber: page })}
        />
      )}
      {isFetching && !isLoading && <p className="fetching-indicator">Refreshing…</p>}
    </div>
  );
}
