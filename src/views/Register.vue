<template>
  <v-app>
    <v-container>
      <toolbar></toolbar>
      <v-layout justify-center>
        <v-flex xs12 sm6 md4 row>
          <v-card height="700" class="mt-2 mt-0">
            <!-- Progress Bar -->
            <v-progress-linear
              :indeterminate="isPending"
              v-show="isPending"
            ></v-progress-linear>

            <v-card-title primary-title>
              <h2>Register</h2>
            </v-card-title>

            <v-card-text>
              <v-layout column>
                <v-radio-group v-model="donor.category" :mandatory="false" row>
                  <v-radio label="Individual" value="individual"></v-radio>
                  <v-radio label="Organization" value="organization"></v-radio>
                </v-radio-group>

                <v-text-field
                  v-model="donor.name"
                  :error-messages="donorNameErrors"
                  :label="
                    donor.category == 'individual'
                      ? 'First Name & Last Name'
                      : 'Organizarion/Company Name'
                  "
                  :append-icon="
                    donor.category == 'individual' ? 'account_circle' : 'home'
                  "
                  required
                  @input="$v.donor.name.$touch()"
                  @blur="$v.donor.name.$touch()"
                ></v-text-field>

                <v-text-field
                  v-model="donor.email"
                  :error-messages="donorEmailErrors"
                  :label="
                    donor.category == 'individual'
                      ? 'Email'
                      : 'Organizarion/Company Email'
                  "
                  append-icon="email"
                  required
                  @input="
                    $v.donor.email.$touch();
                    clearIsEmailAvailable();
                  "
                  @blur="
                    $v.donor.email.$touch();
                    checkEmailAvailable();
                  "
                ></v-text-field>

                <v-text-field
                  v-model="donor.password"
                  :error-messages="donorPasswordErrors"
                  label="Password"
                  required
                  :append-icon="passwordShow ? 'visibility' : 'visibility_off'"
                  :type="passwordShow ? 'text' : 'password'"
                  hint="At least 8 characters"
                  counter
                  @click:append="passwordShow = !passwordShow"
                  @input="$v.donor.password.$touch()"
                  @blur="$v.donor.password.$touch()"
                ></v-text-field>
              </v-layout>
            </v-card-text>

            <v-card-actions>
              <v-flex class="mx-1 px-1">
                <v-btn
                  v-on:click="register"
                  class="btn-login mb-2"
                  Large
                  color="primary"
                  >Register</v-btn
                >
                <p class="mx-1 mt-3">Already Have an Account?</p>

                <v-btn v-on:click="toLoginPage" class="btn-login" Large
                  >Login</v-btn
                >
              </v-flex>
            </v-card-actions>
          </v-card>
        </v-flex>
      </v-layout>
    </v-container>
  </v-app>
</template>

<script>
//Form Validation - Vuelidate
import { validationMixin } from "vuelidate";
import { required, email, minLength } from "vuelidate/lib/validators";
import toolbar from "../components/toolbar";

