<template>
  <n-config-provider :theme-overrides="themeOverrides">
    <slot></slot>
  </n-config-provider>
</template>

<script setup>
import { NConfigProvider } from "naive-ui";
const themeOverrides = {
  common: {
    primaryColor: "#142334",
    primaryColorHover: "#5e7987",
    infoColor: "#1a3b32",
  },
};
</script>
