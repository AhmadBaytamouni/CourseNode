"""
Populate Supabase database with processed course data.
Uses Supabase REST API directly to avoid dependency issues.
"""

import json
import os
import sys
import requests
from typing import Dict, List, Optional

def load_processed_courses() -> List[Dict]:
    """Load processed course data."""
    input_file = '../data/scraped/courses_processed.json'
    if not os.path.exists(input_file):
        print(f"Error: {input_file} not found. Please run data_processor.py first.")
        sys.exit(1)
    
    with open(input_file, 'r', encoding='utf-8') as f:
        return json.load(f)

class SupabaseClient:
    """Simple Supabase REST API client."""
    
    def __init__(self, url: str, key: str):
        self.url = url.rstrip('/')
        self.key = key
        self.headers = {
            'apikey': key,
            'Authorization': f'Bearer {key}',
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
        }
    
    def _request(self, method: str, table: str, data: Optional[Dict] = None, params: Optional[Dict] = None) -> Dict:
        """Make a request to Supabase REST API."""
        url = f"{self.url}/rest/v1/{table}"
        
        if method == 'GET':
            response = requests.get(url, headers=self.headers, params=params)
        elif method == 'POST':
            response = requests.post(url, headers=self.headers, json=data)
        elif method == 'PATCH':
            response = requests.patch(url, headers=self.headers, json=data, params=params)
        elif method == 'DELETE':
            response = requests.delete(url, headers=self.headers, params=params)
        else:
            raise ValueError(f"Unsupported method: {method}")
        
        if not response.ok:
            # Print detailed error information
            try:
                error_data = response.json()
                print(f"  Error response: {error_data}")
            except:
                print(f"  Error response text: {response.text}")
        
        response.raise_for_status()
        return response.json() if response.content else {}
    
    def select(self, table: str, columns: str = '*', filters: Optional[Dict] = None) -> List[Dict]:
        """Select data from a table."""
        params = {'select': columns}
        if filters:
            for key, value in filters.items():
                params[key] = f'eq.{value}'
        result = self._request('GET', table, params=params)
        return result if isinstance(result, list) else []
    
    def insert(self, table: str, data: Dict) -> List[Dict]:
        """Insert data into a table."""
        result = self._request('POST', table, data=data)
        return result if isinstance(result, list) else [result]
    
    def update(self, table: str, data: Dict, filters: Dict) -> List[Dict]:
        """Update data in a table."""
        params = {}
        for key, value in filters.items():
            params[key] = f'eq.{value}'
        result = self._request('PATCH', table, data=data, params=params)
        return result if isinstance(result, list) else []
    
    def delete(self, table: str, filters: Dict) -> None:
        """Delete data from a table."""
        params = {}
        for key, value in filters.items():
            params[key] = f'eq.{value}'
        self._request('DELETE', table, params=params)

