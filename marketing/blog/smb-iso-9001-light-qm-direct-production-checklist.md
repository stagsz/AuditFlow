# Direct Production Checklist — SMB light-QM Blog Post

## Prerelease
- [ ] Director review completed in `marketing/blog/APPROVAL-REVIEW.md`
- [ ] Post approved for publish
- [ ] Slug works: `/blog/smb-iso-9001-light-qm`
- [ ] Frontend page exists and builds:
  - `frontend/src/app/blog/smb-iso-9001-light-qm/page.mdx`
  - `frontend/src/app/blog/index.mdx` links the post

## Deploy Verification
- [ ] Frontend builds clean at project root
- [ ] Vercel deploy succeeds without route/build errors
- [ ] Live page loads on production domain
- [ ] Meta title + description render correctly
- [ ] Internal links resolve
- [ ] No broken markdown/MDX frontmatter errors

## Post-Publish
- [ ] Confirm live at `https://audit-flow.org/blog/smb-iso-9001-light-qm`
- [ ] Record completion in `HERMES_KANBAN_BOARD=company` and mark publish task done
- [ ] Archive collateral task and approval batch
