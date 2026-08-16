# Product Specification

## 1. Document Purpose

This document defines the product requirements and domain context for the Student Management System.

The primary readers are:

* developers
* coding agents
* LLM-based development assistants

Use this document to understand:

* why the product exists
* who uses it
* core domain concepts
* relationships between domain entities
* required screens and features
* important business rules

Implementation details belong in the codebase and `AGENTS.md` files.

---

# 2. Product Overview

## 2.1 Product

A student management system for teachers who manage students, lessons, teaching materials, parent consultations, and instructional resources.

## 2.2 Background

The initial user is a teacher working at Kyowon Group.

Student and lesson information is currently managed with Notion.

Notion provides flexible data management, but it has limitations for this workflow:

* student information is inconvenient to navigate
* repeated lesson records are difficult to manage efficiently
* upcoming consultations are difficult to track
* relationships between students, lessons, scenarios, and textbooks are cumbersome
* teacher workflows require too many manual actions
* the UI/UX is not optimized for daily student management

The product replaces these workflows with a dedicated application.

---

# 3. Product Goal

The primary goal is:

> Allow a teacher to manage students and daily teaching operations quickly from one system.

The system should make it easy to answer questions such as:

* Which students do I teach today?
* What lesson does each student need next?
* Is the lesson prepared?
* What happened during the previous lesson?
* What scenario should I use for this student?
* Are there student-specific notes for the scenario?
* Which textbook is this student currently using?
* Which students need parent consultation soon?
* What tasks do I need to handle today?
* Where can I find teacher training materials?

---

# 4. Primary User

## Teacher

The primary user is a teacher responsible for multiple students.

Typical responsibilities include:

* managing student information
* preparing lessons
* recording completed lessons
* tracking student progress
* managing lesson scenarios
* checking textbooks
* recording student-specific observations
* performing periodic parent consultations
* reviewing teacher training materials
* managing upcoming tasks

The initial product may be optimized for a single teacher.

Multi-user behavior is not yet defined.

---

# 5. Core Domains

The system contains the following primary domains:

```text
Student
Lesson
Scenario
Textbook
Consultation
Material
Todo
```

Core relationships:

```text
Student
 ├── Lessons
 ├── Scenario Progress / Student Scenario Notes
 ├── Textbooks
 ├── Consultations
 └── Todos
```

Teacher materials are primarily teacher-level resources rather than student-level data.

---

# 6. Student

## 6.1 Description

A `Student` represents a student currently or previously managed by the teacher.

## 6.2 Core Data

A student has:

* name
* birth year
* stage
* special notes
* requests
* lesson schedule
* regular consultation date
* status

The system stores `birth_year` instead of date of birth because full birth date information is not available.

Displayed age may be derived from `birth_year` when needed.

## 6.3 Stage

A student belongs to one of the following stages:

```text
Stage 1
Stage 2
Stage 3
```

Detailed curriculum progression exists within each stage.

Examples currently known:

```text
Stage 1: 1-24
Stage 2: 2-12
Stage 3: 3-14
```

The exact meaning and complete structure of these values require further definition.

## 6.4 Student Status

Supported statuses:

```text
FIRST_CONSULTATION_REQUIRED
ACTIVE
ENDED
```

User-facing meanings:

| Status                      | Meaning                                         |
| --------------------------- | ----------------------------------------------- |
| First Consultation Required | Initial consultation has not yet been completed |
| Active                      | Student is currently receiving lessons          |
| Ended                       | Student is no longer receiving lessons          |

## 6.5 Student Schedule

A student's recurring lesson schedule is managed separately from the student's basic profile.

A student may have multiple recurring lesson schedules.

Each schedule should represent:

* student
* day of week
* lesson time
* effective start date
* effective end date
* active status

This supports students who have more than one lesson day per week and preserves flexibility for schedule changes over time.

## 6.6 Student Detail

The student detail view should become the central location for managing one student.

It should eventually expose relevant information such as:

