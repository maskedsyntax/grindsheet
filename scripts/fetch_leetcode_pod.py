import requests
import json
from datetime import datetime


def fetch_leetcode_daily():
    """Fetch LeetCode's daily problem and return details as JSON."""
    # Leetcode GraphQL endpoint
    # IMP: unofficial, may change
    url = "https://leetcode.com/graphql"

    # Query to fetch Problem of the Day details
    query = """
    query questionOfToday {
        activeDailyCodingChallengeQuestion {
            date
            question {
                title
                titleSlug
                difficulty
                topicTags {
                    name
                }
            }
        }
    }
    """

    try:
        response = requests.post(url, json={"query": query})
        response.raise_for_status()

        data = response.json()
        question_data = data["data"]["activeDailyCodingChallengeQuestion"]

        # Extract relevant information
        date = question_data["date"]
        question = question_data["question"]
        title = question["title"]
        title_slug = question["titleSlug"]
        difficulty = question["difficulty"]
        topics = [tag["name"] for tag in question["topicTags"]]

        # Build problem URL from title slug
        problem_url = f"https://leetcode.com/problems/{title_slug}/"

        # JSON output
        output = {
            "date": date,
            "title": title,
            "difficulty": difficulty,
            "topics": topics,
            "url": problem_url,
        }

        print(json.dumps(output, indent=2))

    except requests.exceptions.RequestException as e:
        # Network or HTTP errors
        print(json.dumps({"error": f"Error fetching data: {e}"}))
    except KeyError as e:
        # Malformed response
        print(json.dumps({"error": f"Error parsing response: {e}"}))


if __name__ == "__main__":
    fetch_leetcode_daily()
