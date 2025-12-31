#!/usr/bin/env python3
"""
SLOC Analysis Script for Welltegra Network
Analyzes source lines of code across the entire project.
"""

import json
import os
from pathlib import Path
from collections import defaultdict
from datetime import datetime


# File extension to language mapping
LANGUAGE_MAP = {
    '.py': 'Python',
    '.js': 'JavaScript',
    '.jsx': 'JavaScript JSX',
    '.ts': 'TypeScript',
    '.tsx': 'TypeScript JSX',
    '.html': 'HTML',
    '.css': 'CSS',
    '.scss': 'SCSS',
    '.json': 'JSON',
    '.md': 'Markdown',
    '.sh': 'Shell',
    '.bash': 'Shell',
    '.yml': 'YAML',
    '.yaml': 'YAML',
    '.toml': 'TOML',
    '.xml': 'XML',
    '.sql': 'SQL',
    '.go': 'Go',
    '.java': 'Java',
    '.c': 'C',
    '.cpp': 'C++',
    '.h': 'C Header',
    '.hpp': 'C++ Header',
    '.rs': 'Rust',
    '.rb': 'Ruby',
    '.php': 'PHP',
    '.swift': 'Swift',
    '.kt': 'Kotlin',
    '.r': 'R',
    '.txt': 'Text',
    '.ipynb': 'Jupyter Notebook',
    '.dockerfile': 'Dockerfile',
}


def get_project_root():
    """Get the project root directory."""
    return Path(__file__).parent.parent


def should_skip_path(path):
    """Determine if a path should be skipped during analysis."""
    skip_dirs = {
        'node_modules', '.git', '__pycache__', '.pytest_cache',
        'venv', 'env', '.venv', 'dist', 'build', '.next',
        'coverage', '.coverage', 'htmlcov', '.mypy_cache',
        '.ruff_cache', 'playwright-report', 'test-results',
        '.npm', '.cache'
    }

    skip_files = {
        '.DS_Store', 'Thumbs.db', '.gitignore', '.gitattributes',
        'package-lock.json', 'yarn.lock', 'poetry.lock'
    }

    path_obj = Path(path)

    # Check if filename should be skipped
    if path_obj.name in skip_files:
        return True

    # Check if any part of the path is in skip_dirs
    for part in path_obj.parts:
        if part in skip_dirs:
            return True

    return False


def get_language(file_path):
    """Determine the programming language from file extension."""
    path = Path(file_path)

    # Special cases
    if path.name == 'Dockerfile':
        return 'Dockerfile'
    if path.name.lower() in ['makefile', 'gnumakefile']:
        return 'Makefile'

    # Check extension
    ext = path.suffix.lower()
    return LANGUAGE_MAP.get(ext, 'Unknown')


def count_lines(file_path):
    """
    Count lines in a file (code, comments, blank).

    Returns:
        dict: {'code': int, 'comments': int, 'blank': int, 'total': int}
    """
    code_lines = 0
    comment_lines = 0
    blank_lines = 0

    try:
        # Try UTF-8 first, then fallback to latin-1
        encodings = ['utf-8', 'latin-1', 'cp1252']
        content = None

        for encoding in encodings:
            try:
                with open(file_path, 'r', encoding=encoding) as f:
                    content = f.readlines()
                break
            except (UnicodeDecodeError, UnicodeError):
                continue

        if content is None:
            # If all encodings fail, try binary mode
            with open(file_path, 'rb') as f:
                content = f.readlines()
                content = [line.decode('utf-8', errors='ignore') for line in content]

        for line in content:
            stripped = line.strip()

            if not stripped:
                blank_lines += 1
            elif stripped.startswith(('#', '//', '/*', '*', '<!--', '--', "'''", '"""')):
                comment_lines += 1
            else:
                code_lines += 1

    except Exception as e:
        # If file can't be read, return zeros
        return {'code': 0, 'comments': 0, 'blank': 0, 'total': 0}

    total = code_lines + comment_lines + blank_lines

    return {
        'code': code_lines,
        'comments': comment_lines,
        'blank': blank_lines,
        'total': total
    }


