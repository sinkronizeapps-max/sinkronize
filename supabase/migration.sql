-- =============================================
-- SINKRONIZE - Schema Completo Supabase
-- =============================================

-- Extensões necessárias
create extension if not exists "uuid-ossp";

-- =============================================
-- TABELA: profiles (perfis dos usuários)
-- =============================================
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text unique not null,
  name text not null,
  picture text,
  role text not null default 'both' check (role in ('producer', 'affiliate', 'both')),
  affiliate_tier text not null default 'bronze' check (affiliate_tier in ('bronze', 'prata', 'ouro')),
  balance numeric(10,2) not null default 0.0,
  created_at timestamptz not null default now()
);

-- =============================================
-- TABELA: apps
-- =============================================
create table if not exists public.apps (
  id uuid default uuid_generate_v4() primary key,
  slug text unique not null,
  name text not null,
  tagline text not null,
  description text not null,
  category text not null,
  price_monthly numeric(10,2) not null,
  commission_pct numeric(5,2) not null,
  icon_url text,
  cover_url text,
  producer_id uuid references public.profiles(id) on delete set null,
  producer_name text not null default 'Demo',
  rating numeric(3,1) not null default 0.0,
  reviews_count integer not null default 0,
  subscribers integer not null default 0,
  featured boolean not null default false,
  tier text not null default 'basico' check (tier in ('basico', 'plus', 'premium')),
  tier_rank integer not null default 0,
  created_at timestamptz not null default now()
);

-- =============================================
-- TABELA: affiliations (links de afiliados)
-- =============================================
create table if not exists public.affiliations (
  id uuid default uuid_generate_v4() primary key,
  code text unique not null,
  app_id uuid references public.apps(id) on delete cascade,
  app_name text not null,
  app_slug text not null,
  affiliate_id uuid references public.profiles(id) on delete cascade,
  clicks integer not null default 0,
  sales integer not null default 0,
  earned numeric(10,2) not null default 0.0,
  created_at timestamptz not null default now()
);

-- =============================================
-- TABELA: sales (vendas)
-- =============================================
create table if not exists public.sales (
  id uuid default uuid_generate_v4() primary key,
  app_id uuid references public.apps(id) on delete set null,
  app_name text not null,
  buyer_email text not null,
  buyer_name text not null,
  amount numeric(10,2) not null,
  installments integer not null default 1,
  installment_amount numeric(10,2) not null,
  producer_id uuid references public.profiles(id) on delete set null,
  affiliate_id uuid references public.profiles(id) on delete set null,
  affiliation_code text,
  producer_amount numeric(10,2) not null,
  affiliate_amount numeric(10,2) not null default 0,
  platform_amount numeric(10,2) not null,
  status text not null default 'paid' check (status in ('paid', 'pending', 'refunded')),
  created_at timestamptz not null default now()
);

-- =============================================
-- TABELA: reviews
-- =============================================
create table if not exists public.reviews (
  id uuid default uuid_generate_v4() primary key,
  app_id uuid references public.apps(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  user_name text not null,
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text not null,
  created_at timestamptz not null default now()
);

-- =============================================
-- TABELA: notifications
-- =============================================
create table if not exists public.notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  title text not null,
  message text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

-- =============================================
-- TABELA: withdrawals (saques PIX)
-- =============================================
create table if not exists public.withdrawals (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  amount numeric(10,2) not null,
  pix_key text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'paid')),
  created_at timestamptz not null default now()
);

-- =============================================
-- RLS - Segurança por linha
-- =============================================
alter table public.profiles enable row level security;
alter table public.apps enable row level security;
alter table public.affiliations enable row level security;
alter table public.sales enable row level security;
alter table public.reviews enable row level security;
alter table public.notifications enable row level security;
alter table public.withdrawals enable row level security;

-- Profiles
create policy "Perfis visíveis para todos" on public.profiles for select using (true);
create policy "Usuário atualiza próprio perfil" on public.profiles for update using (auth.uid() = id);
create policy "Usuário cria próprio perfil" on public.profiles for insert with check (auth.uid() = id);

-- Apps
create policy "Apps visíveis para todos" on public.apps for select using (true);
create policy "Produtor cria app" on public.apps for insert with check (auth.uid() = producer_id);
create policy "Produtor atualiza próprio app" on public.apps for update using (auth.uid() = producer_id or producer_id is null);

-- Affiliations
create policy "Afiliado vê próprias afiliações" on public.affiliations for select using (auth.uid() = affiliate_id);
create policy "Afiliado cria afiliação" on public.affiliations for insert with check (auth.uid() = affiliate_id);
create policy "Sistema atualiza afiliação" on public.affiliations for update using (true);

-- Sales
create policy "Produtor e afiliado veem vendas" on public.sales for select using (auth.uid() = producer_id or auth.uid() = affiliate_id);
create policy "Qualquer um pode criar venda" on public.sales for insert with check (true);

-- Reviews
create policy "Reviews visíveis para todos" on public.reviews for select using (true);
create policy "Usuário autenticado adiciona review" on public.reviews for insert with check (auth.uid() = user_id);

-- Notifications
create policy "Usuário vê próprias notificações" on public.notifications for select using (auth.uid() = user_id);
create policy "Sistema insere notificações" on public.notifications for insert with check (true);
create policy "Usuário atualiza próprias notificações" on public.notifications for update using (auth.uid() = user_id);

