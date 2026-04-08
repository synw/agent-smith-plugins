"""
# tool
name: smsearch
description: Search the web
arguments:
    query:
        description: the search query
"""
import sys
from smolagents.default_tools import WebSearchTool

executor = WebSearchTool()
print(executor.forward(sys.argv[1]))