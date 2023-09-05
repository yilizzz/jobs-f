import { defineStore } from "pinia";

const useUserStore = defineStore({
  id: "user",
  state: () => ({
    user: "",
    token: "",
    userId: "",
  }),

  getters: {},
  actions: {
    setToken(newToken) {
      this.token = newToken;
    },
    removeToken() {
      this.token = "";
    },
    setUser(user, userId) {
      this.user = user;
      this.userId = userId;
    },
    removeUser() {
      this.user = "";
      this.userId = "";
    },
  },
  persist: true,
});
export default useUserStore;
