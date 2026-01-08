"""
Web scraper for Carleton University Computer Science courses.
Scrapes course data from the Carleton University Undergraduate Calendar.
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
    """Extract course code from text (e.g., 'COMP 1001' or 'COMP1001')."""
    match = re.search(r'COMP\s*(\d{4})', text, re.IGNORECASE)
    if match:
        return f"COMP {match.group(1)}"
    return None

def extract_credits(text: str) -> int:
    """Extract credit value from text."""
    match = re.search(r'(\d+\.?\d*)\s*credit', text, re.IGNORECASE)
    if match:
        return int(float(match.group(1)))
    return 3  # Default to 3 credits

def extract_level(code: str) -> int:
    """Extract course level from code (e.g., COMP 1001 -> 1000)."""
    match = re.search(r'(\d)(\d{3})', code)
    if match:
        return int(match.group(1)) * 1000
    return 1000

def parse_prerequisites(text: str) -> List[str]:
    """Parse prerequisite text and extract course codes."""
    if not text or 'prerequisite' not in text.lower():
        return []
    
    # Find prerequisite section
    prereq_match = re.search(r'prerequisite[s]?[:\s]+(.+?)(?:\.|$)', text, re.IGNORECASE)
    if not prereq_match:
        return []
    
    prereq_text = prereq_match.group(1)
    
    # Extract all course codes
    codes = re.findall(r'COMP\s*\d{4}', prereq_text, re.IGNORECASE)
    # Normalize codes
    normalized = []
    for code in codes:
        match = re.search(r'COMP\s*(\d{4})', code, re.IGNORECASE)
        if match:
            normalized.append(f"COMP {match.group(1)}")
    
    return list(set(normalized))  # Remove duplicates

def scrape_course_page(url: str) -> Optional[Dict]:
    """Scrape a single course page."""
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Extract course information
        # This will need to be adjusted based on actual HTML structure
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
        
        # Extract description and prerequisites from course page
        # Look for common patterns in course pages
        description = ""
        prerequisites_text = ""
        
        # Try to find course description
        desc_elem = soup.find('div', class_=re.compile(r'description|content|coursedesc', re.IGNORECASE))
        if not desc_elem:
            # Try p tags
            desc_elem = soup.find('p', class_=re.compile(r'description', re.IGNORECASE))
        
        if desc_elem:
            description = desc_elem.get_text(strip=True)
        
        # Try to find prerequisites
        prereq_elem = soup.find('div', class_=re.compile(r'prerequisite|requisite', re.IGNORECASE))
        if not prereq_elem:
            # Look for text containing "Prerequisite"
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
        # Get the main course listing page
        response = requests.get(BASE_URL, timeout=30)
        response.raise_for_status()
        # Use utf-8 encoding explicitly
        response.encoding = 'utf-8'
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Get all text content from the page
        all_text = soup.get_text()
        
        # Clean up non-breaking spaces and other special unicode characters
        # Replace non-breaking space (U+00A0) with regular space
        all_text = all_text.replace('\u00a0', ' ')
        # Replace other common problematic characters
        all_text = all_text.replace('\xa0', ' ')
        all_text = all_text.replace('\u2011', '-')  # non-breaking hyphen
        all_text = all_text.replace('\u2013', '-')  # en dash
        all_text = all_text.replace('\u2014', '-')  # em dash
        
        # New approach: Find all course entries using the pattern "COMP #### [credit]"
        # Each course starts with "COMP #### [X.X credit]" and ends at the next course
        # or at "a week." (the lecture hours line)
        
        # Pattern to find course headers: "COMP 1405 [0.5 credit]"
        course_header_pattern = r'COMP\s+(\d{4})\s+\[([^\]]+)\]'
        
        # Find all course headers and their positions
        course_matches = list(re.finditer(course_header_pattern, all_text))
        
        print(f"Found {len(course_matches)} course headers")
        
        for i, match in enumerate(course_matches):
            course_number = match.group(1)
            credit_info = match.group(2)
            course_code = f"COMP {course_number}"
            
            # Extract credits from the bracket content (e.g., "0.5 credit")
            credits_match = re.search(r'(\d+\.?\d*)\s*credit', credit_info, re.IGNORECASE)
            if credits_match:
                credits = float(credits_match.group(1))
            else:
                # Default to 0.5 if not found
                credits = 0.5
            
            # Find the end of this course's description
            # It ends at the next course header or at a reasonable cutoff
            start_pos = match.end()
            
            if i + 1 < len(course_matches):
                # End at the next course header
                end_pos = course_matches[i + 1].start()
            else:
                # Last course - take remaining text (limited)
                end_pos = min(start_pos + 2000, len(all_text))
            
            # Extract the full course text
            course_text = all_text[start_pos:end_pos].strip()
            
            # Try to find "a week." as a more precise end marker
            week_match = re.search(r'a\s+week\.', course_text, re.IGNORECASE)
            if week_match:
                course_text = course_text[:week_match.end()].strip()
            
            # Extract title (first line after the header)
            lines = course_text.split('\n')
            title = lines[0].strip() if lines else course_code
            
            # Clean up title - remove any leftover bracket content
            title = re.sub(r'^\s*\]?\s*', '', title)
            
            # Full description is everything
            description = course_text
            
            # Extract prerequisites text for later parsing
            prereq_text = course_text
            
            courses.append({
                'code': course_code,
                'title': title,
                'description': description,
                'credits': credits,
                'url': BASE_URL,
                'prerequisites': prereq_text
            })
        
        # Sort courses by code
        courses.sort(key=lambda x: x['code'])
        
        print(f"Processed {len(courses)} COMP courses")
        
        # Print breakdown by level
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
    
    # Create output directory
    os.makedirs('../data/scraped', exist_ok=True)
    
    # Scrape courses
    courses = scrape_all_comp_courses()
    
    # Save raw data
    output_file = '../data/scraped/courses_raw.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(courses, f, indent=2, ensure_ascii=False)
    
    print(f"Scraped {len(courses)} courses")
    print(f"Raw data saved to {output_file}")
    
    # Note: This is a basic scraper. The actual implementation will need
    # to be adjusted based on Carleton's website structure. You may need to:
    # 1. Handle pagination if courses are spread across multiple pages
    # 2. Navigate to individual course pages for detailed information
    # 3. Parse prerequisite information more carefully
    # 4. Handle edge cases in course descriptions

if __name__ == '__main__':
    main()

