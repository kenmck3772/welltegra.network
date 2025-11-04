## Code Refactoring Guide for Well-Tegra

### Overview

This guide documents the refactoring from monolithic `app.js` to a modular architecture that reduces global scope pollution and improves maintainability.

### Architecture Changes

**Before (Monolithic)**:
- Single 7,367-line `app.js` file
- Global variables polluting window scope
- Tightly coupled components
- Difficult to test and maintain

**After (Modular)**:
- Core application module (`app-core.js`)
- Feature-based modules (`modules/*.module.js`)
- Centralized state management
- Event-driven communication
- Easy to test and extend

### Core Components

#### 1. App Core (`app-core.js`)

The central hub that provides:

- **State Management**: Centralized application state
- **Module Registry**: Register and retrieve modules
- **Event Bus**: Inter-module communication
- **Lifecycle Management**: Initialize and coordinate modules

```javascript
// Access the core
const app = window.WellTegraApp;

// Update state
app.setState({ selectedWell: wellData });

// Subscribe to state changes
app.on('state:change', (data) => {
    console.log('State updated:', data.changes);
});

// Emit custom events
app.emit('plan:generated', planData);
```

#### 2. Module Pattern

Each module follows this structure:

```javascript
(function(window) {
    'use strict';

    const MyModule = {
        name: 'myModule',

        // Module initialization
        init() {
            this.cacheElements();
            this.bindEvents();
            console.log('[MyModule] Ready');
        },

        // Cache DOM elements
        cacheElements() {
            this.elements = {
                button: document.getElementById('my-button')
            };
        },

        // Bind event listeners
        bindEvents() {
            this.elements.button?.addEventListener('click', () => {
                this.handleClick();
            });
        },

        // Public methods
        handleClick() {
            window.WellTegraApp.emit('button:clicked');
        }
    };

    // Register with core
    window.WellTegraApp.registerModule('myModule', MyModule);

    // Export
    window.MyModule = MyModule;

})(window);
```

### Migration Steps

#### Step 1: Identify Logical Modules

Break down `app.js` into logical units:

- **Navigation** - View routing and tab management
- **Planner** - Well planning logic
- **Analytics** - Data visualization
- **Logistics** - Equipment and personnel management
- **Commercial** - Financial dashboards
- **HSE** - Safety and risk management
- **DataExport** - CSV/JSON export functionality

#### Step 2: Extract Module Code

For each module:

1. Copy related code from `app.js`
2. Wrap in module pattern
3. Replace global variables with module state
4. Use app core for shared state
5. Emit events instead of direct function calls

**Before**:
```javascript
// Global variable
let selectedWell = null;

// Global function
function selectWell(well) {
    selectedWell = well;
    updateUI();
}
```

**After**:
```javascript
const PlannerModule = {
    init() {
        window.WellTegraApp.on('well:selected', (well) => {
            this.handleWellSelection(well);
        });
    },

    handleWellSelection(well) {
        window.WellTegraApp.setState({ selectedWell: well });
        this.updatePlannerUI();
    },

    updatePlannerUI() {
        const state = window.WellTegraApp.getState();
        // Update UI based on state
    }
};
```

#### Step 3: Update Event Handling

**Before** (Direct function calls):
```javascript
generatePlanBtn.addEventListener('click', () => {
    const plan = generatePlan(selectedWell);
    updateAnalytics(plan);
    updateCommercial(plan);
});
```

**After** (Event-driven):
```javascript
// In Planner module
generatePlanBtn.addEventListener('click', () => {
    const plan = this.generatePlan();
    window.WellTegraApp.emit('plan:generated', plan);
});

// In Analytics module
window.WellTegraApp.on('plan:generated', (plan) => {
    this.updateAnalytics(plan);
});

// In Commercial module
window.WellTegraApp.on('plan:generated', (plan) => {
    this.updateCommercial(plan);
});
```

#### Step 4: Update State Management

**Before** (Global state):
```javascript
let appState = {
    selectedWell: null,
    generatedPlan: null
};

function updateState(newState) {
    appState = { ...appState, ...newState };
}
```

**After** (Centralized state):
```javascript
// Update state
window.WellTegraApp.setState({
    selectedWell: well,
    generatedPlan: plan
});

// Read state
const state = window.WellTegraApp.getState();
console.log(state.selectedWell);

// React to state changes
window.WellTegraApp.on('state:change', ({ changes }) => {
    if (changes.selectedWell) {
        this.handleWellChange(changes.selectedWell);
    }
});
```

### Module Examples

#### Example 1: Navigation Module

See `assets/js/modules/navigation.module.js` for a complete example.

Key features:
- Hash-based routing
- Tab activation
- Browser back/forward support
- Event-driven view changes

#### Example 2: Theme Module

