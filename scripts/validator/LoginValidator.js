import bcrypt from 'https://cdn.jsdelivr.net/npm/bcryptjs@3.0.2/+esm';

export class LoginValidator {
  validateLoginForm() {
    const validator = $('#login-form').validate({
      errorClass: 'text-danger d-block mt-1',
      rules: {
        loginEmail: {
          required: true,
          email: true,
        },
        loginPass: {
          required: true,
        },
      },
    });

    return validator.form();
  }

  async validatePassword(data, password) {
    const isValid = await bcrypt.compare(password, data[0].password);
    if (!isValid) {
      toastr.error('Wrong Password');
      return false;
    }
    return true;
  }
}
