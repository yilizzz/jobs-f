<script setup>
import useUserStore from "../store/user";
import { useRouter } from "vue-router";
import { signIn } from "@/api/user";
import { ref } from "vue";
const router = useRouter();
const userStore = useUserStore();
// Create a reference to the form component
const formRef = ref();
// Create a data model for the form
const formModel = ref({
  email: "",
  password: "",
});
// Define validation rules for form fields
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
      // Validate password format using a regular expression
      return new Promise((resolve, reject) => {
        if (/^\S{6,15}$/.test(value)) {
          // Resolve the promise if the password is valid
          resolve();
        } else {
          // Reject the promise with an error message if the password is invalid
          reject(Error("6-15 characters"));
        }
      });
    },
  },
};
// Function to handle the sign-in process
const onSignIn = async (e) => {
  // Prevent the default form submission behavior
  e.preventDefault();
  // Validate the form using the form reference
  formRef.value?.validate(async (errors) => {
    if (!errors) {
      try {
        // Perform sign-in using the provided email and password
        const res = await signIn(
          formModel.value.email,
          formModel.value.password
        );
        // Update user data and token in the user store
        userStore.setUser(res.user, res.userId);
        userStore.setToken(res.token);
        // Redirect the user to the "myjobs" route with user-specific parameters
        router.push({ name: "myjobs", params: { userId: userStore.userId } });
      } catch (error) {
        if (error.response) {
          if (error.response.status === 401) {
            window.$message.error("Email or password is wrong.");
            router.push({ name: "signin" });
          } else {
            window.$message.error("Server error.");
          }
        } else {
          window.$message.error("An error occurred.");
        }
      }
    } else {
      // Log validation errors and display an error message
      console.log(errors);
      window.$message.error("Invalid input.");
    }
  });
};
</script>

<template>
  <div class="sign-container">
    <div class="sign">
      <h2 style="color: #142334">SIGN IN</h2>
      <br />
      <n-form
        ref="formRef"
        :model="formModel"
        :rules="rules"
        label-placement="left"
        label-width="auto"
        require-mark-placement="right-hanging"
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
  </div>
</template>
<style scoped></style>
