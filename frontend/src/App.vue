<template>
  <div id="app" class="app-wrapper">
    <router-view v-if="$route.path === '/login'" />
    <ResponsiveLayout v-else />
  </div>
</template>

<script>
import ResponsiveLayout from '@/components/ResponsiveLayout.vue';
export default { 
  name: 'App', 
  components: { ResponsiveLayout } 
};
</script>

<style lang="scss">
.app-wrapper {
  min-height: 100vh;
  background: var(--theme-bg, #def0f9);
}
</style>
