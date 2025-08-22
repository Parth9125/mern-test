import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, FileText, Upload, Plus, TrendingUp, Activity } from 'lucide-react';
import { agentsAPI, listsAPI } from '../../services/api';
import LoadingSpinner from '../Common/LoadingSpinner';
import { format } from 'date-fns';

const Dashboard = () => {
  const [stats, setStats] = useState({
    agents: { total: 0, active: 0, inactive: 0 },
    lists: { totalLists: 0, totalItems: 0 }
  });
  const [recentAgents, setRecentAgents] = useState([]);
  const [recentLists, setRecentLists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch stats and recent data
      const [agentStats, listStats, agentsList] = await Promise.all([
        agentsAPI.getStats(),
        listsAPI.getStats(),
        agentsAPI.getAll({ limit: 5 })
      ]);

      setStats({
        agents: agentStats.data.stats,
        lists: listStats.data.stats
      });

      setRecentAgents(agentsList.data.agents);
      setRecentLists(listStats.data.recentLists);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
    <div className="stat-card">
      <div className="d-flex justify-between align-center mb-3">
        <Icon className="w-8 h-8" />
        <div className="stat-value">{value}</div>
      </div>
      <div className="stat-label">{title}</div>
      {subtitle && <div className="text-xs opacity-75 mt-1">{subtitle}</div>}
    </div>
  );

  if (loading) {
    return <LoadingSpinner message="Loading dashboard..." />;
  }

  return (
    <div>
      <div className="d-flex justify-between align-center mb-4">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="d-flex gap-2">
          <Link to="/agents/add" className="btn btn-outline btn-sm">
            <Plus className="w-4 h-4" />
            Add Agent
          </Link>
          <Link to="/lists/upload" className="btn btn-primary btn-sm">
            <Upload className="w-4 h-4" />
            Upload CSV
          </Link>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="dashboard-grid">
        <StatCard
          title="Total Agents"
          value={stats.agents.total}
          icon={Users}
          color="primary"
          subtitle={`${stats.agents.active} active, ${stats.agents.inactive} inactive`}
        />
        <StatCard
          title="Active Agents"
          value={stats.agents.active}
          icon={Activity}
          color="success"
        />
        <StatCard
          title="Total Lists"
          value={stats.lists.totalLists}
          icon={FileText}
          color="info"
        />
        <StatCard
          title="Total Items"
          value={stats.lists.totalItems}
          icon={TrendingUp}
          color="warning"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Agents */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Recent Agents</h3>
            <Link to="/agents" className="text-blue-600 hover:text-blue-800 text-sm">
              View All
            </Link>
          </div>

          <div className="space-y-3">
            {recentAgents.length > 0 ? (
              recentAgents.map((agent) => (
                <div key={agent._id} className="d-flex justify-between align-center p-3 bg-gray-50 rounded">
                  <div>
                    <div className="font-medium">{agent.name}</div>
                    <div className="text-sm text-gray-600">{agent.email}</div>
                  </div>
                  <div className="text-right">
                    <div className={`badge badge-${agent.isActive ? 'success' : 'danger'}`}>
                      {agent.isActive ? 'Active' : 'Inactive'}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {agent.totalAssignedItems} items
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-gray-500">
                No agents found. <Link to="/agents/add" className="text-blue-600">Add your first agent</Link>
              </div>
            )}
          </div>
        </div>

        {/* Recent Lists */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Recent Lists</h3>
            <Link to="/lists" className="text-blue-600 hover:text-blue-800 text-sm">
              View All
            </Link>
          </div>

          <div className="space-y-3">
            {recentLists.length > 0 ? (
              recentLists.map((list) => (
                <div key={list._id} className="d-flex justify-between align-center p-3 bg-gray-50 rounded">
                  <div>
                    <div className="font-medium">{list.originalName}</div>
                    <div className="text-sm text-gray-600">
                      by {list.uploadedBy?.name || 'Admin'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-blue-600">{list.totalItems} items</div>
                    <div className="text-xs text-gray-500">
                      {format(new Date(list.createdAt), 'MMM dd, yyyy')}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-gray-500">
                No lists uploaded yet. <Link to="/lists/upload" className="text-blue-600">Upload your first list</Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card mt-6">
        <div className="card-header">
          <h3 className="card-title">Quick Actions</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/agents/add" className="btn btn-outline d-flex align-center gap-3 p-4">
            <Plus className="w-6 h-6" />
            <div className="text-left">
              <div className="font-medium">Add New Agent</div>
              <div className="text-sm text-gray-600">Create agent account</div>
            </div>
          </Link>

          <Link to="/lists/upload" className="btn btn-outline d-flex align-center gap-3 p-4">
            <Upload className="w-6 h-6" />
            <div className="text-left">
              <div className="font-medium">Upload CSV</div>
              <div className="text-sm text-gray-600">Distribute new list</div>
            </div>
          </Link>

          <Link to="/agents" className="btn btn-outline d-flex align-center gap-3 p-4">
            <Users className="w-6 h-6" />
            <div className="text-left">
              <div className="font-medium">Manage Agents</div>
              <div className="text-sm text-gray-600">View all agents</div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;