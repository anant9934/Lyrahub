"""Apply AIMETRA's shared visual palette to existing Tailwind color utilities.

Only replaces known neutral/brand utility values. Semantic success, warning,
danger, and data-series colors are intentionally left intact.
"""

from pathlib import Path


ROOT = Path(__file__).resolve().parents[1] / "frontend" / "src"

COLORS = {
    # Earlier Unidale neutral palette.
    "#1E1E1E": "#0F172A",
    "#3A3A3A": "#34465E",
    "#5C5C5C": "#526783",
    "#7A7A7A": "#667A93",
    "#9A9A9A": "#71849B",
    "#F2F2F1": "#F6F8FC",
    "#D6D6D6": "#DCE5F1",
    # More recent monochrome public palette.
    "#111111": "#0F172A",
    "#333333": "#34465E",
    "#555555": "#526783",
    "#777777": "#667A93",
    "#888888": "#71849B",
    "#AAAAAA": "#71849B",
    "#BBBBBB": "#71849B",
    "#FAFAFA": "#F6F8FC",
    "#F5F5F5": "#EDF4FC",
    "#E5E5E5": "#DCE5F1",
}

PREFIXES = ("bg", "text", "border", "ring", "placeholder:text", "focus:border", "focus:ring", "hover:bg", "hover:text", "hover:border", "group-hover:bg", "group-hover:text")

PUBLIC_THEMES = {
    "about/page.tsx": "about",
    "people/page.tsx": "people",
    "programs/page.tsx": "programs",
    "research/page.tsx": "research",
    "events/page.tsx": "events",
    "contact/page.tsx": "contact",
    "leadership/page.tsx": "leadership",
    "privacy/page.tsx": "legal",
    "security/page.tsx": "legal",
    "terms/page.tsx": "legal",
    "not-found.tsx": "system",
}


def main() -> None:
    changed: list[tuple[Path, int]] = []
    for path in (*ROOT.joinpath("app").rglob("*.tsx"), *ROOT.joinpath("components").rglob("*.tsx")):
        original = path.read_text()
        updated = original
        replacements = 0
        for prefix in PREFIXES:
            for old, new in COLORS.items():
                before = f"{prefix}-[{old}]"
                after = f"{prefix}-[{new}]"
                count = updated.count(before)
                if count:
                    updated = updated.replace(before, after)
                    replacements += count
        for prefix in ("bg", "border", "ring"):
            before = f"{prefix}-[#EEBE1E]"
            count = updated.count(before)
            if count:
                updated = updated.replace(before, f"{prefix}-[#FACC15]")
                replacements += count
        if path.is_relative_to(ROOT / "app"):
            route = str(path.relative_to(ROOT / "app"))
            theme = PUBLIC_THEMES.get(route)
            marker = 'className="min-h-screen bg-white text-[#0F172A] flex flex-col"'
            if theme and "aimetra-public" not in updated and marker in updated:
                updated = updated.replace(marker, f'className="aimetra-public theme-{theme} min-h-screen bg-white text-[#0F172A] flex flex-col"', 1)
                replacements += 1
        if updated != original:
            path.write_text(updated)
            changed.append((path.relative_to(ROOT), replacements))
    print(f"Updated {len(changed)} files and {sum(count for _, count in changed)} color utilities.")


if __name__ == "__main__":
    main()
