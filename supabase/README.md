# Supabase — Hostiv

Les sites par slug (`/thegrandappartement`, etc.) sont **uniquement** servis depuis la table `properties`. Aucun fallback local à l’exécution.

**Source de vérité** : la base Supabase (édition via le dashboard, SQL Editor, ou migrations). Le fichier `seed-thegrandappartement.sql` est un **snapshot d’amorçage** pour un nouvel environnement.

## 1. Variables `.env` (obligatoires pour les sites slug)

```env
SUPABASE_URL=https://VOTRE_REF.supabase.co
SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...
```

Redémarrer `npm run dev` après modification.

## 2. Migrations SQL (dans l’ordre)

1. `migrations/20260516120000_properties.sql`
2. `migrations/20260516130000_properties_booking_notify_email.sql`
3. `migrations/20260516140000_property_assets_storage.sql` — bucket `property-assets`
4. `migrations/20260516150000_properties_favicon_path.sql`
5. `migrations/20260516160000_properties_owner_user_id.sql`
6. `migrations/20260519190000_properties_calendar_config_feeds.sql`
7. `migrations/20260519210000_booking_reservations.sql`
8. `migrations/20260520100000_properties_stripe_connect.sql` — Stripe Connect Express
9. `migrations/20260521100000_booking_reservations_refund.sql`
10. `migrations/20260521120000_hostiv_subscription_plan.sql` — forfait Starter / Pro (`hostiv_accounts` + `properties.subscription_plan`)

## 3. Données initiales

SQL Editor → exécuter une fois `seed-thegrandappartement.sql`, puis renseigner `booking_notify_email` pour chaque site.

Les chemins d’images en base restent relatifs (`/gallery/...`, `/branding/...`). L’app les résout vers Storage : `{slug}/gallery/...`.

## 4. Assets (Supabase Storage)

Structure dans le bucket public **`property-assets`** :

```
{slug}/gallery/...
{slug}/branding/...
{slug}/about/...
{slug}/platforms/...
```

**Premier envoi** : placer les fichiers sous `public/gallery`, `public/branding`, `public/about`, `public/platforms`, puis :

```bash
npm run storage:upload -- thegrandappartement
```

Les assets des sites ne sont plus versionnés dans le repo (uniquement dans Storage).

**Nouveau site** : ajouter les dossiers sous `public/`, lancer `storage:upload -- mon-slug`, puis pointer les chemins `/gallery/...` dans `properties.content` (pas besoin d’URL complètes).

**Vérification** : ouvrir une image dans le navigateur :

`https://VOTRE_REF.supabase.co/storage/v1/object/public/property-assets/thegrandappartement/gallery/hero-salon.jpeg`

Les images des sites passent uniquement par Storage (`SUPABASE_URL` requis).

## 5. Champs utiles par site

| Colonne / donnée | Usage |
|------------------|--------|
| `booking_notify_email` | E-mail hôte (réservations) |
| `booking_config` | Tarifs et règles |
| `owner_user_id` | UID Supabase Auth du propriétaire (backoffice) |
| `subscription_plan` | Forfait Hostiv du site : `starter` ou `pro` (sync depuis `hostiv_accounts` à la liaison) |
| `hostiv_accounts` | Forfait choisi à l’inscription (trigger sur `auth.users`, champ `user_metadata.subscription_plan`) |
| `stripe_account_id`, `stripe_charges_enabled` | Compte Connect Express et activation des paiements |
| `favicon_path` | Favicon du site (ex. `/branding/favicon.png` → Storage) |
| `content` | Textes, galeries, avis (chemins `/gallery/...`) |
| Storage `{slug}/…` | Fichiers binaires (logo, favicon, galerie…) |

**Favicon Hostiv** (`/`) : fichiers locaux dans `public/hostiv/` (hors Storage).

**Favicon d’un site** (`/:slug`) : colonne `favicon_path` + fichier dans Storage `{slug}/branding/`.

## 6. Backoffice (`/:slug/admin`)

URL : `https://votredomaine.fr/thegrandappartement/admin` (adapter le slug).

1. Créer un utilisateur dans **Supabase → Authentication → Users** (e-mail + mot de passe).
2. Lier son UID à la propriété :

```sql
update public.properties
set owner_user_id = 'e29246ac-9a6d-4a43-bb23-71f65041c1e3'
where slug = 'thegrandappartement';
```

3. Se connecter sur `/thegrandappartement/admin` avec ce compte Supabase.

Seul l’utilisateur dont l’UID correspond à `owner_user_id` peut modifier le site.

## 7. Vérifier

```sql
select slug, brand_name, booking_notify_email from public.properties;
```
