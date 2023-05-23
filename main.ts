import {RocosSDK, SearchStreamQuery} from "@team-rocos/rocos-js-sdk";
import {RocosSDKNode} from "@team-rocos/rocos-js-sdk/node";
import {take} from "rxjs/operators";

const applicationId = process.env.APPLICATION_ID || "";
const applicationSecret = process.env.APPLICATION_SECRET || "";

function main() {
    fetchData().catch(console.error)
}

async function fetchData() {
    const sdk = new RocosSDKNode({
        url: `api2.rocos.io`,
        appId: applicationId,
        appKey: applicationSecret,
    });

    await searchStream(sdk, 'onsight-solar-inspection', {
        startDate: 1682284971572,
        endDate: 1684876971572,
        interval: "3h",
        refreshDelay: 3600,
        dateField: "dateCreated",
        projectId: "onsight-solar-inspection",
        disableDateHistogram: true,
        groupByFields: [
            "sourceId",
            "dataId",
            "callsign"
        ],
        payloadIds: [
            "bunker_status.battery_voltage"
        ],
        filters: [
            {
                keyword: "sourceId",
                ids: [
                    "plugin_ros"
                ]
            },
            {
                keyword: "dataId",
                ids: [
                    "bunker_status"
                ]
            },
            {
                keyword: "callsign",
                ids: [
                    "ost-01"
                ]
            }
        ]
    });
}

async function searchStream(sdk: RocosSDK, projectId: string, query: SearchStreamQuery) {
    const searchService = sdk.getSearchService();
    const streams = await searchService.searchStream({
        projectId,
        query,
    }).pipe(take(1)).toPromise()

    console.log(`Got ${streams.length} streams`);
    console.log('Logging the first 4 streams');
    streams.slice(0, 4).forEach(stream => {
        console.group(stream.date);
        stream.rows.map(row => {
            return JSON.parse(row.payload)
        }).forEach(payload => {
            console.log(payload)
        })
        console.groupEnd();
    })
}

main();
