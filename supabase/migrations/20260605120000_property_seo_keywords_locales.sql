alter table properties
  add column if not exists seo_keywords_en text not null default '',
  add column if not exists seo_keywords_fr_enabled boolean not null default true,
  add column if not exists seo_keywords_en_enabled boolean not null default false;
