<script setup>
import { reactive, ref, toRefs, computed, inject } from "vue";
import DetailForm from "./DetailForm.vue";
import { NButton } from "naive-ui";
import { deleteJob, searchJobs } from "../../api/jobs";
import useUserStore from "../../store/user";
import { Icon } from "@vicons/utils";
import { ArrowUpCircleSharp, ArrowDownCircleSharp } from "@vicons/ionicons5";

const userStore = useUserStore();
const token = userStore.token;
const userId = userStore.userId;

const props = defineProps({
  data: {
    // Job list data
    type: Array,
    required: true,
    default() {
      return [];
    },
  },
});
const { data } = toRefs(props);

// Use a computed property for listNum.
// Computed properties clearly communicate that their value is derived from other reactive properties.
// Computed properties automatically recompute their value whenever any of their reactive dependencies change.
// They only recompute when necessary, based on changes to their dependencies.
const listNum = computed(() => data.value.length);
const tableRef = ref();
const detailRef = ref();

const dateColumn = {
  title: "Post Date",
  key: "post_date",
  render: (item, _) => {
    // only when there is date data, get YYYY-MM-DD from UTC date and adjust for local time zone
    if (item.post_date) {
      // return item.post_date.slice(0, 10);
      const utcDate = new Date(item.post_date);
      const localDate = new Date(
        utcDate.getTime() + utcDate.getTimezoneOffset() * 60000
      );
      return localDate.toISOString().slice(0, 10);
    }
  },
  sorter(rowA, rowB) {
    return Date.parse(rowA.post_date) - Date.parse(rowB.post_date);
  },
};
const websiteColumn = {
  title: "Website",
  key: "website",
  width: 250,
  render(rowData) {
    return h(
      "a",
      {
        href: rowData.website,
        target: "_blank",
        style: {
          color: "rgba(91, 91, 98, 0.75)",
          textDecoration: "none",
        },
      },
      rowData.website
    );
  },
};

const columns = [
  {
    title: "Title",
    key: "title",
  },
  {
    title: "Company",
    key: "company",
  },
  {
    title: "State 👀",
    key: "state",
    defaultFilter: [
      "Suitable",
      "Applied",
      "Interviewing",
      "Waiting for reply",
      "Rejected",
      "Offer received",
    ],
    filterOptions: [
      {
        label: "Suitable",
        value: "Suitable",
      },
      {
        label: "Applied",
        value: "Applied",
      },
      {
        label: "Interviewing",
        value: "Interviewing",
      },
      {
        label: "Waiting for reply",
        value: "Waiting for reply",
      },
      {
        label: "Rejected",
        value: "Rejected",
      },
      {
        label: "Offer received",
        value: "Offer received",
      },
    ],
    filter(value, row) {
      if (row.state) {
        return row.state.indexOf(value) >= 0;
      }
    },
  },
  dateColumn,
  websiteColumn,
  {
    title: "Action",
    key: "actions",
    render(row) {
      return h("div", [
        h(
          NButton,
          {
            size: "small",
            onClick: () => onEditJob(row),
          },
          { default: () => "Edit" }
        ),
        h(
          NButton,
          {
            size: "small",
            onClick: () => onDelJob(row._id),
          },
          { default: () => "Delete" }
        ),
      ]);
    },
  },
];

const paginationReactive = reactive({
  page: 1,
  pageSize: 10,
  showSizePicker: true,
  pageSizes: [10, 20, 30],
  onChange: (page) => {
    paginationReactive.page = page;
  },
  onUpdatePageSize: (pageSize) => {
    paginationReactive.pageSize = pageSize;
    paginationReactive.page = 1;
  },
});
const pagination = paginationReactive;

const sortDateA = () => {
  tableRef.value.sort("post_date", "ascend");
};
const sortDateD = () => {
  tableRef.value.sort("post_date", "descend");
};
const clearSorter = () => {
  tableRef.value.sort(null);
};
const searchRes = ref([]);
const emit = defineEmits(["search"]);
const searchKeywords = ref("");
const onSearch = async () => {
  try {
    const res = await searchJobs(userId, searchKeywords.value);
    searchRes.value = res;
    emit("search", searchRes);
    console.log(`Search res data: ${searchRes.value}`);
  } catch (error) {
    window.$message.error("Error in Searching.");
  }
};
const clearSearch = () => {
  searchKeywords.value = "";
  emit("search", "clear");
};
const onEditJob = (row) => {
  detailRef.value.open(row);
};
const onAddOrEdit = inject("onAddOrEdit");
const onDelete = (type) => {
  console.log(`JobsTable Delete succeed: ${type}`);
  onAddOrEdit(type);
};
const onDelJob = async (id) => {
  window.$dialog.warning({
    title: "Warning",
    content: "Are you sure?",
    positiveText: "Yes",
    negativeText: "No",
    onPositiveClick: async () => {
      try {
        await deleteJob(id, token);
        window.$message.success("One record deleted.", { duration: 3e3 });
        onDelete("delete");
      } catch (error) {
        window.$message.error("Error in deleting.", { duration: 3e3 });
      }
    },
    onNegativeClick: () => {},
  });
};

