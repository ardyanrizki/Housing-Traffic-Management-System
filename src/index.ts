
// Importing necessary modules from the 'azle' library and 'uuid' library
import { $update, Record, StableBTreeMap, Opt, nat64, ic, match, Result } from 'azle';
import { v4 as uuidv4 } from "uuid";

// Define record types
type Housing = Record<{
    id: string;
    housing_name: string;
    number_of_residents: number;
    traffic_id: string;
    created_date: nat64;
    updated_at: Opt<nat64>;
}>;

type Traffic = Record<{
    id: string;
    road_name: string;
    traffic_limit: number;
    created_date: nat64;
    updated_at: Opt<nat64>;
}>;

type HousingPayload = Record<{
    housing_name: string;
    number_of_residents: number;
    traffic_id: string;
}>;

type TrafficPayload = Record<{
    road_name: string;
    limit: number;
}>;

type HousingResponse = Record<{
    msg: string;
    isSuccess: boolean;
    remainingLimit: number;
}>;

// Create instances of StableBTreeMap for each entity type
const housingStorage = new StableBTreeMap<string, Housing>(0, 44, 512);
const trafficStorage = new StableBTreeMap<string, Traffic>(1, 44, 512);

// Function to create traffic record
$update;
export function createTraffic(payload: TrafficPayload): Result<string, string> {
    try {
        // Payload Validation
        if (!payload.road_name || payload.limit <= 0) {
            return Result.Err("Invalid payload for creating traffic record.");
        }

        const trafficId = uuidv4();
        const traffic: Traffic = {
            id: trafficId,
            road_name: payload.road_name,
            traffic_limit: payload.limit,
            created_date: ic.time(),
            updated_at: Opt.None,
        };
        trafficStorage.insert(trafficId, traffic);
        return Result.Ok(trafficId);
    } catch (error) {
        return Result.Err(`Failed to create traffic record: ${error}`);
    }
}

// Function to create housing record and check remaining traffic limit
$update;
export function createHousing(payload: HousingPayload): Result<HousingResponse, string> {
    try {
        // Payload Validation
        if (!payload.housing_name || payload.number_of_residents <= 0 || !payload.traffic_id) {
            return Result.Err("Invalid payload for creating housing record.");
        }

        const remainingLimit = getTrafficRemainingLimit(payload.traffic_id);
        const isSuccess = remainingLimit >= payload.number_of_residents;

        if (!isSuccess) {
            return Result.Err(`Error: The number of residents exceeds the available limit for this traffic. Remaining Limit: ${remainingLimit}`);
        }

        const housingId = uuidv4();
        const housing: Housing = {
            id: housingId,
            housing_name: payload.housing_name,
            number_of_residents: payload.number_of_residents,
            traffic_id: payload.traffic_id,
            created_date: ic.time(),
            updated_at: Opt.None,
        };
        housingStorage.insert(housingId, housing);

        return Result.Ok({
            msg: "Success: Housing data has been successfully created.",
            isSuccess: isSuccess,
            remainingLimit: remainingLimit
        });
    } catch (error) {
        return Result.Err(`Failed to create housing record: ${error}`);
    }
}

// Function to get the remaining traffic limit for a specific traffic id
export function getTrafficRemainingLimit(id: string): number {
    try {
        // ID Validation
        if (!id) {
            return 0;
        }

        const housings = housingStorage.values().filter((housing) => housing.traffic_id === id);
        const totalResidents = housings.reduce((total, housing) => total + housing.number_of_residents, 0);

        const traffic = match(trafficStorage.get(id), {
            Some: (traffic) => traffic,
            None: () => null,
        });

        if (traffic) {
            const remainingLimit = Math.max(0, traffic.traffic_limit - totalResidents);
            return remainingLimit;
        }

        return 0;
    } catch (error) {
        return 0;
    }
}

// Function to edit traffic limit
$update;
export function editTrafficLimit(id: string, payload: TrafficPayload): Result<Traffic, string> {
    try {
        // ID Validation
        if (!id) {
            return Result.Err("Invalid ID for editing traffic limit.");
        }

        const traffic = match(trafficStorage.get(id), {
            Some: (traffic) => traffic,
            None: () => null,
        });

        if (traffic) {
            // Payload Validation
            if (!payload.road_name || payload.limit <= 0) {
                return Result.Err("Invalid payload for editing traffic limit.");
            }

            traffic.road_name = payload.road_name;
            traffic.traffic_limit = payload.limit;
            traffic.updated_at = Opt.Some(ic.time());
            trafficStorage.insert(id, traffic);
            return Result.Ok(traffic);
        } else {
            return Result.Err(`Traffic record with ID=${id} not found.`);
        }
    } catch (error) {
        return Result.Err(`Failed to edit traffic limit: ${error}`);
    }
}


// Cryptographic utility for generating random values
globalThis.crypto = {
  // @ts-ignore
  getRandomValues: () => {
    let array = new Uint8Array(32);
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
    return array;
  },
};
