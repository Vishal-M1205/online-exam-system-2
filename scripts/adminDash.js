import { COURSE_API, USER_API, CENTRE_API, ENROLL_API } from '../scripts/api.js';
import { DashboardUtils } from './utils/DashboardUtils.js';
import { CourseService } from './services/CousreService.js';
import { EnrollmentServices } from './services/EnrollmentServices.js';
import { StudentService } from './services/StudentService.js';
import { CentreService } from './services/CentreService.js';
import { Statistics } from './utils/Statistics.js';
import { ConfirmationService } from './utils/ConfirmationService.js';

class AdminDashboard {
  constructor() {
    this.dashboardUtil = new DashboardUtils();
    this.courseService = new CourseService();
    this.enrollmentServices = new EnrollmentServices();
    this.statistics = new Statistics();
    this.studentService = new StudentService();
    this.centreService = new CentreService();
    this.confiramationService = new ConfirmationService();

    this.user = this.dashboardUtils.getUserData();

    this.currentEnrollId = null;

    //For maintaining the state in while applying filter used in URLSearchParams
    this.status = '';
    this.searchQuery = '';
    this.courseQuery = '';
    this.examDateQuery = '';

    //Pagination variables
    this.page = 1;
    this.perPage = 5;
    this.totalPages = 0;
    //Deleted default state
    this.isDeleted = false;
    //Modal from the DOM
    this.rejectModal = new bootstrap.Modal(document.getElementById('rejectModal'));
    this.filterModal = new bootstrap.Modal(document.getElementById('filterModal'));
  }

  setupEvents() {
    $('#parent').on('click', '[data-action]', (e) => {
      const button = e.currentTarget;
      const action = button.dataset.action;
      const id = button.dataset.id;

      switch (action) {
        case 'view':
          this.handleView(id);
          break;
        case 'approve':
          this.handleApprove(id);
          break;
        case 'reject':
          this.currentEnrollId = id;
          break;
        case 'permanentDelete':
          this.handleDelete(id);
          break;
        case 'restore':
          this.handleRestore(id);
          break;
      }
    });
    //Event Listner fot the Filter Modal
    $('#filterAplyBtn').on('click', () => {
      if ($('#courseNameFilter').val() || $('#examDateFilter').val()) {
        this.courseQuery = $('#courseNameFilter').val();
        this.examDateQuery = $('#examDateFilter').val();
        $('#clrFilter').prop('disabled', false);
        this.resetPagination();
        this.loadEnrollments();
        this.filterModal.hide();
      } else {
        toastr.warning('Atleast Select One Filter');
      }
    });

    //Clears the filter
    $('#clrFilter').on('click', () => {
      $('#courseNameFilter').val('');
      $('#examDateFilter').val('');
      this.courseQuery = '';
      this.examDateQuery = '';
      $('#clrFilter').prop('disabled', true);
      this.resetPagination();
      this.loadEnrollments();
    });

    $('#rejectSubmit').on('click', () => {
      this.handleReject();
    });

    $('#nextPage').on('click', () => {
      if (this.page < this.totalPages) {
        this.page += 1;
        $('#pageNum').text(this.page);

        this.loadEnrollments();
      }
    });
    $('#prevPage').on('click', () => {
      if (this.page > 1) {
        this.page -= 1;
        $('#pageNum').text(this.page);

        this.loadEnrollments();
      }
    });

    $('#searchInput').on('input', function () {
      this.page = 1;
      $('#pageNum').text(this.page);
      this.searchQuery = $('#searchInput').val();

      this.loadEnrollments();
    });
    $('#courseCard').on('click', () => {
      window.location.assign('../pages/coursesPage.html');
    });

    $('#allBtn,#enrollmentCard').on('click', () => {
      this.setBtnState('');
    });

    $('#apprBtn,#approveCard').on('click', () => {
      this.setBtnState('Approved');
    });

    $('#pendBtn,#pendCard').on('click', () => {
      this.setBtnState('Pending');
    });

    $('#rejBtn,#rejectCard').on('click', () => {
      this.setBtnState('Rejected');
    });

    $('#deletedBtn').on('click', () => {
      if (this.status == 'Attended') {
        this.status = '';
        this.setBtnState('');
      }
      if (!this.isDeleted) {
        this.isDeleted = true;
      } else {
        this.isDeleted = false;
      }

      this.loadEnrollments();
      $(this).toggleClass('btn-blue');
    });

    $('#attendedBtn').on('click', () => {
      this.resetPagination();
      $('#deletedBtn').removeClass('btn-blue');
      $(this).toggleClass('btn-blue');
      this.isDeleted = false;
      if (this.status == 'Attended') {
        this.status = '';
        $('#allBtn').addClass('btn-pink-gradient');
      } else {
        this.status = 'Attended';
        $('#allBtn').removeClass('btn-pink-gradient');
      }
      $('#apprBtn').removeClass('btn-pink-gradient');
      $('#pendBtn').removeClass('btn-pink-gradient');
      $('#rejBtn').removeClass('btn-pink-gradient');

      getRecordOnStatus();
    });

    $('#centreCard').on('click', async () => {
      try {
        const data = await this.centreService.getCentre();
        this.renderCentre(data);
      } catch (error) {
        toastr.error(error.message);
      }
    });

    $('#studentCard').on('click', () => {
      window.location.assign('../pages/userPage.html');
    });
  }