const rowClassName = (row) => {
  switch (row.color) {
    case "important":
      return "red";
    case "interesting":
      return "blue";
    case "black-list":
      return "black";
    default:
      return "grey";
  }
};
</script>

<template>
  <n-space id="search" justify="space-around">
    <n-card
      :segmented="{
        content: true,
      }"
      header-style="height:2rem; background: rgba(128, 128, 128, 0.4) "
      content-style="text-align: center"
    >
      <template #header> Number of offers </template>
      {{ listNum }}
    </n-card>
    <n-space vertical align="start">
      <n-input-group>
        <n-input
          v-model:value="searchKeywords"
          :style="{ width: '50%' }"
          maxlength="20"
          show-count
          clearable
        />
        <n-button type="primary" @click="onSearch">Search</n-button>
        <n-button @click="clearSearch" strong secondary type="info"
          >Clear Search</n-button
        >
      </n-input-group>

      <n-space vertical align="space-evenly">
        <n-button @click="sortDateD" strong secondary type="info">
          <Icon color="var(--color-text)" size="24">
            <ArrowUpCircleSharp />
          </Icon>
          Post Date Descend
        </n-button>
        <n-button @click="sortDateA" strong secondary type="info">
          <Icon color="var(--color-text)" size="24">
            <ArrowDownCircleSharp />
          </Icon>
          Post Date Ascend
        </n-button>
        <n-button @click="clearSorter" strong secondary type="info"
          >Clear Sorter</n-button
        >
      </n-space>
    </n-space>
  </n-space>

  <n-data-table
    class="tableResponsive"
    ref="tableRef"
    :columns="columns"
    :data="data"
    :pagination="pagination"
    :row-class-name="rowClassName"
  />
  <DetailForm ref="detailRef"></DetailForm>
</template>
<style scoped>
#search {
  width: 100%;
  margin: 1rem;
}

@media (max-width: 821px) {
  .tableResponsive td:nth-child(4),
  .tableResponsive th:nth-child(4),
  .tableResponsive td:nth-child(5),
  .tableResponsive th:nth-child(5),
  .tableResponsive td:nth-child(6),
  .tableResponsive th:nth-child(6) {
    display: none;
  }
}
:deep(.red td) {
  color: #b7511d !important;

  -webkit-animation: shake-horizontal 2s cubic-bezier(0.455, 0.03, 0.515, 0.955)
    3 both;
  animation: shake-horizontal 2s cubic-bezier(0.455, 0.03, 0.515, 0.955) 3 both;
}
:deep(.blue td) {
  color: #40a070 !important;
}
:deep(.grey td) {
  color: rgba(91, 91, 98, 0.75) !important;
}
:deep(.black td) {
  color: black !important;
}
/* ----------------------------------------------
 * Generated by Animista on 2023-9-4 11:55:2
 * Licensed under FreeBSD License.
 * See http://animista.net/license for more info. 
 * w: http://animista.net, t: @cssanimista
 * ---------------------------------------------- */

/**
 * ----------------------------------------
 * animation shake-horizontal
 * ----------------------------------------
 */
@-webkit-keyframes shake-horizontal {
  0%,
  100% {
    -webkit-transform: translateX(0);
    transform: translateX(0);
  }
  10%,
  30%,
  50%,
  70% {
    -webkit-transform: translateX(-10px);
    transform: translateX(-10px);
  }
  20%,
  40%,
  60% {
    -webkit-transform: translateX(10px);
    transform: translateX(10px);
  }
  80% {
    -webkit-transform: translateX(8px);
    transform: translateX(8px);
  }
  90% {
    -webkit-transform: translateX(-8px);
    transform: translateX(-8px);
  }
}
@keyframes shake-horizontal {
  0%,
  100% {
    -webkit-transform: translateX(0);
    transform: translateX(0);
  }
  10%,
  30%,
  50%,
  70% {
    -webkit-transform: translateX(-10px);
    transform: translateX(-10px);
  }
  20%,
  40%,
  60% {
    -webkit-transform: translateX(10px);
    transform: translateX(10px);
  }
  80% {
    -webkit-transform: translateX(8px);
    transform: translateX(8px);
  }
  90% {
    -webkit-transform: translateX(-8px);
    transform: translateX(-8px);
  }
}
</style>