* basic student information
* current stage
* current curriculum progress
* schedule
* student notes
* requests
* lesson history
* current or upcoming lesson
* scenario information
* student-specific scenario notes
* textbook information
* parent consultation history
* next consultation
* related todos

---

# 7. Lesson

## 7.1 Description

A `Lesson` represents an actual lesson scheduled or performed with a student.

A student can have many lessons.

```text
Student 1 --- N Lesson
```

## 7.2 Core Data

A lesson currently contains:

* preparation status
* learning date
* lesson time
* curriculum progress
* attendance status
* special notes
* related student schedule when generated from a recurring schedule

## 7.3 Preparation Status

The current known requirement is whether lesson preparation is complete.

Example concept:

```text
NOT_PREPARED
PREPARED
```

The final status model is not yet defined.

## 7.4 Lesson Generation

Lessons are actual scheduled or completed lesson instances.

Lessons may be generated from a student's recurring schedule, but they may also be created manually when needed.

The system should generate only a practical near-future range of lessons instead of creating all future lessons indefinitely.

Curriculum progress should not be automatically finalized by lesson generation.

The system may suggest the next curriculum unit, but the teacher confirms the actual curriculum progress recorded on each lesson.

## 7.5 Attendance Status

Known attendance states:

```text
PRESENT
ABSENT
```

Additional states such as cancellation or rescheduling are not yet defined.

## 7.6 Curriculum Progress

A lesson records the curriculum position used during that lesson.

Examples:

```text
1-24
2-12
3-14
```

Curriculum progression should eventually connect with scenarios and textbooks.

## 7.7 Lesson Notes

A teacher can record observations about the lesson.

Examples:

* concentration was weak
* had difficulty understanding a concept
* performed better than the previous lesson
* needs repetition in the next lesson

These notes form part of the student's learning history.

---

# 8. Scenario

## 8.1 Description

A `Scenario` defines how a teacher plans to teach a particular curriculum unit or stage.

It acts as a reusable lesson guide.

Examples include:

* lesson sequence
* explanation method
* activities
* questions to ask
* important teaching points

## 8.2 Scenario Structure

Scenarios are associated with curriculum stages or curriculum units.

Conceptually:

```text
Stage
  └── Curriculum Unit
        └── Scenario
```

The exact scenario structure is not yet defined.

## 8.3 Student-Specific Scenario Data

The original scenario is reusable.

However, each student may require additional information associated with that scenario.

Examples:

* student-specific comments
* special considerations
* areas requiring repetition
* changes in teaching approach

The base scenario should not be modified just because one student requires customization.

Conceptually:

```text
Scenario
   |
   +---- Student A Scenario Note
   |
   +---- Student B Scenario Note
```

This allows:

* one reusable base scenario
* separate student-specific context

---

# 9. Textbook

## 9.1 Description

A `Textbook` represents teaching material used for a curriculum stage.

Textbooks are associated with stages or curriculum units.

Conceptually:

```text
Stage
  └── Textbook
```

A student may also need to be associated with the textbook currently being used.

The exact textbook data fields are not yet defined.

Potential information requiring future definition includes:

* textbook name
* stage
* curriculum range
* publisher or source
* teacher notes
* file or link

These fields are not yet confirmed requirements.

---

# 10. Consultation

## 10.1 Description

A `Consultation` represents a parent consultation for a student.

Each student requires a parent consultation approximately once every three months.

```text
Student 1 --- N Consultation
```

## 10.2 Core Requirement

The system should make upcoming consultations visible so teachers do not miss them.

The system should support:

* consultation history
* last consultation date
* next consultation date
* consultation records

The detailed content recorded during a consultation is not yet defined.

## 10.3 Consultation Cycle

Current business rule:

> A parent consultation should occur once every three months for each student.

The exact scheduling rule requires further definition.

For example, it is not yet decided whether the next consultation is calculated from:

* student registration date
* previous consultation date
* manually selected regular consultation date

---

# 11. Material

## 11.1 Description

A `Material` represents educational or training resources provided to teachers by Kyowon Group.

Kyowon Group periodically conducts teacher training.

The system should provide a centralized place to collect and access those materials.

