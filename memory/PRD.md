# SINKRONIZE - PRD

## Problem
Marketplace estilo Hotmart para apps de assinatura, com afiliados e produtores. Paleta Claude (coral/bege/charcoal), tipografia editorial.

## Stack
React + FastAPI + MongoDB. Spectral (serif) + Figtree (sans). Auth dual (JWT + Emergent Google).

## Implemented (MVP - 22/02/2026)
- Landing page (hero, bento, how-it-works, top apps, numbers, final CTA, footer)
- Marketplace com busca, categorias e ordenação
- Detalhe do app + reviews + virar afiliado + link único
- Auth JWT email/senha + Google Login (Emergent)
- Dashboard Produtor: stats, gráfico, vendas, criar app, materiais de divulgação (banners + copy + hashtags)
- Dashboard Afiliado: stats, gráfico, afiliações, comissões, níveis Bronze/Prata/Ouro
- Carteira com saldo + saque PIX
- Checkout simulado com split (produtor / afiliado / plataforma 9.9%)
- Notificações de venda
- Páginas institucionais (Para Produtores / Para Afiliados)

## Backlog (P1/P2)
- P1: Pagamento real (Stripe Connect / Mercado Pago split / Pagar.me)
- P1: Upload de imagens (object storage)
- P1: Email transacional (Resend)
- P2: Recuperação de senha, 2FA, KYC produtores
- P2: API pública para integração com webhooks de assinatura
- P2: Programa de cupons/descontos
