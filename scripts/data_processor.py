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

def parse_prerequisites(text: str) -> List[str]:
    """Parse prerequisite text and extract course codes."""
    if not text:
        return []
    
    # Normalize text
    text = text.lower()
    
    # Find prerequisite section
    prereq_patterns = [
        r'prerequisite[s]?[:\s]+(.+?)(?:\.|corequisite|exclusion|$)',
        r'prerequisite[s]?[:\s]+(.+?)(?:\.|$)',
    ]
    
    prereq_text = None
    for pattern in prereq_patterns:
        match = re.search(pattern, text, re.IGNORECASE | re.DOTALL)
        if match:
            prereq_text = match.group(1)
            break
    
    if not prereq_text:
        return []
    
    # Extract course codes
    codes = re.findall(r'COMP\s*\d{4}', prereq_text, re.IGNORECASE)
    normalized = []
    for code in codes:
        normalized_code = normalize_course_code(code)
        if normalized_code not in normalized:
            normalized.append(normalized_code)
    
    return normalized

def process_course(raw_course: Dict) -> Optional[Dict]:
    """Process a single raw course entry."""
    try:
        code = normalize_course_code(raw_course.get('code', ''))
        if not code:
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
        
        # Extract prerequisites
        prereq_text = raw_course.get('prerequisites', '') or description
        prerequisites = parse_prerequisites(prereq_text)
        
        processed = {
            'code': code,
            'title': title,
            'credits': credits,
            'description': description,
            'level': extract_level(code),
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