Potential resource formats may include:

* documents
* links
* videos
* files
* notes

Supported formats are not yet defined.

---

# 12. Todo

## 12.1 Description

A `Todo` represents work the teacher needs to complete.

Todo functionality supports the operational side of student management.

Possible examples:

* prepare tomorrow's lesson
* contact a parent
* conduct a consultation
* write lesson notes
* check teaching material
* prepare student-specific scenario notes

## 12.2 Relationship

A todo may potentially be:

```text
Teacher-level
Student-related
Lesson-related
Consultation-related
```

The exact relationship model is not yet defined.

Todos should complement the domain workflow rather than exist only as an unrelated checklist.

---

# 13. Primary Navigation

The initial application should provide five primary sections.

```text
1. Student Management
2. Lesson Status
3. Textbook Management
4. Consultation Management
5. Teacher Materials
```

Todo functionality may appear globally rather than as a primary navigation tab.

---

# 14. Student Management

## Purpose

Manage students and quickly access information required for teaching.

Expected capabilities:

* view students
* search students
* filter students
* view student status
* view lesson schedule
* create a student
* edit student information
* open student details
* manage student notes
* manage requests

Useful filters may eventually include:

* status
* stage
* lesson day

These filters are candidate requirements and are not yet finalized.

---

# 15. Lesson Status

## Purpose

Provide a teacher-oriented view of scheduled and completed lessons.

This screen should help answer:

> What lessons do I have, and what do I need to prepare?

Expected information may include:

* student
* lesson date
* lesson time
* stage
* curriculum progress
* preparation status
* attendance status

Expected actions:

* mark lesson as prepared
* record attendance
* open lesson details
* record lesson notes
* access the associated scenario
* access student information

A date-oriented workflow is likely important because lessons occur according to recurring schedules.

The exact UI is not yet defined.

---

# 16. Textbook Management

## Purpose

Manage textbooks used for each curriculum stage.

Expected capabilities:

* view textbooks
* identify associated stage
* access textbook information
* connect textbooks to curriculum progress

Additional requirements need further definition.

---

# 17. Consultation Management

## Purpose

Prevent missed parent consultations and preserve consultation history.

The screen should make it easy to identify:

* consultations due soon
* overdue consultations
* completed consultations
* consultation history by student

Expected actions:

* create a consultation record
* record consultation details
* view previous consultations
* determine or schedule the next consultation

---

# 18. Teacher Materials

## Purpose

Provide one location for teacher training materials.

Expected capabilities:

* browse materials
* open materials
* search materials
* categorize materials

File management and storage behavior are not yet defined.

---

# 19. Student Detail

Student Detail is a major workflow even though it is not a primary tab.

Conceptual layout:

```text
Student Detail

Basic Information
├── Name
├── Birth Year
├── Stage
├── Status
├── Lesson Schedule
├── Notes
└── Requests

Learning
├── Current Progress
├── Current Textbook
├── Scenario
└── Scenario Notes

Lessons
├── Upcoming Lesson
└── Lesson History

Consultations
├── Next Consultation
└── Consultation History

Tasks
└── Related Todos
```

The exact UI layout is not yet defined.

---

# 20. Dashboard / Daily Workflow

A dedicated dashboard has not yet been confirmed.

However, the product should support a teacher's daily workflow.

Useful information may include:

```text
Today
├── Today's Lessons
├── Lessons Not Prepared
├── Upcoming Consultations
├── Overdue Consultations
└── Todos
```

Whether this becomes:

* a dashboard
* the default lesson screen
* a sidebar
* another UI structure

is still open.

---

# 21. Core User Flows

## 21.1 Prepare for Today's Lessons

```text
Open application
    ↓
Check today's lessons
    ↓
Select student
    ↓
Review previous lesson
    ↓
Check curriculum progress
    ↓
Open scenario
    ↓
Review student-specific notes
    ↓
Prepare lesson
    ↓
Mark as prepared
```

## 21.2 Record a Lesson

