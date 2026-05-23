import { supabase } from './supabase';

const PLATFORM_FEE_PCT = 9.9;

// =============================================
// AUTH
// =============================================
export const authAPI = {
  register: async ({ email, password, name, role = 'both' }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, role } }
    });
    if (error) throw error;
    return data;
  },

  login: async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },

  logout: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  getUser: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    return profile;
  },

  updateProfile: async (updates) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Não autenticado');
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }
};

// =============================================
// APPS
// =============================================
export const appsAPI = {
  list: async ({ category, q, sort = 'featured' } = {}) => {
    let query = supabase.from('apps').select('*');
    if (category && category !== 'all') query = query.eq('category', category);
    if (q) query = query.or(`name.ilike.%${q}%,tagline.ilike.%${q}%,description.ilike.%${q}%`);
    query = query.order('tier_rank', { ascending: false }).order('rating', { ascending: false });
    const { data, error } = await query.limit(200);
    if (error) throw error;
    return data || [];
  },

  getBySlug: async (slug) => {
    const { data, error } = await supabase
      .from('apps')
      .select('*')
      .eq('slug', slug)
      .single();
    if (error) throw error;
    return data;
  },

  getById: async (id) => {
    const { data, error } = await supabase
      .from('apps')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  categories: async () => {
    const { data, error } = await supabase.from('apps').select('category');
    if (error) throw error;
    const counts = {};
    (data || []).forEach(a => { counts[a.category] = (counts[a.category] || 0) + 1; });
    return Object.entries(counts).map(([name, count]) => ({ name, count }));
  },

  create: async (payload) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Não autenticado');
    const profile = await authAPI.getUser();
    const slug = payload.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      + '-' + Math.random().toString(36).slice(2, 6);
    const { data, error } = await supabase
      .from('apps')
      .insert({
        ...payload,
        slug,
        producer_id: user.id,
        producer_name: profile?.name || 'Produtor',
        tier: 'basico',
        tier_rank: 0,
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  myApps: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Não autenticado');
    const { data, error } = await supabase
      .from('apps')
      .select('*')
      .eq('producer_id', user.id)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  upgradeTier: async (appId, tier) => {
    const tierRank = { basico: 0, plus: 1, premium: 2 };
    const { data, error } = await supabase
      .from('apps')
      .update({ tier, tier_rank: tierRank[tier], featured: tier === 'premium' })
      .eq('id', appId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  tiers: () => [
    { id: 'basico', name: 'Básico', price: 0, perks: ['Listagem padrão no marketplace', 'Acesso ao programa de afiliados', 'Materiais de divulgação básicos'] },
    { id: 'plus', name: 'Plus', price: 49, perks: ['Selo PLUS no card', 'Prioridade na ordenação', 'Materiais avançados', 'Suporte prioritário'] },
    { id: 'premium', name: 'Premium', price: 119, perks: ['Selo dourado PREMIUM', 'Topo do marketplace', 'Destaque na home', 'Banners personalizados', 'Suporte VIP'] },
  ]
};

// =============================================
// AFFILIATIONS
// =============================================
export const affiliationsAPI = {
  create: async (appId) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Não autenticado');
    const app = await appsAPI.getById(appId);
    // Check if already exists
    const { data: existing } = await supabase
      .from('affiliations')
      .select('*')
      .eq('app_id', appId)
      .eq('affiliate_id', user.id)
      .single();
    if (existing) return existing;
    const code = Math.random().toString(36).slice(2, 10).toUpperCase();
    const { data, error } = await supabase
      .from('affiliations')
      .insert({ code, app_id: appId, app_name: app.name, app_slug: app.slug, affiliate_id: user.id })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  myAffiliations: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Não autenticado');
    const { data, error } = await supabase
      .from('affiliations')
      .select('*, apps(*)')
      .eq('affiliate_id', user.id)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  trackClick: async (code) => {
    const { data } = await supabase
      .from('affiliations')
      .select('clicks')
      .eq('code', code)
      .single();
    if (data) {
      await supabase
        .from('affiliations')
        .update({ clicks: data.clicks + 1 })
        .eq('code', code);
    }
  }
};

// =============================================
// CHECKOUT / SALES
// =============================================
export const salesAPI = {
  checkout: async ({ appId, buyerEmail, buyerName, affiliationCode, installments = 1 }) => {
    const app = await appsAPI.getById(appId);
    const amount = parseFloat(app.price_monthly);
    const commissionPct = parseFloat(app.commission_pct);
    const platformAmount = parseFloat((amount * PLATFORM_FEE_PCT / 100).toFixed(2));
    const afterPlatform = amount - platformAmount;

    let affiliateId = null;
    let affiliateAmount = 0;

    if (affiliationCode) {
      const { data: aff } = await supabase
        .from('affiliations')
        .select('*')
        .eq('code', affiliationCode)
        .single();
      if (aff && aff.app_id === appId) {
        affiliateId = aff.affiliate_id;
        affiliateAmount = parseFloat((afterPlatform * commissionPct / 100).toFixed(2));
        // Update affiliation stats
        await supabase.from('affiliations').update({
          sales: aff.sales + 1,
          earned: aff.earned + affiliateAmount
        }).eq('code', affiliationCode);
      }
    }

    const producerAmount = parseFloat((afterPlatform - affiliateAmount).toFixed(2));
    const inst = Math.max(1, Math.min(12, installments));

    const { data: sale, error } = await supabase
      .from('sales')
      .insert({
        app_id: appId,
        app_name: app.name,
        buyer_email: buyerEmail.toLowerCase(),
        buyer_name: buyerName,
        amount,
        installments: inst,
        installment_amount: parseFloat((amount / inst).toFixed(2)),
        producer_id: app.producer_id,
        affiliate_id: affiliateId,
        affiliation_code: affiliationCode,
        producer_amount: producerAmount,
        affiliate_amount: affiliateAmount,
        platform_amount: platformAmount,
        status: 'paid'
      })
      .select()
      .single();
    if (error) throw error;

    // Update app subscribers
    await supabase.from('apps').update({ subscribers: app.subscribers + 1 }).eq('id', appId);

    // Update producer balance
    if (app.producer_id) {
      const { data: prod } = await supabase.from('profiles').select('balance').eq('id', app.producer_id).single();
      if (prod) {
        await supabase.from('profiles').update({ balance: prod.balance + producerAmount }).eq('id', app.producer_id);
        await supabase.from('notifications').insert({
          user_id: app.producer_id,
          title: 'Nova venda!',
          message: `${buyerName} assinou ${app.name} (+R$ ${producerAmount.toFixed(2)})`
        });
      }
    }

    // Update affiliate balance
    if (affiliateId) {
      const { data: aff } = await supabase.from('profiles').select('balance, affiliate_tier').eq('id', affiliateId).single();
      if (aff) {
        const newBalance = aff.balance + affiliateAmount;
        let tier = 'bronze';
        if (newBalance >= 5000) tier = 'ouro';
        else if (newBalance >= 1000) tier = 'prata';
        await supabase.from('profiles').update({ balance: newBalance, affiliate_tier: tier }).eq('id', affiliateId);
        await supabase.from('notifications').insert({
          user_id: affiliateId,
          title: 'Comissão recebida!',
          message: `Você ganhou R$ ${affiliateAmount.toFixed(2)} com a venda de ${app.name}`
        });
      }
    }

    return sale;
  },

  mySales: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Não autenticado');
    const { data, error } = await supabase
      .from('sales')
      .select('*')
      .eq('producer_id', user.id)
      .order('created_at', { ascending: false })
      .limit(100);
    if (error) throw error;
    return data || [];
  },

  myCommissions: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Não autenticado');
    const { data, error } = await supabase
      .from('sales')
      .select('*')
      .eq('affiliate_id', user.id)
      .order('created_at', { ascending: false })
      .limit(100);
    if (error) throw error;
    return data || [];
  }
};

// =============================================
// REVIEWS
// =============================================
export const reviewsAPI = {
  add: async ({ appId, rating, comment }) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Não autenticado');
    const profile = await authAPI.getUser();
    const { data, error } = await supabase
      .from('reviews')
      .insert({ app_id: appId, user_id: user.id, user_name: profile?.name || 'Usuário', rating, comment })
      .select()
      .single();
    if (error) throw error;
    // Recalculate avg rating
    const { data: all } = await supabase.from('reviews').select('rating').eq('app_id', appId);
    if (all) {
      const avg = all.reduce((s, r) => s + r.rating, 0) / all.length;
      await supabase.from('apps').update({ rating: parseFloat(avg.toFixed(1)), reviews_count: all.length }).eq('id', appId);
    }
    return data;
  },

  list: async (appId) => {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('app_id', appId)
      .order('created_at', { ascending: false })
      .limit(100);
    if (error) throw error;
    return data || [];
  }
};

// =============================================
// NOTIFICATIONS
// =============================================
export const notificationsAPI = {
  list: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) throw error;
    return data || [];
  },

  markAllRead: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('notifications').update({ read: true }).eq('user_id', user.id);
  }
};

