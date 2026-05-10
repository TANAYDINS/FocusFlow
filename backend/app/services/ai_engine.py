import os
import json
from dotenv import load_dotenv
import google.generativeai as genai
from typing import List, Dict

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Configure Gemini
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
else:
    print("WARNING: GEMINI_API_KEY not found in environment variables.")

def analyze_tasks_from_text(text: str) -> List[Dict]:
    """
    Analyzes natural language text and extracts tasks using Gemini.
    """
    if not GEMINI_API_KEY:
        return []

    model = genai.GenerativeModel('gemini-1.5-flash')
    
    prompt = f"""
    Analyze the following text and extract a list of tasks. 
    For each task, provide a title, an estimated duration in minutes, a deadline (if mentioned, otherwise null), and a priority level (High, Medium, Low).
    Output the result as a valid JSON array of objects.
    
    Text: "{text}"
    
    Format:
    [
      {{
        "title": "Task title",
        "estimated_duration": 60,
        "deadline": "Friday, 2:00 PM",
        "priority": "High"
      }}
    ]
    """
    
    try:
        response = model.generate_content(prompt)
        # Extract JSON from markdown if present
        text_response = response.text
        if "```json" in text_response:
            text_response = text_response.split("```json")[1].split("```")[0]
        elif "```" in text_response:
            text_response = text_response.split("```")[1].split("```")[0]
            
        return json.loads(text_response.strip())
    except Exception as e:
        print(f"Error calling Gemini API: {e}")
        return []

def calculate_priority_score(title: str, stress_level: int) -> float:
    """
    Uses Gemini to determine a priority score from 1 to 100 based on the task description and user stress level.
    """
    if not GEMINI_API_KEY:
        return 50.0

    model = genai.GenerativeModel('gemini-1.5-flash')
    
    prompt = f"""
    Given the task "{title}" and the user's stress level for this task (1 to 5, where 5 is highest): {stress_level}.
    Calculate a Priority Score from 1 to 100 for this task.
    Consider that higher stress usually implies higher priority, but also consider the complexity of the task name.
    Return ONLY a number.
    """
    
    try:
        response = model.generate_content(prompt)
        score_text = response.text.strip()
        # Keep only digits
        score = ''.join(filter(str.isdigit, score_text))
        return float(score) if score else 50.0
    except Exception as e:
        print(f"Error calling Gemini API: {e}")
        return 50.0
