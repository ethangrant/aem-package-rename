# AEM Package Rename Tool

Utility for renaming Adobe Experience Manager (AEM) packages by modifying both folder names and file contents.

## Features

- Unzips AEM packages
- Renames folders containing the old sitename
- Updates file contents to replace old sitename with new sitename
- Creates a new zip file with the modified contents
- Provides detailed console output of changes made

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## Installation

1. Clone this repository:
```bash
git clone <repository-url>
cd aem-package-rename
```

2. Install dependencies:
```bash
npm install
```

## How It Works

1. **Unzip Package**: Extracts the contents of the AEM package to a temporary directory
2. **Rename Folders**: Recursively searches for and renames folders containing the old sitename
3. **Update Files**: Scans all files and replaces instances of the old sitename with the new one
4. **Create New Package**: Creates a new zip file with the modified contents