import Swal from 'sweetalert2';

/**
 * Show a SweetAlert confirmation dialog before a destructive action.
 * Returns true if the user confirmed, false otherwise.
 */
export async function confirmDelete({
  title = 'Are you sure?',
  text = "This action can't be undone.",
  confirmButtonText = 'Yes, delete it',
} = {}) {
  const result = await Swal.fire({
    title,
    text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText: 'Cancel',
    reverseButtons: true,
    focusCancel: true,
    confirmButtonColor: '#dc2626',
    cancelButtonColor: '#64748b',
  });
  return result.isConfirmed;
}

/** Show a brief success toast in the top-right corner. */
export function toastSuccess(title = 'Done') {
  return Swal.fire({
    toast: true,
    position: 'top-end',
    icon: 'success',
    title,
    showConfirmButton: false,
    timer: 2000,
    timerProgressBar: true,
  });
}

/** Show a brief error toast in the top-right corner. */
export function toastError(title = 'Something went wrong') {
  return Swal.fire({
    toast: true,
    position: 'top-end',
    icon: 'error',
    title,
    showConfirmButton: false,
    timer: 3500,
    timerProgressBar: true,
  });
}
