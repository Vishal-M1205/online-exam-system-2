import { DashboardUtils } from './utils/DashboardUtils.js';
import { StudentService } from './services/StudentService.js';

class UserPage {
  constructor() {
    this.dashboardUtil = new DashboardUtils();
    this.studentService = new StudentService();

    this.user = this.dashboardUtil.getUserData();
  }

  // Fetches all students and renders their information on the page
  async loadUser() {
    try {
      const data = await this.studentService.getStudentEnrollments({ role: 'Student' });
      this.renderCourseElement(data);
    } catch (error) {
      toastr.error(error.message);
    }
  }

  // Dynamically renders student details cards in the DOM with personal information
  renderCourseElement(data) {
    const parent = document.getElementById('userParent');
    let html = '';
    data.forEach((e) => {
      html += `
        <div class="col-lg-6">
    <div class="card shadow-sm border-0 h-100">
        <div class="card-header bg-pink text-white">
            <h5 class="mb-0">Student Details</h5>
        </div>

        <div class="card-body">
            <div class="row g-3">

                <div class="col-md-6">
                    <p class="text-muted mb-0">Name</p>
                    <p class="mb-0 fw-bold">${e.name}</p>
                </div>

                <div class="col-md-6">
                    <p class="text-muted mb-0">Role</p>
                    <p class="mb-0 fw-bold"> ${e.role}</p>
                </div>

                <div class="col-md-6">
                    <p class="text-muted mb-0">Email</p>
                    <p class="mb-0 fw-bold">${e.email}</p>
                </div>

                <div class="col-md-6">
                    <p class="text-muted mb-0">Mobile</p>
                    <p class="mb-0 fw-bold">${e.mobile}</p>
                </div>

                <div class="col-md-6">
                    <p class="text-muted mb-0">Date of Birth</p>
                    <p class="mb-0 fw-bold">${e.dob}</p>
                </div>

                <div class="col-md-6">
                    <p class="text-muted mb-0">Gender</p>
                    <p class="mb-0 fw-bold">${e.gender}</p>
                </div>

                <div class="col-12">
                    <p class="text-muted mb-0">College</p>
                    <p class="mb-0 fw-bold">${e.college}</p>
                </div>

                <div class="col-12">
                    <p class="text-muted mb-0">Department</p>
                    <p class="mb-0 fw-bold">${e.departmentName}</p>
                </div>

            </div>
        </div>
      </div>
   </div>
        `;
    });
    parent.innerHTML = html;
  }
  // Initializes the user page with dashboard configuration and user data display
  init() {
    this.dashboardUtil.toastrConfig();
    this.dashboardUtil.renderUserDetail(this.user[0]);
    this.dashboardUtil.setUsername(this.user[0]);
    this.dashboardUtil.logoutService();
    this.dashboardUtil.backToPreviousPage();
    this.loadUser();
  }
}

const userPage = new UserPage();
userPage.init();

// Rener Element in the DOM
