-- Métadonnées SEO étendues (Open Graph, robots, partage social)
alter table public.properties
  add column if not exists seo_keywords text not null default '',
  add column if not exists seo_og_title text not null default '',
  add column if not exists seo_og_description text not null default '',
  add column if not exists seo_og_image_path text not null default '',
  add column if not exists seo_twitter_card text not null default 'summary_large_image',
  add column if not exists seo_noindex boolean not null default false;

alter table public.properties
  drop constraint if exists properties_seo_twitter_card_check;

alter table public.properties
  add constraint properties_seo_twitter_card_check
  check (seo_twitter_card in ('summary', 'summary_large_image'));