```text
Open scheduled lesson
    ↓
Record attendance
    ↓
Record curriculum progress
    ↓
Add lesson notes
    ↓
Save lesson
```

## 21.3 Prepare Parent Consultation

```text
Check consultations
    ↓
Identify student due for consultation
    ↓
Open student details
    ↓
Review recent lesson history
    ↓
Perform consultation
    ↓
Record consultation
    ↓
Schedule or calculate next consultation
```

## 21.4 Review a Student

```text
Open Student Management
    ↓
Select student
    ↓
Student Detail
    ↓
Review:
- profile
- progress
- lessons
- scenario
- textbook
- consultation
- todos
```

---

# 22. Domain Relationship Overview

Current conceptual model:

```text
Teacher
|
+-- Students
|   |
|   +-- Student Schedules
|   |
|   +-- Lessons
|   |
|   +-- Consultations
|   |
|   +-- Student Scenario Notes
|   |
|   +-- Textbook / Curriculum Progress
|   |
|   +-- Todos
|
+-- Scenarios
|   +-- Stage / Curriculum Unit
|
+-- Textbooks
|   +-- Stage / Curriculum Unit
|
+-- Materials
|
+-- Todos
```

This model is conceptual.

It is not yet a database schema.

---

# 23. Product Principles

## Optimize for Teacher Workflow

The product exists to reduce the friction of daily teaching administration.

Prefer fewer actions and clear information over highly configurable workflows.

## Student Context Should Be Easy to Access

Relevant student information should be reachable without navigating across unrelated screens.

## Reusable Data and Student Data Must Be Separated

Reusable information such as scenarios should remain independent from student-specific notes.

## Upcoming Work Must Be Visible

Time-sensitive work such as:

* lessons
* preparation
* consultations
* todos

should be easy to discover.

## Historical Information Must Be Preserved

The teacher should be able to understand a student's history rather than only the current state.

---

# 24. Initial Product Scope

The initial product should focus on:

1. student management
2. lesson management
3. scenario integration
4. textbook management
5. parent consultation management
6. teacher material management
7. todo support
8. student detail view

Do not add unrelated school administration features unless requirements expand.

---

# 25. Non-Goals

The following have not been requested and should not be assumed:

* school-wide administration
* student login
* parent login
* payment management
* attendance across an entire school
* grading system
* classroom management
* messaging platform
* LMS replacement
* automated curriculum generation
* multi-organization support

These may only be introduced when explicitly added to the product scope.

---

# 26. Open Questions

The following requirements still need clarification.

## Student

* What exactly is the initial consultation workflow?
* Can an ended student become active again?

## Curriculum

* What do `1-24`, `2-12`, and `3-14` represent?
* How many curriculum units exist per stage?
* Is curriculum progression sequential?
* Can lessons skip or repeat units?

## Lesson

* Can lessons be rescheduled?
* Are cancellation and makeup lessons required?
* Can one lesson cover multiple curriculum units?
* What exactly does `prepared` mean?

## Scenario

* Is there one scenario per curriculum unit?
* Can multiple scenarios exist for one unit?
* What data does a scenario contain?
* How should student-specific scenario notes be structured?

## Textbook

* Can one stage have multiple textbooks?
* Does a textbook map to a stage or individual curriculum units?
* Is textbook progress tracked per student?
* Are textbook files stored in the system?

## Consultation

* What information must be recorded during a consultation?
* How is the next consultation date calculated?
* Are reminders required?
* How early should an upcoming consultation appear?

## Material

* Are files uploaded directly?
* Are external links sufficient?
* What categories are needed?
* Is search required for the first release?

## Todo

* Are todos created manually, automatically, or both?
* Should consultation deadlines create automatic todos?
* Should lesson preparation create automatic todos?
* Do todos require due dates and priorities?

## Users

* Is the first version single-user only?
* Will multiple teachers eventually use the same system?
* Is authentication required for the initial version?

---

# 27. Specification Status

Status:

```text
Draft v0.1
```

This document currently captures the initial product concept.

Requirements marked as uncertain or listed under `Open Questions` must not be treated as finalized product behavior.
