import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  Search,
  Plus,
  Edit2,
  Power,
  Shield,
  Building,
  Key,
  Copy,
  Check,
  RefreshCw,
  Mail,
  Phone,
  MapPin,
} from 'lucide-react';
import PageHeader from '../../../components/ui/PageHeader';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Avatar from '../../../components/ui/Avatar';
import Badge from '../../../components/ui/Badge';
import Modal from '../../../components/ui/Modal';
import ConfirmDialog from '../../../components/ui/ConfirmDialog';
import Pagination from '../../../components/ui/Pagination';
import Skeleton from '../../../components/ui/Skeleton';
import EmptyState from '../../../components/ui/EmptyState';
import adminService from '../../../services/adminService';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';

const WARDS = [
  'Ward 1 - Central',
  'Ward 2 - North',
  'Ward 3 - East',
  'Ward 4 - South',
  'Ward 5 - West',
  'Ward 6 - Metro',
  'Ward 7 - Suburbs',
  'Ward 8 - Industrial',
  'Ward 9 - Heritage',
];

export const AdminUsers = () => {
  const { user: currentAdmin } = useAuth();
  const toast = useToast();

  const [users, setUsers] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('all');
  const [department, setDepartment] = useState('all');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  // Departments for assignment
  const [departments, setDepartments] = useState([]);

  // Create User Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    email: '',
    role: 'officer',
    department: '',
    designation: 'Field Officer',
    phone: '',
    ward: 'Ward 1 - Central',
  });
  const [isCreating, setIsCreating] = useState(false);

  // Temp Password Dialog (Shown Once)
  const [tempPasswordData, setTempPasswordData] = useState(null);
  const [copiedPass, setCopiedPass] = useState(false);

  // Edit User Modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    ward: '',
    designation: '',
    department: '',
  });
  const [isUpdating, setIsUpdating] = useState(false);

  // Toggle Active Dialog
  const [userToToggle, setUserToToggle] = useState(null);
  const [showToggleConfirm, setShowToggleConfirm] = useState(false);

  // Load departments
  useEffect(() => {
    adminService.getDepartments().then((res) => {
      setDepartments(res.departments || []);
    }).catch(() => {});
  }, []);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminService.getUsers({
        search,
        role,
        department,
        page,
        limit,
      });
      setUsers(res.users || []);
      setTotalCount(res.pagination?.total || 0);
      setTotalPages(res.pagination?.pages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, role, department, page, limit]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Submit Create User
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!createForm.name || !createForm.email) {
      toast.error('Name and email are required');
      return;
    }
    if (createForm.role === 'officer' && !createForm.department) {
      toast.error('Please assign a department to the officer');
      return;
    }

    setIsCreating(true);
    try {
      const res = await adminService.createUser(createForm);
      toast.success(`Account created for ${createForm.name}`, 'User Registered');
      setShowCreateModal(false);

      // Present temporary credentials dialog
      setTempPasswordData({
        name: res.user.name,
        email: res.user.email,
        tempPassword: res.tempPassword,
        role: res.user.role,
      });

      setCreateForm({
        name: '',
        email: '',
        role: 'officer',
        department: '',
        designation: 'Field Officer',
        phone: '',
        ward: 'Ward 1 - Central',
      });
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create user');
    } finally {
      setIsCreating(false);
    }
  };

  // Open Edit User
  const handleOpenEdit = (user) => {
    setEditingUser(user);
    setEditForm({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      ward: user.ward || 'Ward 1 - Central',
      designation: user.designation || '',
      department: user.department?._id || user.department || '',
    });
    setShowEditModal(true);
  };

  // Submit Edit User
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingUser) return;

    setIsUpdating(true);
    try {
      await adminService.updateUser(editingUser._id, editForm);
      toast.success(`User "${editForm.name}" updated`, 'Changes Saved');
      setShowEditModal(false);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update user');
    } finally {
      setIsUpdating(false);
    }
  };

  // Confirm Activate/Deactivate
  const handleConfirmToggle = async () => {
    if (!userToToggle) return;

    if (currentAdmin?._id === userToToggle._id && userToToggle.isActive) {
      toast.error('Self-deactivation forbidden: You cannot deactivate your own account.');
      setShowToggleConfirm(false);
      setUserToToggle(null);
      return;
    }

    try {
      const newStatus = !userToToggle.isActive;
      await adminService.updateUser(userToToggle._id, { isActive: newStatus });
      toast.success(
        `User ${userToToggle.name} is now ${newStatus ? 'Active' : 'Deactivated'}`,
        'Account Status Updated'
      );
      setShowToggleConfirm(false);
      setUserToToggle(null);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update user status');
      setShowToggleConfirm(false);
      setUserToToggle(null);
    }
  };

  const copyTempPassword = () => {
    if (tempPasswordData?.tempPassword) {
      navigator.clipboard.writeText(tempPasswordData.tempPassword);
      setCopiedPass(true);
      setTimeout(() => setCopiedPass(false), 2000);
      toast.info('Temporary password copied to clipboard');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Municipal User Directory & RBAC"
        subtitle={`Total of ${totalCount} registered users across administrative and citizen roles.`}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchUsers}
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
              Add Staff / Officer
            </Button>
          </div>
        }
      />

      {/* FILTER BAR */}
      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            placeholder="Search by name, email, phone, ward..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            leftIcon={<Search className="w-4 h-4 text-slate-400" />}
          />

          <select
            value={role}
            onChange={(e) => {
              setRole(e.target.value);
              setPage(1);
            }}
            className="w-full text-xs sm:text-sm rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-3 py-2 text-slate-800 dark:text-slate-200"
          >
            <option value="all">All Roles</option>
            <option value="officer">Municipal Officers</option>
            <option value="admin">Administrators</option>
            <option value="citizen">Citizens</option>
          </select>

          <select
            value={department}
            onChange={(e) => {
              setDepartment(e.target.value);
              setPage(1);
            }}
            className="w-full text-xs sm:text-sm rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-3 py-2 text-slate-800 dark:text-slate-200"
          >
            <option value="all">All Departments</option>
            {departments.map((d) => (
              <option key={d._id} value={d._id}>
                {d.name} ({d.code})
              </option>
            ))}
          </select>
        </div>
      </Card>

      {/* USERS TABLE */}
      <Card className="overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4 animate-pulse">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : users.length === 0 ? (
          <div className="py-12">
            <EmptyState
              icon={Users}
              title="No Users Found"
              description="No user accounts matched your search criteria."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Department / Designation</th>
                  <th className="py-3 px-4">Ward / Contact</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {users.map((u) => {
                  const isCurrentAdmin = currentAdmin?._id === u._id;

                  return (
                    <tr key={u._id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <Avatar name={u.name} size="sm" />
                          <div>
                            <span className="font-bold text-slate-900 dark:text-slate-100 block">
                              {u.name} {isCurrentAdmin && <span className="text-[10px] text-purple-600 font-normal">(You)</span>}
                            </span>
                            <span className="text-xs text-slate-500 font-mono block">
                              {u.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <Badge
                          variant={u.role === 'admin' ? 'purple' : u.role === 'officer' ? 'warning' : 'primary'}
                          size="sm"
                        >
                          {u.role.toUpperCase()}
                        </Badge>
                      </td>

                      <td className="py-3.5 px-4">
                        {u.role === 'officer' ? (
                          <div>
                            <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                              {u.department?.name || 'Department Officer'}
                            </span>
                            <span className="text-xs text-slate-500 block">
                              {u.designation || 'Field Inspector'}
                            </span>
                          </div>
                        ) : u.role === 'admin' ? (
                          <span className="font-semibold text-purple-700 dark:text-purple-300">
                            {u.designation || 'Municipal Commissioner'}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">Resident Citizen</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-xs text-slate-600 dark:text-slate-400">
                        <div>{u.ward || 'General'}</div>
                        <div className="font-mono text-[11px] text-slate-400">{u.phone || 'No phone'}</div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            u.isActive
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400'
                          }`}
                        >
                          {u.isActive ? 'Active' : 'Disabled'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenEdit(u)}
                            leftIcon={<Edit2 className="w-3 h-3" />}
                          >
                            Edit
                          </Button>

                          {!isCurrentAdmin && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className={u.isActive ? 'text-rose-600 hover:bg-rose-50' : 'text-emerald-600'}
                              onClick={() => {
                                setUserToToggle(u);
                                setShowToggleConfirm(true);
                              }}
                            >
                              {u.isActive ? 'Deactivate' : 'Activate'}
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Showing {(page - 1) * limit + 1} to {Math.min(page * limit, totalCount)} of {totalCount} users
            </span>
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={(p) => setPage(p)}
            />
          </div>
        )}
      </Card>

      {/* CREATE USER MODAL */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Register New Municipal Staff Account"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs sm:text-sm">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Account Role
            </label>
            <select
              value={createForm.role}
              onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
              className="w-full rounded-lg text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-slate-100"
            >
              <option value="officer">Department Field Officer</option>
              <option value="admin">Administrator / Executive</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Input
                label="Full Name"
                required
                value={createForm.name}
                onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                placeholder="e.g. Er. Sunil Deshmukh"
              />
            </div>
            <div>
              <Input
                label="Official Email Address"
                type="email"
                required
                value={createForm.email}
                onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                placeholder="officer@civicsetu.gov.in"
              />
            </div>
          </div>

          {createForm.role === 'officer' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Assigned Department <span className="text-rose-500">*</span>
              </label>
              <select
                value={createForm.department}
                onChange={(e) => setCreateForm({ ...createForm, department: e.target.value })}
                required
                className="w-full rounded-lg text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-slate-100"
              >
                <option value="">Select Department...</option>
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Input
                label="Designation"
                value={createForm.designation}
                onChange={(e) => setCreateForm({ ...createForm, designation: e.target.value })}
                placeholder="e.g. Junior Engineer (Drainage)"
              />
            </div>
            <div>
              <Input
                label="Contact Phone"
                value={createForm.phone}
                onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                placeholder="+91 98765 43210"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Primary Ward Jurisdiction
            </label>
            <select
              value={createForm.ward}
              onChange={(e) => setCreateForm({ ...createForm, ward: e.target.value })}
              className="w-full rounded-lg text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-slate-100"
            >
              {WARDS.map((w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </select>
          </div>

          <p className="text-xs text-slate-500 italic">
            * A secure temporary password will be automatically generated and shown once upon submission.
          </p>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" type="button" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={isCreating}>
              Create User Account
            </Button>
          </div>
        </form>
      </Modal>

      {/* TEMPORARY PASSWORD COPYABLE DIALOG (SHOWN ONCE) */}
      <Modal
        isOpen={Boolean(tempPasswordData)}
        onClose={() => setTempPasswordData(null)}
        title="Temporary Credentials Generated"
      >
        <div className="space-y-4 text-xs sm:text-sm">
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-xl text-amber-900 dark:text-amber-200">
            <strong>Important:</strong> Provide these temporary login credentials to the user. This temporary password will not be shown again.
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">User:</span>
              <strong className="text-slate-900 dark:text-white">{tempPasswordData?.name}</strong>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Email:</span>
              <strong className="font-mono text-slate-900 dark:text-white">{tempPasswordData?.email}</strong>
            </div>
            <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-400 uppercase tracking-wider font-bold block">
                  Temporary Password
                </span>
                <span className="font-mono text-base font-extrabold text-brand-600 dark:text-brand-400">
                  {tempPasswordData?.tempPassword}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={copyTempPassword}
                leftIcon={copiedPass ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              >
                {copiedPass ? 'Copied' : 'Copy'}
              </Button>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button variant="primary" onClick={() => setTempPasswordData(null)}>
              Done
            </Button>
          </div>
        </div>
      </Modal>

      {/* EDIT USER MODAL */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title={`Edit Staff Profile: ${editingUser?.name}`}
      >
        <form onSubmit={handleEditSubmit} className="space-y-4 text-xs sm:text-sm">
          <Input
            label="Full Name"
            required
            value={editForm.name}
            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
          />

          <Input
            label="Email Address"
            type="email"
            required
            value={editForm.email}
            onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Designation"
              value={editForm.designation}
              onChange={(e) => setEditForm({ ...editForm, designation: e.target.value })}
            />
            <Input
              label="Phone"
              value={editForm.phone}
              onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
            />
          </div>

          {editingUser?.role === 'officer' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Department Assignment
              </label>
              <select
                value={editForm.department}
                onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                className="w-full rounded-lg text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-slate-100"
              >
                <option value="">No Department</option>
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Ward Jurisdiction
            </label>
            <select
              value={editForm.ward}
              onChange={(e) => setEditForm({ ...editForm, ward: e.target.value })}
              className="w-full rounded-lg text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-slate-100"
            >
              {WARDS.map((w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" type="button" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={isUpdating}>
              Save Profile
            </Button>
          </div>
        </form>
      </Modal>

      {/* TOGGLE CONFIRM DIALOG */}
      <ConfirmDialog
        isOpen={showToggleConfirm}
        onClose={() => setShowToggleConfirm(false)}
        onConfirm={handleConfirmToggle}
        title={userToToggle?.isActive ? 'Deactivate User Account' : 'Activate User Account'}
        message={
          userToToggle?.isActive
            ? `Deactivating ${userToToggle?.name} will prevent them from logging in or receiving new complaint assignments.`
            : `Reactivate account for ${userToToggle?.name}?`
        }
        confirmText={userToToggle?.isActive ? 'Deactivate' : 'Activate'}
        variant={userToToggle?.isActive ? 'danger' : 'primary'}
      />
    </div>
  );
};

export default AdminUsers;
