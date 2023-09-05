<script setup>
import useUserStore from "../store/user";
import { useRouter } from "vue-router";
import { signIn } from "@/api/user";
import { ref } from "vue";
const router = useRouter();
const userStore = useUserStore();
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
          resolve();
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
        if (/^\S{4,15}$/.test(value)) {
          resolve();
        } else {
          reject(Error("6-15 characters"));
        }
      });
    },
  },
};
const onSignIn = async (e) => {
  e.preventDefault();
  formRef.value?.validate(async (errors) => {
    if (!errors) {
      try {
        const res = await signIn(
          formModel.value.email,
          formModel.value.password
        );
        userStore.setUser(res.user, res.userId);
        userStore.setToken(res.token);
        router.push({ name: "myjobs", params: { userId: userStore.userId } });
      } catch (error) {
        if (error.response) {
          if (error.response.status === 401) {
            window.$message.error("Email or password is wrong.");
            // alert("Email or password is wrong.");
            router.push({ name: "signin" });
          } else {
            window.$message.error("Server error.");
            // alert("Server error.");
          }
        } else {
          window.$message.error("An error occurred.");
          // alert("An error occurred.");
        }
      }
    } else {
      console.log(errors);
      window.$message.error("Invalid input.");
    }
  });
};
</script>

<template>
  <div>
    <h3>Sign In</h3>

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
        <n-button round type="primary" @click="onSignIn"> Submit </n-button>
      </div>
    </n-form>
  </div>
</template>
