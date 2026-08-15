export class StudentService {
  async getStudentEnrollments(params) {
    try {
      const data = await $.get(ENROLL_API, params);
      return data;
    } catch (error) {
      console.log(error);
    }
  }
}