// =============================================
// WALLET
// =============================================
export const walletAPI = {
  get: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Não autenticado');
    const [{ data: profile }, { data: withdrawals }] = await Promise.all([
      supabase.from('profiles').select('balance, affiliate_tier').eq('id', user.id).single(),
      supabase.from('withdrawals').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(50)
    ]);
    return {
      balance: profile?.balance || 0,
      tier: profile?.affiliate_tier || 'bronze',
      withdrawals: withdrawals || []
    };
  },

  withdraw: async ({ amount, pixKey }) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Não autenticado');
    const { data: profile } = await supabase.from('profiles').select('balance').eq('id', user.id).single();
    if (!profile || amount <= 0 || amount > profile.balance) throw new Error('Valor inválido ou saldo insuficiente');
    const { data, error } = await supabase
      .from('withdrawals')
      .insert({ user_id: user.id, amount, pix_key: pixKey, status: 'pending' })
      .select()
      .single();
    if (error) throw error;
    await supabase.from('profiles').update({ balance: profile.balance - amount }).eq('id', user.id);
    return data;
  }
};

// =============================================
// STATS
// =============================================
export const statsAPI = {
  producer: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Não autenticado');
    const { data: sales } = await supabase.from('sales').select('*').eq('producer_id', user.id);
    const { count: appsCount } = await supabase.from('apps').select('*', { count: 'exact', head: true }).eq('producer_id', user.id);
    const allSales = sales || [];
    const totalRevenue = allSales.reduce((s, x) => s + x.producer_amount, 0);
    const now = new Date();
    const last30 = allSales.filter(s => new Date(s.created_at) > new Date(now - 30 * 86400000));
    const series = {};
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now - i * 86400000);
      series[d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })] = 0;
    }
    allSales.forEach(s => {
      const d = new Date(s.created_at);
      if (now - d < 14 * 86400000) {
        const key = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
        if (key in series) series[key] += s.producer_amount;
      }
    });
    return {
      total_revenue: parseFloat(totalRevenue.toFixed(2)),
      total_sales: allSales.length,
      apps_count: appsCount || 0,
      revenue_30d: parseFloat(last30.reduce((s, x) => s + x.producer_amount, 0).toFixed(2)),
      chart: Object.entries(series).map(([day, value]) => ({ day, value: parseFloat(value.toFixed(2)) }))
    };
  },

  affiliate: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Não autenticado');
    const [{ data: sales }, { data: affs }] = await Promise.all([
      supabase.from('sales').select('*').eq('affiliate_id', user.id),
      supabase.from('affiliations').select('*').eq('affiliate_id', user.id)
    ]);
    const allSales = sales || [];
    const allAffs = affs || [];
    const totalEarned = allSales.reduce((s, x) => s + x.affiliate_amount, 0);
    const totalClicks = allAffs.reduce((s, x) => s + x.clicks, 0);
    const conv = totalClicks > 0 ? (allSales.length / totalClicks * 100) : 0;
    const now = new Date();
    const series = {};
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now - i * 86400000);
      series[d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })] = 0;
    }
    allSales.forEach(s => {
      const d = new Date(s.created_at);
      if (now - d < 14 * 86400000) {
        const key = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
        if (key in series) series[key] += s.affiliate_amount;
      }
    });
    return {
      total_earned: parseFloat(totalEarned.toFixed(2)),
      total_sales: allSales.length,
      total_clicks: totalClicks,
      conversion: parseFloat(conv.toFixed(2)),
      affiliations: allAffs.length,
      chart: Object.entries(series).map(([day, value]) => ({ day, value: parseFloat(value.toFixed(2)) }))
    };
  }
};

