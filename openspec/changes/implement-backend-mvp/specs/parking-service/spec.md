## ADDED Requirements

### Requirement: CRUD for apartments and parking spots
The parking-service SHALL expose CRUD endpoints for apartments (`GET/POST/PUT/DELETE /parking/apartments`) and spots (`GET/POST/PUT/DELETE /parking/spots`).

#### Scenario: Create apartment
- **WHEN** admin creates apartment with unit, block, owner, hasVehicle
- **THEN** service creates apartment record for the condominium

#### Scenario: Create parking spot
- **WHEN** admin creates spot with number and type
- **THEN** service creates spot record for the condominium

### Requirement: Atomic lottery execution with registered seed
The parking-service SHALL execute lottery via `POST /parking/lottery` using Fisher-Yates algorithm with `java.util.Random(seed)`. The operation MUST be transactional with SERIALIZABLE isolation. The seed MUST be persisted with results.

#### Scenario: Successful lottery
- **WHEN** admin executes lottery with eligible apartments and available spots
- **THEN** service atomically assigns spots to apartments using Fisher-Yates shuffle, persists LotterySession with seed and all LotteryResults

#### Scenario: Reproducible with same seed
- **WHEN** lottery is executed twice with same seed, same apartments, same spots
- **THEN** results are identical (mathematically reproducible)

#### Scenario: Concurrent lottery attempts
- **WHEN** two admins execute lottery simultaneously
- **THEN** SERIALIZABLE isolation ensures only one succeeds; second returns 409

### Requirement: Only hasVehicle apartments participate
The parking-service SHALL only include apartments with `hasVehicle: true` in the lottery. Already-drawn apartments MUST be excluded until reset.

#### Scenario: Apartment without vehicle
- **WHEN** lottery is executed
- **THEN** apartments with hasVehicle=false are excluded from the draw

#### Scenario: Previously drawn apartment
- **WHEN** apartment was already assigned a spot in current session
- **THEN** apartment is excluded from new lottery rounds (until reset)

### Requirement: Handle excess apartments (more eligible than spots)
The parking-service SHALL perform partial lottery when eligible apartments exceed available spots, recording `undrawnApartments` in the LotterySession.

#### Scenario: More apartments than spots
- **WHEN** 20 eligible apartments compete for 15 spots
- **THEN** 15 are assigned spots; 5 are recorded in `undrawnApartments` field

### Requirement: Handle excess spots
The parking-service SHALL leave unassigned spots when eligible apartments are fewer than available spots.

#### Scenario: Fewer apartments than spots
- **WHEN** 10 eligible apartments compete for 15 spots
- **THEN** 10 spots are assigned; 5 remain unassigned

### Requirement: Lottery reset (admin only)
The parking-service SHALL expose `DELETE /parking/lottery` to reset lottery results, freeing apartments and spots for a new round. Only `admin` role can execute.

#### Scenario: Admin resets lottery
- **WHEN** admin sends DELETE /parking/lottery
- **THEN** all lottery results are cleared; apartments and spots available for new round

#### Scenario: Non-admin attempts reset
- **WHEN** manager attempts DELETE /parking/lottery
- **THEN** service returns 403

### Requirement: Validation before lottery
The parking-service SHALL validate that eligible apartments > 0 and available spots > 0 before executing.

#### Scenario: No eligible apartments
- **WHEN** no apartments have hasVehicle=true
- **THEN** service returns 400 with explanatory message

#### Scenario: No spots registered
- **WHEN** no parking spots exist
- **THEN** service returns 400 with explanatory message

### Requirement: LotteryResult persists full snapshot
Each LotteryResult SHALL contain: unit, block, owner, spot number, spot type, seed, drawnAt timestamp.

#### Scenario: Result snapshot content
- **WHEN** lottery is executed
- **THEN** each result record contains full snapshot data independent of source entities