-- Withdrawals
create policy "Usuário vê próprios saques" on public.withdrawals for select using (auth.uid() = user_id);
create policy "Usuário cria saque" on public.withdrawals for insert with check (auth.uid() = user_id);

-- =============================================
-- TRIGGER: cria perfil automaticamente no cadastro
-- =============================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name, picture)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'picture'
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =============================================
-- SEED: dados de demonstração (9 apps)
-- =============================================
insert into public.apps (slug, name, tagline, description, category, price_monthly, commission_pct, icon_url, cover_url, producer_name, rating, reviews_count, subscribers, featured, tier, tier_rank, created_at)
values
  ('mente-calma', 'Mente Calma', 'Meditação guiada por IA em 5 minutos', 'Meditação guiada por IA em 5 minutos. Uma experiência cuidadosamente desenhada para transformar seu dia a dia. Acesso ilimitado, atualizações constantes e suporte humano sempre que precisar.', 'Bem-estar', 29.90, 50, 'https://images.unsplash.com/photo-1545389336-cf090694435e?w=400&q=80', 'https://images.unsplash.com/photo-1545389336-cf090694435e?w=400&q=80', 'Studio Nova', 4.2, 40, 1200, true, 'premium', 2, now() - interval '0 days'),
  ('fluxo-pro', 'FluxoPro', 'Produtividade para criadores que cobram caro', 'Produtividade para criadores que cobram caro. Uma experiência cuidadosamente desenhada para transformar seu dia a dia. Acesso ilimitado, atualizações constantes e suporte humano sempre que precisar.', 'Produtividade', 49.90, 40, 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&q=80', 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&q=80', 'Studio Nova', 4.3, 63, 1680, true, 'premium', 2, now() - interval '3 days'),
  ('treino-ia', 'TreinoIA', 'Personal trainer com IA no seu bolso', 'Personal trainer com IA no seu bolso. Uma experiência cuidadosamente desenhada para transformar seu dia a dia. Acesso ilimitado, atualizações constantes e suporte humano sempre que precisar.', 'Fitness', 39.90, 45, 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&q=80', 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&q=80', 'Studio Nova', 4.4, 86, 2160, false, 'plus', 1, now() - interval '6 days'),
  ('financas-zen', 'Finanças Zen', 'Controle financeiro sem planilha', 'Controle financeiro sem planilha. Uma experiência cuidadosamente desenhada para transformar seu dia a dia. Acesso ilimitado, atualizações constantes e suporte humano sempre que precisar.', 'Finanças', 19.90, 60, 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&q=80', 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&q=80', 'Studio Nova', 4.5, 109, 2640, false, 'plus', 1, now() - interval '9 days'),
  ('chef-ia', 'ChefIA', 'Receitas com o que você tem na geladeira', 'Receitas com o que você tem na geladeira. Uma experiência cuidadosamente desenhada para transformar seu dia a dia. Acesso ilimitado, atualizações constantes e suporte humano sempre que precisar.', 'Culinária', 24.90, 55, 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80', 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80', 'Studio Nova', 4.6, 132, 3120, false, 'plus', 1, now() - interval '12 days'),
  ('idiomas-vivos', 'Idiomas Vivos', 'Aprenda 7 idiomas conversando', 'Aprenda 7 idiomas conversando. Uma experiência cuidadosamente desenhada para transformar seu dia a dia. Acesso ilimitado, atualizações constantes e suporte humano sempre que precisar.', 'Educação', 59.90, 35, 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=400&q=80', 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=400&q=80', 'Studio Nova', 4.7, 155, 3600, false, 'basico', 0, now() - interval '15 days'),
  ('sono-profundo', 'Sono Profundo', 'Histórias e sons que te fazem dormir em 7 minutos', 'Histórias e sons que te fazem dormir em 7 minutos. Uma experiência cuidadosamente desenhada para transformar seu dia a dia. Acesso ilimitado, atualizações constantes e suporte humano sempre que precisar.', 'Bem-estar', 14.90, 65, 'https://images.unsplash.com/photo-1520206183501-b80df61043c2?w=400&q=80', 'https://images.unsplash.com/photo-1520206183501-b80df61043c2?w=400&q=80', 'Studio Nova', 4.8, 178, 4080, false, 'basico', 0, now() - interval '18 days'),
  ('pet-saude', 'Pet Saúde', 'App veterinário para tutores apaixonados', 'App veterinário para tutores apaixonados. Uma experiência cuidadosamente desenhada para transformar seu dia a dia. Acesso ilimitado, atualizações constantes e suporte humano sempre que precisar.', 'Pets', 34.90, 50, 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=400&q=80', 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=400&q=80', 'Studio Nova', 4.9, 201, 4560, false, 'basico', 0, now() - interval '21 days'),
  ('vendedor-10x', 'Vendedor 10x', 'Scripts e CRM para autônomos', 'Scripts e CRM para autônomos. Uma experiência cuidadosamente desenhada para transformar seu dia a dia. Acesso ilimitado, atualizações constantes e suporte humano sempre que precisar.', 'Negócios', 69.90, 40, 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=400&q=80', 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=400&q=80', 'Studio Nova', 5.0, 224, 5040, false, 'basico', 0, now() - interval '24 days')
on conflict (slug) do nothing;
