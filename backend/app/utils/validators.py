import re
import unicodedata
from typing import Optional

ROMANIAN_CHARS_REGEX = re.compile(r"^[a-zA-ZĂÂÎȘȚăâîșț\s\-]+$")
SECURITY_REGEX = re.compile(r"['\";`\\<>\/&]|--|\/\*|\.\.|%00")
HIDDEN_UNICODE_REGEX = re.compile(r"[\u200B-\u200D\uFEFF]")
DOUBLE_DIACRITICS_REGEX = re.compile(r"([ĂÂÎȘȚăâîșț])\1")
CONSECUTIVE_SPACES_REGEX = re.compile(r"\s{2,}")
WHITESPACE_AROUND_HYPHEN_REGEX = re.compile(r"\s-|-\s")


def normalize_and_sanitize_romanian_string(text: str) -> str:
    if not text:
        return text

    text = text.strip()
    text = unicodedata.normalize("NFC", text)

    legacy_map = {
        "Ş": "Ș", "ş": "ș",
        "Ţ": "Ț", "ţ": "ț",
        "Ș": "Ș", "ș": "ș",
        "Ț": "Ț", "ț": "ț",
    }
    for old, new in legacy_map.items():
        text = text.replace(old, new)

    return re.sub(r"\s+", " ", text)


def validate_romanian_name_rules(name: str, field_name: str) -> str:
    cleaned = normalize_and_sanitize_romanian_string(name)
    original_name = name.strip()

    if not cleaned:
        raise ValueError(f"{field_name} nu poate fi gol.")

    if SECURITY_REGEX.search(cleaned):
        raise ValueError(f"{field_name} '{original_name}' conține caractere periculoase.")

    if HIDDEN_UNICODE_REGEX.search(cleaned):
        raise ValueError(f"{field_name} '{original_name}' conține caractere Unicode ascunse.")

    if not ROMANIAN_CHARS_REGEX.match(cleaned):
        raise ValueError(f"{field_name} '{original_name}' conține caractere nepermise.")

    chars_no_spaces = len(cleaned.replace(" ", ""))
    if chars_no_spaces < 2 or chars_no_spaces > 50:
        raise ValueError(f"{field_name} '{original_name}' trebuie să aibă între 2 și 50 caractere fără spații.")

    if CONSECUTIVE_SPACES_REGEX.search(cleaned):
        raise ValueError(f"{field_name} '{original_name}' conține spații multiple consecutive.")

    hyphen_count = cleaned.count("-")
    if hyphen_count > 1:
        raise ValueError(f"{field_name} '{original_name}' conține mai mult de o cratimă.")

    if hyphen_count == 1:
        if cleaned.startswith("-") or cleaned.endswith("-") or WHITESPACE_AROUND_HYPHEN_REGEX.search(cleaned):
            raise ValueError(f"{field_name} '{original_name}' are o cratimă poziționată incorect.")

    words = re.split(r"[\s\-]+", cleaned)
    if len(words) > 4:
        raise ValueError(f"{field_name} '{original_name}' conține prea multe cuvinte.")

    for word in words:
        if len(word) < 2 or len(word) > 20:
            raise ValueError(f"Cuvântul '{word}' are o lungime nepermisă.")
        if DOUBLE_DIACRITICS_REGEX.search(word):
            raise ValueError(f"Cuvântul '{word}' conține diacritice duble.")
        if not word[0].isupper():
            raise ValueError(f"Fiecare parte din {field_name.lower()} trebuie să înceapă cu literă mare.")

    formatted_words = []
    for word in words:
        if "-" in word:
            sub_parts = word.split("-")
            formatted_word = "-".join([p.capitalize() for p in sub_parts if p])
        else:
            formatted_word = word.capitalize()
        formatted_words.append(formatted_word)

    return " ".join(formatted_words)


