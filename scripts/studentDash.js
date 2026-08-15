import { EnrollmentServices } from './services/EnrollmentServices.js';
import { CourseService } from './services/CousreService.js';
import { CentreService } from './services/CentreService.js';
import { ConfirmationService } from './utils/ConfirmationService.js';
import { DashboardUtils } from './utils/DashboardUtils.js';
import { Statistics } from './utils/Statistics.js';
class StudentDashboard {
  constructor() {
    this.enrollmentServices = new EnrollmentServices();
    this.courseService = new CourseService();
    this.centreService = new CentreService();
    this.confirmationService = new ConfirmationService();
    this.dashboardUtils = new DashboardUtils();
    this.statistics = new Statistics();

    //  Logged IN used detail
    this.user = this.dashboardUtils.getUserData();

    // To track the current user updating the enrollment
    this.currentUpdateId = null;
    this.reapplyDate = null;
    // Filter Status

    this.status = '';
    this.searchQuery = '';
    this.startDateQuery = '';
    this.endDateQuery = '';

    // Delete Status

    this.isDeleted = false;

    //Modals used in studentDash.htnl

    this.enrollModal = new bootstrap.Modal(document.getElementById('enrollModal'));
    this.updateModal = new bootstrap.Modal(document.getElementById('updateModal'));
    this.reapplyModal = new bootstrap.Modal(document.getElementById('reapplyModal'));
    this.filterModal = new bootstrap.Modal(document.getElementById('filterModal'));
  }

  async getStats() {
    try {
      const enrollments = await this.enrollmentServices.getEnrollments({
        userId: this.user[0].id,
        isDeleted: false,
      });
      const stats = this.statistics.calculateStats(enrollments);
      this.renderStats(stats);
    } catch (error) {
      console.log(error);
    }
  }

  buildQuery() {
    const params = {
      userId: this.user[0].id,
      _sort: '-updatedAt',
      isDeleted: this.isDeleted,
    };

    if (this.status) {
      params.status = this.status;
    }

    if (this.searchQuery) {
      params['centre:startsWith'] = this.searchQuery;
    }

    if (this.startDateQuery) {
      params['preferredDate:gte'] = this.startDateQuery;
    }
    if (this.endDateQuery) {
      params['preferredDate:lte'] = this.endDateQuery;
    }

    return params;
  }

  getStatusClass(status) {
    if (status === 'Approved') {
      return 'bg-success-subtle text-success';
    } else if (status === 'Pending') {
      return 'bg-warning-subtle text-yellow';
    } else if (status === 'Rejected') {
      return 'bg-danger-subtle text-danger';
    } else {
      return 'bg-info-subtle text-info';
    }
  }

  getActionButton(id, status) {
    if (status === 'Pending') {
      return `
                    <button class="btn  bi bi-pen icon-tooltip updateBtn"
                 data-tooltip="Edit"
                    data-bs-toggle="modal"
                    data-bs-target="#updateModal"
                    data-action="update"
                    data-id="${id}">
                 </button>
                  <button class="btn  bi bi-trash icon-tooltip cancelBtn"
                 data-tooltip="Cancel" 
                 data-action="cancel"
                 data-id="${id}">
                 </button>
                    `;
    }
    if (status === 'Rejected') {
      return `
                    <button class="btn  bi bi-arrow-counterclockwise icon-tooltip reapplyBtn"
                 data-tooltip="Reapply"
                    data-bs-toggle="modal"
                    data-bs-target="#reapplyModal"
                    data-action="reapply"
                    data-id="${id}">
                 </button>
                  <button class="btn  bi bi-trash icon-tooltip cancelBtn"
                 data-tooltip="Cancel"  
                 data-action="cancel"
                 data-id="${id}">
                 </button>
                    `;
    }
    if (status === 'Approved') {
      return `
                    <button class="btn  bi bi-check-circle icon-tooltip attendBtn"
                 data-tooltip="Attended ?" 
                    data-action="attend"
                 data-id="${id}">
                 </button>
                  <button class="btn  bi bi-trash icon-tooltip cancelBtn"
                 data-tooltip="Cancel"  
                 data-action="cancel"
                 data-id="${id}">
                 </button>
                    `;
    }
    return '';
  }

