<script setup>
import { RouterLink } from "vue-router";
import { emailValid } from "@/api/user";
import { ref } from "vue";
const email = ref("");
const formRef = ref();
const formModel = ref({
  email: "",
});

const rules = {
  email: {
    required: true,
    trigger: ["blur"],
    validator: (rule, value) => {
      return new Promise(async (resolve, reject) => {
        if (/^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/.test(value)) {
          try {
            const response = await emailValid(value);
            if (response) {
              resolve();
            } else {
              reject("Email not registered");
            }
          } catch (error) {
            reject("Error checking email availability");
          }
        } else {
          reject(Error("Not a valid email"));
        }
      });
    },
  },
};
const onSubmit = () => {};
</script>
<template>
  <h3>Reset Password</h3>
  <n-form
    ref="formRef"
    :model="formModel"
    :rules="rules"
    label-placement="left"
    label-width="auto"
    require-mark-placement="right-hanging"
    :style="{
      maxWidth: '640px',
    }"
  >
    <n-form-item path="email" label="Email">
      <n-input v-model:value="formModel.email" type="email" />
    </n-form-item>

    <div style="display: flex; justify-content: flex-end">
      <n-button round type="primary" @click="onSubmit"> Submit </n-button>
    </div>
  </n-form>
</template>
