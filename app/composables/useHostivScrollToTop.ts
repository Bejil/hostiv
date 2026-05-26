export function useHostivScrollToTop() {
  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return { scrollToTop }
}
