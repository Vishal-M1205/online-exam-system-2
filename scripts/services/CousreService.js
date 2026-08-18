import { COURSE_API } from '../api.js';

export class CourseService {
  // Fetches all available courses from the API
  async getCourse() {
    const data = await $.get(COURSE_API);
    return data;
  }
}
