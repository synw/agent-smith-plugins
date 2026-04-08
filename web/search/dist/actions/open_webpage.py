"""
# tool
name: open_webpage
description: Visits a webpage at the given url and reads its content as a markdown string. Use this to browse webpages.
arguments:
    url:
        description: The url of the page to get the content from
"""
import sys
from smolagents.default_tools import VisitWebpageTool

executor = VisitWebpageTool(15000)
print(executor.forward(sys.argv[1]))