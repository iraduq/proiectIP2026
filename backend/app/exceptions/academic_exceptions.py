from typing import Optional
from starlette import status
from app.utils.custom_exception import AppException


class EmptyUpdateError(AppException):
    def __init__(self) -> None:
        super().__init__(
            message="Cererea de modificare nu conține niciun câmp de actualizat.",
            status_code=status.HTTP_400_BAD_REQUEST,
            code="empty_update",
        )


class DataIntegrityError(AppException):
    def __init__(self) -> None:
        super().__init__(
            message="Operațiunea încalcă constrângerile de integritate ale datelor (duplicat sau referință invalidă).",
            status_code=status.HTTP_409_CONFLICT,
            code="data_integrity_violation",
        )


class InactiveEntityAccessDeniedError(AppException):
    def __init__(self, entity_label: str) -> None:
        super().__init__(
            message="Nu aveți permisiunea de a accesa această resursă.",
            status_code=status.HTTP_403_FORBIDDEN,
            code="inactive_entity_access_denied",
        )


class InstitutionNameAlreadyExistsError(AppException):
    def __init__(self, name: str) -> None:
        super().__init__(
            message=f"Există deja o instituție cu denumirea '{name}'.",
            status_code=status.HTTP_409_CONFLICT,
            code="institution_name_already_exists",
        )


class InstitutionCodeAlreadyExistsError(AppException):
    def __init__(self, code: str) -> None:
        super().__init__(
            message=f"Există deja o instituție cu codul '{code}'.",
            status_code=status.HTTP_409_CONFLICT,
            code="institution_code_already_exists",
        )


class InstitutionInactiveError(AppException):
    def __init__(self, name: str) -> None:
        super().__init__(
            message=f"Instituția '{name}' este dezactivată; operațiunea nu poate fi efectuată.",
            status_code=status.HTTP_409_CONFLICT,
            code="institution_inactive",
        )


class InstitutionAlreadyActiveError(AppException):
    def __init__(self, name: str) -> None:
        super().__init__(
            message=f"Instituția '{name}' este deja activă.",
            status_code=status.HTTP_409_CONFLICT,
            code="institution_already_active",
        )


class InstitutionAlreadyInactiveError(AppException):
    def __init__(self, name: str) -> None:
        super().__init__(
            message=f"Instituția '{name}' este deja dezactivată.",
            status_code=status.HTTP_409_CONFLICT,
            code="institution_already_inactive",
        )


class InstitutionHasActiveFacultiesError(AppException):
    def __init__(self, name: str, count: int) -> None:
        super().__init__(
            message=f"Instituția '{name}' are {count} facultăți active. Dezactivați-le înainte.",
            status_code=status.HTTP_409_CONFLICT,
            code="institution_has_active_faculties",
        )


class InstitutionHasFacultiesError(AppException):
    def __init__(self, name: str, count: int) -> None:
        super().__init__(
            message=f"Instituția '{name}' nu poate fi ștearsă deoarece are {count} facultăți asociate.",
            status_code=status.HTTP_409_CONFLICT,
            code="institution_has_faculties",
        )


class FacultyNameAlreadyExistsError(AppException):
    def __init__(self, name: str) -> None:
        super().__init__(
            message=f"Există deja o facultate cu denumirea '{name}' în această instituție.",
            status_code=status.HTTP_409_CONFLICT,
            code="faculty_name_already_exists",
        )


class FacultyCodeAlreadyExistsError(AppException):
    def __init__(self, code: str) -> None:
        super().__init__(
            message=f"Există deja o facultate cu codul '{code}' în această instituție.",
            status_code=status.HTTP_409_CONFLICT,
            code="faculty_code_already_exists",
        )


class FacultyInactiveError(AppException):
    def __init__(self, name: str) -> None:
        super().__init__(
            message=f"Facultatea '{name}' este dezactivată; operațiunea nu poate fi efectuată.",
            status_code=status.HTTP_409_CONFLICT,
            code="faculty_inactive",
        )


class FacultyAlreadyActiveError(AppException):
    def __init__(self, name: str) -> None:
        super().__init__(
            message=f"Facultatea '{name}' este deja activă.",
            status_code=status.HTTP_409_CONFLICT,
            code="faculty_already_active",
        )


class FacultyAlreadyInactiveError(AppException):
    def __init__(self, name: str) -> None:
        super().__init__(
            message=f"Facultatea '{name}' este deja dezactivată.",
            status_code=status.HTTP_409_CONFLICT,
            code="faculty_already_inactive",
        )


class FacultyHasActiveDepartmentsError(AppException):
    def __init__(self, name: str, count: int) -> None:
        super().__init__(
            message=f"Facultatea '{name}' are {count} departamente active. Dezactivați-le înainte.",
            status_code=status.HTTP_409_CONFLICT,
            code="faculty_has_active_departments",
        )


class FacultyHasDepartmentsError(AppException):
    def __init__(self, name: str, count: int) -> None:
        super().__init__(
            message=f"Facultatea '{name}' nu poate fi ștearsă deoarece are {count} departamente asociate.",
            status_code=status.HTTP_409_CONFLICT,
            code="faculty_has_departments",
        )


class DepartmentNameAlreadyExistsError(AppException):
    def __init__(self, name: str) -> None:
        super().__init__(
            message=f"Există deja un departament cu denumirea '{name}' în această facultate.",
            status_code=status.HTTP_409_CONFLICT,
            code="department_name_already_exists",
        )


class DepartmentCodeAlreadyExistsError(AppException):
    def __init__(self, code: str) -> None:
        super().__init__(
            message=f"Există deja un departament cu codul '{code}' în această facultate.",
            status_code=status.HTTP_409_CONFLICT,
            code="department_code_already_exists",
        )


