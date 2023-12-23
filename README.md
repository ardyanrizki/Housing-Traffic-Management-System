# Housing Traffic Management System

## Overview

This smart contract, implemented in TypeScript for the Internet Computer, manages housing and traffic allocations in a residential area. The system allows for the creation of traffic records, housing records, and dynamic adjustments to traffic limits.

## Prerequisites

- Node
- TypeScript
- DFX
- IC CDK

## Installation

1. **Clone the repository:**

    ```bash
    git clone https://github.com/YourUsername/housing-traffic-management.git
    cd housing-traffic-management
    ```

## Project Structure

The project is organized into the following directories and files:

- **`src/`**: Contains the source code for the housing traffic management system.
  - **`index.ts`**: App entry point Implementation of the system.

- **`node_modules/`**: Directory for project dependencies.

- **`package.json`**: Configuration file for npm, including project dependencies and scripts.

- **`tsconfig.json`**: TypeScript configuration file, specifying compiler options.

- **`LICENSE`**: MIT License file, detailing the terms under which the project is licensed.

- **`README.md`**: Project documentation providing an overview, installation instructions, usage details, and license information.

## Models

### Traffic

```typescript
type Traffic = Record<{
    id: string;
    road_name: string;
    traffic_limit: number;
    created_date: nat64;
    updated_at: Opt<nat64>;
}>;
```

### Housing

```typescript
type Housing = Record<{
    id: string;
    housing_name: string;
    number_of_residents: number;
    traffic_id: string;
    created_date: nat64;
    updated_at: Opt<nat64>;
}>;
```

### TrafficPayload

```typescript
type TrafficPayload = Record<{
    road_name: string;
    limit: number;
}>;
```

### HousingPayload

```typescript
type HousingPayload = Record<{
    housing_name: string;
    number_of_residents: number;
    traffic_id: string;
}>;

```

### HousingResponse

```typescript
type HousingResponse = Record<{
    msg: string;
    isSuccess: boolean,
    remainingLimit: number;
}>;
```

## Functions

### `createTraffic(payload: TrafficPayload): string`

- Creates a new traffic record with a unique ID, road name, traffic limit, and timestamp.

### `createHousing(payload: HousingPayload): HousingResponse`

- Creates a new housing record, checks the remaining traffic limit, and returns a response indicating success or failure.

### `getTrafficRemainingLimit(id: string): number`

- Retrieves the remaining traffic limit for a specific traffic ID, considering the number of residents in associated housing.

### `editTrafficLimit(id: string, payload: TrafficPayload): void`

- Edits the road name and traffic limit for a specific traffic ID.

## Usage

- Create traffic records with `createTraffic(payload)`.
- Create housing records and check remaining traffic limits with `createHousing(payload)`.
- Retrieve the remaining traffic limit for a specific traffic ID using `getTrafficRemainingLimit(id)`.
- Edit traffic limits with `editTrafficLimit(id, payload)`.

## Try it out

Ensure you have [DFX installed](https://sdk.dfinity.org/docs/quickstart/local-quickstart.html) and a local Internet Computer replica running:

```bash
npm install
npm run createTraffic
npm run createHousing
npm run getTrafficRemainingLimit
npm run editTrafficLimit
