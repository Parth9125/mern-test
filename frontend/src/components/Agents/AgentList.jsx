import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, Eye, Phone, Mail, User } from 'lucide-react';
import { agentsAPI } from '../../services/api';
import LoadingSpinner from '../Common/LoadingSpinner';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

const AgentList = () => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalAgents: 0
  });

  useEffect(() => {
    fetchAgents();
  }, [searchTerm, statusFilter, pagination.currentPage]);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.currentPage,
        limit: 10,
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== 'all' && { status: statusFilter })
      };

      const response = await agentsAPI.getAll(params);
      setAgents(response.data.agents);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching agents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (agentId, agentName) => {
    if (window.confirm(`Are you sure you want to delete agent "${agentName}"?`)) {
      try {
        await agentsAPI.delete(agentId);
        toast.success('Agent deleted successfully');
        fetchAgents();
      } catch (error) {
        console.error('Error deleting agent:', error);
      }
    }
  };

  const handleStatusToggle = async (agentId, currentStatus) => {
    try {
      await agentsAPI.update(agentId, { isActive: !currentStatus });
      toast.success(`Agent ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      fetchAgents();
    } catch (error) {
      console.error('Error updating agent status:', error);
    }
  };

  const AgentCard = ({ agent }) => (
    <div className="agent-card">
      <div className="agent-header">
        <div>
          <h3 className="agent-name">{agent.name}</h3>
          <div className="agent-email">
            <Mail className="w-4 h-4 inline mr-1" />
            {agent.email}
          </div>
          <div className="agent-mobile">
            <Phone className="w-4 h-4 inline mr-1" />
            {agent.mobile}
          </div>
        </div>
        <div className={`badge badge-${agent.isActive ? 'success' : 'danger'}`}>
          {agent.isActive ? 'Active' : 'Inactive'}
        </div>
      </div>

      <div className="agent-stats">
        <div className="agent-stat">
          <div className="agent-stat-value">{agent.totalAssignedItems}</div>
          <div className="agent-stat-label">Items</div>
        </div>
        <div className="agent-stat">
          <div className="agent-stat-value">{agent.assignedLists?.length || 0}</div>
          <div className="agent-stat-label">Lists</div>
        </div>
        <div className="agent-stat">
          <div className="agent-stat-value">
            {format(new Date(agent.createdAt), 'MMM dd')}
          </div>
          <div className="agent-stat-label">Created</div>
        </div>
      </div>

      <div className="d-flex gap-2 mt-3">
        <button
          onClick={() => handleStatusToggle(agent._id, agent.isActive)}
          className={`btn btn-sm ${agent.isActive ? 'btn-secondary' : 'btn-primary'}`}
        >
          {agent.isActive ? 'Deactivate' : 'Activate'}
        </button>
        <button
          onClick={() => handleDelete(agent._id, agent.name)}
          className="btn btn-sm btn-danger"
          disabled={agent.assignedLists?.length > 0}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {agent.assignedLists?.length > 0 && (
        <div className="text-xs text-yellow-600 mt-2">
          Cannot delete: Agent has assigned lists
        </div>
      )}
    </div>
  );

  return (
    <div>
      <div className="d-flex justify-between align-center mb-4">
        <h1 className="text-2xl font-bold">Agents ({pagination.totalAgents})</h1>
        <Link to="/agents/add" className="btn btn-primary">
          <Plus className="w-4 h-4" />
          Add New Agent
        </Link>
      </div>

      {/* Filters */}
      <div className="card mb-4">
        <div className="d-flex gap-4 align-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search agents by name, email, or mobile..."
              className="form-control pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="form-control w-auto"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Agents Grid */}
      {loading ? (
        <LoadingSpinner message="Loading agents..." />
      ) : agents.length > 0 ? (
        <>
          <div className="agent-grid">
            {agents.map((agent) => (
              <AgentCard key={agent._id} agent={agent} />
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="d-flex justify-center gap-2 mt-6">
              <button
                className="btn btn-outline btn-sm"
                disabled={!pagination.hasPrevPage}
                onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
              >
                Previous
              </button>

              <span className="d-flex align-center px-3 text-sm">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>

              <button
                className="btn btn-outline btn-sm"
                disabled={!pagination.hasNextPage}
                onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
              >
                Next
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="card text-center py-8">
          <User className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium mb-2">No agents found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || statusFilter !== 'all' 
              ? 'Try adjusting your search or filter criteria.' 
              : 'Get started by creating your first agent.'}
          </p>
          <Link to="/agents/add" className="btn btn-primary">
            <Plus className="w-4 h-4" />
            Add First Agent
          </Link>
        </div>
      )}
    </div>
  );
};

export default AgentList;