  resetPagination() {
    this.page = 1;
    $('#pageNum').text(this.page);
  }

  renderCourseFilterOption(data) {
    const parent = document.getElementById('courseNameFilter');
    let html = `<option value="">Selected None</option>`;
    data.forEach((c) => {
      html += `
            <option value="${c.courseName}">${c.courseName}</option>
            `;
    });
    parent.innerHTML = html;
  }

  //Populating the select tag in the Filter Modal

  async populateCourseFilter() {
    try {
      const data = await this.courseService.getCourse();

      this.renderCourseFilterOption(data);
    } catch (error) {
      toastr.error(error.message);
    }
  }

  renderEnrollStats(data) {
    $('#enrollCount').text(data.total);
    $('#pendingCount').text(data.pending);
    $('#rejectCount').text(data.rejected);
    $('#approveCount').text(data.approved);
  }

  renderEnrollStatsPercent(data) {
    $('#pendingBar').css('width', `${data.pending}%`);
    $('#rejectBar').css('width', `${data.rejected}%`);
    $('#approveBar').css('width', `${data.approved}%`);
  }

  renderCourseStats(data) {
    $('#courseCount').text(data.length);
  }

  renderStudentStats(data) {
    $('#studentCount').text(data.length);
  }

  renderCentreStats(data) {
    $('#centreCount').text(data.length);
  }

  // Gets the count for the statistics section

  async getStats() {
    try {
      const enrollmentData = await this.enrollmentServices.getEnrollments({
        isDeleted: false,
      });
      const courseData = await this.courseService.getCourse();
      const studentData = await this.studentService.getStudentEnrollments({ role: 'Student' });
      const centreData = await this.centreService.getCentre();

      const enrollStats = this.statistics.calculateStats(enrollmentData);
      this.renderEnrollStats(enrollStats);

      const enrollStatsPercent = this.statistics.calculateStatsPercent(enrollStats);
      this.renderEnrollStatsPercent(enrollStatsPercent);

      this.renderCourseStats(courseData);
      this.renderStudentStats(studentData);
      this.renderCentreStats(centreData);
    } catch (error) {
      toastr.error(error.message);
    }
  }

  // Populate details in the view Modal
  async handleView(id) {
    try {
      const data = this.enrollmentServices.getEnrollment(id);
      this.dashboardUtil.populateViewModal(data);
    } catch (error) {
      console.log(error);
    }
  }

  async handleApprove(id) {
    try {
      const approveConfirmation = await this.confiramationService.confirm(
        'Are you sure you want to approve?'
      );
      if (approveConfirmation) {
        const response = await this.enrollmentServices.applyEnrollment(id);
        if (response.ok) {
          this.getStats();
          this.loadEnrollments();
        }
      }
    } catch (error) {}
  }

  validateRejectForm() {
    if (!$('#rejectReason').val()) {
      toastr.warning('Empty field not allowed!');
      return false;
    }
    return true;
  }

  // Changing the Status to 'Rejected' with Reason
  async handleReject() {
    try {
      if (!this.validateRejectForm()) {
        return;
      }
      const rejectConfirmation = await this.confiramationService.confirm(
        'Are you sure you want to reject?',
        'warning'
      );
      if (rejectConfirmation) {
        const payload = { reason: $('#rejectReason').val() };
        const response = await this.enrollmentServices.reapplyEnrollment(
          this.currentEnrollId,
          payload
        );
        if (response.ok) {
          this.getStats();
          this.loadEnrollments();
          this.rejectModal.hide();
        }
      }
    } catch (error) {
      toastr.error(error.message);
    }
  }

  // Deleting the record Permanently
  async handleDelete(id) {
    try {
      const deleteConfirmation = await this.confiramationService.confirm(
        'Are you sure you want to delete permanently?',
        'warning'
      );
      if (deleteConfirmation) {
        const response = await this.enrollmentServices.deleteEnrollment(id);
        if (response.ok) {
          this.getStats();
          this.loadEnrollments();
        }
      }
    } catch (error) {
      toastr.error(error.message);
    }
  }

  // Restoring the record isDeleted = false
  async handleRestore(id) {
    const restoreConfirmation = await this.confiramationService.confirm(
      'Are you sure you want to restore?'
    );
    if (restoreConfirmation) {
      const response = await this.enrollmentServices.restoreEnrollment(id);
      if (response.ok) {
        this.getStats();
        this.loadEnrollments();
      }
    }
  }

  determineStatusClass(status) {
    switch (status) {
      case 'Pending':
        return 'text-warning bg-warning-subtle';
      case 'Approved':
        return 'text-success bg-success-subtle';
      case 'Attended':
        return 'text-info bg-info-subtle';
      default:
        return 'text-danger bg-danger-subtle';
    }
  }

