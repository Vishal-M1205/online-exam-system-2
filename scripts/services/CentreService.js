import { CENTRE_API } from '../api.js';

export class CentreService {
  // Fetches all available examination centres from the API
  async getCentre() {
    const data = await $.get(CENTRE_API);
    return data;
  }
}
