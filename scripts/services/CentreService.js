import { CENTRE_API } from '../api.js';

export class CentreService {
  async getCentre() {
    const data = await $.get(CENTRE_API);
    return data;
  }
}
