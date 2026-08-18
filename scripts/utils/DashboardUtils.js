import { ConfirmationService } from './ConfirmationService.js';

export class DashboardUtils {
  // Initializes DashboardUtils with ConfirmationService dependency
  constructor() {
    this.confirmationService = new ConfirmationService();
  }
  // Retrieves user data from browser's local storage
  getUserData() {
    return JSON.parse(localStorage.getItem('user'));
  }
  // Displays user profile information in the off-canvas sidebar panel
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
  // Formats a date string into a readable format (e.g., Jan 15, 2024)
  dateFormat(date) {
    let newDate = new Date(date);
    newDate = newDate.toDateString().split(' ');
    return `${newDate[1]} ${newDate[2]},${newDate[3]}`;
  }

  // Sets the user's first name in the dashboard header
  setUsername(userData) {
    $('#userName').text(userData.name.split(' ')[0]);
  }

  // Checks if an exam date has passed and the exam hasn't been attended yet
  checkExamExpiry(date, status) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const examDate = new Date(date);
    examDate.setHours(0, 0, 0, 0);
    return examDate < today && status !== 'Attended';
  }

  // Populates the view modal with enrollment details including name, course, and status
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

  // Configures global toastr notification settings for the application
  toastrConfig() {
    //toastr Configuration
    toastr.options = {
      positionClass: 'toast-bottom-right',
      showDuration: '300',
      preventDuplicates: true,
    };
  }

  // Handles logout functionality with user confirmation and redirects to login page
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

  // Navigates back to the previous page in browser history
  backToPreviousPage() {
    $('#backBtn').on('click', () => {
      window.history.back();
    });
  }
}
