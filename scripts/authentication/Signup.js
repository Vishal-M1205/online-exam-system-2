import { DashboardUtils } from '../utils/DashboardUtils.js';
import { SignupValidator } from '../validator/SignupValidator.js';
import { DepartmentService } from '../services/DepartmentService.js';
import { StudentService } from '../services/StudentService.js';

// Regex for the validations

export class Signup {
  constructor() {
    this.dashboardUtils = new DashboardUtils();
    this.signupValidator = new SignupValidator();
    this.departmentService = new DepartmentService();
    this.studentService = new StudentService();

    this.signupModal = new bootstrap.Modal(document.getElementById('signupModal'));
  }

  setupEventListeners() {
    $('#signup-form').on('submit', (e) => {
      e.preventDefault();
      this.handleSubmit();
    });
  }

  async handleSubmit() {
    try {
      if (!this.signupValidator.validateSignupForm()) {
        return;
      }
      const email = $('#email').val().trim();
      if (await this.signupValidator.checkDuplicateEmail(email)) {
        return;
      }
      const data = await this.getSignupPayload();
      const response = await this.studentService.createNewStudent(data);
      if (response.ok) {
        this.signupModal.hide();
        toastr.success('Registration Success');
      }
    } catch (error) {
      console.log(error);
    }
  }

  async getSignupPayload() {
    return {
      name: $('#name').val().trim(),
      email: $('#email').val().trim().toLowerCase(),
      password: await this.signupValidator.hashPassword($('#pass').val().trim()),
      dob: $('#dob').val(),
      gender: $('#male').prop('checked') ? 'Male' : 'Female',
      college: $('#college').val().trim(),
      deptId: $('#department').data('id'),
      departmentName: $('#department').val(),
      mobile: $('#mobile').val(),
      role: 'Student',
    };
  }

  renderDepartment(data) {
    const parent = document.getElementById('department');
    let html = '';
    data.forEach((d) => {
      html += `
         <option value="${d.departmentName}" data-id="${d.deptId}">${d.departmentName}</option>
      `;
    });
    parent.innerHTML = html;
  }

  async populateDepartmentOption() {
    try {
      const data = await this.departmentService.getDepartment();
      this.renderDepartment(data);
    } catch (error) {
      console.log(error);
    }
  }

  init() {
    this.dashboardUtils.toastrConfig();
    this.signupValidator.setMinimumDateForDOB();
    this.populateDepartmentOption();
    this.setupEventListeners();
  }
}
