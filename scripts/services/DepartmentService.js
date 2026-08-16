import { DEP_API } from '../api.js';

export class DepartmentService {
  async getDepartment() {
    try {
      const response = await fetch(DEP_API);
      const data = await response.json();
      return data;
    } catch (error) {
      console.log(error);
    }
  }
}
