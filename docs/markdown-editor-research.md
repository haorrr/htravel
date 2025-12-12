# React Markdown Editor Research for Article CMS

## Recommended: @uiw/react-md-editor

**Why**: Actively maintained (v4.0.8, 4mo old), lightweight textarea-based architecture, no CodeMirror/Monaco dependency.

**Bundle Size**: Check [Bundlephobia](https://bundlephobia.com/package/@uiw/react-md-editor) for exact gzipped size (lightweight by design).

**Key Features**:
- Markdown syntax highlighting (optional `@uiw/react-md-editor/nohighlight` to reduce bundle)
- GitHub Flavored Markdown
- Dark mode support
- Line operations (Ctrl+D duplicate, Alt+Arrow movement)
- Live preview
- Textarea-based (no external editors)
- Custom toolbar support
- Mermaid diagram support

**Image Handling**: Uses clipboard event API with `onPaste` prop. Requires custom implementation:
```javascript
editor.addEventListener('paste', (e) => {
  const file = e.clipboardData.files[0];
  if (file?.type.startsWith('image/')) {
    uploadImage(file).then(url => insertMarkdown(`![](${url})`));
  }
});
```

**Vietnamese Support**: i18n-ready with custom commands (reference: commands-cn pattern). Toolbar text customizable.

**Styling**: CSS variable customization, no CSS framework dependency.

**React 19**: Untested officially (pinned to React 18.2 types). Likely works as standard React component using hooks. Verify in your environment.

---

## Alternatives Comparison

| Feature | react-md-editor | react-markdown-editor-lite | react-simplemde-editor |
|---------|-----------------|---------------------------|----------------------|
| **Maintenance** | Active (v4.0.8) | Unmaintained (v1.3.4, 3y) | Stale (v5.2.0, 3y) |
| **Bundle Size** | Lightweight | ~20KB gzip | Large (~600KB+) |
| **Dependencies** | Minimal | Minimal | EasyMDE peer dependency |
| **SSR Support** | Yes (Next.js) | Yes (Gatsby, Next.js) | Limited |
| **Features** | Essential | Rich plugin system | User-friendly toolbar |
| **Code Highlighting** | Optional | Built-in | Built-in |
| **Image Upload** | Manual implementation | Manual implementation | Limited support |
| **Downloads/week** | 378 | 24,981 | ~5,000 |

**Legend**: react-markdown-editor-lite has popularity but stale maintenance. SimpleMDE depends on EasyMDE (large bundle). react-md-editor balances simplicity + active support.

---

## Integration Strategy for Article CMS

**Architecture**:
```
MarkdownEditor (React 19)
  ├── Toolbar (custom buttons: Bold, Image, Preview)
  ├── Editor Area (textarea-based)
  ├── Live Preview (right pane)
  └── Image Upload Handler (form submission)
```

**State Management with React Query**:
```typescript
// Hook for image uploads
useUploadImageMutation({
  onSuccess: (url) => insertMarkdown(`![alt](${url})`)
});

// Hook for article save
useSaveArticleMutation({
  onSuccess: () => invalidateQueries('articles')
});
```

**File Upload Flow**:
1. User pastes/drags image → clipboard handler captures file
2. Multer validates MIME type + magic bytes (backend)
3. Sharp optimizes image (resize, compress)
4. Return CDN URL → insert markdown syntax
5. User can edit alt text in preview

**Language Setup** (Vietnamese):
```typescript
const commands = [
  { name: 'bold', label: 'Đậm' },
  { name: 'italic', label: 'Nghiêng' },
  { name: 'image', label: 'Hình ảnh' }
];
```

---

## Production Checklist

- [ ] Test React 19 compatibility in dev environment
- [ ] Implement image upload endpoint (validate + compress)
- [ ] Add Vietnamese i18n for toolbar
- [ ] Use `@uiw/react-md-editor/nohighlight` if syntax highlighting not needed
- [ ] Set up React Query for mutation + invalidation
- [ ] Configure CORS for image uploads
- [ ] Implement error handling for image upload failures
- [ ] Add unit tests for editor integration
- [ ] Monitor bundle size with bundlephobia

---

## Sources

- [npm: @uiw/react-md-editor](https://www.npmjs.com/package/@uiw/react-md-editor)
- [GitHub: uiwjs/react-md-editor](https://github.com/uiwjs/react-md-editor)
- [Bundlephobia: @uiw/react-md-editor](https://bundlephobia.com/package/@uiw/react-md-editor)
- [Official Demo](https://uiwjs.github.io/react-md-editor/)
- [npm Trends: Comparison](https://npmtrends.com/react-markdown-editor-lite-vs-react-md-editor-vs-react-mde-vs-simple-markdown-vs-simplemde)
- [React Markdown CMS Guide](https://www.rowy.io/blog/react-markdown-cms)
- [Contentful: React Markdown Integration](https://www.contentful.com/blog/react-markdown/)
- [MDXEditor: i18n Support](https://mdxeditor.dev/editor/docs/i18n)
