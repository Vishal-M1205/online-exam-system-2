import { COURSE_API, USER_API, CENTRE_API, ENROLL_API } from '../scripts/api.js';

class StudentDashboard {
  constructor() {
    //  Logged IN used detail
    this.user = JSON.parse(localStorage.getItem('user'));

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

  //rendering user detail for the Offcanvas

  renderUserDetail() {
    const user = this.user[0];

    $('#userNameOffCanvas').text(user.name);
    $('#userRole').text(user.role);
    $('#userEmail').text(user.email);
    $('#userGender').text(user.gender);
    $('#userDob').text(this.dateFormat(user.dob));
    $('#userDepartment').text(user.departmentName);
    $('#userCollege').text(user.college);
    $('#userMobile').text(user.mobile);
  }

  //Date formatting function
  dateFormat(date) {
    let newDate = new Date(date);
    newDate = newDate.toDateString().split(' ');
    return `${newDate[1]} ${newDate[2]},${newDate[3]}`;
  }

  //Setting the username in the navbar
  setUsername() {
    $('#userName').text(this.user[0].name.split(' ')[0]);
  }

  calculateStats(enrollments) {
    const stats = enrollments.reduce(
      (result, e) => {
        switch (e.status) {
          case 'Pending':
            result.pending++;
            break;
          case 'Approved':
            result.approved++;
            break;
          case 'Rejected':
            result.rejected++;
            break;
        }
        return result;
      },
      {
        pending: 0,
        approved: 0,
        rejected: 0,
      }
    );
    return stats;
  }

  renderStats(status, total) {
    $('#enrollCount').text(total);
    $('#pendingCount').text(status.pending);
    $('#rejectCount').text(status.rejected);
    $('#approveCount').text(status.approved);
  }

  async getStats() {
    try {
      const enrollments = await $.get(ENROLL_API, { userId: this.user[0].id, isDeleted: false });
      const stats = this.calculateStats(enrollments);
      this.renderStats(stats, enrollments.length);
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

  checkExamExpiry(date, status) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const examDate = new Date(date);
    examDate.setHours(0, 0, 0, 0);
    return examDate < today && status !== 'Attended';
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
                    <button class="btn  bi bi-pen icon-tooltip"
                 data-tooltip="Edit"
                    data-bs-toggle="modal"
                    data-bs-target="#updateModal"
                    data-action="update"
                    data-id="${id}">
                 </button>
                  <button class="btn  bi bi-trash icon-tooltip"
                 data-tooltip="Cancel" 
                 data-action="cancel"
                 data-id="${id}">
                 </button>
                    `;
    }
    if (status === 'Rejected') {
      return `
                    <button class="btn  bi bi-arrow-counterclockwise icon-tooltip"
                 data-tooltip="Reapply"
                    data-bs-toggle="modal"
                    data-bs-target="#reapplyModal"
                    data-action="reapply"
                    data-id="${id}">
                 </button>
                  <button class="btn  bi bi-trash icon-tooltip"
                 data-tooltip="Cancel"  
                 data-action="cancel"
                 data-id="${id}">
                 </button>
                    `;
    }
    if (status === 'Approved') {
      return `
                    <button class="btn  bi bi-check-circle icon-tooltip"
                 data-tooltip="Attended ?" 
                    data-action="attendBtn"
                 data-id="${id}">
                 </button>
                  <button class="btn  bi bi-trash icon-tooltip"
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
      const isExpired = this.checkExamExpiry(e.preferredDate, e.status);
      const statusClass = this.getStatusClass(e.status);
      const actionButton = this.getActionButton(e.id, e.status);
      html += `
           <div class="col-lg-4 col-md-6 col-12">
           <div class="d-flex align-items-start justify-content-between bg-white  px-4 py-3 rounded-4 data-card">
             <div class="d-flex flex-column gap-2">
              <p class="mb-0 fw-semibold">${e.courseName}</p>
               <p class="mb-0"><span class="fw-bold">Exam Date : </span>${this.dateFormat(e.preferredDate)}</p>
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

                 <button class="btn  bi bi-eye icon-tooltip"
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
      const enrollments = await $.get(ENROLL_API, params);
      this.renderEnrollment(enrollments);
    } catch (error) {
      console.log(error);
    }
  }

  setupEvents() {
    $('#parent').on('clcik', '[data-action]', (e) => {
      const button = e.currentTarget;
      const action = button.dataset.action;
      const id = button.dataset.id;

      switch (action) {
        case 'update':
          this.handleUpdate(id);
          break;
      }
    });
  }

  async loadUpdateData(id) {
    const courseResponse = await fetch(COURSE_API);
    const courseData = await courseResponse.json();

    const enrollResponse = await fetch(`${ENROLL_API}/${id}`);
    const enrollData = await response.json();

    return {
      courseData,
      enrollData,
    };
  }

  populateUpdateForm(data) {
    const enrollment = data.enrollData;
    const coures = data.courseData;

    $(`#updateCourse option[data-id="${enrollment.courseId}"]`).prop('selected', true);
    $(`#updateCentre option[data-id="${enrollment.centreId}"]`).prop('selected', true);

    if (enrollment.courseId) {
      const fees = courseData.filter((c) => c.courseId == enrollment.courseId);

      $('#updateFees').val(fees[0].fees);
    }
    $('#updateExamDate').val(data.preferredDate);
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
      return flase;
    } else if (!$('#updateCentre').find(':selected').data('id')) {
      toastr.warning('Empty Centre Field !');
      return flase;
    } else if (!$('#updateExamDate').val()) {
      toastr.warning('Empty Date Field !');
      return flase;
    }
    return true;
  }

  async checkDuplicateEnrollment(id) {
    const checkResponse = await fetch(`${ENROLL_API}?userId=${userDetails[0].id}&isDeleted=false`);
    const checkData = await checkResponse.json();
    for (let e of checkData) {
      if (e.courseName === $('#updateCourse').find(':selected').val() && id != e.id) {
        toastr.warning('Already Registered this Course');
        return true;
      }
    }
    return false;
  }

  handleUpdate(id) {
    try {
      const data = this.loadUpdateData();
      this.populateUpdateForm(data);
      this.setupCourseFeeListener(data.coursedata);
    } catch (error) {
      console.log(error);
    }
  }

  init() {
    this.renderUserDetail();
    this.getStats();
    this.loadEnrollment();
    this.setUsername();
  }
}

const dashboard = new StudentDashboard();

dashboard.init();
