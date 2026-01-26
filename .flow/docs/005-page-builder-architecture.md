# Page Builder Architecture - V2 Backend

> Task 1.5: Document page builder architecture

## Page Builder Overview

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           PAGE BUILDER HIERARCHY                                     │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  ┌─────────────────────────────────────────────────────────────────────────────┐   │
│  │  PAGES (918)                                                                 │   │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │   │
│  │  │ Dashboard   │ │ Transactions│ │  Network    │ │  Settings   │           │   │
│  │  │ /dashboard  │ │ /txn        │ │ /network    │ │ /settings   │           │   │
│  │  └──────┬──────┘ └──────┬──────┘ └──────┬──────┘ └─────────────┘           │   │
│  └─────────┼───────────────┼───────────────┼────────────────────────────────────┘   │
│            │               │               │                                         │
│            v               v               v                                         │
│  ┌─────────────────────────────────────────────────────────────────────────────┐   │
│  │  PAGE_TABS (919)                                                             │   │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐                            │   │
│  │  │  Overview   │ │  Pipeline   │ │  Downline   │                            │   │
│  │  │  (default)  │ │             │ │             │                            │   │
│  │  └──────┬──────┘ └──────┬──────┘ └──────┬──────┘                            │   │
│  └─────────┼───────────────┼───────────────┼────────────────────────────────────┘   │
│            │               │               │                                         │
│            v               v               v                                         │
│  ┌─────────────────────────────────────────────────────────────────────────────┐   │
│  │  PAGE_SECTIONS (920)                                                         │   │
│  │  ┌─────────────────────────────────────────────────┐                        │   │
│  │  │  Section: "Key Metrics"                         │                        │   │
│  │  │  ┌─────────────────────────────────────────────┐│                        │   │
│  │  │  │  PAGE_WIDGETS (921)                         ││                        │   │
│  │  │  │  ┌─────────┐ ┌─────────┐ ┌─────────┐       ││                        │   │
│  │  │  │  │ Widget1 │ │ Widget2 │ │ Widget3 │       ││                        │   │
│  │  │  │  │ (chart) │ │ (KPI)   │ │ (table) │       ││                        │   │
│  │  │  │  └─────────┘ └─────────┘ └─────────┘       ││                        │   │
│  │  │  └─────────────────────────────────────────────┘│                        │   │
│  │  └─────────────────────────────────────────────────┘                        │   │
│  └──────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Core Tables

### pages (Table ID: 918)

**Purpose**: Top-level page definitions for dashboard navigation.

| Field        | Type      | Required | Description      |
| ------------ | --------- | -------- | ---------------- |
| id           | int       | ✓        | Primary key      |
| created_at   | timestamp |          | Default: now     |
| name         | text      | ✓        | Display name     |
| slug         | text      | ✓        | URL path segment |
| icon         | text      | ✓        | Icon identifier  |
| description  | text      | ✓        | Page description |
| is_published | bool      |          | Default: true    |
| sort_order   | int       |          | Display order    |

### page_tabs (Table ID: 919)

**Purpose**: Tabs within pages for sub-navigation.

| Field      | Type      | Required | Description          |
| ---------- | --------- | -------- | -------------------- |
| id         | int       | ✓        | Primary key          |
| created_at | timestamp |          | Default: now         |
| name       | text      | ✓        | Tab display name     |
| slug       | text      | ✓        | URL path segment     |
| sort_order | int       |          | Display order        |
| is_default | bool      |          | Default tab for page |
| page_id    | int       |          | FK → pages           |
| icon       | text      |          | Tab icon             |

### page_sections (Table ID: 920)

**Purpose**: Sections within tabs - containers for widgets.

