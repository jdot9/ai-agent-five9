import json
import ast
from typing import Dict, Optional, Any

# Parse contact from JSON or Python literal (e.g. single-quoted dict).
def _parse_contact(content: str) -> Optional[Dict[str, Any]]:
    if not content or not content.strip():
        return None
    content = content.strip()
    try:
        return json.loads(content)
    except json.JSONDecodeError:
        pass
    try:
        val = ast.literal_eval(content)
        return val if isinstance(val, dict) else None
    except (ValueError, SyntaxError):
        return None