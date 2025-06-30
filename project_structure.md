# Hydrographer's Companion - Modular Structure

## Project Structure
```
hydcom/
├── App.js                     # Main app entry point (clean & small)
├── src/
│   ├── components/
│   │   ├── GPSStatus.js       # GPS location display component
│   │   ├── SampleForm.js      # Sample collection modal
│   │   ├── SurveyForm.js      # Cross-section survey modal
│   │   └── DataExport.js      # Export functionality
│   ├── utils/
│   │   ├── calculations.js    # Survey calculations (rise/fall, misclose)
│   │   ├── gpsUtils.js        # GPS and location utilities
│   │   └── exportUtils.js     # Data export formatting
│   ├── styles/
│   │   └── AppStyles.js       # Centralized styles
│   └── hooks/
│       ├── useLocation.js     # GPS location hook
│       ├── useSamples.js      # Sample management hook
│       └── useSurveys.js      # Survey management hook
└── package.json
```

## Benefits of This Structure

1. **Maintainable**: Each feature in its own file
2. **Reusable**: Components can be easily reused
3. **Testable**: Individual functions can be tested separately
4. **Scalable**: Easy to add new features without cluttering main app
5. **Clean**: Main App.js becomes a simple coordinator

## Implementation Plan

1. **App.js** - Main coordinator (≈100 lines)
2. **Components** - UI elements and forms
3. **Utils** - Pure functions for calculations
4. **Hooks** - State management logic
5. **Styles** - Centralized styling

This structure follows React best practices and makes the codebase professional and maintainable.