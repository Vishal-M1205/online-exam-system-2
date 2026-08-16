import { StudentService } from '../services/StudentService.js';

export class SignupValidator {
  constructor() {
    this.studentService = new StudentService();

    this.nameRegex = /^[A-Za-z ]{3,}$/;
    this.passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[@!#$%&*-_\.]).{8,15}$/;
  }

  validateSignupForm() {
    const validator = $('#signup-form').validate({
      errorClass: 'text-danger d-block mt-1',
      rules: {
        name: {
          required: true,
          pattern: this.nameRegex,
        },
        email: {
          email: true,
          required: true,
        },
        pass: {
          required: true,
          pattern: this.passwordRegex,
        },
        cpass: {
          required: true,
          equalTo: '#pass',
        },
        dob: {
          required: true,
        },
        gender: {
          required: true,
        },
        college: {
          required: true,
        },
        department: {
          required: true,
        },
        mobile: {
          required: true,
          maxlength: 10,
          digits: true,
        },
      },
    });

    return validator.form();
  }

  setMinimumDateForDOB() {
    const dobDate = new Date();
    dobDate.setFullYear(dobDate.getFullYear() - 17);
    $('#dob').prop('max', dobDate.toISOString().split('T')[0]);
  }

  checkDuplicateEmail(email) {
    const emailCheck = this.studentService.getStudentByEmail(email);
    console.log(emailCheck);
    if (emailCheck.responseText) {
      toastr.error('Email Already Exists');
      return false;
    }
    return true;
  }
}
