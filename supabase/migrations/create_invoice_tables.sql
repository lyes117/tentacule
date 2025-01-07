-- Create invoices table
create table public.invoices (
    id uuid default uuid_generate_v4() primary key,
    profile_id uuid references public.profiles(id) on delete cascade not null,
    client_id uuid references public.clients(id) on delete cascade not null,
    invoice_number text not null,
    invoice_date date not null default current_date,
    due_date date not null,
    status text not null default 'pending',
    subtotal numeric(10,2) not null,
    tax_rate numeric(4,2) not null default 20.00,
    tax_amount numeric(10,2) not null,
    total numeric(10,2) not null,
    notes text,
    company_details jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create invoice items table
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

-- Enable RLS
alter table public.invoices enable row level security;
alter table public.invoice_items enable row level security;

-- Create policies
create policy "Users can view their own invoices"
    on public.invoices for select
    using (profile_id = auth.uid());

create policy "Users can create their own invoices"
    on public.invoices for insert
    with check (profile_id = auth.uid());

create policy "Users can update their own invoices"
    on public.invoices for update
    using (profile_id = auth.uid());

create policy "Users can delete their own invoices"
    on public.invoices for delete
    using (profile_id = auth.uid());

-- Invoice items policies
create policy "Users can view their invoice items"
    on public.invoice_items for select
    using (
        exists (
            select 1 from public.invoices
            where invoices.id = invoice_items.invoice_id
            and invoices.profile_id = auth.uid()
        )
    );

create policy "Users can create invoice items"
    on public.invoice_items for insert
    with check (
        exists (
            select 1 from public.invoices
            where invoices.id = invoice_items.invoice_id
            and invoices.profile_id = auth.uid()
        )
    );

create policy "Users can update invoice items"
    on public.invoice_items for update
    using (
        exists (
            select 1 from public.invoices
            where invoices.id = invoice_items.invoice_id
            and invoices.profile_id = auth.uid()
        )
    );

create policy "Users can delete invoice items"
    on public.invoice_items for delete
    using (
        exists (
            select 1 from public.invoices
            where invoices.id = invoice_items.invoice_id
            and invoices.profile_id = auth.uid()
        )
    );

-- Create indexes
create index idx_invoices_profile_id on public.invoices(profile_id);
create index idx_invoices_client_id on public.invoices(client_id);
create index idx_invoice_items_invoice_id on public.invoice_items(invoice_id);
