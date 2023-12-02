<script setup>
import { reactive, ref, toRefs, computed, inject } from "vue";
import DetailForm from "./DetailForm.vue";
import { NButton } from "naive-ui";
import { deleteJob, searchJobs } from "../../api/jobs";
import useUserStore from "../../store/user";
import { Icon } from "@vicons/utils";
import { ArrowUpCircleSharp, ArrowDownCircleSharp } from "@vicons/ionicons5";
import { format } from "date-fns-tz";

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
  width: 200,
  render: (item, _) => {
    // only when there is date data, get YYYY-MM-DD from UTC date,
    // import and use the format function from date-fns-tz to format the date with a specific timezone
    if (item.post_date) {
      // return item.post_date.slice(0, 10);
      const formattedDate = format(
        new Date(item.post_date),
        "yyyy-MM-dd",
        { timeZone: "Europe/London" } // Replace with the correct timezone
      );
      return formattedDate;
    }
  },
  sorter(rowA, rowB) {
    return Date.parse(rowA.post_date) - Date.parse(rowB.post_date);
  },
};
const remarksColumn = {
  title: "Remarks",
  key: "remarks",
  width: 500,
  render(rowData) {
    return h(
      "a",
      {
        href: rowData.remarks,
        target: "_blank",
        style: {
          color: "rgba(91, 91, 98, 0.75)",
          textDecoration: "none",
        },
      },
      rowData.remarks
    );
  },
};

const columns = [
  {
    title: "Title",
    key: "title",
    minWidth: 300,
  },
  {
    title: "Company",
    key: "company",
    width: 300,
  },
  {
    title: "State 👀",
    key: "state",
    width: 200,
    defaultFilter: [
      "Confirm receipt of resume",
      "Applied",
      "Interviewing",
      "Waiting for reply",
      "Rejected",
      "Offer received",
    ],
    filterOptions: [
      {
        label: "Confirm receipt of resume",
        value: "Confirm receipt of resume",
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
  remarksColumn,
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
  pageSize: 500,
  showSizePicker: true,
  pageSizes: [200, 500, 1000],
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
// defineEmits to declare un an event that the component JobsTable can trigger
// Then, the onSearch function triggers the "custom-event" event to notify parent component Myjobs
// and passes the data "searchRes" as the event parameter.
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
// Using "provide" and "inject" to pass a function (onAddOrEdit) from a parent component (Component MyJobs) to its child component (Component JobsTable)
// This allows passing a "type" data from child or grandchild components back up to the parent component,
// Here passing data(it's an entry deleted) from child component JobsTable to parent component Myjobs
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

@media (max-width: 1200px) {
  .tableResponsive td:nth-child(4),
  .tableResponsive th:nth-child(4),
  .tableResponsive td:nth-child(5),
  .tableResponsive th:nth-child(5),
  .tableResponsive td:nth-child(6),
  .tableResponsive th:nth-child(6) {
    visibility: collapse !important;
  }
  .tableResponsive td:nth-child(1),
  .tableResponsive th:nth-child(1),
  .tableResponsive td:nth-child(2),
  .tableResponsive th:nth-child(2) {
    width: 150px !important;
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
