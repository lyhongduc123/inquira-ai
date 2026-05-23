from pathlib import Path

from app.core.config import settings

_RESPONSES_DIR = Path(__file__).resolve().parent / "template"

_TEMPLATE_ALIASES = {
    "system_explanation": "system",
}

_TEMPLATE_CONTEXT = {
    "app_name": settings.APP_NAME,
}


def _load_response_template(key: str, default: str) -> str:
    try:
        template_key = _TEMPLATE_ALIASES.get(key, key)
        path = _RESPONSES_DIR / f"{template_key}.md"
        if not path.exists():
            return default

        content = path.read_text(encoding="utf-8").strip()
        content = content.format_map(_SafeTemplateContext(_TEMPLATE_CONTEXT))
        return content or default
    except Exception:
        return default


class _SafeTemplateContext(dict):
    def __missing__(self, key: str) -> str:
        return "{" + key + "}"