def load_env_file(filepath: str) -> Dict[str, str]:
    """Load environment variables from a .env file."""
    env_vars = {}
    if os.path.exists(filepath):
        with open(filepath, 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, value = line.split('=', 1)
                    key = key.strip()
                    value = value.strip().strip('"').strip("'")
                    env_vars[key] = value
    return env_vars

def get_supabase_client() -> SupabaseClient:
    """Create and return Supabase client."""
    # Try to load from .env or .env.local file in project root or scripts directory
    env_vars = {}
    for env_file in ['../.env.local', '../.env', '.env.local', '.env', '../../.env.local', '../../.env']:
        if os.path.exists(env_file):
            env_vars.update(load_env_file(env_file))
            # Don't break - keep checking to allow multiple files to override
    
    # Load from environment variables (these take precedence over .env file)
    # Also check for NEXT_PUBLIC_ prefixed versions (used by Next.js)
    url = (os.getenv('SUPABASE_URL') or 
           os.getenv('NEXT_PUBLIC_SUPABASE_URL') or
           env_vars.get('SUPABASE_URL') or 
           env_vars.get('NEXT_PUBLIC_SUPABASE_URL'))
    key = (os.getenv('SUPABASE_SERVICE_ROLE_KEY') or 
           os.getenv('SUPABASE_ANON_KEY') or 
           os.getenv('NEXT_PUBLIC_SUPABASE_ANON_KEY') or
           os.getenv('NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY') or
           env_vars.get('SUPABASE_SERVICE_ROLE_KEY') or 
           env_vars.get('SUPABASE_ANON_KEY') or
           env_vars.get('NEXT_PUBLIC_SUPABASE_ANON_KEY') or
           env_vars.get('NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY'))
    
    if not url or not key:
        print("Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_ANON_KEY) must be set")
        print("\nYou can set these in one of the following ways:")
        print("1. Create a .env file in the project root with:")
        print("   SUPABASE_URL=your_supabase_url")
        print("   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key")
        print("\n2. Set environment variables:")
        print("   Windows PowerShell: $env:SUPABASE_URL='your_url'")
        print("   Windows CMD: set SUPABASE_URL=your_url")
        print("   Linux/Mac: export SUPABASE_URL=your_url")
        sys.exit(1)
    
    return SupabaseClient(url, key)

def insert_courses(supabase: SupabaseClient, courses: List[Dict]) -> Dict[str, str]:
    """Insert courses into database and return mapping of code to id."""
    code_to_id = {}
    
    for course in courses:
        try:
            # Check if course already exists
            existing = supabase.select('courses', columns='id,code', filters={'code': course['code']})
            
            if existing:
                # Update existing course
                course_id = existing[0]['id']
                update_data = {
                    'title': course['title'],
                    'credits': course['credits'],
                    'description': course.get('description', ''),
                    'level': course['level'],
                    'department': course['department'],
                }
                result = supabase.update('courses', update_data, filters={'id': course_id})
                code_to_id[course['code']] = course_id
                print(f"Updated: {course['code']}")
            else:
                # Insert new course
                result = supabase.insert('courses', {
                    'code': course['code'],
                    'title': course['title'],
                    'credits': course['credits'],
                    'description': course.get('description', ''),
                    'level': course['level'],
                    'department': course['department'],
                })
                
                if result:
                    course_id = result[0]['id']
                    code_to_id[course['code']] = course_id
                    print(f"Inserted: {course['code']}")
                    
        except Exception as e:
            print(f"Error inserting/updating {course['code']}: {e}")
    
    return code_to_id

def insert_prerequisites(
    supabase: SupabaseClient,
    courses: List[Dict],
    code_to_id: Dict[str, str]
) -> None:
    """Insert prerequisite relationships."""
    for course in courses:
        course_id = code_to_id.get(course['code'])
        if not course_id:
            continue
        
        # Delete existing prerequisites for this course
        try:
            supabase.delete('prerequisites', filters={'course_id': course_id})
        except Exception as e:
            print(f"Warning: Could not delete existing prerequisites for {course['code']}: {e}")
        
        # Insert new prerequisites
        prerequisites_list = course.get('prerequisites', [])
        for prereq in prerequisites_list:
            # Handle both old format (string) and new format (dict)
            if isinstance(prereq, dict):
                prereq_code = prereq.get('code')
                logic_type = prereq.get('logic_type', 'AND')
            else:
                prereq_code = prereq
                logic_type = 'AND'  # Default to AND for old format
            
            prereq_id = code_to_id.get(prereq_code)
            if prereq_id:
                try:
                    supabase.insert('prerequisites', {
                        'course_id': course_id,
                        'prerequisite_id': prereq_id,
                        'is_corequisite': False,
                        'is_exclusion': False,
                        'logic_type': logic_type,
                    })
                except Exception as e:
                    print(f"Error inserting prerequisite {prereq_code} for {course['code']}: {e}")

def main():
    """Main function to populate database."""
    print("Starting database population...")
    
    # Load processed courses
    courses = load_processed_courses()
    print(f"Loaded {len(courses)} courses")
    
    # Create Supabase client
    supabase = get_supabase_client()
    
    # Insert courses
    print("\nInserting courses...")
    code_to_id = insert_courses(supabase, courses)
    print(f"Inserted/updated {len(code_to_id)} courses")
    
    # Insert prerequisites
    print("\nInserting prerequisites...")
    insert_prerequisites(supabase, courses, code_to_id)
    print("Prerequisites inserted")
    
    print("\nDatabase population complete!")

if __name__ == '__main__':
    main()

