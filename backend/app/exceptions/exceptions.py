from typing import Any, Optional
from starlette import status
from app.utils.custom_exception import AppException


class RequestValidationError(AppException):
    def __init__(self, errors: list[dict[str, Any]]) -> None:
        super().__init__(
            message="Datele transmise conțin câmpuri invalide.",
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            code="validation_error",
            details=errors,
        )


class PasswordValidationError(AppException):
    def __init__(self) -> None:
        super().__init__(
            message="Parola trebuie să conțină cel puțin 8 caractere, majuscule, litere mici, cifre și un simbol special.",
            status_code=status.HTTP_400_BAD_REQUEST,
            code="invalid_password",
        )


class InvalidCredentialsError(AppException):
    def __init__(self) -> None:
        super().__init__(
            message="Adresă de email sau parolă incorectă.",
            status_code=status.HTTP_401_UNAUTHORIZED,
            code="invalid_credentials",
        )


class InvalidTokenError(AppException):
    def __init__(self) -> None:
        super().__init__(
            message="Token de autentificare invalid sau expirat.",
            status_code=status.HTTP_401_UNAUTHORIZED,
            code="invalid_token",
        )


class UnauthorizedAccessError(AppException):
    def __init__(self, detail: str = "Nu aveți permisiunile necesare pentru a efectua această acțiune.") -> None:
        super().__init__(
            message=detail,
            status_code=status.HTTP_403_FORBIDDEN,
            code="forbidden_access",
        )


class UserEmailAlreadyExistsError(AppException):
    def __init__(self, email: str) -> None:
        super().__init__(
            message=f"Adresa de email '{email}' este deja înregistrată.",
            status_code=status.HTTP_409_CONFLICT,
            code="user_email_already_exists",
        )


class UserNotFoundError(AppException):
    def __init__(self, identifier: Optional[Any] = None) -> None:
        message = (
            f"Utilizatorul cu identificatorul '{identifier}' nu a fost găsit."
            if identifier
            else "Utilizatorul nu a fost găsit."
        )
        super().__init__(
            message=message,
            status_code=status.HTTP_404_NOT_FOUND,
            code="user_not_found",
        )


class InstitutionNotFoundError(AppException):
    def __init__(self, institution_id: int) -> None:
        super().__init__(
            message=f"Instituția cu ID-ul {institution_id} nu a fost găsită.",
            status_code=status.HTTP_404_NOT_FOUND,
            code="institution_not_found",
        )


class FacultyNotFoundError(AppException):
    def __init__(self, faculty_id: int) -> None:
        super().__init__(
            message=f"Facultatea cu ID-ul {faculty_id} nu a fost găsită.",
            status_code=status.HTTP_404_NOT_FOUND,
            code="faculty_not_found",
        )


class DepartmentNotFoundError(AppException):
    def __init__(self, department_id: int) -> None:
        super().__init__(
            message=f"Departamentul cu ID-ul {department_id} nu a fost găsit.",
            status_code=status.HTTP_404_NOT_FOUND,
            code="department_not_found",
        )


class RoomNotFoundError(AppException):
    def __init__(self, room_id: int) -> None:
        super().__init__(
            message=f"Sala cu ID-ul {room_id} nu a fost găsită.",
            status_code=status.HTTP_404_NOT_FOUND,
            code="room_not_found",
        )


class CategoryNotFoundError(AppException):
    def __init__(self, category_id: int) -> None:
        super().__init__(
            message=f"Categoria de resurse cu ID-ul {category_id} nu a fost găsită.",
            status_code=status.HTTP_404_NOT_FOUND,
            code="category_not_found",
        )


class CategoryAlreadyExistsError(AppException):
    def __init__(self, name: str) -> None:
        super().__init__(
            message=f"Există deja o categorie cu denumirea '{name}'.",
            status_code=status.HTTP_409_CONFLICT,
            code="category_already_exists",
        )


class ResourceNotFoundError(AppException):
    def __init__(self, resource_id: int) -> None:
        super().__init__(
            message=f"Resursa de cercetare cu ID-ul {resource_id} nu a fost găsită.",
            status_code=status.HTTP_404_NOT_FOUND,
            code="resource_not_found",
        )


