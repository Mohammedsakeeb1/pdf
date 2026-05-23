# PDF Toolkit

A professional, SaaS-level web application for managing PDF files directly in your browser. This toolkit provides essential PDF operations like merging and splitting without any backend processing, ensuring maximum privacy and speed.

## Tech Stack
- **Structure**: HTML5
- **Styling**: CSS3, Bootstrap 5
- **Logic**: Vanilla JavaScript
- **Libraries (Future)**: 
  - `pdf-lib` (PDF manipulation)
  - `PDF.js` (PDF rendering)
  - `FileSaver.js` (Saving files)
  - `SortableJS` (Drag and drop reordering)

## Folder Structure
```
/pdf-toolkit
│
├── index.html       # Landing page / Dashboard
├── merge.html       # PDF Merger tool
├── split.html       # PDF Splitter tool
│
├── /css
│   ├── style.css    # Global design system & shared styles
│   ├── merge.css    # Merger-specific styles
│   ├── split.css    # Splitter-specific styles
│
├── /js
│   ├── app.js       # Shared app logic
│   ├── merge.js     # PDF Merger logic
│   ├── split.js     # PDF Splitter logic
│
├── /assets          # Static assets
│   ├── icons
│   ├── images
│
└── README.md
```

## Work in Progress
This project is currently in the initial setup phase. Core functionality and PDF processing logic are yet to be implemented.