| Field      | Type      | Required | Description          |
| ---------- | --------- | -------- | -------------------- |
| id         | int       | ✓        | Primary key          |
| created_at | timestamp |          | Default: now         |
| name       | text      | ✓        | Section title        |
| subtitle   | text      |          | Section subtitle     |
| sort_order | int       |          | Display order        |
| layout     | text      |          | Layout configuration |
| page_id    | int       |          | FK → pages           |
| tab_id     | int       |          | FK → page_tabs       |

### page_widgets (Table ID: 921)

**Purpose**: Links charts to sections with grid positioning.

| Field            | Type      | Required | Description            |
| ---------------- | --------- | -------- | ---------------------- |
| id               | int       | ✓        | Primary key            |
| created_at       | timestamp |          | Default: now           |
| section_id       | int       |          | FK → page_sections     |
| chart_catalog_id | int       |          | FK → chart_catalog     |
| grid_position    | json      |          | Position/size config   |
| sort_order       | int       |          | Display order          |
| is_visible       | bool      |          | Default: true          |
| config_overrides | json      |          | Chart config overrides |

---

## Chart System

### chart_catalog (Table ID: 912)

**Purpose**: Master catalog of available charts and KPIs.

| Field              | Type      | Description                      |
| ------------------ | --------- | -------------------------------- |
| id                 | int       | Primary key                      |
| created_at         | timestamp | Default: now                     |
| chart_id           | text      | Unique chart identifier          |
| display_name       | text      | Human-readable name              |
| description        | text      | Chart description                |
| category           | text      | chart/kpi/table (default: chart) |
| section            | text      | Grouping section                 |
| icon               | text      | Display icon                     |
| is_enabled         | bool      | Available to users               |
| is_default         | bool      | Auto-add to new dashboards       |
| sort_order         | int       | Display order                    |
| default_config     | json      | Default chart configuration      |
| default_size       | json      | Default grid size                |
| smart_chart_config | json      | AI/smart chart settings          |

### chart_types (Table ID: 922)

**Purpose**: Chart type definitions (bar, line, pie, etc.).

| Field       | Type      | Required | Description         |
| ----------- | --------- | -------- | ------------------- |
| id          | int       | ✓        | Primary key         |
| created_at  | timestamp |          | Default: now        |
| name        | text      | ✓        | Type name           |
| slug        | text      | ✓        | URL-safe identifier |
| description | text      |          | Type description    |
| engine      | text      |          | Rendering engine    |
| category    | text      |          | Chart category      |
| icon        | text      |          | Display icon        |

### chart_libraries (Table ID: 923)

**Purpose**: Supported chart rendering libraries.

| Field             | Type      | Required | Description           |
| ----------------- | --------- | -------- | --------------------- |
| id                | int       | ✓        | Primary key           |
| created_at        | timestamp |          | Default: now          |
| name              | text      | ✓        | Library name          |
| slug              | text      | ✓        | URL-safe identifier   |
| license_type      | text      |          | MIT/Apache/Commercial |
| license_cost      | text      |          | Cost info             |
| documentation_url | text      |          | Docs URL              |
| is_active         | bool      |          | Currently supported   |

---

## Filter System

### page_filters (Table ID: 924)

**Purpose**: Admin-configurable filters per page/tab.

| Field         | Type      | Description          |
| ------------- | --------- | -------------------- |
| id            | int       | Primary key          |
| created_at    | timestamp | Default: now         |
| filter_type   | text      | select/date/text/etc |
| filter_key    | text      | API parameter key    |
| label         | text      | Display label        |
| placeholder   | text      | Input placeholder    |
| default_value | json      | Default selection    |
| is_visible    | bool      | Show filter          |
| sort_order    | int       | Display order        |
| is_required   | bool      | Required filter      |
| page_id       | int       | FK → pages           |
| tab_id        | int       | FK → page_tabs       |

### page_filter_options (Table ID: 925)

**Purpose**: Options for select-type filters.

---

## Responsive Layout System

### widget_viewport_layouts (Table ID: 927)

**Purpose**: Responsive grid positions per viewport.

