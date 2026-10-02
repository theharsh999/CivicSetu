import React, { useState, useEffect } from 'react';
import {
  FolderTree,
  Plus,
  Edit2,
  Users,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Power,
  RefreshCw,
} from 'lucide-react';
import PageHeader from '../../../components/ui/PageHeader';
import Card, { CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Textarea from '../../../components/ui/Textarea';
import Modal from '../../../components/ui/Modal';
import ConfirmDialog from '../../../components/ui/ConfirmDialog';
import Skeleton from '../../../components/ui/Skeleton';
import adminService from '../../../services/adminService';
import { useToast } from '../../../context/ToastContext';

export const AdminDepartments = () => {
  const toast = useToast();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Create Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    code: '',
    description: '',
    color: '#0284c7',
    icon: 'Building',
  });
  const [isCreating, setIsCreating] = useState(false);

  // Edit Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    color: '#0284c7',
    icon: 'Building',
    isActive: true,
  });
  const [isUpdating, setIsUpdating] = useState(false);

  // Toggle Active Confirm State
  const [deptToToggle, setDeptToToggle] = useState(null);
  const [showToggleConfirm, setShowToggleConfirm] = useState(false);

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const res = await adminService.getDepartments();
      setDepartments(res.departments || []);
    } catch (err) {
      toast.error('Failed to load municipal departments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  // Handle Create Department
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!createForm.name || !createForm.code) {
      toast.error('Name and code are required');
      return;
    }

    setIsCreating(true);
    try {
      await adminService.createDepartment(createForm);
      toast.success(`Department "${createForm.name}" created`, 'Department Added');
      setShowCreateModal(false);
      setCreateForm({ name: '', code: '', description: '', color: '#0284c7', icon: 'Building' });
      fetchDepartments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create department');
    } finally {
      setIsCreating(false);
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (dept) => {
    setEditingDept(dept);
    setEditForm({
      name: dept.name,
      description: dept.description || '',
      color: dept.color || '#0284c7',
      icon: dept.icon || 'Building',
      isActive: dept.isActive,
    });
    setShowEditModal(true);
  };

  // Handle Edit Submit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingDept) return;

    setIsUpdating(true);
    try {
      await adminService.updateDepartment(editingDept._id, editForm);
      toast.success(`Department "${editForm.name}" updated`, 'Changes Saved');
      setShowEditModal(false);
      fetchDepartments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update department');
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle Toggle Active Confirm
  const handleConfirmToggle = async () => {
    if (!deptToToggle) return;
    try {
      const newStatus = !deptToToggle.isActive;
      await adminService.updateDepartment(deptToToggle._id, { isActive: newStatus });
      toast.success(
        `Department "${deptToToggle.name}" is now ${newStatus ? 'Active' : 'Inactive'}`,
        'Status Updated'
      );
      setShowToggleConfirm(false);
      setDeptToToggle(null);
      fetchDepartments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update status');
      setShowToggleConfirm(false);
      setDeptToToggle(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Municipal Departments Configuration"
        subtitle="Manage municipal operational divisions, assigned staffing, and live workload."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchDepartments}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              Refresh
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowCreateModal(true)}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Add Department
            </Button>
          </div>
        }
      />

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-pulse">
          <Skeleton className="h-44" />
          <Skeleton className="h-44" />
          <Skeleton className="h-44" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map((dept) => (
            <Card key={dept._id} className="p-5 flex flex-col justify-between hover:shadow-md transition">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-4 h-4 rounded-full shrink-0"
                      style={{ backgroundColor: dept.color }}
                    />
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                        {dept.name}
                      </h3>
                      <span className="font-mono text-xs font-semibold text-slate-400">
                        {dept.code}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      dept.isActive
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400'
                    }`}
                  >
                    {dept.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                  {dept.description || 'Primary municipal civil infrastructure and utility division.'}
                </p>

                {/* Stats Breakdown */}
                <div className="grid grid-cols-3 gap-2 py-3 my-3 border-y border-slate-100 dark:border-slate-800 text-center text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Total Tickets</span>
                    <strong className="text-slate-900 dark:text-slate-100 font-bold">{dept.totalGrievances || 0}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-amber-500 block">Open Pending</span>
                    <strong className="text-amber-600 dark:text-amber-400 font-bold">{dept.openGrievances || 0}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-blue-500 block">Active Officers</span>
                    <strong className="text-blue-600 dark:text-blue-400 font-bold">{dept.officerCount || 0}</strong>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-between pt-1 text-xs">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenEdit(dept)}
                  leftIcon={<Edit2 className="w-3 h-3" />}
                >
                  Edit
                </Button>

                <Button
                  variant={dept.isActive ? 'ghost' : 'outline'}
                  size="sm"
                  className={dept.isActive ? 'text-rose-600 hover:bg-rose-50' : 'text-emerald-600'}
                  onClick={() => {
                    setDeptToToggle(dept);
                    setShowToggleConfirm(true);
                  }}
                  leftIcon={<Power className="w-3 h-3" />}
                >
                  {dept.isActive ? 'Deactivate' : 'Activate'}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* CREATE DEPARTMENT MODAL */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Municipal Department"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs sm:text-sm">
          <div>
            <Input
              label="Department Name"
              required
              value={createForm.name}
              onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
              placeholder="e.g. Fire & Emergency Services"
            />
          </div>

          <div>
            <Input
              label="Unique Code (uppercase)"
              required
              value={createForm.code}
              onChange={(e) => setCreateForm({ ...createForm, code: e.target.value.toUpperCase() })}
              placeholder="e.g. FIRE"
            />
          </div>

          <div>
            <Textarea
              label="Description"
              rows={3}
              value={createForm.description}
              onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
              placeholder="Operational responsibilities and scope..."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Theme Color
              </label>
              <input
                type="color"
                value={createForm.color}
                onChange={(e) => setCreateForm({ ...createForm, color: e.target.value })}
                className="w-full h-9 rounded-lg border border-slate-300 p-1 cursor-pointer"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" type="button" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={isCreating}>
              Create Department
            </Button>
          </div>
        </form>
      </Modal>

      {/* EDIT DEPARTMENT MODAL */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title={`Edit Department: ${editingDept?.name}`}
      >
        <form onSubmit={handleEditSubmit} className="space-y-4 text-xs sm:text-sm">
          <div>
            <Input
              label="Department Name"
              required
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
            />
          </div>

          <div>
            <Textarea
              label="Description"
              rows={3}
              value={editForm.description}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Theme Color
            </label>
            <input
              type="color"
              value={editForm.color}
              onChange={(e) => setEditForm({ ...editForm, color: e.target.value })}
              className="w-24 h-9 rounded-lg border border-slate-300 p-1 cursor-pointer"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" type="button" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={isUpdating}>
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* CONFIRM TOGGLE ACTIVE DIALOG */}
      <ConfirmDialog
        isOpen={showToggleConfirm}
        onClose={() => setShowToggleConfirm(false)}
        onConfirm={handleConfirmToggle}
        title={deptToToggle?.isActive ? 'Deactivate Department' : 'Activate Department'}
        message={
          deptToToggle?.isActive
            ? `Are you sure you want to deactivate "${deptToToggle?.name}"? Citizens will no longer be able to route complaints to this division. Deactivation will be rejected if open grievances remain.`
            : `Reactivate "${deptToToggle?.name}" to resume accepting citizen complaints?`
        }
        confirmText={deptToToggle?.isActive ? 'Deactivate' : 'Activate'}
        variant={deptToToggle?.isActive ? 'danger' : 'primary'}
      />
    </div>
  );
};

export default AdminDepartments;
