import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUiStore = defineStore('ui', () => {
  const isModalOpen = ref(false)
  const isSidebarOpen = ref(false)
  const activeTab = ref('')

  function openModal(): void {
    isModalOpen.value = true
  }

  function closeModal(): void {
    isModalOpen.value = false
  }

  function toggleModal(): void {
    isModalOpen.value = !isModalOpen.value
  }

  function openSidebar(): void {
    isSidebarOpen.value = true
  }

  function closeSidebar(): void {
    isSidebarOpen.value = false
  }

  function toggleSidebar(): void {
    isSidebarOpen.value = !isSidebarOpen.value
  }

  function setActiveTab(tabId: string): void {
    activeTab.value = tabId
  }

  function clearActiveTab(): void {
    activeTab.value = ''
  }

  return {
    isModalOpen,
    isSidebarOpen,
    activeTab,
    openModal,
    closeModal,
    toggleModal,
    openSidebar,
    closeSidebar,
    toggleSidebar,
    setActiveTab,
    clearActiveTab,
  }
})