| Field         | Type      | Description                |
| ------------- | --------- | -------------------------- |
| id            | int       | Primary key                |
| created_at    | timestamp | Default: now               |
| widget_id     | int       | FK → page_widgets          |
| viewport      | text      | desktop/tablet/mobile      |
| grid_position | json      | Position/size for viewport |
| visible       | bool      | Show on this viewport      |
| updated_at    | timestamp | Last update                |

---

## User Customization

### user_dashboard_configuration (Table ID: 907)

**Purpose**: User's custom widget selections.

| Field            | Type      | Description          |
| ---------------- | --------- | -------------------- |
| id               | int       | Primary key          |
| created_at       | timestamp | Default: now         |
| user_id          | int       | FK → user            |
| section_id       | int       | FK → page_sections   |
| chart_id         | text      | Chart identifier     |
| chart_catalog_id | int       | FK → chart_catalog   |
| scope            | text      | Scope/context        |
| display_order    | int       | Widget order         |
| grid_column      | int       | Column position      |
| grid_row         | int       | Row position         |
| grid_width       | int       | Width in grid units  |
| grid_height      | int       | Height in grid units |

### user_dashboard_sections (Table ID: 906)

**Purpose**: User-created sections for organizing widgets.

### user_filter_preferences (Table ID: 926)

**Purpose**: User's saved filter values per page/tab.

### user_preferences (Table ID: 711)

**Purpose**: General UI preferences (view modes, table settings).

---

## Entity Relationships

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           PAGE BUILDER ERD                                          │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  ┌──────────┐                                                                       │
│  │  pages   │                                                                       │
│  │  (918)   │                                                                       │
│  └────┬─────┘                                                                       │
│       │                                                                             │
│       │ 1:N                                                                         │
│       v                                                                             │
│  ┌──────────┐         ┌──────────────┐                                             │
│  │page_tabs │         │ page_filters │                                             │
│  │  (919)   │         │    (924)     │                                             │
│  └────┬─────┘         └──────────────┘                                             │
│       │                      │                                                      │
│       │ 1:N                  │ 1:N                                                  │
│       v                      v                                                      │
│  ┌─────────────┐      ┌──────────────────┐                                         │
│  │page_sections│      │page_filter_options│                                         │
│  │   (920)     │      │     (925)         │                                         │
│  └────┬────────┘      └──────────────────┘                                         │
│       │                                                                             │
│       │ 1:N                                                                         │
│       v                                                                             │
│  ┌─────────────┐      ┌──────────────────┐                                         │
│  │page_widgets │──────│chart_catalog     │                                         │
│  │   (921)     │ N:1  │    (912)         │                                         │
│  └────┬────────┘      └────────┬─────────┘                                         │
│       │                        │                                                    │
│       │ 1:N                    │ N:1                                               │
│       v                        v                                                    │
│  ┌────────────────────┐  ┌──────────────┐                                          │
│  │widget_viewport_    │  │ chart_types  │                                          │
│  │   layouts (927)    │  │    (922)     │                                          │
│  └────────────────────┘  └──────────────┘                                          │
│                                                                                      │
│                                                                                      │
│  ┌─────────────────────────────────────────────────────────────────┐               │
│  │                    USER CUSTOMIZATION                           │               │
│  │                                                                 │               │
│  │  ┌──────────┐      ┌─────────────────────┐                     │               │
│  │  │   user   │─────>│user_dashboard_config│                     │               │
│  │  │          │ 1:N  │       (907)         │                     │               │
│  │  └──────────┘      └─────────────────────┘                     │               │
│  │       │                    │                                    │               │
│  │       │ 1:N                │ N:1                               │               │
│  │       v                    v                                    │               │
│  │  ┌─────────────────┐ ┌──────────────┐                          │               │
│  │  │user_filter_     │ │chart_catalog │                          │               │
│  │  │  preferences    │ │   (912)      │                          │               │
│  │  │    (926)        │ └──────────────┘                          │               │
│  │  └─────────────────┘                                            │               │
│  └─────────────────────────────────────────────────────────────────┘               │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Page Builder Data Flow

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           PAGE RENDERING FLOW                                        │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  1. USER NAVIGATES TO PAGE                                                          │
│     ┌──────────────────────────────────────────────────────────────────┐           │
│     │  GET /api/pages/:slug                                            │           │
│     │  → Returns: page + tabs + sections + widgets                     │           │
│     └──────────────────────────────────────────────────────────────────┘           │
│                                                                                      │
│  2. LOAD USER CUSTOMIZATIONS                                                        │
│     ┌──────────────────────────────────────────────────────────────────┐           │
│     │  GET /api/user/:id/dashboard-config                              │           │
│     │  → Returns: user's widget selections + positions                 │           │
│     └──────────────────────────────────────────────────────────────────┘           │
│                                                                                      │
│  3. MERGE ADMIN + USER CONFIG                                                       │
│     ┌──────────────────────────────────────────────────────────────────┐           │
│     │  Admin Layout (page_widgets)                                     │           │
│     │       +                                                          │           │
│     │  User Customizations (user_dashboard_configuration)              │           │
│     │       =                                                          │           │
│     │  Final Rendered Layout                                           │           │
│     └──────────────────────────────────────────────────────────────────┘           │
│                                                                                      │
│  4. APPLY RESPONSIVE LAYOUTS                                                        │
│     ┌──────────────────────────────────────────────────────────────────┐           │
│     │  Detect viewport → Load widget_viewport_layouts                  │           │
│     │  Desktop: 12-column grid                                         │           │
│     │  Tablet:  8-column grid                                          │           │
│     │  Mobile:  4-column grid                                          │           │
│     └──────────────────────────────────────────────────────────────────┘           │
│                                                                                      │
│  5. RENDER CHARTS                                                                   │
│     ┌──────────────────────────────────────────────────────────────────┐           │
│     │  For each widget:                                                │           │
│     │    1. Get chart_catalog entry                                    │           │
│     │    2. Apply config_overrides                                     │           │
│     │    3. Fetch data from aggregation endpoint                       │           │
│     │    4. Render using chart_types + chart_libraries                 │           │
│     └──────────────────────────────────────────────────────────────────┘           │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Grid Position Schema

