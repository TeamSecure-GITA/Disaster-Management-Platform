const request = require("supertest");
const app = require("../app");

describe("Alert API", () => {
  test("invalid alert payload returns validation errors", async () => {
    const response = await request(app).post("/api/alerts").send({});

    expect(response.statusCode).toBe(400);
    expect(response.body.success).toBe(false);
  });

  test("GET /api/alerts/:id should return a response", async () => {
    const response = await request(app).get("/api/alerts/unmatched/path");

    expect(response.statusCode).toBe(404);
    expect(response.body.success).toBe(false);
  });

  test("GET /api/alerts/feed-health returns health data for all 3 programmatic feeds", async () => {
    const response = await request(app).get("/api/alerts/feed-health");

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.feeds).toHaveProperty("ndma_sachet");
    expect(response.body.data.feeds).toHaveProperty("gdacs");
    expect(response.body.data.feeds).toHaveProperty("usgs");
    expect(response.body.data.feeds.ndma_sachet.name).toContain("NDMA SACHET");
    expect(response.body.data.feeds.gdacs.name).toContain("GDACS");
    expect(response.body.data.feeds.usgs.name).toContain("USGS");
  });

  test("parseGdacsRss successfully parses GDACS automated XML feed items", () => {
    const { parseGdacsRss } = require("../services/govtAlertService");
    const sampleXml = `
      <rss version="2.0" xmlns:geo="http://www.w3.org/2003/01/geo/wgs84_pos#" xmlns:gdacs="http://www.gdacs.org">
        <channel>
          <item>
            <title>Tropical Cyclone WARNING: Category 3 Storm approaching coast</title>
            <description>Automated calculation indicates severe impact.</description>
            <link>https://www.gdacs.org/report.aspx?eventtype=TC&amp;eventid=99999</link>
            <pubDate>Sun, 13 Sep 2026 14:00:00 GMT</pubDate>
            <geo:lat>18.2</geo:lat>
            <geo:long>85.4</geo:long>
            <gdacs:eventtype>TC</gdacs:eventtype>
            <gdacs:alertlevel>Red</gdacs:alertlevel>
            <gdacs:alertscore>2.5</gdacs:alertscore>
            <gdacs:severity unit="km/h" value="180">Max sustained wind 180 km/h</gdacs:severity>
            <gdacs:population unit="people" value="1500000">1.5M exposed</gdacs:population>
            <gdacs:country>India</gdacs:country>
            <gdacs:cap>https://www.gdacs.org/cap/99999.xml</gdacs:cap>
          </item>
        </channel>
      </rss>
    `;

    const parsed = parseGdacsRss(sampleXml);
    expect(parsed.length).toBe(1);
    expect(parsed[0].type).toBe("cyclone");
    expect(parsed[0].severity).toBe("critical");
    expect(parsed[0].feedSource).toBe("GDACS_RSS");
    expect(parsed[0].sourceNodalAgency).toBe("UN OCHA / EC JRC");
    expect(parsed[0].location.coordinates).toEqual([85.4, 18.2]);
    expect(parsed[0].metadata.alertScore).toBe("2.5");
    expect(parsed[0].instructions.length).toBeGreaterThan(0);
  });
});