STRUCTURE_NAME_REGEX = re.compile(r"^[A-Za-zĂÂÎȘȚăâîșț0-9][A-Za-zĂÂÎȘȚăâîșț0-9 \-\.,()]*$")
STRUCTURE_CODE_REGEX = re.compile(r"^[A-Z0-9]+(?:[-_][A-Z0-9]+)*$")
FREE_TEXT_FORBIDDEN_REGEX = re.compile(r"[<>`\\]|%00")
PHONE_SEPARATORS_REGEX = re.compile(r"[\s\-\.()]")
PHONE_REGEX = re.compile(r"^\+?[0-9]{9,15}$")
WEBSITE_REGEX = re.compile(
    r"^https?://[A-Za-z0-9](?:[A-Za-z0-9\-]*[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9\-]*[A-Za-z0-9])?)*"
    r"\.[A-Za-z]{2,}(?::\d{2,5})?(?:/[^\s<>\"']*)?$"
)


def validate_structure_name(value: object, label: str, min_length: int = 3, max_length: int = 150) -> str:
    if not isinstance(value, str):
        raise ValueError(f"{label} trebuie să fie un șir de caractere.")

    cleaned = normalize_and_sanitize_romanian_string(value)

    if not cleaned:
        raise ValueError(f"{label} nu poate fi goală.")

    if HIDDEN_UNICODE_REGEX.search(cleaned):
        raise ValueError(f"{label} conține caractere Unicode ascunse.")

    if SECURITY_REGEX.search(cleaned):
        raise ValueError(f"{label} conține caractere periculoase.")

    if len(cleaned) < min_length or len(cleaned) > max_length:
        raise ValueError(f"{label} trebuie să aibă între {min_length} și {max_length} caractere.")

    if not STRUCTURE_NAME_REGEX.match(cleaned):
        raise ValueError(f"{label} conține caractere nepermise sau nu începe cu literă ori cifră.")

    if not (cleaned[0].isupper() or cleaned[0].isdigit()):
        raise ValueError(f"{label} trebuie să înceapă cu literă mare sau cifră.")

    if re.search(r"([.,\-])\1", cleaned):
        raise ValueError(f"{label} conține semne de punctuație repetate.")

    if cleaned.count("(") != cleaned.count(")"):
        raise ValueError(f"{label} conține paranteze neechilibrate.")

    return cleaned


def validate_structure_code(value: object, label: str = "Codul") -> str:
    if not isinstance(value, str):
        raise ValueError(f"{label} trebuie să fie un șir de caractere.")

    cleaned = value.strip().upper()

    if len(cleaned) < 2 or len(cleaned) > 30:
        raise ValueError(f"{label} trebuie să aibă între 2 și 30 de caractere.")

    if not STRUCTURE_CODE_REGEX.match(cleaned):
        raise ValueError(
            f"{label} poate conține doar litere latine, cifre și separatorii '-' sau '_' (fără spații sau diacritice)."
        )

    return cleaned


def validate_free_text(value: object, label: str, max_length: int = 500) -> Optional[str]:
    if value is None:
        return None

    if not isinstance(value, str):
        raise ValueError(f"{label} trebuie să fie un șir de caractere.")

    cleaned = normalize_and_sanitize_romanian_string(value)

    if not cleaned:
        return None

    if len(cleaned) > max_length:
        raise ValueError(f"{label} poate avea maxim {max_length} caractere.")

    if HIDDEN_UNICODE_REGEX.search(cleaned):
        raise ValueError(f"{label} conține caractere Unicode ascunse.")

    if FREE_TEXT_FORBIDDEN_REGEX.search(cleaned):
        raise ValueError(f"{label} conține caractere nepermise.")

    return cleaned


def validate_contact_phone(value: object) -> Optional[str]:
    if value is None:
        return None

    if not isinstance(value, str):
        raise ValueError("Telefonul trebuie să fie un șir de caractere.")

    stripped = PHONE_SEPARATORS_REGEX.sub("", value.strip())

    if not stripped:
        return None

    if not PHONE_REGEX.match(stripped):
        raise ValueError("Telefonul trebuie să conțină între 9 și 15 cifre, opțional cu prefix '+'.")

    return stripped


def validate_website(value: object) -> Optional[str]:
    if value is None:
        return None

    if not isinstance(value, str):
        raise ValueError("Website-ul trebuie să fie un șir de caractere.")

    cleaned = value.strip()

    if not cleaned:
        return None

    if len(cleaned) > 255:
        raise ValueError("Website-ul poate avea maxim 255 de caractere.")

    if not WEBSITE_REGEX.match(cleaned):
        raise ValueError("Website-ul trebuie să înceapă cu http:// sau https:// și să conțină un domeniu valid.")

    return cleaned
