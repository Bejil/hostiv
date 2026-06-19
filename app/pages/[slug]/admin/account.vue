<script setup lang="ts">
definePageMeta({
  ssr: false,
  validate(route) {
    const slug = route.params.slug

    return typeof slug === "string" && slug.length > 0 && slug.toLowerCase() !== "admin"
  }
})

const route = useRoute()

await navigateTo(
  {
    path: `/${String(route.params.slug)}/admin`,
    query: {
      section: "account",
      account_view: "settings"
    }
  },
  { replace: true }
)
</script>
