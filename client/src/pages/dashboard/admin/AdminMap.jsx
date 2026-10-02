import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import {
  MapPin,
  Filter,
  RefreshCw,
  Building,
  AlertTriangle,
  Eye,
  Layers,
  Crosshair,
} from 'lucide-react';
import PageHeader from '../../../components/ui/PageHeader';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import StatusBadge from '../../../components/ui/StatusBadge';
import PriorityBadge from '../../../components/ui/PriorityBadge';
import AdminGrievanceDrawer from './AdminGrievanceDrawer';
import adminService from '../../../services/adminService';
import grievanceService from '../../../services/grievanceService';

const PRIORITY_PIN_COLORS = {
  Critical: '#e11d48', // rose-600
  High: '#f59e0b',     // amber-500
  Medium: '#3b82f6',   // blue-500
  Low: '#10b981',      // emerald-500
};

const STATUS_PIN_COLORS = {
  Submitted: '#94a3b8',
  'AI Classified': '#818cf8',
  Assigned: '#38bdf8',
  'In Progress': '#fbbf24',
  'Awaiting Verification': '#c084fc',
  Resolved: '#10b981',
  Closed: '#64748b',
  Escalated: '#f43f5e',
};

// Create a custom SVG pin icon
const createMapIcon = (color) => {
  return new L.DivIcon({
    className: 'custom-map-pin',
    html: `<div style="
      background-color: ${color};
      width: 26px;
      height: 26px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 2px solid white;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.35);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <div style="
        width: 8px;
        height: 8px;
        background-color: white;
        border-radius: 50%;
        transform: rotate(45deg);
      "></div>
    </div>`,
    iconSize: [26, 26],
    iconAnchor: [13, 26],
    popupAnchor: [0, -26],
  });
};

// Component to adjust map view to fit all markers
const FitBounds = ({ points }) => {
  const map = useMap();
  useEffect(() => {
    if (points && points.length > 0) {
      const validCoords = points
        .filter((p) => p.location?.coordinates?.lat && p.location?.coordinates?.lng)
        .map((p) => [p.location.coordinates.lat, p.location.coordinates.lng]);

      if (validCoords.length > 0) {
        const bounds = L.latLngBounds(validCoords);
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
      }
    }
  }, [points, map]);
  return null;
};

