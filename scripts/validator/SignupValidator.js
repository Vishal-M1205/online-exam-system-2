import { StudentService } from '../services/StudentService.js';
import bcrypt from 'https://cdn.jsdelivr.net/npm/bcryptjs@3.0.2/+esm';

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

  async hashPassword(password) {
    return await bcrypt.hash(password, 10);
  }

  async checkDuplicateEmail(email) {
    const emailCheck = await this.studentService.getStudentByEmail(email);

    if (emailCheck[0]?.email === email) {
      toastr.error('Email Already Exists');
      return true;
    }
    return false;
  }
}
