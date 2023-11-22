<template>
  <div class="card-border">
    <div class="grid-container"></div>
  </div>
</template>

<script>
export default {
  name: "OneCard",
  props: {
    card: Object,
  },
};
</script>

<style>
.card-border {
  height: 100%;
  width: 66%;
  border: 1/16em solid black;
  border-radius: 0.625em;
}

.grid-container {
  display: grid;
}
</style>