export const AdminMap = () => {
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [colorMode, setColorMode] = useState('priority'); // 'priority' or 'status'

  // Filter state
  const [department, setDepartment] = useState('all');
  const [status, setStatus] = useState('all');
  const [priority, setPriority] = useState('all');
  const [ward, setWard] = useState('all');

  // Departments for filter
  const [deptList, setDeptList] = useState([]);

  // Selected grievance for full slide-over drawer
  const [selectedGrievance, setSelectedGrievance] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    adminService.getDepartments().then((res) => {
      setDeptList(res.departments || []);
    }).catch(() => {});
  }, []);

  const fetchPoints = async () => {
    setLoading(true);
    try {
      const res = await adminService.getGrievancesMap({
        department,
        status,
        priority,
        ward,
      });
      setPoints(res.points || []);
    } catch (err) {
      console.error('Failed to fetch map points:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPoints();
  }, [department, status, priority, ward]);

  const handleOpenDetails = async (pointId) => {
    try {
      const res = await grievanceService.getGrievanceById(pointId);
      setSelectedGrievance(res.data.grievance);
      setDrawerOpen(true);
    } catch (err) {
      console.error(err);
    }
  };

  const cityCenter = [19.0760, 72.8777];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Citywide GIS Incident Map"
        subtitle={`Visualizing ${points.length} geo-tagged complaints across municipal wards`}
        actions={
          <div className="flex items-center gap-2">
            {/* Color Mode Toggle */}
            <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setColorMode('priority')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  colorMode === 'priority'
                    ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Color by Priority
              </button>
              <button
                onClick={() => setColorMode('status')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  colorMode === 'status'
                    ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Color by Status
              </button>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={fetchPoints}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              Refresh
            </Button>
          </div>
        }
      />

      {/* FILTER BAR & MAP CONTROLS */}
      <Card className="p-3">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-slate-500 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Filters:
            </span>

            {/* Department */}
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200"
            >
              <option value="all">All Departments</option>
              {deptList.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>

            {/* Priority */}
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200"
            >
              <option value="all">All Priorities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            {/* Status */}
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200"
            >
              <option value="all">All Statuses</option>
              <option value="Submitted">Submitted</option>
              <option value="Assigned">Assigned</option>
              <option value="In Progress">In Progress</option>
              <option value="Awaiting Verification">Awaiting Verification</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
              <option value="Escalated">Escalated</option>
            </select>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-3">
            {colorMode === 'priority' ? (
              <>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
                  <span className="text-[11px] text-slate-600 dark:text-slate-300">Critical</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span className="text-[11px] text-slate-600 dark:text-slate-300">High</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  <span className="text-[11px] text-slate-600 dark:text-slate-300">Medium</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-[11px] text-slate-600 dark:text-slate-300">Low</span>
                </span>
              </>
            ) : (
              <>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <span className="text-[11px] text-slate-600 dark:text-slate-300">In Progress</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-[11px] text-slate-600 dark:text-slate-300">Resolved</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span className="text-[11px] text-slate-600 dark:text-slate-300">Escalated</span>
                </span>
              </>
            )}
          </div>
        </div>
      </Card>

      {/* FULL-WIDTH LEAFLET MAP CONTAINER */}
      <Card className="overflow-hidden relative" style={{ height: 'calc(100vh - 280px)', minHeight: '520px' }}>
        <MapContainer
          center={cityCenter}
          zoom={12}
          style={{ width: '100%', height: '100%' }}
          className="z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <FitBounds points={points} />

          {points.map((p) => {
            const lat = p.location?.coordinates?.lat;
            const lng = p.location?.coordinates?.lng;
            if (!lat || !lng) return null;

            const pinColor =
              colorMode === 'priority'
                ? PRIORITY_PIN_COLORS[p.priority] || '#3b82f6'
                : STATUS_PIN_COLORS[p.status] || '#3b82f6';

            const icon = createMapIcon(pinColor);

            return (
              <Marker key={p._id} position={[lat, lng]} icon={icon}>
                <Popup className="civic-map-popup">
                  <div className="p-1 max-w-xs space-y-2 text-xs">
                    <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-1.5">
                      <span className="font-mono font-bold text-sky-600">
                        {p.trackingId}
                      </span>
                      <PriorityBadge priority={p.priority} size="sm" />
                    </div>

                    <h4 className="font-bold text-slate-900 leading-snug">
                      {p.title}
                    </h4>

                    <div className="text-[11px] text-slate-600 space-y-0.5">
                      <div>
                        <strong>Dept:</strong> {p.department?.name || 'Municipal'}
                      </div>
                      <div>
                        <strong>Category:</strong> {p.category}
                      </div>
                      <div>
                        <strong>Ward:</strong> {p.location?.ward || 'General'}
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                      <StatusBadge status={p.status} size="sm" />
                      <button
                        onClick={() => handleOpenDetails(p._id)}
                        className="text-xs font-semibold text-sky-600 hover:text-sky-700 hover:underline flex items-center gap-1"
                      >
                        Inspect &rarr;
                      </button>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>

        {/* Floating count badge */}
        <div className="absolute top-4 right-4 z-10 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold shadow-md flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-brand-600" />
          <span>{points.length} Incidents Displayed</span>
        </div>
      </Card>

      {/* Slide-over Inspection Drawer */}
      <AdminGrievanceDrawer
        grievance={selectedGrievance}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onUpdate={() => {
          fetchPoints();
        }}
      />
    </div>
  );
};

export default AdminMap;
