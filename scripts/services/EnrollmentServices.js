import { ENROLL_API } from '../api.js';

export class EnrollmentServices {
  async getEnrollments(params) {
    try {
      const data = await $.get(ENROLL_API, params);
      return data;
    } catch (error) {
      console.log(error);
    }
  }

  async getEnrollment(id) {
    try {
      const data = await fetch(`${ENROLL_API}/${id}`);
      return data.json();
    } catch (error) {
      console.log(error);
    }
  }

  async updateEnrollment(id, payload) {
    try {
      const response = await fetch(`${ENROLL_API}/${id}`, {
        method: 'PATCH',
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

  async applyEnrollment(payload) {
    try {
      const response = await fetch(ENROLL_API, {
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

  async reapplyEnrollment(id, payload) {
    try {
      const response = await fetch(`${ENROLL_API}/${id}`, {
        method: 'PATCH',
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

  async cancelEnrollment(id) {
    try {
      const response = await fetch(`${ENROLL_API}/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isDeleted: true,
          updatedAt: new Date().toISOString().split('T')[0],
        }),
      });
      return response;
    } catch (error) {
      console.log(error);
    }
  }

  async attendedExam(id) {
    try {
      const response = await fetch(`${ENROLL_API}/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'Attended',
          updatedAt: new Date().toISOString().split('T')[0],
        }),
      });

      return response;
    } catch (error) {
      console.log(error);
    }
  }

  async approveEnrollment(id) {
    try {
      const response = await fetch(`${ENROLL_API}/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'Approved',
          updatedAt: new Date().toISOString().split('T')[0],
        }),
      });
      return response;
    } catch (error) {
      console.log(error);
    }
  }

  async rejectEnrollment(id, payload) {
    try {
      const response = await fetch(`${ENROLL_API}/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'Rejected',
          ...payload,
          updatedAt: new Date().toISOString().split('T')[0],
        }),
      });
      return response;
    } catch (error) {
      console.log(error);
    }
  }

  async deleteEnrollment(id) {
    try {
      const response = await fetch(`${ENROLL_API}/${id}`, {
        method: 'DELETE',
      });
      return response;
    } catch (error) {
      console.log(error);
    }
  }

  async restoreEnrollment(id) {
    try {
      const response = await fetch(`${ENROLL_API}/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isDeleted: false,
          updatedAt: new Date().toISOString().split('T')[0],
        }),
      });
      return response;
    } catch (error) {
      console.log(error);
    }
  }
}
