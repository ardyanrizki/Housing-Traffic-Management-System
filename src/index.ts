// Importing necessary modules from the 'azle' library and 'uuid' library
import { $update, Record, StableBTreeMap, Opt, nat64, ic, match } from 'azle';
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
    isSuccess: boolean,
    remainingLimit: number;
}>;

// Create instances of StableBTreeMap for each entity type
const housingStorage = new StableBTreeMap<string, Housing>(0, 44, 512);
const trafficStorage = new StableBTreeMap<string, Traffic>(1, 44, 512);

// Function to create traffic record
$update;
export function createTraffic(payload: TrafficPayload): string {
    const trafficId = uuidv4();
    const traffic = {
        id: trafficId,
        road_name: payload.road_name,
        traffic_limit: payload.limit,
        created_date: ic.time(),
        updated_at: Opt.None,
    };
    trafficStorage.insert(trafficId, traffic);
    return trafficId;
}

// Function to create housing record and check remaining traffic limit
$update;
export function createHousing(payload: HousingPayload): HousingResponse {
    const remainingLimit = getTrafficRemainingLimit(payload.traffic_id);
    const isSuccess = remainingLimit >= payload.number_of_residents;

    if (!isSuccess) {
        return {
            msg: "Error: The number of residents exceeds the available limit for this traffic.",
            isSuccess: isSuccess,
            remainingLimit: remainingLimit
        };
    }

    const housingId = uuidv4();
    const housing = {
        id: housingId,
        housing_name: payload.housing_name,
        number_of_residents: payload.number_of_residents,
        traffic_id: payload.traffic_id,
        created_date: ic.time(),
        updated_at: Opt.None,
    };
    housingStorage.insert(housingId, housing);

    return {
        msg: "Success: Housing data has been successfully created.",
        isSuccess: isSuccess,
        remainingLimit: remainingLimit
    };
}

// Function to get the remaining traffic limit for a specific traffic id
export function getTrafficRemainingLimit(id: string): number {
    const housings = housingStorage.values().filter((housing) => housing.traffic_id === id);
    const totalResidents = housings.reduce((total, housing) => total + housing.number_of_residents, 0);

    const traffic = match(trafficStorage.get(id), {
        Some: (traffic) => traffic,
        None: () => (null),
    });
    if (traffic) {
        const remainingLimit = Math.max(0, traffic.traffic_limit - totalResidents);
        return remainingLimit;
    }

    return 0;
}

// Function to edit traffic limit
$update;
export function editTrafficLimit(id: string, payload: TrafficPayload): void {
    const traffic = match(trafficStorage.get(id), {
        Some: (traffic) => traffic,
        None: () => (null),
    });
    if (traffic) {
        traffic.road_name = payload.road_name;
        traffic.traffic_limit = payload.limit;
        traffic.updated_at = Opt.Some(ic.time());
        trafficStorage.insert(id, traffic);
    }
}
