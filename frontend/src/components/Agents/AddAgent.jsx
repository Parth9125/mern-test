import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { Save, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { agentsAPI } from '../../services/api';
import { VALIDATION } from '../../utils/constants';
import { toast } from 'react-toastify';

const AddAgent = () => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm();

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      await agentsAPI.create(data);
      toast.success('Agent created successfully!');
      reset();
      navigate('/agents');
    } catch (error) {
      console.error('Create agent error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="d-flex align-center gap-3 mb-4">
        <Link to="/agents" className="btn btn-outline btn-sm">
          <ArrowLeft className="w-4 h-4" />
          Back to Agents
        </Link>
        <h1 className="text-2xl font-bold">Add New Agent</h1>
      </div>

      <div className="card max-w-2xl">
        <div className="card-header">
          <h2 className="card-title">Agent Information</h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label className="form-label">Agent Name *</label>
            <input
              type="text"
              className={`form-control ${errors.name ? 'border-red-500' : ''}`}
              placeholder="Enter agent's full name"
              {...register('name', {
                required: 'Agent name is required',
                minLength: {
                  value: VALIDATION.NAME_MIN_LENGTH,
                  message: `Name must be at least ${VALIDATION.NAME_MIN_LENGTH} characters`
                },
                maxLength: {
                  value: VALIDATION.NAME_MAX_LENGTH,
                  message: `Name must not exceed ${VALIDATION.NAME_MAX_LENGTH} characters`
                },
                pattern: {
                  value: /^[a-zA-Z\s]+$/,
                  message: 'Name can only contain letters and spaces'
                }
              })}
            />
            {errors.name && (
              <div className="form-error">{errors.name.message}</div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Email Address *</label>
            <input
              type="email"
              className={`form-control ${errors.email ? 'border-red-500' : ''}`}
              placeholder="Enter agent's email address"
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: VALIDATION.EMAIL_REGEX,
                  message: 'Please enter a valid email address'
                }
              })}
            />
            {errors.email && (
              <div className="form-error">{errors.email.message}</div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Mobile Number *</label>
            <input
              type="tel"
              className={`form-control ${errors.mobile ? 'border-red-500' : ''}`}
              placeholder="Enter mobile with country code (e.g., +1234567890)"
              {...register('mobile', {
                required: 'Mobile number is required',
                pattern: {
                  value: VALIDATION.PHONE_REGEX,
                  message: 'Mobile number must include country code (e.g., +1234567890)'
                }
              })}
            />
            {errors.mobile && (
              <div className="form-error">{errors.mobile.message}</div>
            )}
            <div className="text-sm text-gray-600 mt-1">
              Include country code (e.g., +1 for US, +91 for India)
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password *</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                className={`form-control pr-12 ${errors.password ? 'border-red-500' : ''}`}
                placeholder="Enter agent's password"
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: VALIDATION.PASSWORD_MIN_LENGTH,
                    message: `Password must be at least ${VALIDATION.PASSWORD_MIN_LENGTH} characters`
                  },
                  pattern: {
                    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                    message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
                  }
                })}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password && (
              <div className="form-error">{errors.password.message}</div>
            )}
            <div className="text-sm text-gray-600 mt-1">
              Password must contain uppercase, lowercase, and number
            </div>
          </div>

          <div className="d-flex gap-3 pt-4">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <div className="spinner w-5 h-5" />
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Create Agent
                </>
              )}
            </button>

            <Link to="/agents" className="btn btn-secondary">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAgent;