"""
Web scraper for Carleton University Computer Science courses.
"""

import requests
from bs4 import BeautifulSoup
import json
import os
import re
from typing import Dict, List, Optional

BASE_URL = "https://calendar.carleton.ca/undergrad/courses/COMP/"
COURSE_PREFIX = "COMP"

def extract_course_code(text: str) -> Optional[str]:
    """Extract course code from text."""
    match = re.search(r'COMP\s*(\d{4})', text, re.IGNORECASE)
    if match:
        return f"COMP {match.group(1)}"
    return None

def extract_credits(text: str) -> int:
    """Extract credit value from text."""
    match = re.search(r'(\d+\.?\d*)\s*credit', text, re.IGNORECASE)
    if match:
        return int(float(match.group(1)))
    return 3

def extract_level(code: str) -> int:
    """Extract course level from code."""
    match = re.search(r'(\d)(\d{3})', code)
    if match:
        return int(match.group(1)) * 1000
    return 1000

def parse_prerequisites(text: str) -> List[str]:
    """Parse prerequisite text and extract course codes."""
    if not text or 'prerequisite' not in text.lower():
        return []
    
    prereq_match = re.search(r'prerequisite[s]?[:\s]+(.+?)(?:\.|$)', text, re.IGNORECASE)
    if not prereq_match:
        return []
    
    prereq_text = prereq_match.group(1)
    codes = re.findall(r'COMP\s*\d{4}', prereq_text, re.IGNORECASE)
    
    normalized = []
    for code in codes:
        match = re.search(r'COMP\s*(\d{4})', code, re.IGNORECASE)
        if match:
            normalized.append(f"COMP {match.group(1)}")
    
    return list(set(normalized))

def scrape_course_page(url: str) -> Optional[Dict]:
    """Scrape a single course page."""
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, 'html.parser')
        
        course_data = {
            'url': url,
            'raw_html': str(soup),
        }
        
        return course_data
    except Exception as e:
        print(f"Error scraping {url}: {e}")
        return None

def scrape_course_details(url: str) -> Dict:
    """Scrape detailed information from a course page."""
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, 'html.parser')
        
        description = ""
        prerequisites_text = ""
        
        # Try to find description in common HTML elements
        desc_elem = soup.find('div', class_=re.compile(r'description|content|coursedesc', re.IGNORECASE))
        if not desc_elem:
            desc_elem = soup.find('p', class_=re.compile(r'description', re.IGNORECASE))
        
        if desc_elem:
            description = desc_elem.get_text(strip=True)
        
        # Try to find prerequisites section
        prereq_elem = soup.find('div', class_=re.compile(r'prerequisite|requisite', re.IGNORECASE))
        if not prereq_elem:
            # Fallback: search all elements for prerequisite text
            for elem in soup.find_all(['p', 'div', 'span']):
                text = elem.get_text()
                if 'prerequisite' in text.lower() and len(text) < 500:
                    prerequisites_text = text
                    break
        
        if prereq_elem:
            prerequisites_text = prereq_elem.get_text(strip=True)
        
        return {
            'description': description,
            'prerequisites': prerequisites_text
        }
    except Exception as e:
        print(f"  Warning: Could not scrape details from {url}: {e}")
        return {'description': '', 'prerequisites': ''}

def scrape_all_comp_courses() -> List[Dict]:
    """Scrape all COMP courses from Carleton calendar."""
    courses = []
    
    try:
        # Fetch the main course listing page
        response = requests.get(BASE_URL, timeout=30)
        response.raise_for_status()
        response.encoding = 'utf-8'
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Extract all text content from the page
        all_text = soup.get_text()
        
        # Clean up special unicode characters that cause parsing issues
        all_text = all_text.replace('\u00a0', ' ')  # Non-breaking space
        all_text = all_text.replace('\xa0', ' ')   # Non-breaking space (alternative)
        all_text = all_text.replace('\u2011', '-')  # Non-breaking hyphen
        all_text = all_text.replace('\u2013', '-')  # En dash
        all_text = all_text.replace('\u2014', '-')  # Em dash
        
        # Pattern to find course headers: "COMP 1405 [0.5 credit]"
        # Uses negative lookbehind to avoid matching codes in descriptions
        course_header_pattern = r'(?<!\w)COMP\s+(\d{4})\s+\[([^\]]+)\]'
        course_matches = list(re.finditer(course_header_pattern, all_text))
        
        print(f"Found {len(course_matches)} course headers")
        
        # Process each course found
        for i, match in enumerate(course_matches):
            course_number = match.group(1)
            course_level = int(course_number[0]) * 1000
            
            # Skip graduate-level courses (5000+)
            if course_level >= 5000:
                continue
                
            credit_info = match.group(2)
            course_code = f"COMP {course_number}"
            
            # Extract credit value from bracket content
            credits_match = re.search(r'(\d+\.?\d*)\s*credit', credit_info, re.IGNORECASE)
            if credits_match:
                credits = float(credits_match.group(1))
            else:
                credits = 0.5  # Default fallback
            
            # Determine where this course's text ends
            start_pos = match.end()
            
            if i + 1 < len(course_matches):
                # End at the next course header
                end_pos = course_matches[i + 1].start()
            else:
                # Last course - limit to 2000 characters
                end_pos = min(start_pos + 2000, len(all_text))
            
            # Extract course text between start and end positions
            course_text = all_text[start_pos:end_pos].strip()
            
            # Use "a week." as a more precise end marker (lecture hours line)
            week_match = re.search(r'a\s+week\.', course_text, re.IGNORECASE)
            if week_match:
                course_text = course_text[:week_match.end()].strip()
            
            # Extract title from first line of course text
            lines = course_text.split('\n')
            title = lines[0].strip() if lines else course_code
            title = re.sub(r'^\s*\]?\s*', '', title)  # Clean up any leftover brackets
            
            # Store full description and prerequisites text
            description = course_text
            prereq_text = course_text
            
            courses.append({
                'code': course_code,
                'title': title,
                'description': description,
                'credits': credits,
                'url': BASE_URL,
                'prerequisites': prereq_text
            })
        
        # Sort courses by code for consistent output
        courses.sort(key=lambda x: x['code'])
        
        print(f"Processed {len(courses)} COMP courses")
        
        # Print breakdown by course level
        level_counts = {}
        for course in courses:
            level = extract_level(course['code'])
            level_counts[level] = level_counts.get(level, 0) + 1
        
        for level in sorted(level_counts.keys()):
            print(f"  {level}-level: {level_counts[level]} courses")
        
    except Exception as e:
        print(f"Error scraping courses: {e}")
        import traceback
        traceback.print_exc()
    
    return courses

def main():
    """Main scraping function."""
    print("Starting Carleton CS course scraper...")
    
    os.makedirs('../data/scraped', exist_ok=True)
    
    courses = scrape_all_comp_courses()
    
    output_file = '../data/scraped/courses_raw.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(courses, f, indent=2, ensure_ascii=False)
    
    print(f"Scraped {len(courses)} courses")
    print(f"Raw data saved to {output_file}")

if __name__ == '__main__':
    main()
