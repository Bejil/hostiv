<script setup lang="ts">
defineProps<{
  slug: string
}>()
</script>

<template>
  <div class="site-preview-banner" role="status">
    <p class="site-preview-banner__text">
      <strong>Aperçu privé</strong> — ce site n’est visible ici que parce que vous êtes connecté au backoffice. Il n’est pas accessible au public tant qu’il n’est pas publié.
    </p>
    <NuxtLink :to="`/${slug}/admin`" class="site-preview-banner__link">Retour au backoffice</NuxtLink>
  </div>
</template>

<style scoped>
.site-preview-banner {
  position: sticky;
  top: 0;
  z-index: 50;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 0.65rem 1.25rem;
  padding: 0.65rem 1rem;
  background: #fff8ee;
  border-bottom: 1px solid #f5d9a8;
  color: #5c3d0a;
  font-size: 0.875rem;
  line-height: 1.45;
}

.site-preview-banner__text {
  margin: 0;
  text-align: center;
}

.site-preview-banner__link {
  flex-shrink: 0;
  padding: 0.35rem 0.85rem;
  border-radius: 999px;
  background: #0d9b6e;
  color: #fff;
  font-weight: 600;
  font-size: 0.8125rem;
  text-decoration: none;
}

.site-preview-banner__link:hover {
  background: #067a57;
}
</style>