  renderEnrollment(enrollments) {
    const parent = document.getElementById('parent');
    parent.innerHTML = '';
    let html = '';

    enrollments.forEach((e) => {
      const isExpired = this.dashboardUtils.checkExamExpiry(e.preferredDate, e.status);
      const statusClass = this.getStatusClass(e.status);
      const actionButton = this.getActionButton(e.id, e.status);
      html += `
           <div class="col-lg-4 col-md-6 col-12">
           <div class="d-flex align-items-start justify-content-between bg-white  px-4 py-3 rounded-4 data-card">
             <div class="d-flex flex-column gap-2">
              <p class="mb-0 fw-semibold">${e.courseName}</p>
               <p class="mb-0"><span class="fw-bold">Exam Date : </span>${this.dashboardUtils.dateFormat(e.preferredDate)}</p>
               <p class="mb-0"><span class="fw-bold">Centre : </span>${e.centre}</p>
               <div class="d-flex align-items-center gap-1">
               <p class="px-2 py-1 ${statusClass} rounded-pill w-50 text-center">
               ${e.status}
               </p>
               ${
                 isExpired
                   ? `<i class="bi fs-5 mb-3 bi-exclamation-triangle-fill text-danger icon-tooltip"
                 data-tooltip="Exam date has passed"
                                  ></i>`
                   : ''
               }
               </div>
               
             </div>
             <div class="d-flex flex-column gap-2" >

                 <button class="btn  bi bi-eye icon-tooltip viewBtn"
                 data-tooltip="View"
                 data-bs-toggle="modal"
                 data-bs-target="#viewModal"
                 data-id="${e.id}"
                 data-action="view" >
                 </button>
                 
                 ${actionButton}
             </div>
           </div>
         </div>
        `;
    });
    parent.innerHTML = html;
  }

  async loadEnrollment() {
    try {
      const params = this.buildQuery();
      const enrollments = await this.enrollmentServices.getEnrollments(params);
      this.renderEnrollment(enrollments);
    } catch (error) {
      console.log(error);
    }
  }

  setupEvents() {
    $('#parent').on('click', '[data-action]', (e) => {
      const button = e.currentTarget;
      const action = button.dataset.action;
      const id = button.dataset.id;

      switch (action) {
        case 'update':
          this.handleUpdate(id);
          break;
        case 'reapply':
          this.handleReapply(id);
          break;
        case 'cancel':
          this.handleCancel(id);
          break;
        case 'attended':
          this.handleAttended(id);
          break;
        case 'view':
          this.handleView(id);
          break;
      }
    });

    $('#updateApplyBtn').on('click', () => {
      this.submitUpdate();
    });

    $('#enrollApplyBtn').on('submit', (e) => {
      e.preventDefault();
      this.applyEnrollment();
    });

    $('#reapplySubmitBtn').on('click', () => {
      this.reapplyEnrollment();
    });

    $('#allBtn, #enrollCard').on('click', () => {
      this.setBtnState('');
    });

    $('#apprBtn, #approvedCard').on('click', () => {
      this.setBtnState('Approved');
    });

    $('#pendBtn, #pendingCard').on('click', () => {
      this.setBtnState('Pending');
    });

    $('#rejBtn, #rejectedCard').on('click', () => {
      this.setBtnState('Rejected');
    });

    $('#attnBtn').on('click', () => {
      this.setBtnState('Attended');
    });

    $('#filterAplyBtn').on('click', () => {
      this.applyFilter();
    });

    $('#clrFilter').on('click', () => {
      this.clearFilter();
    });
    $('#searchInput').on('input', () => {
      this.searchQuery = $('#searchInput').val();
      this.loadEnrollment();
    });

    $('#exploreCourseBtn').on('click', () => {
      window.location.assign('../pages/coursesPage.html');
    });
  }

  async handleView(id) {
    const data = await this.enrollmentServices.getEnrollment(id);
    this.dashboardUtils.populateViewModal(data);
  }

  async handleAttended(id) {
    const confirmAttended = await this.confirmationService.confirm(
      'Are you sure you attended the exam?'
    );
    if (confirmAttended) {
      const response = await this.enrollmentServices.attendedExam(id);
      if (response.ok) {
        this.loadEnrollment();
        this.getStats();
        toastr.success('Thank you for Attending the Exam');
      }
    }
  }

  async handleCancel(id) {
    const confirmCancel = await this.confirmationService.confirm(
      'Are you sure you want to cancel the Application?'
    );
    if (confirmCancel) {
      const resposne = await this.enrollmentServices.cancelEnrollment(id);
      if (resposne.ok) {
        this.loadEnrollment();
        this.getStats();
        toastr.success('Deleted Successfully');
      }
    }
  }

  validateReapplyDate() {
    if (this.reapplyDate == $('#reapplyDate').val()) {
      toastr.warning('Same Date Applied !');
      return false;
    }
    return true;
  }

  getReapplyPayload() {
    return {
      preferredDate: $('#reapplyDate').val(),
      status: 'Pending',
      reason: '',
      updatedAt: new Date().toISOString().split('T')[0],
    };
  }

