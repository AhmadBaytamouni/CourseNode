"""
Process scraped course data and prepare it for database insertion.
"""

import json
import os
import re
from typing import Dict, List, Optional

def normalize_course_code(code: str) -> str:
    """Normalize course code format (e.g., 'COMP1001' -> 'COMP 1001')."""
    match = re.search(r'COMP\s*(\d{4})', code, re.IGNORECASE)
    if match:
        return f"COMP {match.group(1)}"
    return code.upper().strip()

def extract_level(code: str) -> int:
    """Extract course level from code."""
    match = re.search(r'(\d)(\d{3})', code)
    if match:
        return int(match.group(1)) * 1000
    return 1000

def parse_prerequisites(text: str) -> List[Dict]:
    """Parse prerequisite text and extract course codes with AND/OR logic."""
    if not text:
        return []
    
    # Find prerequisite section (keep original case for better parsing)
    # Look for "Prerequisite(s):" pattern - handle both "Prerequisite:" and "Prerequisite(s):"
    # Prioritize matching up to section markers (Lectures, Corequisite, etc.) over periods
    prereq_patterns = [
        r'prerequisite[s]?[\(\)s]*[:\s]+(.+?)(?:Lectures|Corequisite|Exclusion|Includes:|Also listed as|$)',
        r'prerequisite[s]?[\(\)s]*[:\s]+(.+?)(?:\.|$)',
    ]
    
    prereq_text = None
    for pattern in prereq_patterns:
        match = re.search(pattern, text, re.IGNORECASE | re.DOTALL)
        if match:
            prereq_text = match.group(1)
            break
    
    if not prereq_text:
        return []
    
    # Clean up the prerequisite text - remove "with a minimum grade" clauses
    # Better pattern: match "with a minimum grade of X" or "with a minimum grade X" up to comma, and, or end
    prereq_text = re.sub(r'\s+with\s+a\s+minimum\s+grade\s+(?:of\s+)?[^,and)]+(?=\s*[,and)]|$)', '', prereq_text, flags=re.IGNORECASE)
    # Remove trailing periods
    prereq_text = re.sub(r'\.+$', '', prereq_text)
    prereq_text = prereq_text.strip()
    
    prerequisites = []
    
    # Ignore SYSC courses - filter them out from the text for parsing
    # Replace SYSC codes with placeholders so they don't interfere with parsing
    sysc_pattern = r'SYSC\s*\d{4}'
    prereq_text = re.sub(sysc_pattern, '', prereq_text, flags=re.IGNORECASE)
    # Clean up extra spaces and commas left after removing SYSC codes
    prereq_text = re.sub(r'\s*,\s*,', ',', prereq_text)  # Remove double commas
    prereq_text = re.sub(r'\s*,\s*\)', ')', prereq_text)  # Clean commas before closing parens
    prereq_text = re.sub(r'\(\s*,', '(', prereq_text)  # Clean commas after opening parens
    prereq_text = re.sub(r'\s+', ' ', prereq_text)  # Normalize spaces
    
    # Check if the text contains "or" (without parentheses) - if so, treat all as OR
    # Pattern: COMP XXXX or COMP YYYY (not in parentheses)
    has_or_without_parens = re.search(r'COMP\s+\d{4}\s+(?:or|OR)\s+COMP\s+\d{4}', prereq_text, re.IGNORECASE)
    if has_or_without_parens and not re.search(r'\([^)]*(?:or|OR)[^)]*\)', prereq_text, re.IGNORECASE):
        # Simple OR case without parentheses: "COMP 1005 or COMP 1405"
        codes = re.findall(r'COMP\s*\d{4}', prereq_text, re.IGNORECASE)
        for code in codes:
            normalized_code = normalize_course_code(code)
            prerequisites.append({
                'code': normalized_code,
                'logic_type': 'OR'
            })
    else:
        # Handle complex cases with parentheses and AND/OR mixing
        # Strategy: Process text character by character to preserve exact order
        
        # First, identify OR groups
        or_group_pattern = r'\(([^)]*(?:or|OR)[^)]*)\)'
        or_groups = list(re.finditer(or_group_pattern, prereq_text, re.IGNORECASE))
        
        # Build map of OR group ranges and their multi-COMP status
        or_group_info = {}  # Maps (start, end) to (codes_list, is_multi_comp)
        for match in or_groups:
            start, end = match.span()
            group_text = match.group(1)
            # Extract codes from group text in order
            codes_in_group = re.findall(r'COMP\s*\d{4}', group_text, re.IGNORECASE)
            comp_codes_in_group = [normalize_course_code(code) for code in codes_in_group]
            is_multi_comp = len(comp_codes_in_group) > 1
            or_group_info[(start, end)] = (comp_codes_in_group, is_multi_comp)
        
        # Extract all course codes with their positions, in order
        all_code_matches = list(re.finditer(r'COMP\s*\d{4}', prereq_text, re.IGNORECASE))
        
        # Build prerequisites list preserving exact order from text
        seen_codes = set()
        for match in all_code_matches:
            code = match.group(0)
            normalized_code = normalize_course_code(code)
            position = match.start()
            
            # Skip if already added
            if normalized_code in seen_codes:
                continue
            
            # Check if this code is in an OR group
            is_in_multi_comp_or = False
            for (or_start, or_end), (codes_in_group, is_multi_comp) in or_group_info.items():
                if or_start <= position < or_end and normalized_code in codes_in_group:
                    is_in_multi_comp_or = is_multi_comp
                    break
            
            # Determine logic type
            logic_type = 'OR' if is_in_multi_comp_or else 'AND'
            
            prerequisites.append({
                'code': normalized_code,
                'logic_type': logic_type
            })
            seen_codes.add(normalized_code)
    
    # Remove duplicates while preserving order
    seen = {}
    unique_prereqs = []
    for prereq in prerequisites:
        code = prereq['code']
        if code not in seen:
            seen[code] = prereq
            unique_prereqs.append(prereq)
        elif prereq['logic_type'] == 'OR' and seen[code]['logic_type'] == 'AND':
            # Replace AND with OR if same code appears in OR group
            idx = unique_prereqs.index(seen[code])
            unique_prereqs[idx] = prereq
            seen[code] = prereq
    
    return unique_prereqs

