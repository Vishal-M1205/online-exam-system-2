import { USER_API } from '../api.js';
export class StudentService {
  async getStudentEnrollments(params) {
    try {
      const data = await $.get(USER_API, params);
      return data;
    } catch (error) {
      console.log(error);
    }
  }

  getStudentByEmail(email) {
    return $.get(`${USER_API}?email=${email}`);
  }

  async createNewStudent(payload) {
    try {
      const response = await fetch(USER_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      return response;
    } catch (error) {
      console.log(error);
    }
  }
}
