"""
# tool
name: wikipedia
description: Searches Wikipedia and returns a summary or full text of the given topic, along with the page URL.
arguments:
    query:
        description: The topic to search on Wikipedia.
    
"""
import sys
from smolagents.default_tools import WikipediaSearchTool

executor = WikipediaSearchTool(
    user_agent="Agent Smith",
)

print(executor.forward(sys.argv[1]))