def process_course(raw_course: Dict) -> Optional[Dict]:
    """Process a single raw course entry."""
    try:
        code = normalize_course_code(raw_course.get('code', ''))
        if not code:
            return None
        
        # Extract level and filter out 5000-level courses (graduate level, not undergraduate)
        level = extract_level(code)
        if level >= 5000:
            return None
        
        title = raw_course.get('title', '').strip()
        description = raw_course.get('description', '').strip()
        
        # Extract credits - store as float to support 0.5 credits
        credits_text = raw_course.get('credits', 0.5)
        if isinstance(credits_text, str):
            match = re.search(r'(\d+\.?\d*)', credits_text)
            credits = float(match.group(1)) if match else 0.5
        else:
            credits = float(credits_text)
        
        # Extract prerequisites with logic types
        prereq_text = raw_course.get('prerequisites', '') or description
        prerequisites_with_logic = parse_prerequisites(prereq_text)
        
        # Store prerequisites as list of dicts with code and logic_type
        prerequisites = prerequisites_with_logic
        
        processed = {
            'code': code,
            'title': title,
            'credits': credits,
            'description': description,
            'level': level,
            'department': 'COMP',
            'prerequisites': prerequisites,
            'corequisites': raw_course.get('corequisites', []),
            'exclusions': raw_course.get('exclusions', []),
        }
        
        return processed
        
    except Exception as e:
        print(f"Error processing course {raw_course.get('code', 'unknown')}: {e}")
        return None

def main():
    """Main processing function."""
    print("Processing scraped course data...")
    
    # Load raw data
    input_file = '../data/scraped/courses_raw.json'
    if not os.path.exists(input_file):
        print(f"Error: {input_file} not found. Please run scraper.py first.")
        return
    
    with open(input_file, 'r', encoding='utf-8') as f:
        raw_courses = json.load(f)
    
    # Process courses
    processed_courses = []
    for raw_course in raw_courses:
        processed = process_course(raw_course)
        if processed:
            processed_courses.append(processed)
    
    # Save processed data
    output_file = '../data/scraped/courses_processed.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(processed_courses, f, indent=2, ensure_ascii=False)
    
    print(f"Processed {len(processed_courses)} courses")
    print(f"Processed data saved to {output_file}")
    
    # Print summary
    print("\nSummary:")
    for level in [1000, 2000, 3000, 4000]:
        count = sum(1 for c in processed_courses if c['level'] == level)
        print(f"  {level}-level: {count} courses")

if __name__ == '__main__':
    main()