class ResourceUnavailableError(AppException):
    def __init__(self, status_name: str) -> None:
        super().__init__(
            message=f"Resursa nu este disponibilă pentru rezervare (stare tehnică: {status_name}).",
            status_code=status.HTTP_400_BAD_REQUEST,
            code="resource_unavailable",
        )


class ResourceInMaintenanceError(AppException):
    def __init__(self, resource_id: int) -> None:
        super().__init__(
            message=f"Resursa cu ID-ul {resource_id} este în mentenanță și nu poate fi rezervată.",
            status_code=status.HTTP_409_CONFLICT,
            code="resource_in_maintenance",
        )


class ResourceDefectiveError(AppException):
    def __init__(self, resource_id: int) -> None:
        super().__init__(
            message=f"Resursa cu ID-ul {resource_id} este marcată ca defectă.",
            status_code=status.HTTP_409_CONFLICT,
            code="resource_defective",
        )


class SpecializationAccessDeniedError(AppException):
    def __init__(self, specialization: str) -> None:
        super().__init__(
            message=f"Accesul la această resursă este restricționat pentru specializarea '{specialization}'.",
            status_code=status.HTTP_403_FORBIDDEN,
            code="specialization_access_denied",
        )


class ReservationNotFoundError(AppException):
    def __init__(self, reservation_id: int) -> None:
        super().__init__(
            message=f"Rezervarea cu ID-ul {reservation_id} nu a fost găsită.",
            status_code=status.HTTP_404_NOT_FOUND,
            code="reservation_not_found",
        )


class ReservationConflictError(AppException):
    def __init__(self, resource_id: int, start_time: Any, end_time: Any) -> None:
        super().__init__(
            message=f"Resursa {resource_id} este deja rezervată în intervalul {start_time} - {end_time}.",
            status_code=status.HTTP_409_CONFLICT,
            code="reservation_conflict",
        )


class ReservationLimitExceededError(AppException):
    def __init__(self, limit: int = 4) -> None:
        super().__init__(
            message=f"Ați atins limita maximă permisă de {limit} resurse împrumutate simultan.",
            status_code=status.HTTP_400_BAD_REQUEST,
            code="reservation_limit_exceeded",
        )


class StudentMatricolRequiredError(AppException):
    def __init__(self) -> None:
        super().__init__(
            message="Pentru a efectua o rezervare este necesar un număr matricol valid asociat contului.",
            status_code=status.HTTP_400_BAD_REQUEST,
            code="matricol_number_required",
        )


class DuplicateCategoryReservationError(AppException):
    def __init__(self, category_name: str) -> None:
        super().__init__(
            message=f"Nu puteți rezerva simultan două resurse din aceeași categorie ('{category_name}').",
            status_code=status.HTTP_400_BAD_REQUEST,
            code="duplicate_category_reservation",
        )


class InvalidReservationIntervalError(AppException):
    def __init__(self, detail: str = "Intervalul de rezervare specificat este invalid.") -> None:
        super().__init__(
            message=detail,
            status_code=status.HTTP_400_BAD_REQUEST,
            code="invalid_reservation_interval",
        )


class ReservationStateTransitionError(AppException):
    def __init__(self, current_state: str, new_state: str) -> None:
        super().__init__(
            message=f"Tranziția de stare de la '{current_state}' la '{new_state}' nu este permisă.",
            status_code=status.HTTP_400_BAD_REQUEST,
            code="invalid_state_transition",
        )


class TechnicalHistoryNotFoundError(AppException):
    def __init__(self, history_id: int) -> None:
        super().__init__(
            message=f"Înregistrarea din jurnalul tehnic cu ID-ul {history_id} nu a fost găsită.",
            status_code=status.HTTP_404_NOT_FOUND,
            code="technical_history_not_found",
        )


class DatabaseOperationError(AppException):
    def __init__(self) -> None:
        super().__init__(
            message="A apărut o eroare la salvarea datelor în baza de date.",
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            code="database_operation_failed",
        )
