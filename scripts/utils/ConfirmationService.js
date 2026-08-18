export class ConfirmationService {
  // Displays a SweetAlert confirmation dialog and returns the user's response
  async confirm(title, icon = 'info') {
    const response = await Swal.fire({
      title: title,
      icon: icon,
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
    });
    return response.isConfirmed;
  }
}
