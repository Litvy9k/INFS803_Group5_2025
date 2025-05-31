'use client';

import { useState, useEffect } from 'react';
import {
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    IconButton,
    InputAdornment,
    Link as MuiLink,
    Tab,
    Tabs,
    TextField,
    Typography,
    Alert,
} from '@mui/material';
import {
    Close as CloseIcon,
    Visibility,
    VisibilityOff,
    Google as GoogleIcon,
    Apple as AppleIcon,
    Facebook as FacebookIcon,
    CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { userAPI } from '@/app/services/apiService';

// Create a theme that matches our game forum color scheme
const theme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#1b9f67',
        },
        secondary: {
            main: '#1f1e33',
        },
        background: {
            default: '#1f1e33',
            paper: '#2c2b4d',
        },
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    borderRadius: '6px',
                },
            },
        },
        MuiDialog: {
            styleOverrides: {
                paper: {
                    backgroundColor: '#2c2b4d',
                    backgroundImage: 'none',
                    borderRadius: '8px',
                    border: '1px solid rgba(27, 159, 103, 0.3)',
                },
            },
        },
        MuiDialogTitle: {
            styleOverrides: {
                root: {
                    borderBottom: '1px solid rgba(27, 159, 103, 0.2)',
                    padding: '16px 24px',
                },
            },
        },
        MuiInputBase: {
            styleOverrides: {
                root: {
                    backgroundColor: 'rgba(31, 30, 51, 0.5)',
                    borderRadius: '6px',
                },
            },
        },
        MuiTab: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    fontSize: '1rem',
                    minWidth: 100,
                },
            },
        },
    },
});

