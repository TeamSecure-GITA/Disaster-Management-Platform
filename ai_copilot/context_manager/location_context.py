from typing import Optional, List
from schemas.input import GeoPoint
from schemas.context import LocationContext

class LocationContextTracker:
    def update_location(self, context: LocationContext, point: GeoPoint, zone: str = None) -> LocationContext:
        context.current_location = point
        if zone and zone not in context.affected_zones:
            context.affected_zones.append(zone)
        return context
