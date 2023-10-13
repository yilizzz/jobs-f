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

// Pass value from parent Myjobs to child JobsTable:
// props can be used to pass value,
// and toRefs can be used to receive it in the child component.
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
// Using provide and inject,
// you can provide data in the parent component and then inject (get) this data in the child component.
// Usually used to pass data across component levels without having to pass props layer by layer.
// Here passing data(it's an entry added or edited) from child component DetailForm to parent component Myjobs
provide("onAddOrEdit", onAddOrEdit);

onMounted(() => fetchJobs());

const onAddJob = () => {
  // This open methods is defined in child component DetailForm
  // It is passed to parent component using defineExpose
  detailRef.value.open({});
};
// The onSearch method receives the parameter(result of a search) from the child component JobsTable
// and stores it in the parent component's jobsData property for display again in the child component JobsTable.
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
  <!-- ParentComponent listens to the custom-event: onSearch -->
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