```javascript
const ThemeModule = {
    name: 'theme',

    init() {
        this.cacheElements();
        this.bindEvents();
        this.applyTheme();
    },

    cacheElements() {
        this.elements = {
            toggleBtn: document.getElementById('theme-toggle-btn'),
            lightIcon: document.getElementById('theme-icon-light'),
            darkIcon: document.getElementById('theme-icon-dark')
        };
    },

    bindEvents() {
        this.elements.toggleBtn?.addEventListener('click', () => {
            this.toggleTheme();
        });

        // React to theme changes
        window.WellTegraApp.on('theme:change', (theme) => {
            this.updateIcons(theme);
        });
    },

    toggleTheme() {
        const currentTheme = window.WellTegraApp.getState().theme;
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        window.WellTegraApp.setTheme(newTheme);
    },

    applyTheme() {
        const theme = window.WellTegraApp.getState().theme;
        this.updateIcons(theme);
    },

    updateIcons(theme) {
        this.elements.lightIcon?.classList.toggle('hidden', theme === 'dark');
        this.elements.darkIcon?.classList.toggle('hidden', theme === 'light');
    }
};

window.WellTegraApp.registerModule('theme', ThemeModule);
```

### Loading Order

Update `index.html` to load modules in the correct order:

```html
<!-- 1. Core utilities -->
<script src="assets/js/security-utils.js"></script>
<script src="assets/js/fetch-utils.js"></script>
<script src="assets/js/performance-utils.js"></script>
<script src="assets/js/error-handler.js"></script>
<script src="assets/js/crypto-utils.js"></script>
<script src="assets/js/image-utils.js"></script>

<!-- 2. App core -->
<script src="assets/js/app-core.js"></script>

<!-- 3. Feature modules -->
<script src="assets/js/modules/navigation.module.js"></script>
<script src="assets/js/modules/theme.module.js"></script>
<script src="assets/js/modules/planner.module.js"></script>
<!-- ... other modules ... -->

<!-- 4. App initialization -->
<script>
document.addEventListener('DOMContentLoaded', () => {
    window.WellTegraApp.init();
});
</script>

<!-- 5. Legacy code (temporary) -->
<script src="assets/js/app.js" defer></script>
<script src="assets/js/mobile-communicator.js" defer></script>
```

### Testing Modules

Modules are easier to test in isolation:

```javascript
// test/navigation.test.js
describe('Navigation Module', () => {
    beforeEach(() => {
        // Setup mock app core
        window.WellTegraApp = {
            navigateTo: jest.fn(),
            on: jest.fn()
        };

        NavigationModule.init();
    });

    test('navigates to view', () => {
        NavigationModule.navigateTo('planner');
        expect(window.WellTegraApp.navigateTo).toHaveBeenCalledWith('planner');
    });
});
```

### Benefits

1. **Reduced Global Scope Pollution**
   - Before: ~50+ global variables/functions
   - After: 1 global object (`WellTegraApp`)

2. **Better Maintainability**
   - Modules are self-contained
   - Clear dependencies
   - Easier to understand

3. **Improved Testability**
   - Modules can be tested in isolation
   - Mock dependencies easily
   - Better code coverage

4. **Enhanced Debugging**
   - Module-specific console logs
   - Event tracing
   - State history

5. **Easier Collaboration**
   - Developers can work on separate modules
   - Less merge conflicts
   - Clear ownership

### Migration Checklist

- [ ] Create module structure (`assets/js/modules/`)
- [ ] Implement app core (`app-core.js`)
- [ ] Extract navigation module
- [ ] Extract theme module
- [ ] Extract planner module
- [ ] Extract analytics module
- [ ] Extract logistics module
- [ ] Extract commercial module
- [ ] Extract HSE module
- [ ] Update `index.html` load order
- [ ] Add integration tests
- [ ] Remove global variables
- [ ] Update documentation

### Backward Compatibility

During migration, both old and new code can coexist:

```javascript
// In app.js (legacy)
function selectWell(well) {
    // Old logic
    selectedWell = well;

    // Bridge to new system
    if (window.WellTegraApp) {
        window.WellTegraApp.setState({ selectedWell: well });
    }
}

// In new modules
window.WellTegraApp.on('state:change', ({ changes }) => {
    if (changes.selectedWell) {
        // New module logic
    }
});
```

### Next Steps

1. Start with non-critical modules (theme, navigation)
2. Gradually migrate features
3. Add tests as you go
4. Remove legacy code once migrated
5. Update documentation

### Resources

- [Module Pattern](https://addyosmani.com/resources/essentialjsdesignpatterns/book/#modulepatternjavascript)
- [Event-Driven Architecture](https://martinfowler.com/articles/201701-event-driven.html)
- [State Management Patterns](https://kentcdodds.com/blog/application-state-management-with-react)
