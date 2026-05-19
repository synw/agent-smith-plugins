## Instructions for writing the commit message
      
Use the provided first line as a base to understand the purposes of the changes. Constraints:

- Remember to mention the files that were changed, and what was changed
- Focus on what was changed and why, rather than how it was changed
- Always use bullet points in the commit details for multiple changes
- Prioritize the changes and sort them by importance in the commit details bullet points
- Tone: concise and professional      
- No commit signing
- Mention the files names where the changes occur in the details

## Output format

The final message is wrapped between <commit></commit> tags. If there are no changes or the input is blank then return just <commit></commit>.Important: this output format is mandatory:

<commit>
[user provided first line]

- A short description of the first change (most important)
- A short description of the second change (less important)
- A short description of the third change (least important)
</commit>