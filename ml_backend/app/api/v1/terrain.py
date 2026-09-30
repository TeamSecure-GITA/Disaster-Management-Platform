"""
Terrain and DEM Topographic Derivation API Router.

Derives slope, aspect, curvature, elevation, distance to roads and streams,
lithology, and land cover per grid cell from Digital Elevation Models (Copernicus GLO-30, SRTM, CartoDEM).
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional
from fastapi import APIRouter, HTTPException, Query, status
from pydantic import BaseModel, Field

from app.geospatial.terrain_dem import (
    get_terrain_at_coordinates,
    get_grid_terrain,
    get_corridor_terrain_profile,
    calculate_enhanced_lsi,
    HIGHWAY_CORRIDORS,
)

router = APIRouter(prefix="/terrain", tags=["Geospatial - DEM & Topography"])


class CalculateLSIRequest(BaseModel):
    rainfall_24h: float = Field(50.0, description="24h rainfall in mm")
    threshold: float = Field(100.0, description="Critical geological threshold in mm")
    soil_saturation: float = Field(50.0, description="Soil saturation percentage (0-100)")
    slope_angle: Optional[float] = Field(None, description="Explicit slope angle in degrees (auto-derived from DEM if omitted)")
    lat: Optional[float] = Field(None, description="Latitude for DEM & inventory derivation")
    lng: Optional[float] = Field(None, description="Longitude for DEM & inventory derivation")
    historical_events: Optional[int] = Field(None, description="Historical landslide events (auto-derived from geocoded inventory if omitted)")


@router.get("/point")
async def get_point_terrain(
    lat: float = Query(..., description="Latitude coordinate"),
    lng: float = Query(..., description="Longitude coordinate"),
    dem: str = Query("Copernicus GLO-30", description="DEM source (Copernicus GLO-30, SRTM 30m, CartoDEM 30m)"),
):
    """
    Derives topographic (slope, aspect, curvature, elevation),
    proximity (distance to road cuts and drainage channels),
    geological (GSI lithology and strength), and ecological (LULC root cohesion)
    metrics for a coordinate cell from DEM.
    """
    try:
        data = get_terrain_at_coordinates(lat, lng, dem_source=dem)
        return {
            "success": True,
            "grid_id": data["grid_id"],
            "dem_source": data["dem_source"],
            "coordinates": [data["location"]["coordinates"][0], data["location"]["coordinates"][1]],
            "topography": {
                "elevation_meters": data["elevation_meters"],
                "slope_deg": data["slope_deg"],
                "aspect_deg": data["aspect_deg"],
                "aspect_direction": data["aspect_direction"],
                "curvature": data["curvature"],
            },
            "proximity": {
                "distance_to_roads_meters": data["distance_to_roads_meters"],
                "nearest_road_name": data["nearest_road_name"],
                "distance_to_streams_meters": data["distance_to_streams_meters"],
                "nearest_stream_name": data["nearest_stream_name"],
            },
            "geology": data["lithology"],
            "ecology": data["land_cover"],
            "terrain_risk_multiplier": data["terrain_risk_multiplier"],
        }
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Terrain point derivation error: {exc}",
        )


@router.get("/grid")
async def get_grid(
    bbox: str = Query("88.48,27.20,88.58,27.30", description="Bounding box minLng,minLat,maxLng,maxLat"),
    resolution: float = Query(300.0, description="Grid resolution in meters"),
    dem: str = Query("Copernicus GLO-30", description="DEM source model"),
):
    """
    Generates a GeoJSON FeatureCollection of polygon grid cells over a bounding box,
    deriving slope, aspect, curvature, elevation, distance to roads, distance to streams,
    lithology, and land cover per grid cell.
    """
    try:
        parts = [float(p.strip()) for p in bbox.split(",")]
        if len(parts) != 4:
            raise ValueError("Bounding box must contain 4 comma-separated values: minLng,minLat,maxLng,maxLat")
        min_lng, min_lat, max_lng, max_lat = parts
        res = get_grid_terrain(
            min_lng=min_lng,
            min_lat=min_lat,
            max_lng=max_lng,
            max_lat=max_lat,
            resolution_meters=resolution,
            dem_source=dem,
        )
        return {
            "success": True,
            **res,
        }
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Grid terrain derivation error: {exc}",
        )


@router.get("/corridor/{corridor_id}")
async def get_corridor(corridor_id: str):
    """
    Generates longitudinal elevation and slope profile chainage along highway corridor.
    """
    try:
        profile = get_corridor_terrain_profile(corridor_id)
        return {
            "success": True,
            **profile,
        }
    except ValueError as val_err:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(val_err),
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Corridor profiling error: {exc}",
        )


@router.get("/sources")
async def get_sources():
    """
    Returns metadata on available DEM sources and thematic layers.
    """
    return {
        "success": True,
        "sources": [
            {
                "id": "Copernicus GLO-30",
                "name": "Copernicus DEM GLO-30 Public (ESA)",
                "resolution": "30m",
                "verticalAccuracy": "± 2.0m",
                "coverage": "Global & North-Eastern Region",
                "status": "Active (Primary)",
            },
            {
                "id": "CartoDEM 30m",
                "name": "CartoDEM Version-3 R1 (ISRO NRSC)",
                "resolution": "30m",
                "verticalAccuracy": "± 3.5m",
                "coverage": "Indian Subcontinent (Optimized for Himalayas)",
                "status": "Active (Secondary)",
            },
            {
                "id": "SRTM 30m",
                "name": "Shuttle Radar Topography Mission (SRTM v3.0)",
                "resolution": "30m (1 arc-second)",
                "verticalAccuracy": "± 5.0m",
                "coverage": "Global",
                "status": "Active (Benchmark)",
            },
        ],
        "thematic_layers": [
            {
                "name": "Horn's Slope & Aspect Matrix",
                "derivedFrom": "3x3 neighborhood elevation kernel",
                "units": "Degrees (0°-89.9°)",
            },
            {
                "name": "Profile & Planform Curvatures",
                "derivedFrom": "Zevenbergen & Thorne second spatial derivatives",
                "units": "Curvature units (1/m x 100)",
            },
            {
                "name": "Highway Toe Excavation Proximity",
                "derivedFrom": "Geodesic polyline solver to NH network",
                "units": "Meters",
            },
            {
                "name": "Drainage Scour Proximity",
                "derivedFrom": "Geodesic polyline solver to River channel network",
                "units": "Meters",
            },
            {
                "name": "GSI Bedrock Lithology",
                "derivedFrom": "Geological Survey of India 1:50,000 mapping",
                "classes": ["VERY_LOW", "LOW", "MODERATE", "HIGH"],
            },
            {
                "name": "LULC Root Cohesion",
                "derivedFrom": "ISRO Bhuvan & Copernicus Sentinel-2 LULC",
                "units": "kPa additional shear strength",
            },
        ],
    }


@router.post("/calculate-lsi")
async def calculate_lsi_api(request: CalculateLSIRequest):
    """
    Computes multi-factor Landslide Susceptibility Index (LSI) fusing
    precipitation and soil moisture with DEM-derived geotechnical topography.
    """
    try:
        res = calculate_enhanced_lsi(
            rainfall_24h=request.rainfall_24h,
            threshold=request.threshold,
            soil_saturation=request.soil_saturation,
            slope_angle=request.slope_angle,
            lat=request.lat,
            lng=request.lng,
            historical_events=request.historical_events,
        )
        return {
            "success": True,
            "result": res,
        }
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"LSI calculation error: {exc}",
        )


@router.get("/inventory")
async def get_landslide_inventory(
    state: Optional[str] = Query(None, description="Filter by NER state"),
    source: Optional[str] = Query(None, description="Filter by catalog source (NASA GLC, GSI, BRO, SDMA)"),
    highway: Optional[str] = Query(None, description="Filter by corridor (e.g. NH-10, NH-29)"),
    min_year: Optional[int] = Query(None, description="Minimum event year"),
    lat: Optional[float] = Query(None, description="Optional center latitude for radius filter"),
    lng: Optional[float] = Query(None, description="Optional center longitude for radius filter"),
    radius_km: float = Query(25.0, description="Spatial search radius in km"),
):
    """
    Returns geocoded historical landslide inventory compiled from NASA GLC, GSI Bhukosh,
    BRO Task Forces, and State SDMA records. Supports spatial radius filtering.
    """
    from app.geospatial.landslide_inventory import (
        HISTORICAL_LANDSLIDE_INVENTORY,
        query_historical_landslides_near,
    )

    if lat is not None and lng is not None:
        events = query_historical_landslides_near(lat, lng, radius_km=radius_km)
    else:
        events = [dict(e) for e in HISTORICAL_LANDSLIDE_INVENTORY]

    if state:
        events = [e for e in events if e.get("state", "").lower() == state.lower()]
    if source:
        events = [e for e in events if source.lower() in e.get("source", "").lower()]
    if highway:
        events = [e for e in events if highway.lower() in e.get("highway", "").lower()]
    if min_year:
        events = [e for e in events if e.get("year", 0) >= min_year]

    return {
        "success": True,
        "total_records": len(events),
        "source_catalogs": [
            "NASA Global Landslide Catalog (GLC)",
            "Geological Survey of India (GSI Bhukosh NLSM)",
            "Border Roads Organisation (BRO Projects Swastik, Pushpak, Sewak, Vartak)",
            "State Disaster Management Authorities (SDMA / PWD)",
        ],
        "events": events,
    }


@router.get("/inventory/stats")
async def get_inventory_stats():
    """
    Returns summary analytics on historical landslide events across NER states.
    """
    from app.geospatial.landslide_inventory import HISTORICAL_LANDSLIDE_INVENTORY

    by_state: Dict[str, int] = {}
    by_source: Dict[str, int] = {}
    by_category: Dict[str, int] = {}
    total_fatalities = 0
    total_blockage_days = 0

    for e in HISTORICAL_LANDSLIDE_INVENTORY:
        st = e.get("state", "Unknown")
        by_state[st] = by_state.get(st, 0) + 1

        src = e.get("source", "Unknown")
        by_source[src] = by_source.get(src, 0) + 1

        cat = e.get("category", "General")
        by_category[cat] = by_category.get(cat, 0) + 1

        total_fatalities += e.get("fatalities", 0)
        total_blockage_days += e.get("road_blockage_days", 0)

    return {
        "success": True,
        "total_documented_landslides": len(HISTORICAL_LANDSLIDE_INVENTORY),
        "by_state": by_state,
        "by_source": by_source,
        "by_category": by_category,
        "total_documented_fatalities": total_fatalities,
        "total_road_blockage_days": total_blockage_days,
    }


@router.get("/inventory/density")
async def get_point_historical_density(
    lat: float = Query(..., description="Latitude coordinate"),
    lng: float = Query(..., description="Longitude coordinate"),
    radius_km: float = Query(30.0, description="Spatial query radius in km"),
):
    """
    Calculates spatial historical landslide density, kernel score, and nearest event proximity.
    Replaces static constant defaults with geocoded spatial analysis.
    """
    from app.geospatial.landslide_inventory import calculate_historical_landslide_density

    result = calculate_historical_landslide_density(lat, lng, radius_km=radius_km)
    return {
        "success": True,
        "coordinates": [lng, lat],
        "result": result,
    }


@router.get("/inventory/training-metrics")
async def get_inventory_training_metrics():
    """
    Returns validation and calibration metrics for the supervised model trained
    on geocoded historical landslide labels and negative controls.
    """
    from app.geospatial.landslide_inventory import train_inventory_landslide_model

    bundle = train_inventory_landslide_model()
    return {
        "success": True,
        "model_name": "ner-historical-inventory-ensemble",
        "training_dataset": "NASA GLC + GSI Bhukosh + BRO NER Historical Inventory",
        "metrics": bundle["metrics"],
        "trained_date": bundle["trained_date"],
    }


# ─── Model Validation Benchmark Endpoint ───────────────────────────────────────

@router.get("/model-validation")
async def get_model_validation_benchmark():
    """
    Validates and compares:
      1. Rainfall-threshold baseline (standard empirical I-D critical threshold)
      2. Logistic Regression (scaled linear model on inventory)
      3. Gradient-Boosted Classifier (non-linear ensemble on inventory)

    Uses Spatial Cross-Validation (GroupKFold grouped by 8 NER States & River Basins).
    Reports Precision, Recall, F1-Score, ROC-AUC, and Warning Lead Time (in hours).
    """
    try:
        from app.geospatial.landslide_inventory import evaluate_spatial_models_with_baselines

        report = evaluate_spatial_models_with_baselines()
        return {
            "success": True,
            "validation_report": report,
        }
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Model validation execution error: {exc}",
        )


# ─── Live Grid Cell & Road Segment Inference Schemas ──────────────────────────

class LiveGridCellInput(BaseModel):
    grid_id: Optional[str] = Field(None, description="Unique grid cell identifier")
    latitude: float = Field(..., description="Latitude coordinate")
    longitude: float = Field(..., description="Longitude coordinate")
    rainfall_24h_mm: Optional[float] = Field(50.0, description="Live 24h rainfall in mm")
    rainfall_1h_mm: Optional[float] = Field(None, description="Hourly rainfall in mm")
    rainfall_6h_mm: Optional[float] = Field(None, description="6-hour rainfall in mm")
    rainfall_7d_mm: Optional[float] = Field(None, description="7-day cumulative rainfall in mm")
    soil_moisture_pct: Optional[float] = Field(55.0, description="Soil saturation percentage (0-100)")
    slope_angle_deg: Optional[float] = Field(None, description="Slope angle in degrees (auto-derived from DEM if omitted)")
    elevation_m: Optional[float] = Field(None, description="Elevation in meters (auto-derived from DEM if omitted)")
    crack_density: Optional[float] = Field(0.04, description="Surface crack density (0-1)")
    ground_displacement_mm: Optional[float] = Field(0.5, description="Ground displacement rate (mm)")
    dem_source: Optional[str] = Field("Copernicus GLO-30", description="DEM source model")


class PredictGridCellsRequest(BaseModel):
    cells: Optional[List[LiveGridCellInput]] = Field(None, description="List of custom grid cells with live telemetry")
    bbox: Optional[str] = Field(None, description="Optional bounding box 'minLng,minLat,maxLng,maxLat' to generate and predict cells")
    resolution: Optional[float] = Field(500.0, description="Grid resolution in meters when bbox provided")
    live_rainfall_24h_mm: Optional[float] = Field(65.0, description="Live rainfall to apply across bounding box cells")
    live_soil_moisture_pct: Optional[float] = Field(60.0, description="Live soil moisture to apply across bounding box cells")
    dem_source: Optional[str] = Field("Copernicus GLO-30", description="DEM source")


class RoadSegmentInput(BaseModel):
    segment_id: Optional[str] = Field(None, description="Road segment or milestone ID")
    highway_name: Optional[str] = Field("NH-10", description="Highway corridor name")
    chainage_km: Optional[float] = Field(None, description="Chainage distance along corridor in km")
    latitude: float = Field(..., description="Latitude coordinate")
    longitude: float = Field(..., description="Longitude coordinate")
    rainfall_24h_mm: Optional[float] = Field(75.0, description="Live 24h rainfall in mm")
    soil_moisture_pct: Optional[float] = Field(65.0, description="Soil saturation percentage (0-100)")
    slope_angle_deg: Optional[float] = Field(None, description="Slope inclination in degrees (auto-derived if omitted)")
    crack_density: Optional[float] = Field(0.05, description="Surface crack dilation")
    ground_displacement_mm: Optional[float] = Field(0.8, description="Displacement rate (mm)")


class PredictRoadSegmentsRequest(BaseModel):
    highway: Optional[str] = Field("NH-10", description="Pre-configured corridor ID (NH-10, NH-29, NH-6, NH-13, NH-54, NH-2, NH-37)")
    live_rainfall_24h_mm: Optional[float] = Field(90.0, description="Live rainfall to apply along corridor (mm)")
    live_soil_moisture_pct: Optional[float] = Field(70.0, description="Live soil moisture (%) along corridor")
    custom_segments: Optional[List[RoadSegmentInput]] = Field(None, description="Explicit road segments with live inputs")


# ─── Live Grid Cell Execution Endpoint ─────────────────────────────────────────

@router.post("/predict-grid-cells")
async def predict_grid_cells(request: PredictGridCellsRequest):
    """
    Executes the validated inventory-trained Gradient Boosted ML model per grid cell
    on live inputs. Outputs susceptibility score, risk category, warning lead time (hours),
    and renamed Geotechnical Slope Stability Margin.
    """
    from app.geospatial.landslide_inventory import predict_live_terrain_hazard

    results = []

    # Case A: Explicit list of cells provided
    if request.cells:
        for idx, cell in enumerate(request.cells):
            cell_lat, cell_lng = cell.latitude, cell.longitude
            cell_dict = cell.model_dump(exclude_unset=True)

            # Auto-derive DEM topographic properties if missing
            terrain = None
            if cell.slope_angle_deg is None or cell.elevation_m is None:
                try:
                    terrain = get_terrain_at_coordinates(cell_lat, cell_lng, dem_source=cell.dem_source or "Copernicus GLO-30")
                    if cell.slope_angle_deg is None:
                        cell_dict["slope_angle_deg"] = terrain["slope_deg"]
                    if cell.elevation_m is None:
                        cell_dict["elevation_m"] = terrain["elevation_meters"]
                    if cell_dict.get("distance_to_road_m") is None:
                        cell_dict["distance_to_road_m"] = terrain["distance_to_roads_meters"]
                    if cell_dict.get("distance_to_drainage_m") is None:
                        cell_dict["distance_to_drainage_m"] = terrain["distance_to_streams_meters"]
                except Exception:
                    pass

            hazard = predict_live_terrain_hazard(cell_dict)
            results.append({
                "grid_id": cell.grid_id or f"GRID-CELL-{idx + 1:03d}",
                "coordinates": [cell_lng, cell_lat],
                "prediction": hazard,
                "dem_derived": terrain is not None,
                "dem_features": {
                    "slope_deg": cell_dict.get("slope_angle_deg"),
                    "elevation_meters": cell_dict.get("elevation_m"),
                    "lithology": terrain["lithology"]["formation"] if terrain else "Regional Formation",
                    "lithology_strength": terrain["lithology"]["strength_class"] if terrain else "MODERATE",
                } if terrain else None,
            })

    # Case B: Bounding box provided -> generate polygon cells and score each
    elif request.bbox:
        parts = [float(p.strip()) for p in request.bbox.split(",")]
        if len(parts) != 4:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Bounding box must contain 4 comma-separated numbers: minLng,minLat,maxLng,maxLat",
            )
        min_lng, min_lat, max_lng, max_lat = parts
        grid_geo = get_grid_terrain(
            min_lng=min_lng,
            min_lat=min_lat,
            max_lng=max_lng,
            max_lat=max_lat,
            resolution_meters=request.resolution or 500.0,
            dem_source=request.dem_source or "Copernicus GLO-30",
        )

        for feat in grid_geo.get("features", []):
            props = feat.get("properties", {})
            centroid = props.get("center_coordinates", [min_lng, min_lat])
            cell_lng, cell_lat = centroid[0], centroid[1]

            cell_input = {
                "latitude": cell_lat,
                "longitude": cell_lng,
                "rainfall_24h_mm": request.live_rainfall_24h_mm or 65.0,
                "soil_moisture_pct": request.live_soil_moisture_pct or 60.0,
                "slope_angle_deg": props.get("slope_deg", 25.0),
                "elevation_m": props.get("elevation_meters", 800.0),
                "distance_to_road_m": props.get("distance_to_roads_meters", 150.0),
                "distance_to_drainage_m": props.get("distance_to_streams_meters", 200.0),
                "crack_density": 0.04,
                "ground_displacement_mm": 0.6,
            }

            hazard = predict_live_terrain_hazard(cell_input)

            # Inject prediction into feature properties for GeoJSON visualization
            props["hazard_prediction"] = hazard
            results.append({
                "grid_id": props.get("grid_id"),
                "coordinates": [cell_lng, cell_lat],
                "prediction": hazard,
                "dem_features": {
                    "slope_deg": props.get("slope_deg"),
                    "elevation_meters": props.get("elevation_meters"),
                    "lithology": props.get("lithology", {}).get("formation"),
                    "lithology_strength": props.get("lithology", {}).get("strength_class"),
                    "land_cover": props.get("land_cover", {}).get("classification"),
                },
            })

    else:
        # Default: sample high-risk grid cell across East Sikkim / Teesta Gorge
        sample_cells = [
            {"id": "CELL-SK-TEESTA", "lat": 27.0654, "lng": 88.4612, "rain": 140.0, "soil": 88.0, "crack": 0.16, "disp": 3.8},
            {"id": "CELL-NL-DZUDZA", "lat": 25.7000, "lng": 94.0200, "rain": 115.0, "soil": 84.0, "crack": 0.12, "disp": 2.9},
            {"id": "CELL-AS-VALLEY", "lat": 26.1800, "lng": 91.7500, "rain": 90.0,  "soil": 50.0, "crack": 0.01, "disp": 0.2},
        ]
        for s in sample_cells:
            t = get_terrain_at_coordinates(s["lat"], s["lng"])
            cell_data = {
                "latitude": s["lat"],
                "longitude": s["lng"],
                "rainfall_24h_mm": s["rain"],
                "soil_moisture_pct": s["soil"],
                "slope_angle_deg": t["slope_deg"],
                "elevation_m": t["elevation_meters"],
                "distance_to_road_m": t["distance_to_roads_meters"],
                "distance_to_drainage_m": t["distance_to_streams_meters"],
                "crack_density": s["crack"],
                "ground_displacement_mm": s["disp"],
            }
            hazard = predict_live_terrain_hazard(cell_data)
            results.append({
                "grid_id": s["id"],
                "coordinates": [s["lng"], s["lat"]],
                "prediction": hazard,
                "dem_features": {
                    "slope_deg": t["slope_deg"],
                    "elevation_meters": t["elevation_meters"],
                    "lithology": t["lithology"]["formation"],
                    "lithology_strength": t["lithology"]["strength_class"],
                },
            })

    return {
        "success": True,
        "total_cells_evaluated": len(results),
        "model_used": "GradientBoostedClassifier (Spatial Cross-Validated Inventory Model)",
        "results": results,
    }


# ─── Live Road Segment Execution Endpoint ──────────────────────────────────────

@router.post("/predict-road-segments")
async def predict_road_segments(request: PredictRoadSegmentsRequest):
    """
    Executes live ML inference per highway road segment along critical NER transit corridors
    (e.g., NH-10, NH-29, NH-6, NH-13, NH-54, NH-2, NH-37).

    Returns segment-by-segment predictions with:
      - Susceptibility score & risk category
      - Warning Lead Time in hours
      - Renamed Geotechnical Slope Stability Margin
      - Estimated Road Blockage Probability (%)
      - Tactical Mitigation Action for highway engineering and traffic control.
    """
    from app.geospatial.landslide_inventory import predict_live_terrain_hazard

    segments_evaluated = []

    # Case A: Custom segment list provided
    if request.custom_segments:
        for idx, seg in enumerate(request.custom_segments):
            seg_dict = seg.model_dump(exclude_unset=True)
            terrain = None
            if seg.slope_angle_deg is None:
                try:
                    terrain = get_terrain_at_coordinates(seg.latitude, seg.longitude)
                    seg_dict["slope_angle_deg"] = terrain["slope_deg"]
                    seg_dict["elevation_m"] = terrain["elevation_meters"]
                    seg_dict["distance_to_road_m"] = 15.0  # On road corridor
                except Exception:
                    pass

            hazard = predict_live_terrain_hazard(seg_dict)

            # Road blockage probability factors in slope, road proximity, and susceptibility
            prob = hazard["susceptibility_score"]
            blockage_prob = round(min(0.98, prob * 1.05), 3) if prob >= 0.40 else round(prob * 0.4, 3)

            rec_action = (
                "Issue red transit warning; pre-position heavy wheel loaders & rock-breaker excavators."
                if prob >= 0.80
                else "Night movement restriction; deploy drone slope-monitoring and patrol."
                if prob >= 0.65
                else "Standard monsoon caution; monitor culvert clearance and drainage."
                if prob >= 0.40
                else "Normal traffic flow; no transit restrictions."
            )

            segments_evaluated.append({
                "segment_id": seg.segment_id or f"SEG-{idx + 1:02d}",
                "highway_name": seg.highway_name or "Highway Corridor",
                "chainage_km": seg.chainage_km,
                "coordinates": [seg.longitude, seg.latitude],
                "prediction": hazard,
                "road_blockage_probability": blockage_prob,
                "recommended_action": rec_action,
            })

    # Case B: Pre-configured highway corridor provided
    else:
        highway_id = request.highway or "NH-10"
        try:
            corridor = get_corridor_terrain_profile(highway_id)
        except Exception:
            corridor = get_corridor_terrain_profile("NH-10")

        live_rain = request.live_rainfall_24h_mm or 90.0
        live_soil = request.live_soil_moisture_pct or 70.0

        for idx, point in enumerate(corridor.get("profile", [])):
            pt_lng, pt_lat = point["coordinates"]
            seg_input = {
                "latitude": pt_lat,
                "longitude": pt_lng,
                "rainfall_24h_mm": live_rain,
                "soil_moisture_pct": live_soil,
                "slope_angle_deg": point["slope_deg"],
                "elevation_m": point["elevation_meters"],
                "distance_to_road_m": 12.0,  # Road shoulder
                "distance_to_drainage_m": point["distance_to_streams_meters"],
                "crack_density": 0.08 if point["slope_deg"] > 30 else 0.02,
                "ground_displacement_mm": 1.5 if point["slope_deg"] > 30 else 0.3,
            }

            hazard = predict_live_terrain_hazard(seg_input)
            prob = hazard["susceptibility_score"]
            blockage_prob = round(min(0.98, prob * 1.05), 3) if prob >= 0.40 else round(prob * 0.4, 3)

            rec_action = (
                f"High collapse danger at Chainage Km {point['chainage_km']}: Pre-deploy BRO earthmoving team at standby; close lane to heavy vehicles."
                if prob >= 0.80
                else f"Active slope creep at Km {point['chainage_km']}: Issue convoy speed limit (20 km/h); post safety flaggers."
                if prob >= 0.65
                else f"Moderate moisture saturation at Km {point['chainage_km']}: Regular patrol frequency."
                if prob >= 0.40
                else "Corridor segment clear; standard transit."
            )

            segments_evaluated.append({
                "segment_id": f"{highway_id}-KM{point['chainage_km']:.0f}",
                "highway_name": corridor["corridor_name"],
                "chainage_km": point["chainage_km"],
                "coordinates": [pt_lng, pt_lat],
                "elevation_meters": point["elevation_meters"],
                "slope_deg": point["slope_deg"],
                "lithology": point["lithology"],
                "strength_class": point["strength_class"],
                "prediction": hazard,
                "road_blockage_probability": blockage_prob,
                "recommended_action": rec_action,
            })

    # Summary statistics across corridor
    max_risk = max((s["prediction"]["susceptibility_score"] for s in segments_evaluated), default=0.0)
    critical_count = sum(1 for s in segments_evaluated if s["prediction"]["risk_level"] in ("High", "Critical"))

    return {
        "success": True,
        "highway": request.highway or "NH-10",
        "total_segments_evaluated": len(segments_evaluated),
        "critical_segments_count": critical_count,
        "max_segment_risk_score": max_risk,
        "corridor_status": "HIGH ALERT" if max_risk >= 0.75 else "VIGILANCE" if max_risk >= 0.45 else "NORMAL",
        "segments": segments_evaluated,
    }


@router.get("/predict-road-corridor")
async def get_road_corridor_prediction(
    highway: str = Query("NH-10", description="Corridor ID: NH-10, NH-29, NH-6, NH-13, NH-54, NH-2, NH-37"),
    rainfall_24h_mm: float = Query(90.0, description="Live 24h rainfall (mm)"),
    soil_moisture_pct: float = Query(70.0, description="Live soil moisture (%)"),
):
    """Convenience GET endpoint for evaluating strategic highway corridors on live weather."""
    req = PredictRoadSegmentsRequest(
        highway=highway,
        live_rainfall_24h_mm=rainfall_24h_mm,
        live_soil_moisture_pct=soil_moisture_pct,
    )
    return await predict_road_segments(req)

