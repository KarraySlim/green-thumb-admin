import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MapPin, Search } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

interface LocationPickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

function MapClickHandler({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function LocationPicker({ value, onChange, placeholder = "Localisation" }: LocationPickerProps) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<[number, number]>([36.8, 10.18]); // default Tunis
  const [searchQuery, setSearchQuery] = useState("");
  const [addressLabel, setAddressLabel] = useState(value);

  useEffect(() => {
    setAddressLabel(value);
  }, [value]);

  const handleLocationSelect = async (lat: number, lng: number) => {
    setPosition([lat, lng]);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=fr`);
      const data = await res.json();
      const label = data.display_name ?? `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
      setAddressLabel(label);
      onChange(label);
    } catch {
      const label = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
      setAddressLabel(label);
      onChange(label);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1&accept-language=fr`);
      const data = await res.json();
      if (data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        setPosition([lat, lng]);
        handleLocationSelect(lat, lng);
      }
    } catch {
      // ignore
    }
  };

  return (
    <div className="space-y-1">
      <div className="flex gap-2">
        <Input value={addressLabel} onChange={(e) => { setAddressLabel(e.target.value); onChange(e.target.value); }} placeholder={placeholder} className="flex-1" />
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button type="button" variant="outline" size="icon">
              <MapPin className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Choisir la localisation</DialogTitle>
            </DialogHeader>
            <div className="flex gap-2 mb-3">
              <Input
                placeholder="Rechercher un lieu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              <Button type="button" variant="outline" onClick={handleSearch}>
                <Search className="h-4 w-4" />
              </Button>
            </div>
            <div className="h-[400px] rounded-lg overflow-hidden border">
              <MapContainer center={position} zoom={8} style={{ height: "100%", width: "100%" }}>
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={position} />
                <MapClickHandler onLocationSelect={handleLocationSelect} />
              </MapContainer>
            </div>
            <div className="flex justify-end mt-2">
              <Button onClick={() => setOpen(false)}>Confirmer</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
