import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, LogIn, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { APP_NAME, VALIDATION } from '../../utils/constants';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const { login, register: registerUser, loading } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm();

  const onSubmit = async (data) => {
    try {
      let result;
      if (isRegistering) {
        result = await registerUser(data);
      } else {
        result = await login(data);
      }

      if (result.success) {
        reset();
      }
    } catch (error) {
      console.error('Auth error:', error);
    }
  };

  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    reset();
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1 className="login-title">{APP_NAME}</h1>
          <p className="login-subtitle">
            {isRegistering 
              ? 'Create admin account to get started' 
              : 'Sign in to your admin account'
            }
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          {isRegistering && (
            <div className="form-group">
              <label className="form-label">
                <User className="inline w-4 h-4 mr-2" />
                Full Name
              </label>
              <input
                type="text"
                className={`form-control ${errors.name ? 'border-red-500' : ''}`}
                placeholder="Enter your full name"
                {...register('name', {
                  required: 'Name is required',
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
          )}

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className={`form-control ${errors.email ? 'border-red-500' : ''}`}
              placeholder="Enter your email"
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
            <label className="form-label">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                className={`form-control pr-12 ${errors.password ? 'border-red-500' : ''}`}
                placeholder="Enter your password"
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: VALIDATION.PASSWORD_MIN_LENGTH,
                    message: `Password must be at least ${VALIDATION.PASSWORD_MIN_LENGTH} characters`
                  },
                  ...(isRegistering && {
                    pattern: {
                      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                      message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
                    }
                  })
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
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg w-full"
            disabled={loading}
          >
            {loading ? (
              <div className="spinner w-5 h-5" />
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                {isRegistering ? 'Create Account' : 'Sign In'}
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            className="text-blue-600 hover:text-blue-800 text-sm"
            onClick={toggleMode}
          >
            {isRegistering 
              ? 'Already have an account? Sign in' 
              : 'Need to create an admin account? Register here'
            }
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;