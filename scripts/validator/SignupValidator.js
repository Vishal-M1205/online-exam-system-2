import { StudentService } from '../services/StudentService.js';
import bcrypt from 'https://cdn.jsdelivr.net/npm/bcryptjs@3.0.2/+esm';

export class SignupValidator {
  // Initializes regex patterns and StudentService for form validation
  constructor() {
    this.studentService = new StudentService();

    this.nameRegex = /^[A-Za-z ]{3,}$/;
    this.passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[@!#$%&*-_\.]).{8,15}$/;
  }

  // Validates signup form fields including name, email, password, and other required fields
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

  // Sets maximum date for date of birth to ensure user is at least 17 years old
  setMinimumDateForDOB() {
    const dobDate = new Date();
    dobDate.setFullYear(dobDate.getFullYear() - 17);
    $('#dob').prop('max', dobDate.toISOString().split('T')[0]);
  }

  // Hashes password using bcrypt with 10 salt rounds for secure storage
  async hashPassword(password) {
    return await bcrypt.hash(password, 10);
  }

  // Checks if email already exists in database to prevent duplicate registrations
  async checkDuplicateEmail(email) {
    const emailCheck = await this.studentService.getStudentByEmail(email);

    if (emailCheck[0]?.email === email) {
      toastr.error('Email Already Exists');
      return true;
    }
    return false;
  }
}
