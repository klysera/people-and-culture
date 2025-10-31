# Mermaid Diagram Test Page

This page demonstrates various Mermaid diagram types for testing rendering functionality.

## Flowchart Example

```mermaid
graph TB
    Start([Start Process]) --> Check{Is Valid?}
    Check -->|Yes| Process[Process Data]
    Check -->|No| Error[Show Error]
    Process --> Complete([Complete])
    Error --> Complete

    style Start fill:#4f81bd,color:#fff
    style Complete fill:#6699cc,color:#fff
    style Error fill:#ff6b6b,color:#fff
```

## Sequence Diagram Example

```mermaid
sequenceDiagram
    participant User
    participant System
    participant Database

    User->>System: Submit Request
    System->>Database: Query Data
    Database-->>System: Return Results
    System-->>User: Display Results
    Note over User,Database: Process Complete
```

## Gantt Chart Example

```mermaid
gantt
    title Klysera Implementation Roadmap
    dateFormat YYYY-MM-DD
    section Culture Foundation
    Culture Manifesto           :done,    cf1, 2024-01-01, 7d
    TIK Identity                :done,    cf2, after cf1, 5d
    Values Implementation       :active,  cf3, after cf2, 10d

    section Hiring Process
    Hiring Framework           :         hf1, 2024-01-20, 7d
    Interview Guide           :         hf2, after hf1, 5d
    Onboarding Journey        :         hf3, after hf2, 10d

    section Leadership
    Leadership Principles     :         lp1, 2024-02-01, 5d
    Development Program      :         lp2, after lp1, 10d
```

## Class Diagram Example

```mermaid
classDiagram
    class Culture {
        +Values
        +Principles
        +Behaviors
        +enableExcellence()
    }
    class Leadership {
        +Vision
        +Strategy
        +Execution
        +inspire()
    }
    class Team {
        +Members
        +Goals
        +Performance
        +collaborate()
    }

    Culture <|-- Leadership
    Leadership <|-- Team
    Team --> Culture : embodies
```

## Pie Chart Example

```mermaid
pie title Culture Elements Distribution
    "Core Values" : 30
    "Operating Principles" : 25
    "Leadership Practices" : 20
    "Daily Rituals" : 15
    "Recognition" : 10
```

## State Diagram Example

```mermaid
stateDiagram-v2
    [*] --> Onboarding
    Onboarding --> Learning : Complete Orientation
    Learning --> Performing : Pass Certification
    Performing --> Excelling : Achieve Mastery
    Excelling --> Mentoring : Become Leader
    Mentoring --> [*]

    Performing --> Learning : Needs Development
    Excelling --> Performing : Role Change
```

## Journey Map Example

```mermaid
journey
    title Employee Journey at Klysera
    section Hiring
      Apply to Position: 5: Candidate
      Initial Interview: 4: Candidate, Recruiter
      Culture Interview: 5: Candidate, Team
      Receive Offer: 5: Candidate
    section Onboarding
      Day 1 Welcome: 5: Employee
      Culture Immersion: 4: Employee, Buddy
      TIK Certification: 3: Employee, Manager
      First Project: 4: Employee, Team
    section Growth
      Regular 1:1s: 5: Employee, Manager
      Skill Development: 4: Employee
      Leadership Role: 5: Employee
      Culture Champion: 5: Employee, Organization
```

---

**Note:** If all diagrams above render correctly, Mermaid integration is working properly.