# Equipment Catalog & Tool String Builder Integration Guide

## Overview
This guide explains how to integrate the Equipment Catalog and Tool String Builder features into Well-Tegra v23.

## Files Created

### 1. **equipment-catalog.json** (70 equipment items)
Equipment database with 11 categories:
- Fishing Tools (11 items)
- Running & Jarring Tools (9 items)
- Wireline Tools (9 items)
- Centralizers & Stabilizers (3 items)
- Completion Tools (6 items)
- Bailers (3 items)
- Gas Lift Equipment (4 items)
- Otis Equipment (4 items - manufacturer specific)
- Baker Equipment (8 items - manufacturer specific)
- Camco Equipment (5 items - manufacturer specific)
- Miscellaneous Tools (8 items)

### 2. **service-line-templates.json** (20+ templates)
Pre-configured templates for:
- Coiled Tubing (CT) - 3 templates
- E-Line Services (ELS) - 4 templates
- Slickline (SLK) - 5 templates
- Wireline/Hydraulics (WHM) - 4 templates
- Specialized Operations - 3 templates

### 3. **equipment-catalog-integration.html**
Complete HTML/CSS/JavaScript code for:
- Equipment Catalog browser with search and filters
- Tool String Builder for creating reusable assemblies
- My Tool Strings manager for saved configurations
- Service Templates quick-start library

## Integration Steps

### Option A: Quick Integration (Copy-Paste)

1. **Add CSS to index.html**
   ```html
   <!-- In the <style> section, add: -->
   <style id="equipment-catalog-styles">
   [Copy CSS from equipment-catalog-integration.html lines 20-250]
   </style>
   ```

2. **Add HTML to Planner View**
   ```html
   <!-- In planner-view, after Step 2, add: -->
   <div id="equipment-tools-section">
   [Copy HTML from equipment-catalog-integration.html lines 255-420]
   </div>
   ```

3. **Add JavaScript**
   ```html
   <!-- Before closing </script> tag, add: -->
   <script id="equipment-catalog-script">
   [Copy JavaScript from equipment-catalog-integration.html lines 425-850]
   </script>
   ```

4. **Upload Data Files**
   - Upload `equipment-catalog.json` to root directory
   - Upload `service-line-templates.json` to root directory

### Option B: Modular Integration (Recommended for Production)

1. **Create separate JavaScript file:**
   ```bash
   # Create equipment-catalog.js with the JavaScript from integration file
   ```

2. **Add script reference in index.html:**
   ```html
   <script src="equipment-catalog.js"></script>
   ```

3. **Add CSS link:**
   ```html
   <link rel="stylesheet" href="equipment-catalog.css">
   ```

## Feature Overview

### 1. Equipment Catalog
- **Search**: Full-text search across equipment names, manufacturers, and applications
- **Filter**: Category filtering (fishing, running, wireline, completion, gas lift)
- **Details**: Each item shows name, manufacturer, applications, and quick-add button
- **Organization**: Grouped by logical categories with descriptions

### 2. Tool String Builder
- **Create**: Build custom tool string assemblies from equipment catalog
- **Preview**: Real-time preview of assembly as you build
- **Save**: Store unlimited tool strings in browser localStorage
- **Reuse**: Quick-load saved assemblies into new plans

### 3. My Tool Strings
- **Library**: Browse all saved tool strings
- **Details**: View components, service line, and creation date
- **Actions**: Use in plan or delete
- **Filtering**: Filter by service line (CT/ELS/SLK/WHM)

### 4. Service Templates
- **Pre-configured**: 20+ ready-to-use templates
- **Service-specific**: Templates organized by service line
- **Difficulty rating**: Simple/Standard/Complex/Expert ratings
- **Time estimates**: Duration estimates for planning
- **Manufacturer-specific**: Templates for Baker, Otis, Camco equipment

## Data Structure

### Equipment Item Format:
```json
{
  "id": "fish_001",
  "name": "2 Prong Grab",
  "category": "fishing",
  "manufacturer": "Generic",
  "applications": [
    "Fishing operations",
    "Tool retrieval"
  ],
  "notes": "Optional notes"
}
```

### Tool String Format:
```json
{
  "id": "1729637400123",
  "name": "Standard Fishing Assembly",
  "serviceLine": "ELS",
  "components": [
    { "id": "wire_001", "name": "Rope Socket", ... },
    { "id": "run_001", "name": "Power Jar", ... }
  ],
  "createdAt": "2025-10-22T12:30:00.000Z"
}
```

### Template Format:
```json
{
  "id": "ct_wellbore_cleanout",
  "name": "Wellbore Cleanout Package",
  "description": "Standard CT package...",
  "difficulty": "standard",
  "duration_hours": 12,
  "equipment_ids": ["run_006", "run_009", "cent_001"],
  "applications": ["Scale removal", "Debris cleanout"]
}
```

## API Reference

### Main Functions:

