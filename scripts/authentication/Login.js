import { LoginValidator } from '../validator/LoginValidator.js';
import { StudentService } from '../services/StudentService.js';
import { DashboardUtils } from '../utils/DashboardUtils.js';

export class Login {
  constructor() {
    this.studentService = new StudentService();
    this.loginValidator = new LoginValidator();
    this.dashboardUtils = new DashboardUtils();
  }
  setupEventListeners() {
    $('#login-form').on('submit', (e) => {
      e.preventDefault();
      console.log('submit');
      this.handleLogin();
    });
  }

  async handleLogin() {
    if (!this.loginValidator.validateLoginForm()) {
      return;
    }
    const data = await this.studentService.getStudentByEmail($('#loginEmail').val());

    if (!data[0]?.email) {
      toastr.error('No user found');
      return;
    }
    if (!this.loginValidator.validatePassword(data, $('#loginPass').val())) {
      console.log('error');
      return;
    }
    toastr.success('Login Success');
    localStorage.setItem('user', JSON.stringify(data));
    if (data[0].role == 'Admin') {
      setTimeout(() => {
        window.location.replace('../pages/adminDash.html');
      }, 1000);
    } else {
      setTimeout(() => {
        window.location.replace('../pages/studentDash.html');
      }, 1000);
    }
  }

  init() {
    this.dashboardUtils.toastrConfig();
    this.setupEventListeners();
  }
}
