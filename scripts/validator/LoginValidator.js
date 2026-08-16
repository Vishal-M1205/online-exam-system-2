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

  validatePassword(data, password) {
    if (!(data[0].password == password)) {
      toastr.error('Wrong Password');
      return false;
    }
    return true;
  }
}
