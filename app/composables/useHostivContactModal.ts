export function useHostivContactModal() {
  const open = useState("hostiv-contact-modal-open", () => false)

  function openContact() {
    open.value = true
  }

  function closeContact() {
    open.value = false
  }

  return {
    open,
    openContact,
    closeContact
  }
}
