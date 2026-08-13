import { COURSE_API } from '../api.js';

export class CourseService {
  async getCourse() {
    const data = await $.get(COURSE_API);
    return data;
  }
}
