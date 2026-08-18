import { DashboardUtils } from './utils/DashboardUtils.js';
import { CourseService } from './services/CousreService.js';

class CoursePage {
  constructor() {
    this.dashboardUtil = new DashboardUtils();
    this.courseService = new CourseService();

    this.user = this.dashboardUtil.getUserData();
  }

  // Fetches all courses from the service and renders them on the page
  async loadCourses() {
    try {
      const data = await this.courseService.getCourse();
      this.renderCourseElement(data);
    } catch (error) {
      toastr.error(error.message);
    }
  }

  // Dynamically renders course cards in the DOM with course details and pricing
  renderCourseElement(data) {
    const parent = document.getElementById('courseParent');
    let html = '';
    data.forEach((e) => {
      html += `
           <div class="col-md-4 ">
    <div class="card h-100 shadow-sm border-pink ">
        <img
            src="${e.image}"
            class="card-img-top"
            alt="Full Stack Web Development"
            style="height:180px; object-fit:cover;"
        >

        <div class="card-body">
            <h5 class="card-title fw-bold">
                ${e.courseName}
            </h5>

            <p class="card-text text-muted small">
                ${e.description}
            </p>
        </div>

        <div class="card-footer bg-white border-0 d-flex justify-content-between align-items-center">
            <span class="fw-bold text-primary">
                ₹${e.fees}
            </span>

            
        </div>
    </div>
</div>
        `;
    });
    parent.innerHTML = html;
  }

  // Initializes the course page with user details, logout handler, and course loading
  init() {
    this.dashboardUtil.setUsername(this.user[0]);
    this.dashboardUtil.logoutService();
    this.dashboardUtil.backToPreviousPage();
    this.loadCourses();
  }
}

const coursePage = new CoursePage();
coursePage.init();
