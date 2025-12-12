-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- USERS TABLE (Extends auth.users)
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade not null,
  email text not null,
  nome text,
  avatar_url text,
  plano_atual text default 'free' check (plano_atual in ('free', 'pro', 'pro_plus')),
  stripe_customer_id text,
  stripe_subscription_id text,
  current_period_start timestamp with time zone,
  current_period_end timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.users enable row level security;
create policy "Users can view own data" on public.users for select using (auth.uid() = id);
create policy "Users can update own data" on public.users for update using (auth.uid() = id);

-- Function to handle new user creation trigger
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.users (id, email, nome, plano_atual)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', coalesce(new.raw_user_meta_data->>'plano_atual', 'free'));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- PRODUCTS TABLE
create table public.products (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id) on delete cascade not null,
  nome text not null,
  descricao text,
  segmento text,
  imagem_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.products enable row level security;
create policy "Users can crud own products" on public.products for all using (auth.uid() = user_id);

-- SCRIPTS TABLE
create table public.scripts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id) on delete cascade not null,
  product_id uuid references public.products(id) on delete cascade not null,
  tipo_lead text, -- frio, morno, quente
  canal_venda text, -- whatsapp, instagram, etc
  regiao text, -- Sul, SP, RJ, Nordeste, Neutro
  mensagem_abertura text,
  roteiro_conversa text,
  respostas_objecoes jsonb, 
  follow_up jsonb,
  conversation_history jsonb, -- Saved conversation flow
  modelo_usado text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.scripts enable row level security;
create policy "Users can crud own scripts" on public.scripts for all using (auth.uid() = user_id);

-- USAGE STATS TABLE
create table public.usage_stats (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id) on delete cascade not null,
  mes_referencia text not null, -- Format YYYY-MM
  scripts_gerados int default 0,
  mockups_gerados int default 0,
  videos_gerados int default 0,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, mes_referencia)
);

alter table public.usage_stats enable row level security;
create policy "Users can view own stats" on public.usage_stats for select using (auth.uid() = user_id);
-- Only system should update usage stats really, but for MVP client might increment or via RPC. 
-- Ideally usage increment is done via secure RPC or Server Action with Service Role.

-- MOCKUPS TABLE
create table public.mockups (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id) on delete cascade not null,
  product_id uuid references public.products(id) on delete cascade not null,
  imagem_url text not null,
  prompt_usado text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.mockups enable row level security;
create policy "Users can crud own mockups" on public.mockups for all using (auth.uid() = user_id);

-- VIDEOS TABLE
create table public.videos (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id) on delete cascade not null,
  product_id uuid references public.products(id) on delete cascade not null,
  video_url text not null,
  prompt_usado text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.videos enable row level security;
create policy "Users can crud own videos" on public.videos for all using (auth.uid() = user_id);

-- STORAGE BUCKETS
insert into storage.buckets (id, name, public) values ('products', 'products', true)
on conflict (id) do nothing;

-- Allow Public Access (Read)
create policy "Public Access" on storage.objects for select using ( bucket_id = 'products' );

-- Allow Public Uploads (Anon & Authenticated for 'try before buy' flow)
-- For better security in prod, specific folders or signed URLs preferred, but for this MVP:
create policy "Public Upload" on storage.objects for insert with check ( bucket_id = 'products' );

-- AVATARS BUCKET
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "Avatar Public Access" on storage.objects for select using ( bucket_id = 'avatars' );
create policy "Avatar User Upload" on storage.objects for insert with check ( bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1] );
create policy "Avatar User Update" on storage.objects for update using ( bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1] );