The `grid_position` JSON structure:

```json
{
  "x": 0, // Column start (0-based)
  "y": 0, // Row start (0-based)
  "w": 4, // Width in grid columns
  "h": 2, // Height in grid rows
  "minW": 2, // Minimum width
  "minH": 1, // Minimum height
  "maxW": 12, // Maximum width
  "maxH": 6 // Maximum height
}
```

---

## Table Summary

| Table                        | ID  | Purpose                  | Records |
| ---------------------------- | --- | ------------------------ | ------- |
| pages                        | 918 | Page definitions         | 1+      |
| page_tabs                    | 919 | Tabs within pages        | 1+      |
| page_sections                | 920 | Sections within tabs     | 1+      |
| page_widgets                 | 921 | Widgets in sections      | 1+      |
| page_filters                 | 924 | Filters per page/tab     | 0       |
| page_filter_options          | 925 | Filter option values     | 1+      |
| user_filter_preferences      | 926 | User's filter selections | 0       |
| widget_viewport_layouts      | 927 | Responsive layouts       | 1+      |
| chart_catalog                | 912 | Available charts         | 1+      |
| chart_types                  | 922 | Chart type definitions   | 1+      |
| chart_libraries              | 923 | Rendering libraries      | 1+      |
| user_dashboard_configuration | 907 | User widget config       | 1+      |
| user_dashboard_sections      | 906 | User custom sections     | 1+      |
| user_preferences             | 711 | General UI prefs         | 1+      |

---

_Generated: 2026-01-26_
_Task: fn-1-2cy.5_