// =============================================
// MATERIALS
// =============================================
export const materialsAPI = {
  get: async (appId) => {
    const app = await appsAPI.getById(appId);
    const slug = app.name.toLowerCase().replace(/[^a-z0-9]+/g, '');
    const cat = app.category.toLowerCase().replace(/[^a-z0-9]+/g, '');
    return {
      banners: [
        { size: '1080x1080', url: app.cover_url || app.icon_url, label: 'Quadrado (Instagram)' },
        { size: '1200x630', url: app.cover_url || app.icon_url, label: 'Open Graph (Facebook/X)' },
        { size: '1920x1080', url: app.cover_url || app.icon_url, label: 'Banner Wide (YouTube)' },
      ],
      copy: [
        { title: 'Headline curta', text: `Descubra o ${app.name} — ${app.tagline}` },
        { title: 'Story de venda', text: `Eu testei o ${app.name} por 30 dias e mudou minha rotina. ${app.tagline}. Clique no link da bio.` },
        { title: 'E-mail marketing', text: `Olá! Quero te apresentar uma ferramenta que está revolucionando: ${app.name}. ${app.description.slice(0, 200)}...` },
      ],
      hashtags: ['#sinkronize', `#${slug}`, `#${cat}`, '#afiliados', '#rendaextra']
    };
  }
};
