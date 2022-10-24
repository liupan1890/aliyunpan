<script setup lang="ts"></script>
<template>
  <div class="desktop-loading">
    <div class="desktop-loading-container">
      <img
        class="desktop-loading-img"
        src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEgAAABIBAMAAACnw650AAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAJcEhZcwAAFiUAABYlAUlSJPAAAAAtUExURUdwTFt4/1p4/1l4/1R1/1Z3/1h3/0dv/0xx/09z/0pw/0Vu/05y/1N1/1F0/9uwMxYAAAAPdFJOUwAPHzBlU0HguZbM9Kh2hacb2b0AAAMkSURBVEjHjZbda9NQGMZPP1YVdLRBbwSlSdjwatR0FiZMqiTzqmO6pjBQKdRFRBSGQqRB8UJcKb1RVMyoBW/szK1ClSNer1DFj96IpExRpGjzN/ierO3SNTn1vUkafn2e57znzWkRcpZvYr5RKNSfLiLvOvC3AFUsFIsvznogvguNjY0NQkEZj9yZcz2msL5uGMbdqAuz1GiUSoWukk0NQzMNKFupsKVkGPeGMhOmVHo/xyHEX3xiQ8anHWblMqH6S58tGkY+f3Mw1kwdkA+x7QeBNaCqz51MSC+Xy04GIf+akVerSceTpXqjXo8NJhgrVqvqjQEhvXxy51qmIJW6LTWj6/XHw105rarq9f7SgNFd+htYVdV87/lhXde/u+3UEZB61out65WwG+SvqurtrioIPXAfjOMglbXvxgHKukPBvt/ltv7Qawx/q7Vb9tq+6u3vXtBBkCJxQ5WKHvOCQpqmfoTrvnb7p/fYr2raClxOVCr3vaFLNY3s37zVTnpDu3HtNeS2KlbUGwrVMA6jgGV1KK8i0jQtiYKW9YsGfcP4Dhq3rB806ArGK2jKsjZp0C6MX6JrlpWkQXsxfkWgLA0ax/gdmm+1YjQoiPFb6CWtTTBtGNeIUpgG+QnU6bQQtTDGqGV2RkNmx/wPqDUC+oPfoJRpUoOjPXhzNETqvGnGRkJXTTM7Epo1zYWR0CHTpE4BCkPkYLP5mQ754NQzU19ojC8CUKDZFOluESBTqSZtViJECaWb4gLNLUJ6PS2Kp0ZCwZQo0dxsKCCKYpQG2YIALVDcbIiEmvOCGKYLjYFUzFtoa5D8AJ3xgDiG6d5OS5LkPnhchGV7P1qiKLlK+RmO6X3bl5Yl2U2K4xi2/2E/+Ln8pWA4jotsv++SJMtHh1NDOQyOyWk5E3VhWOfRkZZleTE8yPCDQghNACRnHI98vCBw3KC4j0DLSj9XJC4IPM/tPKuIkqzkWDKsDB8X4rzADbVlUl5eVjIKVC4XJyUI7HBXEsSPVCKRIEycddvMyUyGUImuEuu+57xtl1NsJdZzxBJbdmBGO45gXYoSd+yYXf8ARKIvIShn/twAAAAASUVORK5CYII="
        alt="loading-img" />
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
