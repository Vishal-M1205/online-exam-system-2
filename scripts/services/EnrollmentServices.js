import { ENROLL_API } from '../api.js';

export class EnrollmentServices {
  // Fetches all enrollments with optional filter parameters
  async getEnrollments(params) {
    try {
      const data = await $.get(ENROLL_API, params);
      return data;
    } catch (error) {
      console.log(error);
    }
  }

  // Retrieves a specific enrollment record by its ID
  async getEnrollment(id) {
    try {
      const data = await fetch(`${ENROLL_API}/${id}`);
      return data.json();
    } catch (error) {
      console.log(error);
    }
  }

  // Updates an enrollment record with the provided payload data
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

  // Creates a new enrollment request with the provided student and course data
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

  // Resubmits an enrollment request with updated information
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

  // Cancels an enrollment by marking it as deleted
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

  // Updates enrollment status to Attended after student takes the exam
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

  // Approves a pending enrollment request by updating its status
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

  // Rejects an enrollment request with optional rejection reason
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

  // Permanently deletes an enrollment record from the database
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

  // Restores a previously deleted or cancelled enrollment record
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