def analyze_codebase(root_path):
    """
    Analyze the codebase and return statistics.

    Returns:
        dict: Statistics including total lines, language breakdown, etc.
    """
    language_stats = defaultdict(lambda: {
        'files': 0,
        'code': 0,
        'comments': 0,
        'blank': 0,
        'total': 0
    })

    all_files = []
    analyzed_count = 0

    # Walk through all files in the project
    for root, dirs, files in os.walk(root_path):
        # Remove directories that should be skipped
        dirs[:] = [d for d in dirs if not should_skip_path(os.path.join(root, d))]

        for file in files:
            file_path = os.path.join(root, file)

            if should_skip_path(file_path):
                continue

            language = get_language(file_path)

            # Only analyze text files we recognize
            if language == 'Unknown':
                continue

            line_counts = count_lines(file_path)

            # Skip empty files or binary files
            if line_counts['total'] == 0:
                continue

            # Update language stats
            language_stats[language]['files'] += 1
            language_stats[language]['code'] += line_counts['code']
            language_stats[language]['comments'] += line_counts['comments']
            language_stats[language]['blank'] += line_counts['blank']
            language_stats[language]['total'] += line_counts['total']

            all_files.append({
                'path': os.path.relpath(file_path, root_path),
                'language': language,
                'code': line_counts['code'],
                'comments': line_counts['comments'],
                'blank': line_counts['blank'],
                'total': line_counts['total']
            })

            analyzed_count += 1
            if analyzed_count % 100 == 0:
                print(f"Analyzed {analyzed_count} files...", flush=True)

    # Calculate totals
    total_stats = {
        'files': sum(lang['files'] for lang in language_stats.values()),
        'code': sum(lang['code'] for lang in language_stats.values()),
        'comments': sum(lang['comments'] for lang in language_stats.values()),
        'blank': sum(lang['blank'] for lang in language_stats.values()),
        'total': sum(lang['total'] for lang in language_stats.values())
    }

    return {
        'timestamp': datetime.now().isoformat(),
        'project_root': str(root_path),
        'total': total_stats,
        'by_language': dict(language_stats),
        'files': sorted(all_files, key=lambda x: x['code'], reverse=True)[:100]  # Top 100 files
    }


def format_number(num):
    """Format number with comma separators."""
    return f"{num:,}"


def generate_report(stats):
    """Generate a human-readable text report."""
    report = []
    report.append("=" * 80)
    report.append("WELLTEGRA NETWORK - SOURCE LINES OF CODE ANALYSIS")
    report.append("=" * 80)
    report.append(f"Generated: {stats['timestamp']}")
    report.append("")

    # Overall summary
    report.append("OVERALL SUMMARY")
    report.append("-" * 80)
    total = stats['total']
    report.append(f"Total Files:        {format_number(total['files'])}")
    report.append(f"Code Lines:         {format_number(total['code'])}")
    report.append(f"Comment Lines:      {format_number(total['comments'])}")
    report.append(f"Blank Lines:        {format_number(total['blank'])}")
    report.append(f"Total Lines:        {format_number(total['total'])}")

    if total['code'] > 0:
        comment_ratio = (total['comments'] / total['code']) * 100
        report.append(f"Comment Ratio:      {comment_ratio:.1f}%")

    report.append("")

    # Language breakdown
    report.append("BREAKDOWN BY LANGUAGE")
    report.append("-" * 80)
    report.append(f"{'Language':<20} {'Files':>10} {'Code':>15} {'Comments':>12} {'Blank':>10} {'Total':>15}")
    report.append("-" * 80)

    # Sort languages by code lines
    sorted_languages = sorted(
        stats['by_language'].items(),
        key=lambda x: x[1]['code'],
        reverse=True
    )

    for language, lang_stats in sorted_languages:
        report.append(
            f"{language:<20} "
            f"{lang_stats['files']:>10} "
            f"{format_number(lang_stats['code']):>15} "
            f"{format_number(lang_stats['comments']):>12} "
            f"{format_number(lang_stats['blank']):>10} "
            f"{format_number(lang_stats['total']):>15}"
        )

    report.append("")

    # Top files by code lines
    report.append("TOP 20 FILES BY CODE LINES")
    report.append("-" * 80)
    report.append(f"{'File':<60} {'Code':>10} {'Total':>10}")
    report.append("-" * 80)

    for file_info in stats['files'][:20]:
        # Truncate long paths
        path = file_info['path']
        if len(path) > 58:
            path = "..." + path[-55:]
        report.append(
            f"{path:<60} "
            f"{format_number(file_info['code']):>10} "
            f"{format_number(file_info['total']):>10}"
        )

    report.append("=" * 80)

    return "\n".join(report)


def main():
    """Main execution function."""
    print("Starting SLOC analysis...", flush=True)

    root_path = get_project_root()

    # Analyze the codebase
    stats = analyze_codebase(root_path)

    print(f"\nAnalysis complete! Processed {stats['total']['files']} files.", flush=True)

    # Save JSON output
    json_output_path = root_path / 'sloc-report.json'
    with open(json_output_path, 'w') as f:
        json.dump(stats, f, indent=2)
    print(f"✓ JSON report saved to: {json_output_path}")

    # Generate and save text report
    report = generate_report(stats)
    report_path = root_path / 'sloc-report.txt'
    with open(report_path, 'w') as f:
        f.write(report)
    print(f"✓ Text report saved to: {report_path}")

    # Print summary to console
    print("\n" + report)

    return stats


if __name__ == '__main__':
    main()
