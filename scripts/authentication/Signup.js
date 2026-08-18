import { DashboardUtils } from '../utils/DashboardUtils.js';
import { SignupValidator } from '../validator/SignupValidator.js';
import { DepartmentService } from '../services/DepartmentService.js';
import { StudentService } from '../services/StudentService.js';

export class Signup {
  // Initializes the Signup class with required services and sets up the signup modal
  constructor() {
    this.dashboardUtils = new DashboardUtils();
    this.signupValidator = new SignupValidator();
    this.departmentService = new DepartmentService();
    this.studentService = new StudentService();

    this.signupModal = new bootstrap.Modal(document.getElementById('signupModal'));
  }

  // Attaches event listeners to the signup form for form submission handling
  setupEventListeners() {
    $('#signup-form').on('submit', (e) => {
      e.preventDefault();
      this.handleSubmit();
    });
  }

  // Validates form data and submits signup request to create a new student account
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

  // Collects and formats signup form data into a payload object for API submission
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

  // Renders department options in the dropdown select element
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

  // Fetches department data from the service and populates the department dropdown
  async populateDepartmentOption() {
    try {
      const data = await this.departmentService.getDepartment();
      this.renderDepartment(data);
    } catch (error) {
      console.log(error);
    }
  }

  // Initializes the signup form by configuring toastr, setting date constraints, and populating departments
  init() {
    this.dashboardUtils.toastrConfig();
    this.signupValidator.setMinimumDateForDOB();
    this.populateDepartmentOption();
    this.setupEventListeners();
  }
}
