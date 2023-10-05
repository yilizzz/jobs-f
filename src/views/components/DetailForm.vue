<script setup>
import { ref, inject } from "vue";
import { modifyJob, addJob } from "@/api/jobs.js";

import useUserStore from "../../store/user";
const userStore = useUserStore();
const token = userStore.token;

const formRef = ref(null);
const isEditModalOpen = ref(false);
const size = "large";
const bodyStyle = {
  width: "800px",
};
const segmented = {
  content: "soft",
  footer: "soft",
};
const defaultModel = {
  _id: null,
  userId: null,
  title: null,
  company: null,
  business: null,
  website: null,
  post_date: null,
  contact: null,
  color: null,
  remarks: null,
  state: null,
};
const formModel = ref({ ...defaultModel });
const open = (row) => {
  isEditModalOpen.value = true;
  if (row.title) {
    formModel.value = { ...row };
    //Get the post_date's string to time format
    if (formModel.value.post_date && formModel.value.post_date.length > 0) {
      let formattedDate = new Date(formModel.value.post_date).getTime();
      formModel.value.post_date = formattedDate;
    }
  } else {
    formModel.value = { ...defaultModel };
  }
};
const generalOptions = [
  "Suitable",
  "Applied",
  "Interviewing",
  "Waiting for reply",
  "Rejected",
  "Offer received",
].map((v) => ({
  label: v,
  value: v,
}));
const rules = {
  title: {
    required: true,
    trigger: ["blur", "input"],
    message: "Please input a post",
  },
  // website: {
  //   required: false,
  //   trigger: ["blur"],
  //   validator: (rule, value) => {
  //     return new Promise((resolve, reject) => {
  //       const urlPattern =
  //         /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w- ./?%&=]*)?$/;
  //       if (value && urlPattern.test(value)) {
  //         resolve();
  //       } else {
  //         reject(Error("Website address is not correct."));
  //       }
  //     });
  //   },
  // },
};

const onAddOrEdit = inject("onAddOrEdit");
const onSuccess = (type) => {
  console.log(`DetailForm Success: ${type}`);
  onAddOrEdit(type);
};
const saveChanges = async (e) => {
  e.preventDefault();
  formRef.value?.validate(async (errors) => {
    if (!errors) {
      let res;
      try {
        if (formModel.value._id) {
          res = await modifyJob(formModel.value, formModel.value._id, token);
          window.$message.success("One record updated.", { duration: 3e3 });
          onSuccess("edit");
        } else {
          res = await addJob(formModel.value, token);
          window.$message.success("One record added.", { duration: 3e3 });
          onSuccess("add");
        }
        closeEditModal();
        if (res.acknowledged) {
          console.log(`Modified ${res.modifiedCount} record`);
        }
      } catch (error) {
        window.$message.error("Error on submit.", { duration: 3e3 });
      }
    } else {
      window.$message.error("Error on submit.", { duration: 3e3 });
    }
  });
};

const closeEditModal = () => {
  isEditModalOpen.value = false;
};

defineExpose({
  open,
});
</script>

<template>
  <n-modal
    v-model:show="isEditModalOpen"
    class="custom-card"
    preset="card"
    title="Offer Details"
    size="huge"
    :style="bodyStyle"
    :bordered="false"
    :segmented="segmented"
    content-style="background: rgba(128, 128, 128, 0.4);"
    header-style="color: red"
  >
    <n-form
      ref="formRef"
      :size="size"
      :model="formModel"
      :rules="rules"
      label-placement="left"
      label-width="auto"
      require-mark-placement="right-hanging"
      :style="{
        maxWidth: '640px',
      }"
    >
      <n-form-item label="Title" path="title">
        <n-input v-model:value="formModel.title" />
      </n-form-item>
      <n-form-item label="Company" path="company">
        <n-input v-model:value="formModel.company" />
      </n-form-item>
      <n-form-item label="Business" path="business">
        <n-input
          v-model:value="formModel.business"
          type="textarea"
          :autosize="{
            minRows: 3,
            maxRows: 10,
          }"
        />
      </n-form-item>
      <n-form-item label="Website" path="website">
        <n-input v-model:value="formModel.website" />
      </n-form-item>
      <n-form-item label="Contact" path="contact">
        <n-input v-model:value="formModel.contact" />
      </n-form-item>
      <n-form-item label="Post Date" path="post_date">
        <n-date-picker v-model:value="formModel.post_date" type="date" />
      </n-form-item>

      <n-form-item label="State" path="state">
        <n-select
          v-model:value="formModel.state"
          placeholder="Select"
          :options="generalOptions"
        />
      </n-form-item>
      <n-form-item label="Remarks" path="remarks">
        <n-input v-model:value="formModel.remarks" />
      </n-form-item>
      <n-form-item label="Color this offer" path="color">
        <n-radio-group v-model:value="formModel.color" name="radiogroup1">
          <n-space>
            <n-radio value="important">
              <span style="color: #b7511d">Important</span>
            </n-radio>
            <n-radio value="interesting">
              <span style="color: #40a070">Interesting</span>
            </n-radio>
            <n-radio value="black-list">
              <span style="color: black">Black List</span>
            </n-radio>
            <n-radio value="no-color">
              <span style="color: grey">No Color</span>
            </n-radio>
          </n-space>
        </n-radio-group>
      </n-form-item>

      <div style="display: flex; justify-content: flex-end">
        <n-button round @click="closeEditModal"> Cancel </n-button>
        <n-button round type="primary" @click="saveChanges"> Submit </n-button>
      </div>
    </n-form>

    <!-- <pre>{{ JSON.stringify(formModel, null, 2) }}</pre> -->
    <template #footer>Sniff! </template>
  </n-modal>
</template>
<style lang="scss" scoped>
.n-form-item {
  font-size: 24px;
}
</style>
