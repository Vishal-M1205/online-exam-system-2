import { USER_API } from '../api.js';
export class StudentService {
  // Retrieves all enrollments for a student with optional filter parameters
  async getStudentEnrollments(params) {
    try {
      const data = await $.get(USER_API, params);
      return data;
    } catch (error) {
      console.log(error);
    }
  }

  // Fetches student information by email address
  getStudentByEmail(email) {
    return $.get(`${USER_API}?email=${email}`);
  }

  // Creates a new student record with the provided registration data
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