  determineDisabledState(status) {
    return status === 'Pending' ? '' : 'disabled style="color:black; background-color:grey;"';
  }

  // Dynamically render the element in the DOM using a parent tag

  renderEnrollments(data) {
    const parent = document.getElementById('parent');
    let html = '';
    data.forEach((e, i) => {
      const isExpired = this.dashboardUtil.checkExamExpiry(e.preferredDate, e.status);
      html += `
        <tr>
                  <td>${(this.page - 1) * this.perPage + i + 1}</td>
                  <td>${e.name}</td>
                  <td>${e.courseName}</td>
                  <td>${e.centre}</td>
                  <td>${this.dashboardUtil.dateFormat(e.preferredDate)}</td>
                  <td class="align-items-center">
                  <div class="d-flex align-items-center justify-content-start gap-2">
                        <span class="
                            ${this.determineStatusClass(e.status)}
                        ">
                            ${e.status}
                        </span>

                        ${
                          isExpired
                            ? `<i class="bi bi-exclamation-triangle-fill text-danger icon-tooltip"
                 data-tooltip="Exam date has passed"></i>`
                            : ''
                        }
                    </div>
                  </td>
                  <td>
                  <button class="btn btn-info btn-sm m-1 icon-tooltip viewBtn"
                 data-tooltip="View"
                   data-bs-toggle="modal" 
                   data-bs-target="#viewModal"
                   data-action="view"
                    data-id="${e.id}">
                   <i class="bi bi-eye" ></i>
                  </button>
                  ${
                    isDeleted
                      ? `
                     <button class="btn  btn-sm m-1 icon-tooltip restoreBtn"
                 data-tooltip="Restore" 
                 data-action="restore"
                 data-id="${e.id}" >
                   <i class="bi bi-arrow-counterclockwise"></i>
                     </button>
                     <button class="btn  btn-sm m-1 icon-tooltip permanentDeleteBtn"
                 data-tooltip="Delete Permanently" 
                     data-action="permanentDelete"
                     data-id="${e.id}">
                       <i class="bi bi-trash"></i>
                     </button>
                    
                    
                    `
                      : ` <button class="btn  btn-sm m-1 icon-tooltip approveBtn"
                 data-tooltip="Approve" ${this.determineDisabledState(e.status)} 
                  data-action="approve"
                  data-id="${e.id}">
                   <i class="bi bi-check-circle"></i>
                  </button>
                  
                    <button class="btn  btn-sm m-1 icon-tooltip rejectBtn"
                 data-tooltip="Reject" ${this.determineDisabledState(e.status)} 
                  data-bs-toggle="modal"
                  data-bs-target="#rejectModal"
                  data-action="reject"
                  data-id="${e.id}">
                   <i class="bi bi-x-circle"></i>
                  </button>

                  `
                  }
                  </td>
                 </tr>
        `;
    });
    parent.innerHTML = html;
  }

  buildQuery() {
    const params = {};
    params._sort = '-updatedAt';
    params.isDeleted = this.isDeleted;
    if (this.status) {
      params.status = this.status;
    }
    if (this.searchQuery) {
      params['name:startsWith'] = this.searchQuery;
    }
    if (this.courseQuery) {
      params.courseName = this.courseQuery;
    }
    if (this.examDateQuery) {
      params.preferredDate = this.examDateQuery;
    }
    params._page = this.page;
    params._per_page = this.perPage;
    return params;
  }

  loadEnrollments() {
    const params = this.buildQuery();
    const data = this.enrollmentServices.getEnrollments(params);
    this.renderEnrollments(data.data);
    this.totalPages = data.pages;
  }

  setBtnState(status) {
    this.status = status;
    $('#allBtn, #apprBtn, #pendBtn, #rejBtn').removeClass('btn-pink-gradient');
    const btnId = {
      '': '#allBtn',
      Approved: '#apprBtn',
      Pending: '#pendBtn',
      Rejected: '#rejBtn',
    };
    $(btnId[status]).addClass('btn-pink-gradient');
    $('#attendedBtn').removeClass('btn-blue');
    this.resetPagination();
    this.loadEnrollments();
  }

  renderCentre(data) {
    const parent = document.getElementById('centreParent');

    let html = '';
    data.forEach((e) => {
      html += `
      <div class="shadow-sm px-3 d-flex align-items-center py-2 rounded-3 my-2 border border-2">
                 <h5 class="mb-0 text-pink"><span class="bi bi-building me-2 text-navy"></span>${e.centreName}</h5>
              </div>
      
      `;
    });
    parent.innerHTML = html;
  }

  init() {
    this.dashboardUtil.toastrConfig();
    this.dashboardUtil.renderUserDetail(this.user[0]);
    this.dashboardUtil.setUsername(this.user[0]);
    this.dashboardUtil.logoutService();
    this.populateCourseFilter();
    this.getStats();
    this.setupEvents();
    this.loadEnrollments();
    $('#pageNum').text(this.page);
  }
}

const dashboard = new AdminDashboard();
dashboard.init();
