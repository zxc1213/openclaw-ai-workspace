# BrowserWing API Commands & Examples

## Core Commands Quick Reference

### Navigation
- `POST /navigate` - Navigate to URL
- `POST /go-back` - Go back in history
- `POST /go-forward` - Go forward in history
- `POST /reload` - Reload current page

### Element Interaction
- `POST /click` - Click element (supports: RefID `@e1`, CSS selector, XPath, text content)
- `POST /type` - Type text into input (supports: RefID `@e3`, CSS selector, XPath)
- `POST /select` - Select dropdown option
- `POST /hover` - Hover over element
- `POST /wait` - Wait for element state (visible, hidden, enabled)
- `POST /press-key` - Press keyboard key (Enter, Tab, Ctrl+S, etc.)

### Data Extraction
- `POST /extract` - Extract data from elements (supports multiple elements, custom fields)
- `POST /get-text` - Get element text content
- `POST /get-value` - Get input element value
- `GET /page-info` - Get page URL and title
- `GET /page-text` - Get all page text
- `GET /page-content` - Get full HTML

### Page Analysis
- `GET /snapshot` - Get accessibility snapshot (⭐ **ALWAYS call after navigation**)
- `GET /clickable-elements` - Get all clickable elements
- `GET /input-elements` - Get all input elements

### Advanced
- `POST /screenshot` - Take page screenshot (base64 encoded)
- `POST /evaluate` - Execute JavaScript code
- `POST /batch` - Execute multiple operations in sequence
- `POST /scroll-to-bottom` - Scroll to page bottom
- `POST /resize` - Resize browser window
- `POST /tabs` - Manage browser tabs (list, new, switch, close)
- `POST /fill-form` - Intelligently fill multiple form fields at once

### Debug & Monitoring
- `GET /console-messages` - Get browser console messages
- `GET /network-requests` - Get network requests made by the page
- `POST /handle-dialog` - Configure JavaScript dialog handling
- `POST /file-upload` - Upload files to input elements
- `POST /drag` - Drag and drop elements
- `POST /close-page` - Close the current page/tab

## Common Operations (with EXECUTOR_URL)

```bash
EXECUTOR_URL="${BROWSERWING_EXECUTOR_URL:-http://127.0.0.1:8080}"

# Navigate to URL
curl -X POST "${EXECUTOR_URL}/api/v1/executor/navigate" \
  -H 'Content-Type: application/json' \
  -d '{"url": "https://example.com"}'

# Click Element (by RefID, CSS, XPath, or text)
curl -X POST "${EXECUTOR_URL}/api/v1/executor/click" \
  -H 'Content-Type: application/json' \
  -d '{"identifier": "@e1"}'

# Type Text
curl -X POST "${EXECUTOR_URL}/api/v1/executor/type" \
  -H 'Content-Type: application/json' \
  -d '{"identifier": "@e3", "text": "user@example.com"}'

# Extract Data
curl -X POST "${EXECUTOR_URL}/api/v1/executor/extract" \
  -H 'Content-Type: application/json' \
  -d '{
    "selector": ".product-item",
    "fields": ["text", "href"],
    "multiple": true
  }'

# Wait for Element
curl -X POST "${EXECUTOR_URL}/api/v1/executor/wait" \
  -H 'Content-Type: application/json' \
  -d '{"identifier": ".loading", "state": "hidden", "timeout": 10}'

# Batch Operations
curl -X POST "${EXECUTOR_URL}/api/v1/executor/batch" \
  -H 'Content-Type: application/json' \
  -d '{
    "operations": [
      {"type": "navigate", "params": {"url": "https://example.com"}, "stop_on_error": true},
      {"type": "click", "params": {"identifier": "@e1"}, "stop_on_error": true},
      {"type": "type", "params": {"identifier": "@e3", "text": "query"}, "stop_on_error": true}
    ]
  }'
```

## Common Scenarios

### Form Filling
1. Navigate to form page
2. Get accessibility snapshot to find input elements and their RefIDs
3. Use `/type` for each field: `@e1`, `@e2`, etc.
4. Use `/select` for dropdowns
5. Click submit button using its RefID

### Data Scraping
1. Navigate to target page
2. Wait for content to load with `/wait`
3. Use `/extract` with CSS selector and `multiple: true`
4. Specify fields to extract: `["text", "href", "src"]`

### Search Operations
1. Navigate to search page
2. Get accessibility snapshot to locate search input
3. Type search query into input
4. Press Enter or click search button
5. Wait for results
6. Extract results data

### Login Automation
1. Navigate to login page
2. Get accessibility snapshot to find RefIDs
3. Type username: `@e2`
4. Type password: `@e3`
5. Click login button: `@e1`
6. Wait for success indicator

## Response Format

All operations return:
```json
{
  "success": true,
  "message": "Operation description",
  "timestamp": "2026-01-15T10:30:00Z",
  "data": {
    // Operation-specific data
  }
}
```

**Error response:**
```json
{
  "error": "error.operationFailed",
  "detail": "Detailed error message"
}
```