#### `loadEquipmentCatalog()`
Loads equipment catalog from JSON file. Call on page load.

#### `switchEquipmentTab(tabName)`
Switch between tabs: 'catalog', 'toolstrings', 'builder', 'templates'

#### `filterEquipmentCategory(category)`
Filter equipment by category: 'all', 'fishing', 'running', 'wireline', etc.

#### `addEquipmentToBuilder()`
Add selected equipment from dropdown to builder

#### `addEquipmentToBuilderDirect(item)`
Add equipment item directly (from catalog click)

#### `saveToolString()`
Save current builder assembly to localStorage

#### `deleteToolString(index)`
Delete saved tool string

#### `useToolString(index)`
Load tool string into active plan (TODO: integrate with main planner)

## Customization

### Adding New Equipment:
1. Edit `equipment-catalog.json`
2. Add item to appropriate category
3. Use sequential ID (e.g., 'fish_012')
4. Reload page

### Creating New Templates:
1. Edit `service-line-templates.json`
2. Add template to appropriate service line
3. Reference equipment by ID
4. Reload page

### Styling:
All styles are scoped to prevent conflicts:
- `.equipment-*` classes for equipment features
- `.tool-string-*` classes for tool string features
- Consistent with v23 color scheme (cyan/teal accent)

## Browser Compatibility

- **Modern Browsers**: Chrome, Firefox, Safari, Edge (latest 2 versions)
- **Storage**: Uses localStorage (supported in all modern browsers)
- **JSON**: Uses native Fetch API (polyfill not required for modern browsers)

## Performance Considerations

- Equipment catalog loaded once on page load
- Tool strings stored in localStorage (no server requests)
- Efficient DOM manipulation (minimal reflows)
- Lazy loading of tab content (only render active tab)

## Future Enhancements

### Planned Features:
1. **Equipment Diagrams**: Link technical drawings from Excel file
2. **Cost Estimation**: Integrate with job costing tool
3. **Availability Tracking**: Link to logistics/inventory system
4. **Collaborative Tool Strings**: Share tool strings between users
5. **AI Recommendations**: Suggest equipment based on objectives
6. **Export**: Export tool strings to PDF/Excel
7. **Import**: Import tool strings from files
8. **Version Control**: Track changes to tool strings
9. **Advanced Search**: Fuzzy search, filters by manufacturer
10. **Mobile Optimization**: Responsive design improvements

### Integration Points:
- **Planner**: Auto-add equipment to procedures
- **Performer**: Show tool string in real-time operations
- **Commercial**: Calculate costs for tool strings
- **Logistics**: Check equipment availability
- **HSE**: Link to equipment safety data sheets

## Troubleshooting

### Equipment catalog not loading:
- Check `equipment-catalog.json` exists in root directory
- Check browser console for CORS errors
- Verify JSON is valid (use JSONLint.com)

### Tool strings not saving:
- Check localStorage is enabled in browser
- Check storage quota (unlikely to hit with small data)
- Clear localStorage and retry: `localStorage.clear()`

### Styling conflicts:
- Equipment styles are scoped, but check for !important rules
- Verify Tailwind CSS classes don't override custom styles
- Check browser developer tools for CSS conflicts

## Testing

### Manual Testing Checklist:
- [ ] Load page, verify equipment catalog displays
- [ ] Search equipment, verify filtering works
- [ ] Add equipment to builder
- [ ] Save tool string, verify it appears in My Tool Strings
- [ ] Delete tool string, verify it's removed
- [ ] Switch between tabs, verify content loads
- [ ] Test on mobile/tablet viewports
- [ ] Test in different browsers
- [ ] Test with localStorage disabled
- [ ] Test with slow network (throttling)

### Automated Testing (Future):
```javascript
// Example test cases
describe('Equipment Catalog', () => {
  test('loads equipment catalog from JSON', async () => {
    await loadEquipmentCatalog();
    expect(equipmentCatalog).toBeDefined();
    expect(Object.keys(equipmentCatalog).length).toBeGreaterThan(0);
  });

  test('saves tool string to localStorage', () => {
    const toolString = {
      name: 'Test Assembly',
      components: []
    };
    savedToolStrings.push(toolString);
    saveToolStringsToStorage();
    const saved = localStorage.getItem('welltegra_toolstrings');
    expect(JSON.parse(saved)).toContain(toolString);
  });
});
```

## Support

For issues or questions:
1. Check browser console for error messages
2. Verify JSON files are valid and accessible
3. Review this integration guide
4. Check LEGACY_FILES_ANALYSIS.md for background context

## License

This equipment catalog integration is part of the Well-Tegra v23 platform.

## Credits

- Equipment data extracted from legacy Well-Tegra v11 application
- Technical drawings from Tool_Eqp drawings.xls.xlsx
- Tool String Builder concept ported from v11
- Integration created by Claude Code (2025-10-22)

---

*Last Updated: 2025-10-22*
*Version: 1.0*