  async reapplyEnrollment() {
    if (!this.validateReapplyDate()) {
      return;
    }

    const confirmReapply = await this.confirmationService.confirm(
      'Are you sure you want to reapply?'
    );

    if (confirmReapply) {
      const payload = this.getReapplyPayload();
      const response = await this.enrollmentServices.reapplyEnrollment(
        this.currentUpdateId,
        payload
      );
      if (response.ok) {
        this.loadEnrollment();
        this.getStats();
        toastr.success('Reapplied Successfully !');
        this.reapplyModal.hide();
      }
    }
  }

  async handleReapply(id) {
    try {
      const data = await this.enrollmentServices.getEnrollment(id);
      this.setReapplyDate(data);
      this.currentUpdateId = id;
      this.reapplyDate = data.preferredDate;
    } catch (error) {
      console.log(error);
    }
  }

  setReapplyDate(data) {
    $('#reapplyDate').val(data.preferredDate);
    $('#reapplyDate').attr('min', new Date().toISOString().split('T')[0]);
  }

  async submitUpdate() {
    try {
      const id = this.currentUpdateId;

      if (!this.updateFormValidate()) {
        return;
      }
      const courseName = $('#updateCourse').find(':selected').val();
      if (await this.checkDuplicateEnrollment(id, courseName)) {
        return;
      }

      const confirmUpdateResponse = await this.confirmationService.confirm(
        'Are you sure you want to update?'
      );

      if (confirmUpdateResponse) {
        const payload = await this.getUpdatePayload();
        await this.updateEnrollment(id, payload);
        toastr.success('Updated Successfully!');

        await this.loadEnrollment();

        await this.getStats();

        this.updateModal.hide();
      }
    } catch (error) {
      console.log(error);
    }
  }

  async loadUpdateData(id) {
    const courseData = await this.courseService.getCourse();

    const enrollData = await this.enrollmentServices.getEnrollment(id);

    return {
      courseData,
      enrollData,
    };
  }

  populateUpdateForm(data) {
    const enrollment = data.enrollData;
    const course = data.courseData;

    $(`#updateCourse option[data-id="${enrollment.courseId}"]`).prop('selected', true);
    $(`#updateCentre option[data-id="${enrollment.centreId}"]`).prop('selected', true);

    if (enrollment.courseId) {
      const fees = course.filter((c) => c.courseId == enrollment.courseId);

      $('#updateFees').val(fees[0].fees);
    }
    $('#updateExamDate').val(enrollment.preferredDate);
    $('#updateExamDate').attr('min', new Date().toISOString().split('T')[0]);
  }

  setupCourseFeeListener(coursedata) {
    $('#updateCourse')
      .off('change')
      .on('change', function () {
        const id = $(this).find(':selected').data('id');
        if (id) {
          const fees = coursedata.filter((c) => c.courseId == id);
          $('#updateFees').val(fees[0].fees);
        } else {
          $('#updateFees').val('');
        }
      });
  }

  updateFormValidate() {
    if (!$('#updateCourse').find(':selected').data('id')) {
      toastr.warning('Empty Course Field !');
      return false;
    } else if (!$('#updateCentre').find(':selected').data('id')) {
      toastr.warning('Empty Centre Field !');
      return false;
    } else if (!$('#updateExamDate').val()) {
      toastr.warning('Empty Date Field !');
      return false;
    }
    return true;
  }

  async checkDuplicateEnrollment(id = null, courseName) {
    const checkData = await this.enrollmentServices.getEnrollments({
      userId: this.user[0].id,
      isDeleted: false,
    });
    for (let e of checkData) {
      if (e.courseName === courseName && id != e.id) {
        toastr.warning('Already Registered this Course');
        return true;
      }
    }
    return false;
  }

  getUpdatePayload() {
    const course = $('#updateCourse').find(':selected');
    const centre = $('#updateCentre').find(':selected');

    return {
      courseId: course.data('id'),
      courseName: course.val(),
      deptId: course.data('depid'),
      deptName: course.data('department'),
      fees: $('#updateFees').val(),
      centreId: centre.data('id'),
      centre: centre.val(),
      preferredDate: $('#updateExamDate').val(),
      updatedAt: new Date().toISOString().split('T')[0],
    };
  }

  async updateEnrollment(id, payload) {
    const response = await this.enrollmentServices.updateEnrollment(id, payload);

    if (!response.ok) {
      throw new Error('Failed to update enrollment.');
    }

    return response;
  }

  async handleUpdate(id) {
    try {
      const data = await this.loadUpdateData(id);
      this.populateUpdateForm(data);
      this.setupCourseFeeListener(data.courseData);
      this.currentUpdateId = id;
    } catch (error) {
      console.log(error);
    }
  }

