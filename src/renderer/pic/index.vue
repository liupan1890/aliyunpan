<script setup lang="ts">
import MySplit from '../layout/MySplit.vue'
import PicLeft from './PicLeft.vue'
import PicRight from './PicRight.vue'
</script>

<template>
  <MySplit>
    <template #first><PicLeft /></template>
    <template #second><PicRight /></template>
  </MySplit>
</template>

<style></style>
