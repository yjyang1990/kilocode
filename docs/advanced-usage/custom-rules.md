# Custom Rules

Custom rules provide a powerful way to define project-specific behaviors and constraints for the Kilo Code AI agent. With custom rules, you can ensure consistent formatting, restrict access to sensitive files, enforce coding standards, and customize the AI's behavior for your specific project needs.

## Overview

Custom rules allow you to create text-based instructions that all AI models will follow when interacting with your project. These rules act as guardrails and conventions that are consistently respected across all interactions with your codebase.

## Rule Format

Custom rules can be written in plain text, but Markdown format is recommended for better structure and comprehension by the AI models. The structured nature of Markdown helps the models parse and understand your rules more effectively.

- Use Markdown headers (`#`, `##`, etc.) to define rule categories
- Use lists (`-`, `*`) to enumerate specific items or constraints
- Use code blocks (``` ```) to include code examples when needed

## Rule Location

Custom rules are stored in the `.kilocode/rules/` directory within your project. Each rule is typically placed in its own Markdown file with a descriptive name:

```
project/
├── .kilocode/
│   ├── rules/
│   │   ├── formatting.md
│   │   ├── restricted_files.md
│   │   └── naming_conventions.md
├── src/
└── ...
```

## Creating Custom Rules

To create a custom rule:

1. Create the `.kilocode/rules/` directory if it doesn't already exist
2. Create a new Markdown file with a descriptive name in this directory
3. Write your rule using Markdown formatting
4. Save the file

The rule will be automatically applied to all future Kilo Code interactions within your project.

## Example Rules

### Example 1: Table Formatting

```markdown
# Tables
When printing tables, always add an exclamation mark to each column header
```

This simple rule instructs the AI to add exclamation marks to all table column headers when generating tables in your project.

### Example 2: Restricted File Access

```markdown
# Restricted files
Files in the list contain sensitive data, they MUST NOT be read
- supersecrets.txt
- credentials.json
- .env
```

This rule prevents the AI from reading or accessing sensitive files, even if explicitly requested to do so.

## Use Cases

Custom rules can be applied to a wide variety of scenarios:

- **Code Style**: Enforce consistent formatting, naming conventions, and documentation styles
- **Security Controls**: Prevent access to sensitive files or directories
- **Project Structure**: Define where different types of files should be created
- **Documentation Requirements**: Specify documentation formats and requirements
- **Testing Patterns**: Define how tests should be structured
- **API Usage**: Specify how APIs should be used and documented
- **Error Handling**: Define error handling conventions

## Best Practices

- **Be Specific**: Clearly define the scope and intent of each rule
- **Use Categories**: Organize related rules under common headers
- **Separate Concerns**: Use different files for different types of rules
- **Use Examples**: Include examples to illustrate the expected behavior
- **Keep It Simple**: Rules should be concise and easy to understand
- **Update Regularly**: Review and update rules as project requirements change

## Limitations

- Rules are applied on a best-effort basis by the AI models
- Complex rules may require multiple examples for clear understanding
- Rules apply only to the project in which they are defined

## Troubleshooting

If your custom rules aren't being properly followed:

1. Check that your rules are properly formatted with clear Markdown structure
2. Ensure that your rules are located in the correct `.kilocode/rules/` directory
3. Verify that the rules are specific and unambiguous
4. Restart VS Code to ensure the rules are properly loaded

## Related Features

- [Custom Modes](/docs/features/custom-modes)
- [Settings Management](/docs/features/settings-management)
- [Auto-Approval Settings](/docs/features/auto-approving-actions)