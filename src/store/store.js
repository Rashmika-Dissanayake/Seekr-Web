import Vue from "vue";
import Vuex from "vuex";
import axios from "axios";
import jwtDecode from "jwt-decode";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    authStatus: "",
    accessToken: localStorage.getItem("access_token") || "",
    currentUser: {},
    userJWT: "",
    user: {
      id: "",
      firstName: "",
      lastName: "",
      email: "",
      imageURL: "",
      role: ""
    },
    questionnaire: {
      state: 0,
      nic: null,
      firstName: null,
      lastName: null,
      nameInFull: null,
      dob: null,
      gender: null,
      maritalStatus: null,
      ageAtMarriage: null
    }
  },
  mutations: {
    auth_request(state) {
      state.authStatus = "loading";
    },
    auth_success(state, token) {
      state.authStatus = "success";
      state.accessToken = token;
      // state.user = user
    },
    auth_error(state) {
      state.authStatus = "error";
    },
    logout(state) {
      state.authStatus = "";
      state.accessToken = "";
    }
  },
  actions: {
    login({ commit }, loginCredentials) {
      return new Promise((resolve, reject) => {
        commit("auth_request");
        axios({
          url: "http://localhost:5000/api/user/login",
          data: loginCredentials,
          method: "POST"
        })
          .then(response => {
            const token = response.data.token;
            // const user = response.data.user;

            console.log(">>>>>>>>>>>>" + response.data.token);
            if (response.data.token != "invalid") {
              //  Store the received JWT in the state variavle of Vuex Store "userJWT"
              this.state.userJWT = response.data.token;
              console.log("JWT Saved" + this.state.userJWT);
              // Decoding the Payload from the userJWT
              const jwtPayload = jwtDecode(this.state.userJWT);
              console.log(jwtPayload.user.id);
              this.state.user.id = jwtPayload.user.id;
              this.state.user.firstName = jwtPayload.user.firstName;
              this.state.user.lastName = jwtPayload.user.lastName;
              this.state.user.email = jwtPayload.user.email;
              // this.$store.state.user.imageURL = jwtPayload.user.imageURL;
              this.state.user.role = jwtPayload.user.role;

              localStorage.setItem("access_token", token);
              axios.defaults.headers.common["Authorization"] = token;
              console.log(
                "Local Storage >> " + localStorage.getItem("access_token")
              );

              commit("auth_success", token);
            }
            resolve(response);
          })
          .catch(err => {
            commit("auth_error");
            localStorage.removeItem("token");
            reject(err);
          });
      });
    }
  },
  getters: {
    isLoggedIn: state => !!state.accessToken,
    authStatus: state => state.authStatus
  }
});
