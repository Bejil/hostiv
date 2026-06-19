<script setup lang="ts">
import { getHostivResourceArticleByPath } from "../../data/hostivResources"

const route = useRoute()
const { locale } = useHostivLocale()

const article = getHostivResourceArticleByPath(route.path, locale.value)

if (!article) {
  throw createError({ statusCode: 404, statusMessage: "Guide introuvable" })
}
</script>

<template>
  <HostivResourceArticlePage :article="article" />
</template>

<style src="../../../assets/css/pages/hostiv/hostiv.css"></style>
