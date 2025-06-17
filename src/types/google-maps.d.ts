
declare namespace google {
  namespace maps {
    class Map {
      constructor(element: HTMLElement, options?: MapOptions);
      setCenter(latlng: LatLng | LatLngLiteral): void;
      setZoom(zoom: number): void;
    }

    interface MapOptions {
      center?: LatLng | LatLngLiteral;
      zoom?: number;
      mapTypeId?: MapTypeId;
    }

    class LatLng {
      constructor(lat: number, lng: number);
      lat(): number;
      lng(): number;
    }

    interface LatLngLiteral {
      lat: number;
      lng: number;
    }

    class Marker {
      constructor(options?: MarkerOptions);
      setMap(map: Map | null): void;
      setPosition(latlng: LatLng | LatLngLiteral): void;
    }

    interface MarkerOptions {
      position?: LatLng | LatLngLiteral;
      map?: Map;
      title?: string;
    }

    class DirectionsService {
      route(request: DirectionsRequest, callback: (result: DirectionsResult, status: DirectionsStatus) => void): void;
    }

    class DirectionsRenderer {
      constructor(options?: DirectionsRendererOptions);
      setMap(map: Map | null): void;
      setDirections(directions: DirectionsResult): void;
    }

    interface DirectionsRequest {
      origin: string | LatLng | LatLngLiteral;
      destination: string | LatLng | LatLngLiteral;
      travelMode: TravelMode;
    }

    interface DirectionsResult {
      routes: DirectionsRoute[];
    }

    interface DirectionsRoute {
      legs: DirectionsLeg[];
    }

    interface DirectionsLeg {
      distance: Distance;
      duration: Duration;
    }

    interface Distance {
      text: string;
      value: number;
    }

    interface Duration {
      text: string;
      value: number;
    }

    interface DirectionsRendererOptions {
      map?: Map;
      suppressMarkers?: boolean;
    }

    enum DirectionsStatus {
      OK = "OK",
      NOT_FOUND = "NOT_FOUND",
      ZERO_RESULTS = "ZERO_RESULTS",
      MAX_WAYPOINTS_EXCEEDED = "MAX_WAYPOINTS_EXCEEDED",
      INVALID_REQUEST = "INVALID_REQUEST",
      OVER_QUERY_LIMIT = "OVER_QUERY_LIMIT",
      REQUEST_DENIED = "REQUEST_DENIED",
      UNKNOWN_ERROR = "UNKNOWN_ERROR"
    }

    enum TravelMode {
      DRIVING = "DRIVING",
      WALKING = "WALKING",
      BICYCLING = "BICYCLING",
      TRANSIT = "TRANSIT"
    }

    enum MapTypeId {
      ROADMAP = "roadmap",
      SATELLITE = "satellite",
      HYBRID = "hybrid",
      TERRAIN = "terrain"
    }

    namespace places {
      class Autocomplete {
        constructor(input: HTMLInputElement, options?: AutocompleteOptions);
        addListener(eventName: string, handler: () => void): void;
        getPlace(): PlaceResult;
      }

      interface AutocompleteOptions {
        types?: string[];
        componentRestrictions?: ComponentRestrictions;
      }

      interface ComponentRestrictions {
        country?: string | string[];
      }

      interface PlaceResult {
        formatted_address?: string;
        name?: string;
        geometry?: PlaceGeometry;
      }

      interface PlaceGeometry {
        location?: LatLng;
      }
    }

    namespace event {
      function clearInstanceListeners(instance: any): void;
    }
  }
}

declare global {
  interface Window {
    google?: typeof google;
  }
}
