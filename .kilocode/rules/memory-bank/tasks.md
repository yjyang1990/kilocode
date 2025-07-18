# Documentation Tasks

This file documents common repetitive tasks and workflows for maintaining the Kilo Code documentation site.

## Add New Provider Documentation

**Last performed:** Initial documentation setup
**Files to modify:**
- `/docs/providers/[provider-name].md` - Create new provider documentation
- `/sidebars.ts` - Add provider to navigation structure
- `/src/constants.ts` - Add provider URLs if needed

**Steps:**
1. Create new provider documentation file in `/docs/providers/`
2. Follow the standard provider documentation template:
   - Introduction and website link
   - Getting an API Key section
   - Supported Models section
   - Configuration in Kilo Code section
   - Tips and Notes section
3. Add provider to the Model Providers section in `sidebars.ts`
4. Update constants file if new URLs are needed
5. Test documentation locally with `npm start`
6. Verify all links work correctly

**Template structure:**
```markdown
---
sidebar_label: Provider Name
---

# Using [Provider Name] With Kilo Code

Brief description of the provider and their strengths.

**Website:** [Provider URL]

## Getting an API Key
[Step-by-step instructions]

## Supported Models
[List of supported models]

## Configuration in Kilo Code
[Setup instructions]

## Tips and Notes
[Additional helpful information]
```

## Add New Tool Documentation

**Last performed:** Tool reference documentation setup
**Files to modify:**
- `/docs/features/tools/[tool-name].md` - Create new tool documentation
- `/sidebars.ts` - Add tool to Tools Reference section
- `/docs/features/tools/tool-use-overview.md` - Update tool overview if needed

**Steps:**
1. Create new tool documentation file in `/docs/features/tools/`
2. Follow the standard tool documentation template
3. Add tool to the Tools Reference section in `sidebars.ts`
4. Update tool overview page if the tool represents a new category
5. Test documentation locally
6. Verify code examples and parameter descriptions are accurate

**Important notes:**
- Include practical examples of tool usage
- Document all parameters with their types and requirements
- Explain when and why to use the tool
- Include common error scenarios and solutions

## Update Feature Documentation

**Last performed:** Feature documentation organization
**Files to modify:**
- Relevant feature documentation files in `/docs/features/`
- `/sidebars.ts` - Update navigation if structure changes
- `/docs/index.mdx` - Update feature highlights if major features added

**Steps:**
1. Identify which feature documentation needs updates
2. Review current documentation for accuracy
3. Update content to reflect latest extension capabilities
4. Add new screenshots if UI has changed
5. Update navigation structure if needed
6. Test all internal links
7. Verify examples still work with current extension version

**Important considerations:**
- Keep screenshots current with latest extension UI
- Ensure feature descriptions match actual extension behavior
- Update version-specific information
- Maintain consistency in documentation style

## Add New Blog Post

**Last performed:** Auto-generate commit messages blog post
**Files to modify:**
- `/blog-posts/[post-name].md` - Create new blog post
- Consider adding to main documentation if content is reference material

**Steps:**
1. Create new blog post file in `/blog-posts/`
2. Follow the established blog post style and tone
3. Include practical examples and real-world usage
4. Add relevant images to `/static/img/` if needed
5. Consider if content should also be added to main documentation
6. Review for clarity and technical accuracy

**Content guidelines:**
- Focus on practical benefits and real-world usage
- Include specific examples and code snippets
- Maintain conversational but informative tone
- Link to relevant documentation sections

## Update Provider API Changes

**Last performed:** Provider documentation updates
**Files to modify:**
- Relevant provider documentation in `/docs/providers/`
- `/docs/getting-started/connecting-api-provider.md` - If setup process changes

**Steps:**
1. Identify which providers have API changes
2. Update supported models lists
3. Update configuration instructions if needed
4. Update pricing information references
5. Test configuration steps with actual provider APIs
6. Update screenshots if provider UIs have changed

**Important notes:**
- Verify model names and capabilities with provider documentation
- Check for new authentication methods or requirements
- Update rate limit information if changed
- Ensure all external links are still valid

## Reorganize Documentation Structure

**Last performed:** Features section reorganization
**Files to modify:**
- `/sidebars.ts` - Primary navigation structure changes
- `/docusaurus.config.ts` - Add redirects for moved content
- Multiple documentation files - Update internal links

**Steps:**
1. Plan new documentation structure
2. Update `sidebars.ts` with new organization
3. Add redirects in `docusaurus.config.ts` for moved content
4. Update internal links throughout documentation
5. Test all navigation paths
6. Verify search functionality still works
7. Update any hardcoded paths in components

**Important considerations:**
- Always add redirects for moved content to prevent broken links
- Update internal link references throughout the site
- Test navigation flow from user perspective
- Consider impact on external links and bookmarks

## Add New Custom Component

**Last performed:** YouTube embed and image components
**Files to modify:**
- `/src/components/[ComponentName]/` - Create new component directory
- `/src/theme/MDXComponents.ts` - Register component for MDX usage
- Documentation files where component will be used

**Steps:**
1. Create component directory in `/src/components/`
2. Implement React component with TypeScript
3. Add component styles in separate CSS module if needed
4. Register component in `MDXComponents.ts` for MDX usage
5. Test component in development environment
6. Document component usage for other contributors
7. Use component in relevant documentation files

**Component guidelines:**
- Follow existing component patterns and styling
- Use TypeScript for type safety
- Include proper error handling
- Make components reusable and configurable
- Follow accessibility best practices