export default {
  mixins: [validationMixin],
  validations: {
    user: {
      firstName: { required, minLength: minLength(4) },
      lastName: { required, minLength: minLength(4) },
      email: { required, email },
      password: { required, minLength: minLength(8) }
    },
    donor: {
      name: { required, minLength: minLength(4) },
      email: { required, email },
      password: { required, minLength: minLength(8) }
    }
  },
  components: {
    toolbar
  },

  data() {
    return {
      regArray: ["User", "Donor"],

      active: 2,
      passwordShow: false,

      donor: {
        name: "",
        email: "",
        password: "",
        category: "individual"
      },

      isPending: false,
      isEmailAvailable: true,
      user: {
        firstName: "",
        lastName: "",
        email: "",
        password: ""
      }
    };
  },
  computed: {
    /**Form Validation and Error Handlin - begin */
    firstNameErrors() {
      console.log(this.$v.user.firstName.$dirty);
      const errors = [];
      if (!this.$v.user.firstName.$dirty) return errors;
      !this.$v.user.firstName.minLength &&
        errors.push("First Name must be at leat 4 charcters");
      !this.$v.user.firstName.required && errors.push("First Name is required");

      return errors;
    },
    lastNameErrors() {
      const errors = [];
      if (!this.$v.user.lastName.$dirty) return errors;
      !this.$v.user.lastName.minLength && errors.push("Last Name is required");
      !this.$v.user.lastName.required && errors.push("Last Name is required");
      return errors;
    },
    emailErrors() {
      const errors = [];
      if (!this.$v.user.email.$dirty) {
        return errors;
      } else {
        !this.$v.user.email.email && errors.push("Must be valid e-mail");
        !this.$v.user.email.required && errors.push("E-mail is required");
        !this.isEmailAvailable &&
          errors.push("This Email has already been taken!");
        return errors;
      }
    },
    passwordErrors() {
      const errors = [];
      if (!this.$v.user.password.$dirty) return errors;
      !this.$v.user.password.required && errors.push("Password is required");
      return errors;
    },
    donorNameErrors() {
      const errors = [];
      if (!this.$v.donor.name.$dirty) return errors;
      !this.$v.donor.name.minLength &&
        errors.push("Name must contain at least 4 characters");
      !this.$v.donor.name.required && errors.push("Name is required");
      return errors;
    },
    donorEmailErrors() {
      const errors = [];
      if (!this.$v.donor.email.$dirty) {
        return errors;
      } else {
        !this.$v.donor.email.email && errors.push("Must be valid e-mail");
        !this.$v.donor.email.required && errors.push("E-mail is required");
        !this.isEmailAvailable &&
          errors.push("This Email has already been taken!");
        return errors;
      }
    },
    donorPasswordErrors() {
      const errors = [];
      if (!this.$v.donor.password.$dirty) return errors;
      !this.$v.donor.password.required && errors.push("Password is required");
      !this.$v.donor.password.minLength &&
        errors.push("Password must contain at least 8 characters");
      return errors;
    }
    /**Form Validation and Error Handlin - end */
  },

  methods: {
    //Form Validation
    submit() {
      this.$v.$touch();
    },
    //Login Method -> Sends HTTP POST request to the server to verify the user
    register() {
      console.log("Selected ->" + this.active);
      switch (parseInt(this.active)) {
        case 1:
          this.registerUser();
          break;
        case 2:
          this.registerDonor();
          break;
        default:
          console.log("Unknown Selection");
          break;
      }
    },
    //Navigate to User Registration Page
    toLoginPage() {
      this.$router.push("/login");
      // console.log(localStorage.token);
    },
    //This Function is used for check whether the entered Email is already in the database
    checkEmailAvailable() {
      if (this.active == 1) {
        if (this.user.email != "") {
          this.$http
            .get("/api/user/checkEmailAvailable", {
              params: {
                email: this.user.email
              }
            })
            .then(response => {
              // console.log(response.data.matchFound);
              if (response.data.matchFound == true) {
                this.isEmailAvailable = false;
              } else {
                this.isEmailAvailable = true;
              }

              // this.login.$router.push("/");
              // localStorage.setItem("token", response.token);
            })
            .catch(function(error) {
              console.log(error);
            });
        }
      } else if (this.active == 2) {
        if (this.donor.email != "") {
          this.$http
            .get("/api/user/checkEmailAvailable", {
              params: {
                email: this.donor.email
              }
            })
            .then(response => {
              // console.log(response.data.matchFound);
              if (response.data.matchFound == true) {
                this.isEmailAvailable = false;
              } else {
                this.isEmailAvailable = true;
              }

              // this.login.$router.push("/");
              // localStorage.setItem("token", response.token);
            })
            .catch(function(error) {
              console.log(error);
            });
        }
      }
    },
    // To clear the Error of unavailability of the Email
    clearIsEmailAvailable() {
      this.isEmailAvailable = true;
    },
    //To get the current tab number
    getActiveTabNumber(tabNumber) {
      this.active = tabNumber;
      this.isEmailAvailable = true;
      this.passwordShow = false;
      console.log("I`m Here" + this.active);
    },
    //Perform registration on User
    registerUser() {
      //Form Validation
      this.$v.user.$touch();
      if (!this.$v.user.$invalid) {
        console.log("I'm Here**********************");
        this.$http
          .post("/api/generaluser/registration", {
            firstName: this.user.firstName,
            lastName: this.user.lastName,
            email: this.user.email,
            password: this.user.password,
            isPatient: false
          })
          .then(response => {
            console.log(response);
            this.$router.push("/login");
          })
          .catch(function(error) {
            console.log(error);
          });
      } else {
        console.log("Validation Failed");
      }
    },
    //Perform registration on User

    registerDonor() {
      //Form Validation
      this.$v.donor.$touch();
      console.log("I'm Here################## -> " + this.$v.donor.$invalid);
      if (!this.$v.donor.$invalid) {
        console.log("I'm Here**********************");
        this.$http
          .post("/api/donor/create", {
            name: this.donor.name,
            category: this.donor.category,
            email: this.donor.email,
            password: this.donor.password
          })
          .then(response => {
            console.log(response);
            console.log("Success :)");
            this.$router.push("/login");
          })
          .catch(function(error) {
            console.log(error);
            console.log("Failed :(");
          });
      }
    }
  }
};
</script>

<style scoped>
.reg-container {
  padding-top: 25px;
}

.btn-login {
  width: 100%;
}

.btn-login-cover {
  padding-left: 8px;
  padding-right: 8px;
  width: 100%;
}
</style>
