import { GeoCoordinate } from '../types/prediction';
import { MAP_DEFAULTS } from '../lib/maps';

interface MapLayers {
  risk: boolean;
  sensors: boolean;
  responders: boolean;
  shelters: boolean;
  evacuation: boolean;
  satellites: boolean;
  dronePath: boolean;
}

interface MapState {
  center: GeoCoordinate;
  zoom: number;
  layers: MapLayers;
  selectedEntity: {
    type: 'incident' | 'sensor' | 'responder' | 'shelter' | 'zone';
    id: string;
  } | null;
}

type Listener = () => void;

class MapStore {
  private state: MapState = {
    center: MAP_DEFAULTS.center,
    zoom: MAP_DEFAULTS.zoom,
    layers: {
      risk: true,
      sensors: true,
      responders: true,
      shelters: true,
      evacuation: true,
      satellites: false,
      dronePath: true,
    },
    selectedEntity: null,
  };

  private listeners: Set<Listener> = new Set();

  public getState = (): MapState => this.state;

  public subscribe = (listener: Listener): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  private notify() {
    this.listeners.forEach((listener) => listener());
  }

  public setView = (center: GeoCoordinate, zoom?: number) => {
    this.state = {
      ...this.state,
      center,
      zoom: zoom !== undefined ? zoom : this.state.zoom,
    };
    this.notify();
  };

  public toggleLayer = (layerName: keyof MapLayers) => {
    this.state = {
      ...this.state,
      layers: {
        ...this.state.layers,
        [layerName]: !this.state.layers[layerName],
      },
    };
    this.notify();
  };

  public selectEntity = (type: MapState['selectedEntity']) => {
    this.state = { ...this.state, selectedEntity: type };
    this.notify();
  };
}

export const mapStore = new MapStore();