  async loadEnrollDetails() {
    try {
      const courseData = await this.courseService.getCourse();
      const centreData = await this.centreService.getCentre();

      this.populateCourseOptions(courseData);
      this.populateCentreOptions(centreData);
      this.setExamMinimumDate();
    } catch (error) {
      console.log(error);
    }
  }

  populateCourseOptions(courseData) {
    const courseParent = document.getElementById('course');
    const updateCourseParent = document.getElementById('updateCourse');

    let courseHTML = `<option value="" data-id="">Choose...</option>`;

    courseData.forEach((e) => {
      courseHTML += `
        <option value="${e.courseName}" data-id="${e.courseId}" 
        data-depid="${e.deptId}" 
        data-department="${e.departmentName}">${e.courseName}</option>
       
       `;
    });
    courseParent.innerHTML = courseHTML;
    updateCourseParent.innerHTML = courseHTML;
  }

  populateCentreOptions(centreData) {
    const centreParent = document.getElementById('centre');
    const updateCentreParent = document.getElementById('updateCentre');

    let centreHTML = `<option value="">Choose...</option>`;

    centreData.forEach((e) => {
      centreHTML += `
        <option value="${e.centreName}" data-id="${e.centreId}">${e.centreName}</option>
       `;
    });

    centreParent.innerHTML = centreHTML;
    updateCentreParent.innerHTML = centreHTML;
  }

  setExamMinimumDate() {
    $('#examDate').attr('min', new Date().toISOString().split('T')[0]);
  }

  validateEnrollForm() {
    const validator = $('#enrollForm').validate({
      errorClass: 'text-danger d-block mt-1',
      rules: {
        course: {
          required: true,
        },
        centre: {
          required: true,
        },
        examDate: {
          required: true,
        },
      },
    });
    return validator.form();
  }

  getEnrollmentPayload() {
    const course = $('#course').find(':selected');
    const centre = $('#centre').find(':selected');
    return {
      name: this.user[0].name,
      email: this.user[0].email,
      userId: this.user[0].id,
      courseId: course.data('id'),
      courseName: course.val(),
      deptId: course.data('depid'),
      deptName: course.data('department'),
      fees: $('#fees').val(),
      centreId: centre.data('id'),
      centre: centre.val(),
      preferredDate: $('#examDate').val(),
      status: 'Pending',
      reason: '',
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      isDeleted: false,
    };
  }

  async applyEnrollment() {
    if (!this.validateEnrollForm()) {
      return;
    }

    const courseName = $('#course').find(':selected').val();

    if (await this.checkDuplicateEnrollment(courseName)) {
      return;
    }

    const confirmResponse = await this.confirmationService.confirm(
      'Are you sure you want to apply?'
    );

    if (confirmResponse) {
      const payload = this.getEnrollmentPayload();
      const response = await this.enrollmentServices.applyEnrollment(payload);

      if (response.ok) {
        toastr.success('Enrolled Successfully !');
        await this.loadEnrollment();

        await this.getStats();

        this.enrollModal.hide();
        document.getElementById('enrollForm').reset();
      }
    }
  }

  setBtnState(status) {
    this.status = status;
    $('#allBtn, #apprBtn, #pendBtn, #rejBtn, #attnBtn').removeClass('btn-pink-gradient');

    const btnMap = {
      '': '#allBtn',
      Approved: '#apprBtn',
      Pending: '#pendBtn',
      Rejected: '#rejBtn',
      Attended: '#attnBtn',
    };

    $(btnMap[status]).addClass('btn-pink-gradient');
    this.loadEnrollment();
  }

  applyFilter() {
    const startDate = $('#startDateFilter').val();
    const endDate = $('#endDateFilter').val();

    if (!startDate && !endDate) {
      toastr.warning('At least select one filter');
      return;
    }

    this.startDateQuery = startDate;
    this.endDateQuery = endDate;

    this.loadEnrollment();

    $('#clrFilter').prop('disabled', false);
    this.filterModal.hide();
  }

  clearFilter() {
    $('#startDateFilter').val('');
    $('#endDateFilter').val('');
    this.startDateQuery = '';
    this.endDateQuery = '';
    $('#clrFilter').prop('disabled', true);
    this.loadEnrollment();
  }

  init() {
    this.dashboardUtils.toastrConfig();
    this.dashboardUtils.renderUserDetail(this.user[0]);
    this.getStats();
    this.loadEnrollment();
    this.dashboardUtils.setUsername(this.user[0]);
    this.dashboardUtils.logoutService();
    this.setupEvents();
    this.loadEnrollDetails();
  }
}

const dashboard = new StudentDashboard();

dashboard.init();
