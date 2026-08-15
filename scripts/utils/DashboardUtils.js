import { ConfirmationService } from './ConfirmationService.js';

export class DashboardUtils {
  constructor() {
    this.confirmationService = new ConfirmationService();
  }
  getUserData() {
    return JSON.parse(localStorage.getItem('user'));
  }
  renderUserDetail(userData) {
    const user = userData;

    $('#userNameOffCanvas').text(user.name);
    $('#userRole').text(user.role);
    $('#userEmail').text(user.email);
    $('#userGender').text(user.gender);
    $('#userDob').text(this.dateFormat(user.dob));
    $('#userDepartment').text(user.departmentName);
    $('#userCollege').text(user.college);
    $('#userMobile').text(user.mobile);
  }
  dateFormat(date) {
    let newDate = new Date(date);
    newDate = newDate.toDateString().split(' ');
    return `${newDate[1]} ${newDate[2]},${newDate[3]}`;
  }

  setUsername(userData) {
    $('#userName').text(userData.name.split(' ')[0]);
  }

  checkExamExpiry(date, status) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const examDate = new Date(date);
    examDate.setHours(0, 0, 0, 0);
    return examDate < today && status !== 'Attended';
  }

  populateViewModal(data) {
    $('#viewName').text(data.name);
    $('#viewEmail').text(data.email);
    $('#viewCourse').text(data.courseName);
    $('#viewDept').text(data.deptName);
    $('#viewFees').text(data.fees);
    $('#viewCentre').text(data.centre);
    $('#viewDate').text(this.dateFormat(data.preferredDate));
    $('#viewStatus').text(data.status);
    if (data.reason) {
      $('#viewReason').text(data.reason);
      $('#reason').removeClass('d-none');
    } else {
      $('#reason').addClass('d-none');
    }
  }

  toastrConfig() {
    //toastr Configuration
    toastr.options = {
      positionClass: 'toast-bottom-right',
      showDuration: '300',
      preventDuplicates: true,
    };
  }

  logoutService() {
    $('#logoutBtn').on('click', async () => {
      const response = await this.confirmationService.confirm(
        'Are you sure you want to logout?',
        'warning'
      );
      if (response) {
        window.location.replace('../pages/index.html');
        localStorage.removeItem('user');
      }
    });
  }
}
