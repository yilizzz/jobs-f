<script setup>
import { ref, provide } from "vue";
import { getAllJobs } from "@/api/jobs";
import useUserStore from "../store/user";
import { onMounted } from "vue";
import DetailForm from "./components/DetailForm.vue";
import JobsTable from "./components/JobsTable.vue";
import { Icon } from "@vicons/utils";
import { AddCircleOutline } from "@vicons/ionicons5";
const userStore = useUserStore();

const jobsData = ref([]);
const detailRef = ref();

const fetchJobs = async () => {
  try {
    const jobs = await getAllJobs(userStore.userId);
    jobsData.value = jobs;
    console.log(jobsData.value);
  } catch (error) {
    console.log(error);
  }
};
const onAddOrEdit = (type) => {
  console.log(`MyJobs: ${type}`);
  fetchJobs();
};
provide("onAddOrEdit", onAddOrEdit);

onMounted(() => fetchJobs());

const onAddJob = () => {
  detailRef.value.open({});
};
const onSearch = (val) => {
  if (val === "clear") {
    fetchJobs();
  } else {
    jobsData.value = val.value;
  }
};
</script>

<template>
  <div class="hello">
    <h2>Hello, {{ userStore.user }}</h2>
    <n-button type="primary" strong icon-placement="right" @click="onAddJob">
      <template #icon>
        <Icon color="var(--color-text)" size="24">
          <AddCircleOutline />
        </Icon>
      </template>
      SNIFF A NEW JOB
    </n-button>
  </div>
  <DetailForm ref="detailRef"></DetailForm>
  <JobsTable :data="jobsData" @search="onSearch"></JobsTable>
</template>
<style>
.hello {
  margin-top: 1rem;
  display: flex;
  flex-direction: row;
}
h2 {
  font-size: 28px;
  margin-right: 3rem;
}
</style>
