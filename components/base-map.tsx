"use client";

import { useEffect, useRef } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

type Marker = {
  lat: number
  lng: number
  type?: "pickup" | "dropoff" | "driver" | "default"
  label?: string
}

interface PickupLocationPopup {
  lat: number
  lng: number
  address: string
  subtitle: string
}

interface BaseMapProps {
  center?: [number, number]
  markers?: Marker[]
  polylines?: [number, number][]
  bounds?: [[number, number], [number, number]]
  onClick?: (lat: number, lng: number) => void
  zoom?: number
  showCenterPin?: boolean
  onMapMove?: (lat: number, lng: number) => void
  enableGeolocation?: boolean
  onGeolocationUpdate?: (lat: number, lng: number, accuracy: number) => void
  hideDriverLabels?: boolean
  pickupLocationPopup?: PickupLocationPopup
}

export default function BaseMap({
  center = [40.7128, -74.006],
  markers = [],
  polylines = [],
  bounds,
  onClick,
  zoom = 13,
  showCenterPin = false,
  onMapMove,
  enableGeolocation = false,
  onGeolocationUpdate,
  hideDriverLabels = false,
  pickupLocationPopup,
}: BaseMapProps) {
  const mapRef = useRef<L.Map | null>(null)
  const markersLayer = useRef<L.LayerGroup | null>(null)
  const polylineLayer = useRef<L.Polyline | null>(null)
  const centerPinRef = useRef<HTMLDivElement | null>(null)
  const geoMarkerRef = useRef<L.Marker | null>(null)
  const geoCircleRef = useRef<L.Circle | null>(null)
  const watchIdRef = useRef<number | null>(null)
  const zoomedRef = useRef<boolean>(false)
  const pickupPopupRef = useRef<L.Marker | null>(null)
  const containerIdRef = useRef<string>(`map-${Math.random().toString(36).substr(2, 9)}`)

  // Refs to prevent infinite loops
  const moveCallbackRef = useRef(onMapMove)
  const isUserDraggingRef = useRef(false)
  const moveTimeoutRef = useRef<NodeJS.Timeout>()

  // Update callback ref when onMapMove changes
  useEffect(() => {
    moveCallbackRef.current = onMapMove
  }, [onMapMove])

  // Initialize map
  useEffect(() => {
    if (!mapRef.current) {
      const containerId = containerIdRef.current
      const container = document.getElementById(containerId)

      // Ensure container exists before initializing
      if (!container) return

      // Check if container already has a map
      if ((container as any)._leaflet_id) {
        return
      }

      mapRef.current = L.map(containerId, {
        center,
        zoom,
        zoomControl: true,
        scrollWheelZoom: true,
        doubleClickZoom: true,
        touchZoom: true,
        dragging: true,
        zoomAnimation: true,
        fadeAnimation: true,
        markerZoomAnimation: true,
        // Improve performance for smooth dragging
        preferCanvas: false,
        attributionControl: false,
      })

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '© <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        // Improve tile loading for smoother experience
        keepBuffer: 4,
        updateWhenZooming: false,
        updateWhenIdle: true,
      }).addTo(mapRef.current)

      if (onClick) {
        mapRef.current.on("click", (e: any) => {
          onClick(e.latlng.lat, e.latlng.lng)
        })
      }
    }
  }, [])

  // Handle center pin
  useEffect(() => {
    if (showCenterPin && !centerPinRef.current) {
      const mapContainer = document.getElementById(containerIdRef.current)
      if (mapContainer) {
        const pin = document.createElement("div")
        pin.innerHTML = `
          <div style="
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -100%);
            z-index: 1000;
            pointer-events: none;
          ">
            <div style="
              width: 24px;
              height: 24px;
              background: #EF4444;
              border: 4px solid white;
              border-radius: 50%;
              box-shadow: 0 4px 12px rgba(0,0,0,0.4);
              display: flex;
              align-items: center;
              justify-content: center;
            ">
              <div style="width: 8px; height: 8px; background: white; border-radius: 50%;"></div>
            </div>
            <div style="
              position: absolute;
              top: 24px;
              left: 50%;
              transform: translateX(-50%);
              width: 2px;
              height: 12px;
              background: #EF4444;
              box-shadow: 1px 0 2px rgba(0,0,0,0.3);
            "></div>
            <div style="
              position: absolute;
              top: 36px;
              left: 50%;
              transform: translateX(-50%);
              width: 8px;
              height: 4px;
              background: rgba(0,0,0,0.3);
              border-radius: 50%;
              filter: blur(1px);
            "></div>
          </div>
        `
        pin.style.position = "absolute"
        pin.style.top = "0"
        pin.style.left = "0"
        pin.style.width = "100%"
        pin.style.height = "100%"
        pin.style.pointerEvents = "none"
        pin.style.zIndex = "1000"

        mapContainer.appendChild(pin)
        centerPinRef.current = pin
      }
    } else if (!showCenterPin && centerPinRef.current) {
      centerPinRef.current.remove()
      centerPinRef.current = null
    }

    return () => {
      if (centerPinRef.current) {
        centerPinRef.current.remove()
        centerPinRef.current = null
      }
    }
  }, [showCenterPin])

  // Handle pickup location popup
  useEffect(() => {
    if (!mapRef.current) return

    if (pickupPopupRef.current) {
      mapRef.current.removeLayer(pickupPopupRef.current)
      pickupPopupRef.current = null
    }

    if (pickupLocationPopup) {
      const popupIcon = L.divIcon({
        className: "pickup-popup-icon",
        html: `
          <div style="
            background: white;
            color: #374151;
            padding: 8px 12px;
            border-radius: 4px;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
            font-family: system-ui, -apple-system, sans-serif;
            transform: translate(-50%, -100%);
            margin-bottom: 8px;
            white-space: nowrap;
            font-size: 14px;
            font-weight: 500;
            position: relative;
            border: 1px solid rgba(0, 0, 0, 0.1);
          ">
            ${pickupLocationPopup.address}
            <div style="
              position: absolute;
              bottom: -5px;
              left: 50%;
              transform: translateX(-50%);
              width: 0;
              height: 0;
              border-left: 5px solid transparent;
              border-right: 5px solid transparent;
              border-top: 5px solid white;
            "></div>
            <div style="
              position: absolute;
              bottom: -6px;
              left: 50%;
              transform: translateX(-50%);
              width: 0;
              height: 0;
              border-left: 6px solid transparent;
              border-right: 6px solid transparent;
              border-top: 6px solid rgba(0, 0, 0, 0.1);
              z-index: -1;
            "></div>
          </div>
        `,
        iconSize: [0, 0],
        iconAnchor: [0, 0],
      })

      pickupPopupRef.current = L.marker([pickupLocationPopup.lat, pickupLocationPopup.lng], {
        icon: popupIcon,
        zIndexOffset: 1000,
      }).addTo(mapRef.current)
    }
  }, [pickupLocationPopup])

  // Handle geolocation
  useEffect(() => {
    if (!mapRef.current || !enableGeolocation) return

    const success = (pos: GeolocationPosition) => {
      const lat = pos.coords.latitude
      const lng = pos.coords.longitude
      const accuracy = pos.coords.accuracy

      if (geoMarkerRef.current) mapRef.current!.removeLayer(geoMarkerRef.current)
      if (geoCircleRef.current) mapRef.current!.removeLayer(geoCircleRef.current)

      geoMarkerRef.current = L.marker([lat, lng]).addTo(mapRef.current!)
      geoCircleRef.current = L.circle([lat, lng], { radius: accuracy }).addTo(mapRef.current!)

      if (!zoomedRef.current) {
        mapRef.current!.fitBounds(geoCircleRef.current.getBounds())
        zoomedRef.current = true
      }

      mapRef.current!.setView([lat, lng])
      onGeolocationUpdate?.(lat, lng, accuracy)
    }

    const error = (err: GeolocationPositionError) => {
      if (err.code === 1) alert("Please allow geolocation access")
      else alert("Cannot get current location")
    }

    watchIdRef.current = navigator.geolocation.watchPosition(success, error)

    return () => {
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current)
      if (geoMarkerRef.current) mapRef.current?.removeLayer(geoMarkerRef.current)
      if (geoCircleRef.current) mapRef.current?.removeLayer(geoCircleRef.current)
    }
  }, [enableGeolocation, onGeolocationUpdate])

  // Update map view
  useEffect(() => {
    if (!mapRef.current) return
    if (bounds) {
      mapRef.current.fitBounds(bounds, { padding: [50, 50] })
    } else if (center) {
      mapRef.current.setView(center, zoom)
    }
  }, [center, zoom, bounds])

  // Update markers
  useEffect(() => {
    if (!mapRef.current) return

    if (markersLayer.current) {
      markersLayer.current.clearLayers()
    } else {
      markersLayer.current = L.layerGroup().addTo(mapRef.current)
    }

    markers.forEach((m) => {
      let color = "blue"
      let iconHtml = ""

      if (m.type === "pickup") {
        color = "green"
        iconHtml = `<div style="background:${color};width:20px;height:20px;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;">
          <div style="width:8px;height:8px;background:white;border-radius:50%;"></div>
        </div>`
      } else if (m.type === "dropoff") {
        color = "red"
        iconHtml = `<div style="background:${color};width:20px;height:20px;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;">
          <div style="width:8px;height:8px;background:white;border-radius:50%;"></div>
        </div>`
      } else if (m.type === "driver") {
        iconHtml = `<div style="width:32px;height:32px;display:flex;align-items:center;justify-content:center;background:white;border-radius:50%;box-shadow:0 2px 12px rgba(0,0,0,0.3);border:2px solid #3B82F6;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 17H19V15H21V17C21 17.5523 20.5523 18 20 18H19V19C19 19.5523 18.55228 20 18 20H16C15.4477 20 15 19.5523 15 19V18H9V19C9 19.5523 8.55228 20 8 20H6C5.44772 20 5 19.5523 5 19V18H4C3.44772 18 3 17.5523 3 17V15H5V17Z" fill="#3B82F6"/>
            <path d="M19 13V11L17.4 6.2C17.1 5.5 16.4 5 15.6 5H8.4C7.6 5 6.9 5.5 6.6 6.2L5 11V13H19ZM8.5 7H15.5L16.5 10H7.5L8.5 7Z" fill="#3B82F6"/>
            <circle cx="7.5" cy="14.5" r="1.5" fill="#3B82F6"/>
            <circle cx="16.5" cy="14.5" r="1.5" fill="#3B82F6"/>
          </svg>
        </div>`
      } else {
        iconHtml = `<div style="background:${color};width:16px;height:16px;border-radius:50%;border:2px solid white;box-shadow:0 0 4px rgba(0,0,0,0.5)"></div>`
      }

      const icon = L.divIcon({
        className: "custom-icon",
        html: iconHtml,
        iconSize: m.type === "driver" ? [32, 32] : [20, 20],
        iconAnchor: m.type === "driver" ? [16, 16] : [10, 10],
      })

      const marker = L.marker([m.lat, m.lng], { icon }).addTo(markersLayer.current!)

      if (m.label && !(m.type === "driver" && hideDriverLabels)) {
        marker
          .bindTooltip(m.label, {
            permanent: true,
            direction: "top",
            offset: [0, m.type === "driver" ? -20 : -15],
            className: "permanent-tooltip",
          })
          .openTooltip()
      }
    })
  }, [markers, hideDriverLabels])

  // Update polyline
  useEffect(() => {
    if (!mapRef.current) return

    if (polylineLayer.current) {
      mapRef.current.removeLayer(polylineLayer.current)
      polylineLayer.current = null
    }

    if (polylines && polylines.length >= 2) {
      polylineLayer.current = L.polyline(polylines, {
        color: "#3B82F6",
        weight: 4,
        opacity: 0.8,
        lineCap: "round",
        lineJoin: "round",
      }).addTo(mapRef.current)
    }
  }, [polylines])

  // Simplified map movement handling
  useEffect(() => {
    if (!mapRef.current || !moveCallbackRef.current) return

    // Clear all existing listeners
    mapRef.current.off("drag")
    mapRef.current.off("dragend")
    mapRef.current.off("moveend")

    // Simple approach: only listen to drag events for real-time updates
    const handleDrag = () => {
      if (mapRef.current && moveCallbackRef.current) {
        const center = mapRef.current.getCenter()
        moveCallbackRef.current(center.lat, center.lng)
      }
    }

    const handleDragEnd = () => {
      if (mapRef.current && moveCallbackRef.current) {
        const center = mapRef.current.getCenter()
        moveCallbackRef.current(center.lat, center.lng)
      }
    }

    // Attach listeners
    mapRef.current.on("drag", handleDrag)
    mapRef.current.on("dragend", handleDragEnd)

    return () => {
      if (mapRef.current) {
        mapRef.current.off("drag", handleDrag)
        mapRef.current.off("dragend", handleDragEnd)
      }
    }
  }, [moveCallbackRef.current]) // Only re-run when callback changes

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (moveTimeoutRef.current) {
        clearTimeout(moveTimeoutRef.current)
      }

      // Clean up geolocation watch
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current)
      }

      // Clean up map instance
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }

      // Clean up center pin
      if (centerPinRef.current) {
        centerPinRef.current.remove()
        centerPinRef.current = null
      }
    }
  }, [])

  return <div id={containerIdRef.current} className="w-full h-[350px] rounded-lg shadow" />
}
