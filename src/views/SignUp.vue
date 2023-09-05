<script setup>
import { useRouter } from "vue-router";
import { ref } from "vue";
import { emailExist, signUp } from "@/api/user";
import useUserStore from "../store/user";
const userStore = useUserStore();
const router = useRouter();
const formRef = ref();
const formModel = ref({
  email: "",
  password: "",
});
const rules = {
  email: {
    required: true,
    trigger: ["blur"],
    validator: (rule, value) => {
      return new Promise(async (resolve, reject) => {
        if (/^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/.test(value)) {
          try {
            const response = await emailExist(value);
            console.log("API response:", response);
            if (response.status === 200) {
              resolve();
            } else if (response.status === 205) {
              reject(Error(response.data.error || "Email already exists"));
            } else {
              reject(Error("Error checking email availability"));
            }
          } catch (error) {
            reject(
              error.response.data.error || "Error checking email availability"
            );
          }
        } else {
          reject(Error("Not a valid email"));
        }
      });
    },
  },
  password: {
    required: true,
    trigger: ["blur"],
    validator: (rule, value) => {
      return new Promise((resolve, reject) => {
        if (/^\S{6,15}$/.test(value)) {
          resolve();
        } else {
          reject(Error("6-15 characters"));
        }
      });
    },
  },
};
const onSignUp = async (e) => {
  e.preventDefault();
  formRef.value?.validate(async (errors) => {
    if (!errors) {
      try {
        const res = await signUp(
          formModel.value.email,
          formModel.value.password
        );
        userStore.setUser(res.user, res.userId);
        userStore.setToken(res.token);
        router.push({ name: "myjobs", params: { userId: userStore.userId } });
      } catch (error) {
        alert("An error occurred.");
        router.push({ name: "signup" });
      }
    } else {
      console.log(errors);
      window.$message.error("Invalid input.");
    }
  });
};
</script>

<template>
  <div class="sign-container">
    <div class="sign">
      <h2>SIGN UP</h2>
      <br />
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
        <n-form-item path="password" label="Password">
          <n-input v-model:value="formModel.password" type="password" />
        </n-form-item>
        <div style="display: flex; justify-content: flex-end">
          <n-button round type="primary" @click="onSignUp"> Submit </n-button>
        </div>
      </n-form>
    </div>
  </div>
</template>
