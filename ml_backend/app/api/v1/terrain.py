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
