<script setup lang="ts">
import MySplit from '../layout/MySplit.vue'
import PanLeft from './PanLeft.vue'
import PanRight from './PanRight.vue'
</script>

<template>
  <MySplit>
    <template #first><PanLeft /></template>
    <template #second><PanRight /></template>
  </MySplit>
</template>

<style></style>
