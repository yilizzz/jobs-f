<script>
import { createDiscreteApi } from "naive-ui";
import { defineComponent } from "vue";

const { message, notification, dialog } = createDiscreteApi([
  "message",
  "dialog",
  "notification",
]);
window.$message = message;
window.$notification = notification;
window.$dialog = dialog;

export default defineComponent({});
</script>

<template>
  <div></div>
</template>
