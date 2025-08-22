import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Upload, Eye, Trash2, FileText, Users, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { listsAPI } from '../../services/api';
import LoadingSpinner from '../Common/LoadingSpinner';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

const DistributedLists = () => {
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedList, setExpandedList] = useState(null);
  const [listDetails, setListDetails] = useState({});

  useEffect(() => {
    fetchLists();
  }, []);

  const fetchLists = async () => {
    try {
      setLoading(true);
      const response = await listsAPI.getAll();
      setLists(response.data.lists);
    } catch (error) {
      console.error('Error fetching lists:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchListDetails = async (listId) => {
    try {
      const response = await listsAPI.getById(listId);
      setListDetails(prev => ({
        ...prev,
        [listId]: response.data.list
      }));
    } catch (error) {
      console.error('Error fetching list details:', error);
    }
  };

  const handleDelete = async (listId, filename) => {
    if (window.confirm(`Are you sure you want to delete the list "${filename}"? This will also remove all assignments from agents.`)) {
      try {
        await listsAPI.delete(listId);
        toast.success('List deleted successfully');
        fetchLists();
        // Remove from details cache
        setListDetails(prev => {
          const newDetails = { ...prev };
          delete newDetails[listId];
          return newDetails;
        });
      } catch (error) {
        console.error('Error deleting list:', error);
      }
    }
  };

  const handleToggleExpand = async (listId) => {
    if (expandedList === listId) {
      setExpandedList(null);
    } else {
      setExpandedList(listId);
      if (!listDetails[listId]) {
        await fetchListDetails(listId);
      }
    }
  };

  const ListCard = ({ list }) => {
    const isExpanded = expandedList === list.id;
    const details = listDetails[list.id];

    return (
      <div className="card">
        <div className="d-flex justify-between align-center mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-1">{list.filename}</h3>
            <div className="text-sm text-gray-600 d-flex align-center gap-4">
              <span className="d-flex align-center gap-1">
                <FileText className="w-4 h-4" />
                {list.totalItems} items
              </span>
              <span className="d-flex align-center gap-1">
                <Users className="w-4 h-4" />
                {list.agentCount} agents
              </span>
              <span className="d-flex align-center gap-1">
                <Calendar className="w-4 h-4" />
                {format(new Date(list.createdAt), 'MMM dd, yyyy')}
              </span>
            </div>
          </div>

          <div className="d-flex align-center gap-2">
            <button
              onClick={() => handleToggleExpand(list.id)}
              className="btn btn-outline btn-sm"
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              {isExpanded ? 'Hide' : 'View'} Details
            </button>

            <button
              onClick={() => handleDelete(list.id, list.filename)}
              className="btn btn-danger btn-sm"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="text-xs text-gray-500">
          Uploaded by {list.uploadedBy?.name || 'Admin'} • 
          {list.distributionComplete ? (
            <span className="text-green-600 ml-1">✓ Distributed</span>
          ) : (
            <span className="text-orange-600 ml-1">⏳ Pending</span>
          )}
        </div>

        {/* Expanded Details */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t">
            {details ? (
              <div>
                <h4 className="font-medium mb-3">Distribution Details</h4>
                <div className="space-y-4">
                  {details.agents.map((agentData, index) => (
                    <div key={agentData.agent.id} className="bg-gray-50 p-4 rounded-lg">
                      <div className="d-flex justify-between align-center mb-3">
                        <div>
                          <div className="font-medium">{agentData.agent.name}</div>
                          <div className="text-sm text-gray-600">{agentData.agent.email}</div>
                          <div className="text-sm text-gray-600">{agentData.agent.mobile}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-blue-600">
                            {agentData.assignedCount} items
                          </div>
                          <div className="text-xs text-gray-500">assigned</div>
                        </div>
                      </div>

                      {/* Items Preview */}
                      <div className="mt-3">
                        <div className="text-sm font-medium mb-2">Assigned Items:</div>
                        <div className="max-h-40 overflow-y-auto">
                          <div className="table-container">
                            <table className="table">
                              <thead>
                                <tr>
                                  <th className="text-xs">Name</th>
                                  <th className="text-xs">Phone</th>
                                  <th className="text-xs">Notes</th>
                                </tr>
                              </thead>
                              <tbody>
                                {agentData.items.slice(0, 5).map((item, itemIndex) => (
                                  <tr key={itemIndex}>
                                    <td className="text-sm">{item.firstName}</td>
                                    <td className="text-sm">{item.phone}</td>
                                    <td className="text-sm">{item.notes || '-'}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                          {agentData.items.length > 5 && (
                            <div className="text-center py-2 text-xs text-gray-500">
                              ... and {agentData.items.length - 5} more items
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <div className="spinner w-6 h-6 mx-auto" />
                <div className="text-sm text-gray-600 mt-2">Loading details...</div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      <div className="d-flex justify-between align-center mb-4">
        <h1 className="text-2xl font-bold">Distributed Lists</h1>
        <Link to="/lists/upload" className="btn btn-primary">
          <Upload className="w-4 h-4" />
          Upload New List
        </Link>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading lists..." />
      ) : lists.length > 0 ? (
        <div className="space-y-4">
          {lists.map((list) => (
            <ListCard key={list.id} list={list} />
          ))}
        </div>
      ) : (
        <div className="card text-center py-8">
          <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium mb-2">No lists uploaded yet</h3>
          <p className="text-gray-600 mb-4">
            Upload your first CSV file to start distributing tasks to agents.
          </p>
          <Link to="/lists/upload" className="btn btn-primary">
            <Upload className="w-4 h-4" />
            Upload First List
          </Link>
        </div>
      )}
    </div>
  );
};

export default DistributedLists;