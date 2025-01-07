-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Profiles table for extended user information
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  company_name text,
  company_size text,
  industry text,
  phone text,
  address text,
  city text,
  postal_code text,
  country text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS (Row Level Security)
alter table public.profiles enable row level security;

-- Employees table
create table public.employees (
  id uuid default uuid_generate_v4() primary key,
  profile_id uuid references public.profiles(id) on delete cascade not null,
  first_name text not null,
  last_name text not null,
  email text unique not null,
  phone text,
  position text,
  department text,
  hire_date date,
  salary numeric(10,2),
  status text default 'active',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tasks table
create table public.tasks (
  id uuid default uuid_generate_v4() primary key,
  profile_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text,
  status text default 'pending',
  priority text default 'medium',
  assigned_to uuid references public.employees(id) on delete set null,
  due_date timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Clients table
create table public.clients (
  id uuid default uuid_generate_v4() primary key,
  profile_id uuid references public.profiles(id) on delete cascade not null,
  company_name text,
  contact_name text not null,
  email text not null,
  phone text,
  address text,
  city text,
  postal_code text,
  country text,
  notes text,
  status text default 'active',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Invoices table
create table public.invoices (
  id uuid default uuid_generate_v4() primary key,
  profile_id uuid references public.profiles(id) on delete cascade not null,
  client_id uuid references public.clients(id) on delete cascade not null,
  invoice_number text not null,
  issue_date date not null,
  due_date date not null,
  status text default 'draft',
  subtotal numeric(10,2) not null,
  tax_rate numeric(4,2) default 20.00,
  tax_amount numeric(10,2) not null,
  total numeric(10,2) not null,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Invoice items table
create table public.invoice_items (
  id uuid default uuid_generate_v4() primary key,
  invoice_id uuid references public.invoices(id) on delete cascade not null,
  description text not null,
  quantity numeric(10,2) not null,
  unit_price numeric(10,2) not null,
  amount numeric(10,2) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Leave requests table
create table public.leave_requests (
  id uuid default uuid_generate_v4() primary key,
  profile_id uuid references public.profiles(id) on delete cascade not null,
  employee_id uuid references public.employees(id) on delete cascade not null,
  start_date date not null,
  end_date date not null,
  type text not null,
  status text default 'pending',
  reason text,
  approved_by uuid references public.employees(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Performance reviews table
create table public.performance_reviews (
  id uuid default uuid_generate_v4() primary key,
  profile_id uuid references public.profiles(id) on delete cascade not null,
  employee_id uuid references public.employees(id) on delete cascade not null,
  reviewer_id uuid references public.employees(id) on delete cascade not null,
  review_date date not null,
  performance_score numeric(3,2),
  comments text,
  goals text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create indexes for better performance
create index idx_profiles_company_name on public.profiles(company_name);
create index idx_employees_profile_id on public.employees(profile_id);
create index idx_employees_email on public.employees(email);
create index idx_tasks_profile_id on public.tasks(profile_id);
create index idx_tasks_assigned_to on public.tasks(assigned_to);
create index idx_clients_profile_id on public.clients(profile_id);
create index idx_invoices_profile_id on public.invoices(profile_id);
create index idx_invoices_client_id on public.invoices(client_id);
create index idx_invoice_items_invoice_id on public.invoice_items(invoice_id);
create index idx_leave_requests_employee_id on public.leave_requests(employee_id);
create index idx_performance_reviews_employee_id on public.performance_reviews(employee_id);

-- Create RLS policies
-- Profiles policies
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Employees policies
create policy "Users can view their company employees"
  on public.employees for select
  using (profile_id = auth.uid());

create policy "Users can insert employees"
  on public.employees for insert
  with check (profile_id = auth.uid());

create policy "Users can update their company employees"
  on public.employees for update
  using (profile_id = auth.uid());

create policy "Users can delete their company employees"
  on public.employees for delete
  using (profile_id = auth.uid());

-- Tasks policies
create policy "Users can view their company tasks"
  on public.tasks for select
  using (profile_id = auth.uid());

create policy "Users can insert tasks"
  on public.tasks for insert
  with check (profile_id = auth.uid());

create policy "Users can update their company tasks"
  on public.tasks for update
  using (profile_id = auth.uid());

create policy "Users can delete their company tasks"
  on public.tasks for delete
  using (profile_id = auth.uid());

-- Clients policies
create policy "Users can view their company clients"
  on public.clients for select
  using (profile_id = auth.uid());

create policy "Users can insert clients"
  on public.clients for insert
  with check (profile_id = auth.uid());

create policy "Users can update their company clients"
  on public.clients for update
  using (profile_id = auth.uid());

create policy "Users can delete their company clients"
  on public.clients for delete
  using (profile_id = auth.uid());

-- Invoices policies
create policy "Users can view their company invoices"
  on public.invoices for select
  using (profile_id = auth.uid());

create policy "Users can insert invoices"
  on public.invoices for insert
  with check (profile_id = auth.uid());

create policy "Users can update their company invoices"
  on public.invoices for update
  using (profile_id = auth.uid());

create policy "Users can delete their company invoices"
  on public.invoices for delete
  using (profile_id = auth.uid());

-- Invoice items policies
create policy "Users can view their company invoice items"
  on public.invoice_items for select
  using (exists (
    select 1 from public.invoices
    where invoices.id = invoice_items.invoice_id
    and invoices.profile_id = auth.uid()
  ));

create policy "Users can insert invoice items"
  on public.invoice_items for insert
  with check (exists (
    select 1 from public.invoices
    where invoices.id = invoice_items.invoice_id
    and invoices.profile_id = auth.uid()
  ));

create policy "Users can update their company invoice items"
  on public.invoice_items for update
  using (exists (
    select 1 from public.invoices
    where invoices.id = invoice_items.invoice_id
    and invoices.profile_id = auth.uid()
  ));

create policy "Users can delete their company invoice items"
  on public.invoice_items for delete
  using (exists (
    select 1 from public.invoices
    where invoices.id = invoice_items.invoice_id
    and invoices.profile_id = auth.uid()
  ));

-- Enable RLS on all tables
alter table public.employees enable row level security;
alter table public.tasks enable row level security;
alter table public.clients enable row level security;
alter table public.invoices enable row level security;
alter table public.invoice_items enable row level security;
alter table public.leave_requests enable row level security;
alter table public.performance_reviews enable row level security;

-- Create functions for automatic updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create triggers for automatic updated_at
create trigger handle_updated_at
  before update on public.profiles
  for each row
  execute function public.handle_updated_at();

create trigger handle_updated_at
  before update on public.employees
  for each row
  execute function public.handle_updated_at();

create trigger handle_updated_at
  before update on public.tasks
  for each row
  execute function public.handle_updated_at();

create trigger handle_updated_at
  before update on public.clients
  for each row
  execute function public.handle_updated_at();

create trigger handle_updated_at
  before update on public.invoices
  for each row
  execute function public.handle_updated_at();

create trigger handle_updated_at
  before update on public.invoice_items
  for each row
  execute function public.handle_updated_at();

create trigger handle_updated_at
  before update on public.leave_requests
  for each row
  execute function public.handle_updated_at();

create trigger handle_updated_at
  before update on public.performance_reviews
  for each row
  execute function public.handle_updated_at();