class DepartmentInactiveError(AppException):
    def __init__(self, name: str) -> None:
        super().__init__(
            message=f"Departamentul '{name}' este dezactivat; operațiunea nu poate fi efectuată.",
            status_code=status.HTTP_409_CONFLICT,
            code="department_inactive",
        )


class DepartmentAlreadyActiveError(AppException):
    def __init__(self, name: str) -> None:
        super().__init__(
            message=f"Departamentul '{name}' este deja activ.",
            status_code=status.HTTP_409_CONFLICT,
            code="department_already_active",
        )


class DepartmentAlreadyInactiveError(AppException):
    def __init__(self, name: str) -> None:
        super().__init__(
            message=f"Departamentul '{name}' este deja dezactivat.",
            status_code=status.HTTP_409_CONFLICT,
            code="department_already_inactive",
        )


class DepartmentHasActiveRoomsError(AppException):
    def __init__(self, name: str, count: int) -> None:
        super().__init__(
            message=f"Departamentul '{name}' are {count} săli active. Dezactivați-le înainte.",
            status_code=status.HTTP_409_CONFLICT,
            code="department_has_active_rooms",
        )


class DepartmentHasRoomsError(AppException):
    def __init__(self, name: str, count: int) -> None:
        super().__init__(
            message=f"Departamentul '{name}' nu poate fi șters deoarece are {count} săli asociate.",
            status_code=status.HTTP_409_CONFLICT,
            code="department_has_rooms",
        )


class InvalidDepartmentHeadError(AppException):
    def __init__(self, user_name: str, reason: str) -> None:
        super().__init__(
            message=f"Utilizatorul '{user_name}' nu poate fi șef de departament: {reason}.",
            status_code=status.HTTP_400_BAD_REQUEST,
            code="invalid_department_head",
        )


class DepartmentHeadLimitExceededError(AppException):
    def __init__(self, user_name: str, limit: int) -> None:
        super().__init__(
            message=f"Utilizatorul '{user_name}' conduce deja numărul maxim de {limit} departamente.",
            status_code=status.HTTP_409_CONFLICT,
            code="department_head_limit_exceeded",
        )


class RoomCodeAlreadyExistsError(AppException):
    def __init__(self, code: str) -> None:
        super().__init__(
            message=f"Există deja o sală cu codul '{code}'.",
            status_code=status.HTTP_409_CONFLICT,
            code="room_code_already_exists",
        )


class RoomNameAlreadyExistsError(AppException):
    def __init__(self, name: str) -> None:
        super().__init__(
            message=f"Există deja o sală cu denumirea '{name}' în acest departament.",
            status_code=status.HTTP_409_CONFLICT,
            code="room_name_already_exists",
        )


class RoomInactiveError(AppException):
    def __init__(self, code: str) -> None:
        super().__init__(
            message=f"Sala '{code}' este dezactivată; operațiunea nu poate fi efectuată.",
            status_code=status.HTTP_409_CONFLICT,
            code="room_inactive",
        )


class RoomAlreadyActiveError(AppException):
    def __init__(self, code: str) -> None:
        super().__init__(
            message=f"Sala '{code}' este deja activă.",
            status_code=status.HTTP_409_CONFLICT,
            code="room_already_active",
        )


class RoomAlreadyInactiveError(AppException):
    def __init__(self, code: str) -> None:
        super().__init__(
            message=f"Sala '{code}' este deja dezactivată.",
            status_code=status.HTTP_409_CONFLICT,
            code="room_already_inactive",
        )


class RoomCapacityOutOfRangeError(AppException):
    def __init__(self, room_type: str, minimum: int, maximum: int, provided: int) -> None:
        super().__init__(
            message=(
                f"Capacitatea {provided} nu este permisă pentru tipul de sală '{room_type}'. "
                f"Intervalul acceptat este {minimum}-{maximum}."
            ),
            status_code=status.HTTP_400_BAD_REQUEST,
            code="room_capacity_out_of_range",
        )


class InvalidRoomResponsibleError(AppException):
    def __init__(self, user_name: str, reason: str) -> None:
        super().__init__(
            message=f"Utilizatorul '{user_name}' nu poate fi responsabil de sală: {reason}.",
            status_code=status.HTTP_400_BAD_REQUEST,
            code="invalid_room_responsible",
        )


class RoomResponsibleLimitExceededError(AppException):
    def __init__(self, user_name: str, limit: int) -> None:
        super().__init__(
            message=f"Utilizatorul '{user_name}' răspunde deja de numărul maxim de {limit} săli active.",
            status_code=status.HTTP_409_CONFLICT,
            code="room_responsible_limit_exceeded",
        )


class RoomResponsibleUnchangedError(AppException):
    def __init__(self, user_name: str) -> None:
        super().__init__(
            message=f"Utilizatorul '{user_name}' este deja responsabilul acestei săli.",
            status_code=status.HTTP_409_CONFLICT,
            code="room_responsible_unchanged",
        )


class NotRoomResponsibleError(AppException):
    def __init__(self, room_code: Optional[str] = None) -> None:
        super().__init__(
            message="Nu aveți permisiunea de a modifica datele acestei săli.",
            status_code=status.HTTP_403_FORBIDDEN,
            code="not_room_responsible",
        )


class RoomFieldsRestrictedError(AppException):
    def __init__(self, fields: list[str]) -> None:
        super().__init__(
            message=f"Responsabilul sălii nu poate modifica câmpurile: {', '.join(fields)}.",
            status_code=status.HTTP_403_FORBIDDEN,
            code="room_fields_restricted",
            details={"restricted_fields": fields},
        )
