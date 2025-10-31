# Mermaid Diagram Test Page

This page tests various Mermaid diagram types to ensure perfect rendering.

## Flowchart Example

```mermaid
graph TB
    A[Start: New Team Member] --> B{Cultural Fit Assessment}
    B -->|Pass| C[TIK Values Training]
    B -->|Needs Development| D[Additional Culture Training]
    C --> E[Role-Specific Onboarding]
    D --> E
    E --> F[30-Day Check-in]
    F --> G{Performance Review}
    G -->|Successful| H[Full Integration]
    G -->|Needs Support| I[Mentorship Program]
    I --> J[60-Day Review]
    J --> H
    H --> K[Ongoing Development]

    style A fill:#4f81bd,color:#fff
    style H fill:#28a745,color:#fff
    style K fill:#6699cc,color:#fff
```

## Sequence Diagram Example

```mermaid
sequenceDiagram
    participant C as Candidate
    participant HR as HR Team
    participant M as Hiring Manager
    participant T as Team Lead

    C->>HR: Submit Application
    HR->>HR: Initial Screening
    HR->>C: Cultural Values Assessment
    C->>HR: Complete Assessment
    HR->>M: Forward Qualified Candidate
    M->>C: Technical Interview
    C->>M: Demonstrate Skills
    M->>T: Team Fit Interview
    T->>C: Collaborative Exercise
    C->>T: Show Team Dynamics
    T->>M: Provide Feedback
    M->>HR: Final Decision
    HR->>C: Offer/Rejection
```

## Gantt Chart Example

```mermaid
gantt
    title Klysera Culture Implementation Timeline
    dateFormat  YYYY-MM-DD
    section Foundation
    Culture Definition       :a1, 2025-11-01, 30d
    Values Framework        :a2, after a1, 15d
    section HR Development
    Hiring Process Design   :b1, 2025-11-15, 45d
    Onboarding Program      :b2, after b1, 30d
    section Research
    GitLab Analysis         :c1, 2025-11-01, 21d
    Zapier Analysis         :c2, after c1, 21d
    Doist Analysis          :c3, after c2, 21d
    section Implementation
    Pilot Program           :d1, after b2, 60d
    Full Rollout            :d2, after d1, 90d
```

## Pie Chart Example

```mermaid
pie title Remote Work Success Factors
    "Culture & Values" : 35
    "Communication Tools" : 20
    "Process & Structure" : 25
    "Leadership Support" : 20
```

## Class Diagram Example

```mermaid
classDiagram
    class Employee {
        +String name
        +String role
        +Date startDate
        +TIKScore tikAssessment
        +onboard()
        +completeTraining()
        +performReview()
    }

    class Manager {
        +List~Employee~ team
        +conductInterview()
        +provideFeedback()
        +mentorEmployee()
    }

    class HRSystem {
        +trackProgress()
        +generateReports()
        +manageCertification()
    }

    Employee --|> Manager : reports to
    HRSystem --> Employee : tracks
    HRSystem --> Manager : supports
```

## State Diagram Example

```mermaid
stateDiagram-v2
    [*] --> Candidate
    Candidate --> Screening : Apply
    Screening --> Interview : Pass Initial
    Screening --> Rejected : Fail Screening
    Interview --> Assessment : Technical Pass
    Interview --> Rejected : Technical Fail
    Assessment --> Offer : Culture Fit
    Assessment --> Rejected : Culture Mismatch
    Offer --> Onboarding : Accept
    Offer --> Declined : Reject
    Onboarding --> Probation : Complete
    Probation --> FullEmployee : Success
    Probation --> Terminated : Failure
    FullEmployee --> [*] : Ongoing
    Rejected --> [*]
    Declined --> [*]
    Terminated --> [*]
```

## Test Results

If all diagrams above render correctly with Klysera branding colors, your Mermaid integration is working perfectly!

**Expected Colors:**
- Primary: #4f81bd (Klysera blue)
- Secondary: #6699cc (Light blue)
- Background: #f8f9fa (Light gray)

---

*This test page demonstrates the full range of Mermaid diagram capabilities for the Klysera People & Culture documentation system.*