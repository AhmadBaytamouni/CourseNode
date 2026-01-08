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
    seen_codes = set()
    
    try:
        # Get the main course listing page
        response = requests.get(BASE_URL, timeout=30)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Look for course entries - they're typically in specific HTML structures
        # Common patterns: headings (h3, h4), paragraphs, or list items with course codes
        
        # Method 1: Look for headings with course codes (e.g., <h3>COMP 1001</h3>)
        headings = soup.find_all(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'])
        for heading in headings:
            text = heading.get_text(strip=True)
            course_code = extract_course_code(text)
            if course_code and course_code not in seen_codes:
                seen_codes.add(course_code)
                # Get the next sibling or parent content for title/description
                title = text
                description = ""
                credits = 3
                
                # Try to extract title (everything after course code)
                title_match = re.search(r'COMP\s*\d{4}\s*[–\-]\s*(.+)', text)
                if title_match:
                    title = title_match.group(1).strip()
                
                # Look for content in following siblings
                next_elem = heading.find_next_sibling()
                if next_elem:
                    next_text = next_elem.get_text(strip=True)
                    if next_text and len(next_text) > 20:
                        description = next_text[:500]  # Limit description length
                    
                    # Extract credits
                    credits_match = re.search(r'(\d+\.?\d*)\s*credit', next_text, re.IGNORECASE)
                    if credits_match:
                        credits = int(float(credits_match.group(1)))
                
                courses.append({
                    'code': course_code,
                    'title': title,
                    'description': description,
                    'credits': credits,
                    'url': BASE_URL,
                    'prerequisites': description  # Will be parsed later
                })
        
        # Method 2: Look for paragraphs or divs containing course codes
        if len(courses) < 10:  # If we didn't find many, try another method
            paragraphs = soup.find_all(['p', 'div', 'li'])
            for para in paragraphs:
                text = para.get_text()
                # Look for pattern like "COMP 1001 - Course Title"
                matches = re.finditer(r'COMP\s*(\d{4})\s*[–\-]\s*([^\n]+)', text, re.IGNORECASE)
                for match in matches:
                    course_code = f"COMP {match.group(1)}"
                    if course_code not in seen_codes:
                        seen_codes.add(course_code)
                        title = match.group(2).strip()
                        
                        # Extract credits from surrounding text
                        credits_match = re.search(r'(\d+\.?\d*)\s*credit', text, re.IGNORECASE)
                        credits = int(float(credits_match.group(1))) if credits_match else 3
                        
                        courses.append({
                            'code': course_code,
                            'title': title,
                            'description': text[:500] if len(text) > 20 else '',
                            'credits': credits,
                            'url': BASE_URL,
                            'prerequisites': text  # Will be parsed later
                        })
        
        # Method 3: Search all text content for course codes
        if len(courses) < 50:  # Still not enough courses
            all_text = soup.get_text()
            # Find all course code patterns
            code_matches = re.finditer(r'COMP\s*(\d{4})', all_text, re.IGNORECASE)
            for match in code_matches:
                course_code = f"COMP {match.group(1)}"
                if course_code not in seen_codes:
                    seen_codes.add(course_code)
                    # Extract surrounding text (50 chars before and after)
                    start = max(0, match.start() - 100)
                    end = min(len(all_text), match.end() + 300)
                    context = all_text[start:end]
                    
                    # Try to extract title
                    title_match = re.search(rf'{re.escape(course_code)}\s*[–\-]?\s*([^\n]+)', context)
                    title = title_match.group(1).strip() if title_match else course_code
                    
                    credits_match = re.search(r'(\d+\.?\d*)\s*credit', context, re.IGNORECASE)
                    credits = int(float(credits_match.group(1))) if credits_match else 3
                    
                    courses.append({
                        'code': course_code,
                        'title': title,
                        'description': context[:500],
                        'credits': credits,
                        'url': BASE_URL,
                        'prerequisites': context
                    })
        
        # Sort courses by code
        courses.sort(key=lambda x: x['code'])
        
        print(f"Found {len(courses)} COMP courses")
        
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

