<template>
  <div class="content">1123</div>
  <button @click="add">+1</button>
</template>

<script setup>
import { ref, reactive, computed } from "vue"

const count = ref(1)
function add() {
  count.value++
  console.error("111")
}
</script>

<style scoped lang="scss"></style>