export default function MuiAuthModal({ open, onClose }) {
    const [tabValue, setTabValue] = useState(0); // 0 for login, 1 for register
    const [formData, setFormData] = useState({
        username: '',
        nickname: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [registrationSuccess, setRegistrationSuccess] = useState(false);

    // Handle tab change
    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
        setErrors({});
        setRegistrationSuccess(false);
    };

    // Handle input change
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        // Clear field-specific error when user starts typing
        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: null,
            }));
        }
    };

    // Toggle password visibility
    const handleTogglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    // Toggle confirm password visibility
    const handleToggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    // Parse Django REST Framework error response
    const parseDjangoErrors = (errorResponse) => {
        const fieldErrors = {};

        if (errorResponse && typeof errorResponse === 'object') {
            // Handle field-specific errors
            Object.keys(errorResponse).forEach((field) => {
                const errorMessages = errorResponse[field];
                if (Array.isArray(errorMessages)) {
                    fieldErrors[field] = errorMessages[0]; // Take first error message
                } else if (typeof errorMessages === 'string') {
                    fieldErrors[field] = errorMessages;
                }
            });

            // Handle non-field errors (general errors)
            if (errorResponse.non_field_errors) {
                fieldErrors.form = Array.isArray(errorResponse.non_field_errors)
                    ? errorResponse.non_field_errors[0]
                    : errorResponse.non_field_errors;
            }

            // Handle detail errors (common in DRF)
            if (errorResponse.detail) {
                fieldErrors.form = errorResponse.detail;
            }
        }

        return fieldErrors;
    };

    // Validate form inputs
    const validateForm = () => {
        const newErrors = {};
        if (!formData.username) {
            newErrors.username = 'Username is required';
        }
        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        // Additional validation for register
        if (tabValue === 1) {
            if (!formData.email) {
                newErrors.email = 'Email is required';
            } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
                newErrors.email = 'Email is invalid';
            }
            if (!formData.nickname) {
                newErrors.nickname = 'Nickname is required';
            }

            if (!formData.confirmPassword) {
                newErrors.confirmPassword = 'Please confirm your password';
            } else if (formData.password !== formData.confirmPassword) {
                newErrors.confirmPassword = 'Passwords do not match';
            }
        }

        return newErrors;
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("starting")

        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setIsLoading(true);
        setErrors({});

        try {
            if (tabValue === 0) {
                // Handle Login 
                const credentials = {
                    username: formData.username,
                    password: formData.password,
                };

                console.log(credentials)

                const response = await userAPI.login(credentials);

                // The login function now automatically stores tokens
                console.log('Login successful:', response);

                // Store user data if provided
                if (response.user) {
                    localStorage.setItem('user_data', JSON.stringify(response.user));
                }

                // Close modal on successful login
                onClose();

                // Refresh page to update auth state
                window.location.reload();
            } else {
                // Handle Registration
                const registrationData = {
                    username: formData.username,
                    nickname: formData.nickname,
                    email: formData.email,
                    password: formData.password,
                };

                const response = await userAPI.register(registrationData);

                console.log('Registration successful:', response);

                // Show success message
                setRegistrationSuccess(true);

                // Switch to login tab and prefill email (and username if available)
                setTimeout(() => {
                    setTabValue(0);
                    setFormData(prev => ({
                        ...prev,
                        email: '',
                        username: response.username || formData.username,
                        nickname: '',
                        password: '',
                        confirmPassword: '',
                    }));
                    setRegistrationSuccess(false);
                }, 1000);
            }

        } catch (error) {
            console.error('Authentication error:', error);

            // Parse Django REST Framework errors
            if (error.response && error.response.data) {
                const djangoErrors = parseDjangoErrors(error.response.data);
                setErrors(djangoErrors);
            } else if (error.message) {
                setErrors({ form: error.message });
            } else {
                setErrors({ form: 'An unexpected error occurred. Please try again.' });
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Reset form when modal opens/closes
    useEffect(() => {
        if (!open) {
            setFormData({
                username: '',
                nickname: '',
                email: '',
                password: '',
                confirmPassword: '',
            });
            setErrors({});
            setRegistrationSuccess(false);
            setTabValue(0);
        }
    }, [open]);

    return (
        <ThemeProvider theme={theme}>
            <Dialog
                open={open}
                onClose={onClose}
                fullWidth
                maxWidth="sm"
                PaperProps={{
                    elevation: 5,
                }}
            >
                {/* Dialog Title with Close Button */}
                <DialogTitle>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h6" component="div">
                            {tabValue === 0 ? 'Sign In to GameForum' : 'Create a GameForum Account'}
                        </Typography>
                        <IconButton edge="end" color="inherit" onClick={onClose} aria-label="close">
                            <CloseIcon />
                        </IconButton>
                    </Box>
                </DialogTitle>

                {/* Tabs for switching between login and register */}
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs
                        value={tabValue}
                        onChange={handleTabChange}
                        variant="fullWidth"
                        textColor="primary"
                        indicatorColor="primary"
                    >
                        <Tab label="Sign In" />
                        <Tab label="Register" />
                    </Tabs>
                </Box>

                <DialogContent>
                    <Box
                        component="form"
                        onSubmit={handleSubmit}
                        noValidate
                        sx={{ mt: 3, px: 5 }}
                    >
                        {/* Registration success message */}
                        {registrationSuccess && (
                            <Alert
                                severity="success"
                                icon={<CheckCircleIcon fontSize="inherit" />}
                                sx={{ mb: 3 }}
                            >
                                Registration successful! Redirecting to login...
                            </Alert>
                        )}

                        {/* General error message */}
                        {errors.form && (
                            <Alert severity="error" sx={{ mb: 3 }}>
                                {errors.form}
                            </Alert>
                        )}

                        {/* Username */}

                        <TextField
                            margin="dense"
                            required
                            fullWidth
                            id="username"
                            label="Username"
                            name="username"
                            autoComplete="username"
                            value={formData.username}
                            onChange={handleChange}
                            error={!!errors.username}
                            helperText={errors.username}
                            disabled={isLoading}
                            sx={{ mb: 2 }}
                        />


                        {/* Nickname - only for registration */}
                        {tabValue === 1 && (
                            <TextField
                                margin="dense"
                                required
                                fullWidth
                                id="nickname"
                                label="Nickname"
                                name="nickname"
                                autoComplete="nickname"
                                value={formData.nickname}
                                onChange={handleChange}
                                error={!!errors.nickname}
                                helperText={errors.nickname}
                                disabled={isLoading}
                                sx={{ mb: 2 }}
                                placeholder="Display name for the forum"
                            />
                        )}

                        {/* Email - only for registration */}
                        {tabValue === 1 && (
                            <TextField
                                margin="dense"
                                required
                                fullWidth
                                id="email"
                                label="Email Address"
                                name="email"
                                autoComplete="email"
                                value={formData.email}
                                onChange={handleChange}
                                error={!!errors.email}
                                helperText={errors.email}
                                disabled={isLoading}
                                sx={{ mb: 2 }}
                            />
                        )}

                        {/* Password */}
                        <TextField
                            margin="dense"
                            required
                            fullWidth
                            name="password"
                            label="Password"
                            type={showPassword ? 'text' : 'password'}
                            id="password"
                            autoComplete={tabValue === 0 ? 'current-password' : 'new-password'}
                            value={formData.password}
                            onChange={handleChange}
                            error={!!errors.password}
                            helperText={errors.password}
                            disabled={isLoading}
                            sx={{ mb: 2 }}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label="toggle password visibility"
                                            onClick={handleTogglePasswordVisibility}
                                            edge="end"
                                        >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />

                        {/* Confirm Password - only for registration */}
                        {tabValue === 1 && (
                            <TextField
                                margin="dense"
                                required
                                fullWidth
                                name="confirmPassword"
                                label="Confirm Password"
                                type={showConfirmPassword ? 'text' : 'password'}
                                id="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                error={!!errors.confirmPassword}
                                helperText={errors.confirmPassword}
                                disabled={isLoading}
                                sx={{ mb: 2 }}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                aria-label="toggle password visibility"
                                                onClick={handleToggleConfirmPasswordVisibility}
                                                edge="end"
                                            >
                                                {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        )}

                        {/* Submit Button */}
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, mb: 2 }}>
                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                disabled={isLoading}
                                sx={{ mt: 2, mb: 2, py: 1.5, width: 300 }}
                            >
                                {isLoading ? (
                                    <CircularProgress size={24} color="inherit" />
                                ) : (
                                    tabValue === 0 ? 'Sign In' : 'Create Account'
                                )}
                            </Button>
                        </Box>

                        {/* Forgot Password - only for login */}
                        {tabValue === 0 && (
                            <Box sx={{ textAlign: 'center', mt: 1 }}>
                                <MuiLink href="#" variant="body2" color="primary">
                                    Forgot password?
                                </MuiLink>
                            </Box>
                        )}

                        {/* Divider with text */}
                        <Box sx={{ position: 'relative', mt: 3, mb: 3 }}>
                            <Divider>
                                <Typography variant="body2" color="text.secondary">
                                    OR
                                </Typography>
                            </Divider>
                        </Box>

                        {/* Social Login Buttons */}
                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 2 }}>
                            <Button
                                variant="outlined"
                                startIcon={<GoogleIcon />}
                                sx={{ borderRadius: '4px', p: 1 }}
                                disabled
                            >
                                Google
                            </Button>
                            <Button
                                variant="outlined"
                                startIcon={<AppleIcon />}
                                sx={{ borderRadius: '4px', p: 1 }}
                                disabled
                            >
                                Apple
                            </Button>
                            <Button
                                variant="outlined"
                                startIcon={<FacebookIcon />}
                                sx={{ borderRadius: '4px', p: 1 }}
                                disabled
                            >
                                Facebook
                            </Button>
                        </Box>

                        {tabValue === 0 && (
                            <Typography variant="body2" className='text-gray-400' align="center" sx={{ mt: 2 }}>
                                Available Later!
                            </Typography>
                        )}

                        {/* Terms of service - only for registration */}
                        {tabValue === 1 && (
                            <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 2 }}>
                                By creating an account, you agree to our{' '}
                                <MuiLink href="#" color="primary">
                                    Terms of Service
                                </MuiLink>{' '}
                                and{' '}
                                <MuiLink href="#" color="primary">
                                    Privacy Policy
                                </MuiLink>
                            </Typography>
                        )}
                    </Box>
                </DialogContent>
            </Dialog>
        </ThemeProvider>
    );
}