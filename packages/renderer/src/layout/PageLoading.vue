<script setup lang="ts"></script>
<template>
  <div class="desktop-loading">
    <div class="desktop-loading-container">
      <img class="desktop-loading-img" src="/loading.png" alt="loading-img" />
    </div>
  </div>
</template>
<style>
.desktop-loading {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
}

.desktop-loading-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  backdrop-filter: blur(24px);
}

.desktop-loading-img {
  width: 36px;
  height: 36px;
  animation: rotate360 infinite 1s linear;
}

@keyframes rotate360 {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
