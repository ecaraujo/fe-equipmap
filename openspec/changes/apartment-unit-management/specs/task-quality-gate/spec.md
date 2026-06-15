## ADDED Requirements

### Requirement: Each implemented task includes Sonar review
Every OpenSpec task that changes code or configuration SHALL include a SonarCloud/SonarQube review of the files touched by that task before it is marked complete.

#### Scenario: Task changes application code
- **WHEN** an agent completes a task that changes frontend, BFF, microservice, script, SQL, or configuration files
- **THEN** the agent reviews SonarCloud/SonarQube findings for the touched files before checking the task as complete.

#### Scenario: Task changes only documentation
- **WHEN** an agent completes a task that changes only documentation or OpenSpec artifacts
- **THEN** the agent records that Sonar review is not applicable for that task.

### Requirement: New Sonar findings are resolved or justified
The implementation SHALL not leave new Sonar bugs, vulnerabilities, security hotspots, code smells, duplication, or maintainability debt unresolved in files touched by a task.

#### Scenario: New actionable finding
- **WHEN** SonarCloud/SonarQube reports a new actionable finding caused by the task
- **THEN** the agent fixes the finding before marking the task complete.

#### Scenario: False positive finding
- **WHEN** SonarCloud/SonarQube reports a finding that is a false positive or cannot be resolved safely in the task scope
- **THEN** the agent documents the concrete justification and scope before marking the task complete.

### Requirement: Task completion records quality evidence
Task completion notes SHALL include the verification commands or Sonar evidence used for the task.

#### Scenario: Local or remote quality evidence exists
- **WHEN** an agent marks a task complete
- **THEN** the task summary includes the relevant build/test/SonarCloud/SonarQube evidence or explains why a specific check could not be executed.
